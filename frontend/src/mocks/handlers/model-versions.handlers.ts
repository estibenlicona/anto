import { http, HttpResponse } from "msw";
import type {
  EstimationModelListItem,
  ModelValidationReport,
  SaveDimensionsRequest,
  SaveDriversRequest,
  SaveMixRequest,
  SaveTallaRulesRequest,
} from "@features/admin-shell/services/estimationModelService";
import {
  MODEL_ID,
  MODEL_SEED,
  initialHistorySeeds,
  initialVersionSeeds,
  type VersionSeed,
} from "./model-versions.seeds";
import { validateVersion } from "./model-validation";

const MODELS_URL = `/admin/modelos`;

interface HistoryEntry {
  occurredAtUtc: string;
  author: string;
  section: string;
  summary: string;
}

let versions: VersionSeed[] = initialVersionSeeds();
let history: Record<number, HistoryEntry[]> = initialHistorySeeds();

const clone = <T>(value: T): T => structuredClone(value);

/** Reinicia el estado en memoria del mock — llamar en los tests que ejercitan el guardado. */
export function resetModelVersionsMock() {
  versions = initialVersionSeeds();
  history = initialHistorySeeds();
}

/** Lectura de sólo consulta para otros handlers (iniciativas estima con la vigente). */
export function currentVersionSnapshot(): VersionSeed | undefined {
  const current = versions.find((v) => v.status === "Vigente");
  return current ? clone(current) : undefined;
}

export function versionSnapshot(versionId: string): VersionSeed | undefined {
  const found = versions.find((v) => v.id === versionId);
  return found ? clone(found) : undefined;
}

export function allVersionsSnapshot(): VersionSeed[] {
  return clone(versions);
}

/** Sube la cuenta de estimaciones de una versión: la usa el mock de iniciativas al guardar. */
export function countEstimation(versionId: string) {
  const version = versions.find((v) => v.id === versionId);
  if (version) version.estimationsCount += 1;
}

export function publishVersion(number: number, effectiveFrom: string, note: string) {
  const current = versions.find((v) => v.status === "Vigente");
  if (current) {
    current.status = "Archivada";
    current.effectiveTo = effectiveFrom;
  }

  const draft = versions.find((v) => v.number === number);
  if (draft) {
    draft.status = "Vigente";
    draft.effectiveFrom = effectiveFrom;
    draft.changeNote = note;
  }
}

export function record(number: number, author: string, section: string, summary: string) {
  history[number] = [
    ...(history[number] ?? []),
    { occurredAtUtc: new Date().toISOString(), author, section, summary },
  ];
}

export function historyOf(number: number): HistoryEntry[] {
  return clone(history[number] ?? []);
}

const listing = (): EstimationModelListItem[] => [
  {
    ...MODEL_SEED,
    versions: [...versions]
      .sort((a, b) => b.number - a.number)
      .map((v) => ({
        id: v.id,
        number: v.number,
        status: v.status,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
        changeNote: v.changeNote,
        estimationsCount: v.estimationsCount,
      })),
  },
];

const notFound = (detail: string) =>
  HttpResponse.json({ detail }, { status: 404 });

const badRequest = (detail: string) =>
  HttpResponse.json({ detail }, { status: 400 });

/**
 * Escribir sobre una versión que no es borrador responde 409 y no 400: el
 * cuerpo puede estar perfecto — lo que no admite la operación es el estado del
 * recurso.
 */
const conflict = (number: number, status: string) =>
  HttpResponse.json(
    {
      detail:
        `La versión ${number} está ${status} y no se edita. ` +
        "Para cambiarla, se crea una versión nueva a partir de ella.",
    },
    { status: 409 }
  );

/** Encuentra la versión y se niega si no es un borrador. */
function openDraft(numero: string, author: unknown) {
  const number = Number(numero);
  const version = versions.find((v) => v.number === number);

  if (!version) return { error: notFound(`No existe la versión ${numero}.`) };
  if (typeof author !== "string" || author.trim().length === 0) {
    return {
      error: badRequest(
        "Un cambio de configuración no se guarda sin autor: el historial quedaría anónimo."
      ),
    };
  }
  if (version.status !== "Borrador") {
    return { error: conflict(version.number, version.status) };
  }

  return { version };
}

const reportOf = (version: VersionSeed): ModelValidationReport =>
  validateVersion(version.content);

