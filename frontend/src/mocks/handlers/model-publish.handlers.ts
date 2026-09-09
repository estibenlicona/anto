import { http, HttpResponse } from "msw";
import type {
  ModelVersionDiff,
  ModelVersionDiffEntry,
  PublishModelVersionRequest,
} from "@features/admin-shell/services/estimationModelService";
import type { EstimationModelVersion } from "@features/initiatives/services/evaluationModel";
import {
  allVersionsSnapshot,
  currentVersionSnapshot,
  publishVersion,
  record,
} from "./model-versions.handlers";
import { validateVersion } from "./model-validation";

const MODELS_URL = "/admin/modelos";

const number = (value: number) =>
  Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);

const signed = (value: number) => (value > 0 ? `+${number(value)}` : number(value));

/**
 * Compara por código y no por posición: mover una pregunta de lugar no es un
 * cambio de contenido, y si el diff lo contara como uno, reordenar el
 * cuestionario llenaría la lista de ruido y escondería lo que sí cambió.
 */
function compare<T>(
  entries: ModelVersionDiffEntry[],
  section: ModelVersionDiffEntry["section"],
  label: string,
  before: T[],
  after: T[],
  key: (item: T) => string,
  name: (item: T) => string,
  describe: (item: T) => string
) {
  const byKeyBefore = new Map(before.map((item) => [key(item), item]));
  const byKeyAfter = new Map(after.map((item) => [key(item), item]));

  for (const [code, item] of byKeyAfter) {
    const previous = byKeyBefore.get(code);
    if (!previous) {
      entries.push({
        section,
        item: `${label} ${name(item)}`,
        kind: "agregado",
        before: null,
        after: describe(item),
      });
      continue;
    }

    const was = describe(previous);
    const now = describe(item);
    if (was !== now) {
      entries.push({
        section,
        item: `${label} ${name(item)}`,
        kind: "cambiado",
        before: was,
        after: now,
      });
    }
  }

  for (const [code, item] of byKeyBefore) {
    if (!byKeyAfter.has(code)) {
      entries.push({
        section,
        item: `${label} ${name(item)}`,
        kind: "quitado",
        before: describe(item),
        after: null,
      });
    }
  }
}

/** Una salida ausente no se lista: eso es lo que significa "no aporta". */
const describeWeights = (weights: Record<string, number | undefined>) => {
  const listed = Object.entries(weights)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return listed.length === 0
    ? "sin peso en ninguna salida"
    : listed.map(([key, value]) => `${key} ${number(value!)}`).join(", ");
};