export const modelVersionsHandlers = [
  http.get(MODELS_URL, () => HttpResponse.json(listing())),

  http.get(`${MODELS_URL}/:modelId/versiones/:numero`, ({ params }) => {
    const version = versions.find((v) => v.number === Number(params.numero));
    return version
      ? HttpResponse.json(clone(version.content))
      : notFound(`No existe la versión ${params.numero}.`);
  }),

  http.get(`${MODELS_URL}/:modelId/versiones/:numero/historial`, ({ params }) =>
    HttpResponse.json(
      historyOf(Number(params.numero)).sort((a, b) =>
        b.occurredAtUtc.localeCompare(a.occurredAtUtc)
      )
    )
  ),

  http.post(`${MODELS_URL}/:modelId/versiones`, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      author?: string;
      sourceVersion?: number;
    } | null;

    if (!body?.author?.trim()) {
      return badRequest("Crear una versión exige el autor.");
    }

    const source = versions.find((v) => v.number === body.sourceVersion);
    if (!source) {
      return notFound(`No existe la versión ${body.sourceVersion}.`);
    }

    if (versions.some((v) => v.status === "Borrador")) {
      return conflict(
        versions.find((v) => v.status === "Borrador")!.number,
        "Borrador"
      );
    }

    const number = Math.max(...versions.map((v) => v.number)) + 1;
    const id = `${MODEL_ID}-V${number}`;
    versions = [
      ...versions,
      {
        id,
        number,
        status: "Borrador",
        effectiveFrom: null,
        effectiveTo: null,
        changeNote: null,
        estimationsCount: 0,
        content: {
          ...clone(source.content),
          versionId: id,
          versionNumber: number,
        },
      },
    ];

    record(number, body.author, "publicar", `Se creó la versión ${number}.`);

    return HttpResponse.json({ number, status: "Borrador" }, { status: 201 });
  }),

  http.put(
    `${MODELS_URL}/:modelId/versiones/:numero/dimensiones`,
    async ({ params, request }) => {
      const body = (await request
        .json()
        .catch(() => null)) as SaveDimensionsRequest | null;
      const opened = openDraft(String(params.numero), body?.author);
      if (opened.error) return opened.error;

      const { version } = opened;
      // Los pesos no llegan en esta sección: se editan en la de drivers. Se
      // conservan los que la pregunta ya tenía.
      const weights = new Map(
        version.content.questions.map((q) => [q.id, q.weights])
      );

      version.content.dimensions = body!.dimensions.map((d) => ({ ...d }));
      version.content.questions = body!.questions.map((q) => ({
        id: q.code,
        dimension: q.dimensionCode,
        text: q.texto,
        type: q.type,
        unit: q.unit ?? undefined,
        driver: q.driverCode,
        active: q.active,
        options: q.options.map((o) => ({ ...o })),
        weights: weights.get(q.code) ?? {},
      }));
      version.content.triage = body!.triage.map((t) => ({
        id: t.code,
        text: t.texto,
        critical: t.critical,
      }));

      record(
        version.number,
        body!.author,
        "dimensiones",
        `Se guardaron ${body!.dimensions.length} dimensiones y ${body!.questions.length} preguntas.`
      );

      return HttpResponse.json(reportOf(version));
    }
  ),

  http.put(
    `${MODELS_URL}/:modelId/versiones/:numero/drivers`,
    async ({ params, request }) => {
      const body = (await request
        .json()
        .catch(() => null)) as SaveDriversRequest | null;
      const opened = openDraft(String(params.numero), body?.author);
      if (opened.error) return opened.error;

      const { version } = opened;
      version.content.drivers = body!.drivers.map((d) => ({
        code: d.code,
        description: d.description,
        outputs: [...d.outputs],
      }));

      for (const row of body!.weights) {
        const question = version.content.questions.find((q) => q.id === row.questionCode);
        // La fila se reemplaza entera: una salida que no viene es "no aporta",
        // y fusionar dejaría vivo un peso que alguien quitó.
        if (question) question.weights = { ...row.weights };
      }

      record(
        version.number,
        body!.author,
        "drivers",
        `Se guardaron ${body!.drivers.length} drivers y ${body!.weights.length} filas de pesos.`
      );

      return HttpResponse.json(reportOf(version));
    }
  ),

  http.put(
    `${MODELS_URL}/:modelId/versiones/:numero/tallas`,
    async ({ params, request }) => {
      const body = (await request
        .json()
        .catch(() => null)) as SaveTallaRulesRequest | null;
      const opened = openDraft(String(params.numero), body?.author);
      if (opened.error) return opened.error;

      const { version } = opened;
      const edges = [0, ...body!.boundaries, 100];

      version.content.tallaRules = body!.rules.map((r, index) => ({
        ...r,
        minPct: edges[index],
        maxPct: edges[index + 1],
      }));
      version.content.riskBands = body!.riskBands.map((b) => ({ ...b }));

      record(
        version.number,
        body!.author,
        "tallas",
        `Se guardaron ${body!.rules.length} reglas de talla.`
      );

      return HttpResponse.json(reportOf(version));
    }
  ),

  http.put(
    `${MODELS_URL}/:modelId/versiones/:numero/mix`,
    async ({ params, request }) => {
      const body = (await request.json().catch(() => null)) as SaveMixRequest | null;
      const opened = openDraft(String(params.numero), body?.author);
      if (opened.error) return opened.error;

      const { version } = opened;
      version.content.mix = body!.mix.map((m) => ({
        capability: m.capacidad,
        byTalla: { ...m.porTalla },
      }));
      version.content.mixModifiers = body!.modifiers.map((m) => ({
        code: m.code,
        driver: m.driverCode,
        operator: m.operator,
        value: m.threshold,
        tallas: [...m.tallas],
        adjustments: m.adjustments.map((a) => ({
          capability: a.capabilityKey,
          points: a.points,
        })),
      }));

      record(
        version.number,
        body!.author,
        "mix",
        `Se guardaron ${body!.mix.length} capacidades del mix.`
      );

      return HttpResponse.json(reportOf(version));
    }
  ),
];

export { openDraft as openDraftForTests, reportOf as reportForTests };