function diffBetween(
  before: EstimationModelVersion | undefined,
  after: EstimationModelVersion
): ModelVersionDiffEntry[] {
  const entries: ModelVersionDiffEntry[] = [];

  if (!before) {
    // Sin versión con la que comparar, todo lo que hay es nuevo.
    for (const dimension of after.dimensions) {
      entries.push({
        section: "dimensiones",
        item: `Dimensión ${dimension.name}`,
        kind: "agregado",
        before: null,
        after: `orden ${dimension.order}`,
      });
    }
    return entries;
  }

  compare(
    entries, "dimensiones", "Dimensión",
    before.dimensions, after.dimensions,
    (d) => d.code, (d) => d.name,
    (d) => `${d.name}, orden ${d.order}, ${d.active ? "activa" : "inactiva"}`
  );

  compare(
    entries, "dimensiones", "Pregunta",
    before.questions, after.questions,
    (q) => q.id, (q) => q.id,
    (q) =>
      `${q.text} · ${q.type} · dimensión ${q.dimension} · driver ${q.driver} · ` +
      `${q.active ? "activa" : "inactiva"} · opciones: ${q.options.map((o) => o.label).join(" / ")}`
  );

  compare(
    entries, "dimensiones", "Tamizaje",
    before.triage, after.triage,
    (t) => t.id, (t) => t.id,
    (t) => `${t.text}${t.critical ? " (crítica)" : ""}`
  );

  compare(
    entries, "drivers", "Driver",
    before.drivers, after.drivers,
    (d) => d.code, (d) => d.code,
    (d) => `${d.description} → ${d.outputs.join(", ")}`
  );

  // Los pesos se comparan aparte de la pregunta porque se editan en otra
  // sección: mezclarlos llevaría a arreglarlos al lugar equivocado.
  const weightsBefore = new Map(before.questions.map((q) => [q.id, q.weights]));
  for (const question of after.questions) {
    const was = weightsBefore.get(question.id);
    if (!was) continue;
    const previous = describeWeights(was);
    const now = describeWeights(question.weights);
    if (previous !== now) {
      entries.push({
        section: "drivers",
        item: `Pesos de ${question.id}`,
        kind: "cambiado",
        before: previous,
        after: now,
      });
    }
  }

  compare(
    entries, "tallas", "Talla",
    before.tallaRules, after.tallaRules,
    (r) => r.talla, (r) => r.talla,
    (r) =>
      `${number(r.minPct)}–${number(r.maxPct)}% · PM ${number(r.pmMin)}–` +
      `${number(r.pmExpected)}–${number(r.pmMax)} · ${r.lectura} · ${r.action}`
  );

  compare(
    entries, "tallas", "Riesgo",
    before.riskBands, after.riskBands,
    (b) => b.level, (b) => b.level,
    (b) => `hasta ${number(b.maxPct)}%`
  );

  compare(
    entries, "mix", "Capacidad",
    before.mix, after.mix,
    (m) => m.capability, (m) => m.capability,
    (m) =>
      Object.entries(m.byTalla)
        .map(([talla, pct]) => `${talla} ${number(pct)}%`)
        .join(", ")
  );

  compare(
    entries, "mix", "Modificador",
    before.mixModifiers, after.mixModifiers,
    (m) => m.code, (m) => m.code,
    (m) =>
      `${m.driver} ${m.operator} ${number(m.value)} en ${m.tallas.join("/")}: ` +
      m.adjustments.map((a) => `${a.capability} ${signed(a.points)}`).join(", ")
  );

  return entries;
}

export const modelPublishHandlers = [
  http.get(`${MODELS_URL}/:modelId/versiones/:numero/validacion`, ({ params }) => {
    const version = allVersionsSnapshot().find(
      (v) => v.number === Number(params.numero)
    );

    return version
      ? HttpResponse.json(validateVersion(version.content))
      : HttpResponse.json({ detail: `No existe la versión ${params.numero}.` }, { status: 404 });
  }),

  http.get(`${MODELS_URL}/:modelId/versiones/:numero/diferencias`, ({ params }) => {
    const target = Number(params.numero);
    const version = allVersionsSnapshot().find((v) => v.number === target);
    if (!version) {
      return HttpResponse.json({ detail: `No existe la versión ${target}.` }, { status: 404 });
    }

    const current = currentVersionSnapshot();
    const from = current && current.number !== target ? current : undefined;

    const diff: ModelVersionDiff = {
      fromVersion: from?.number ?? null,
      toVersion: target,
      entries: diffBetween(from?.content, version.content),
    };

    return HttpResponse.json(diff);
  }),

  http.post(
    `${MODELS_URL}/:modelId/versiones/:numero/publicacion`,
    async ({ params, request }) => {
      const body = (await request
        .json()
        .catch(() => null)) as PublishModelVersionRequest | null;

      if (!body?.author?.trim()) {
        return HttpResponse.json(
          { detail: "Publicar una versión exige el autor." },
          { status: 400 }
        );
      }

      const target = Number(params.numero);
      const version = allVersionsSnapshot().find((v) => v.number === target);
      if (!version) {
        return HttpResponse.json({ detail: `No existe la versión ${target}.` }, { status: 404 });
      }

      if (version.status !== "Borrador") {
        return HttpResponse.json(
          {
            detail:
              `La versión ${target} está ${version.status} y no se edita. ` +
              "Para cambiarla, se crea una versión nueva a partir de ella.",
          },
          { status: 409 }
        );
      }

      const report = validateVersion(version.content);

      // 422 y no 400: el cuerpo está bien formado, lo que no se puede es
      // publicar *esta* configuración. El informe viaja igual para que el
      // cliente pueda llevar a arreglar cada impedimento.
      if (!report.canPublish) {
        return HttpResponse.json(report, { status: 422 });
      }

      publishVersion(target, body.effectiveFrom, body.note);
      record(
        target,
        body.author,
        "publicar",
        `Se publicó la versión ${target}: ${body.note}`
      );

      return HttpResponse.json(report);
    }
  ),
];
