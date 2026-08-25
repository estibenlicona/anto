import { http, HttpResponse } from "msw";
import { clampPagination, paginate } from "@shared/services/pagination";
import { bandRange } from "@features/admin-shell/services/tallaBandsService";
import {
  computeEvaluation,
  type EvaluationInput,
  type EvaluationModel,
  SCORE_MAX,
} from "@features/initiatives/services/evaluationModel";
import type {
  InitiativeDto,
  InitiativeEvaluationDto,
  InitiativeInput,
  InitiativeStatus,
  InitiativesStats,
  SaveEvaluationRequest,
} from "@features/initiatives/services/initiativeService";
import { getQuestionPoolSnapshot } from "./question-pool.handlers";
import { getTallaBandsSnapshot } from "./talla-bands.handlers";
import { getCapabilityMixSnapshot } from "./capability-mix.handlers";
import { getSquadsSnapshot } from "./squads.handlers";
import {
  BAND_ACTIONS,
  INITIATIVE_SEEDS,
  QUALITATIVE_SCALE,
  QUESTION_KINDS,
  TRIAGE,
  type InitiativeSeed,
} from "./initiatives.seeds";

const BASE = "/initiatives";
const STATUSES: InitiativeStatus[] = ["Evaluating", "Active", "Closed"];

/**
 * El modelo se arma en cada petición desde los mocks de Admin: un cambio
 * guardado allá se refleja en la siguiente evaluación (RN-40).
 */
export function buildEvaluationModel(): EvaluationModel {
  const pool = getQuestionPoolSnapshot();
  const { boundaries, bands } = getTallaBandsSnapshot();
  const mix = getCapabilityMixSnapshot();
  const dimensions = Array.from(new Set(pool.map((q) => q.dimension)));
  return {
    dimensions,
    questions: pool.map((q) => {
      const kind = QUESTION_KINDS[q.id] ?? {
        kind: "Evaluative" as const,
        scale: QUALITATIVE_SCALE,
      };
      return {
        id: q.id,
        dimension: q.dimension,
        text: q.texto,
        weight: q.peso,
        kind: kind.kind,
        scale: kind.scale,
      };
    }),
    triage: TRIAGE.map((t) => ({ ...t })),
    bands: bands.map((b, i) => {
      const range = bandRange(boundaries, i);
      return {
        talla: b.talla,
        minPct: range.from,
        maxPct: range.to,
        pmMin: b.pmMin,
        pmMax: b.pmMax,
        lectura: b.lectura,
        action: BAND_ACTIONS[b.talla] ?? "",
      };
    }),
    mix: mix.map((m) => ({
      capability: m.capacidad,
      byTalla: { ...m.porTalla },
    })),
  };
}

function squadName(squadId: string): string {
  return getSquadsSnapshot().find((s) => s.id === squadId)?.name ?? "";
}

function evaluate(
  input: EvaluationInput,
  savedAtUtc: string
): InitiativeEvaluationDto {
  const model = buildEvaluationModel();
  const r = computeEvaluation(model, input);
  return {
    triage: [...input.triage],
    answers: { ...input.answers },
    targetMonths: r.targetMonths,
    points: r.points,
    maxPoints: r.maxPoints,
    pct: r.pct,
    talla: r.talla,
    pmMin: r.band.pmMin,
    pmMax: r.band.pmMax,
    fteExpected: r.fteExpected,
    fteMin: r.fteMin,
    fteMax: r.fteMax,
    dimensions: r.dimensions,
    mix: r.mix,
    triageVerdict: r.triageVerdict,
    savedAtUtc,
  };
}

function fromSeed(seed: InitiativeSeed): StoredInitiative {
  return {
    id: seed.id,
    name: seed.name,
    squadId: seed.squadId,
    squadName: squadName(seed.squadId),
    productOwner: seed.productOwner,
    targetMonths: seed.targetMonths,
    status: seed.status,
    evaluation: seed.answers
      ? evaluate(
          {
            triage: seed.answers.triage,
            answers: seed.answers.byQuestion,
            targetMonths: seed.targetMonths,
          },
          seed.createdAtUtc
        )
      : null,
    createdAtUtc: seed.createdAtUtc,
  };
}

/**
 * Lo que el mock persiste. `squadHasOtherActive` no se guarda: depende del
 * resto de las iniciativas de la célula y quedaría desactualizado en cuanto
 * otra se active o se cierre. Se deriva al responder, como los campos
 * calculados de la célula en squads.handlers.
 */
type StoredInitiative = Omit<InitiativeDto, "squadHasOtherActive">;

// El seeding se resuelve al primer uso y no al evaluar el módulo: `fromSeed`
// resuelve el nombre de la célula contra el mock de células, y ese mock ahora
// lee de vuelta las iniciativas de cada célula. Con inicialización ansiosa,
// cuál de los dos módulos se evalúa primero decide si el otro encuentra su
// estado o una variable en zona muerta — y eso lo fija el orden de imports.
let initiatives: StoredInitiative[] | null = null;

function all(): StoredInitiative[] {
  if (initiatives === null) initiatives = INITIATIVE_SEEDS.map(fromSeed);
  return initiatives;
}

export function resetInitiativesMock() {
  initiatives = INITIATIVE_SEEDS.map(fromSeed);
}

/** Sólo lectura para otros handlers (backlog, asignaciones): misma fuente de ids y nombres. */
export function getInitiativesSnapshot(): StoredInitiative[] {
  return all();
}

/** ¿La célula de esta iniciativa ya tiene otra activa? Se mira el conjunto, no la página. */
function squadHasOtherActive(initiative: StoredInitiative): boolean {
  return all().some(
    (i) =>
      i.squadId === initiative.squadId &&
      i.id !== initiative.id &&
      i.status === "Active"
  );
}

/** Lo guardado más lo derivado: la única forma en que una iniciativa sale del mock. */
function respond(initiative: StoredInitiative): InitiativeDto {
  return {
    ...initiative,
    squadHasOtherActive: squadHasOtherActive(initiative),
  };
}

function isValidInput(value: unknown): value is InitiativeInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<InitiativeInput>;
  return (
    typeof v.name === "string" &&
    v.name.trim().length > 0 &&
    v.name.length <= 200 &&
    typeof v.squadId === "string" &&
    getSquadsSnapshot().some((s) => s.id === v.squadId) &&
    typeof v.productOwner === "string" &&
    v.productOwner.trim().length > 0 &&
    v.productOwner.length <= 100 &&
    typeof v.targetMonths === "number" &&
    Number.isInteger(v.targetMonths) &&
    v.targetMonths >= 1 &&
    v.targetMonths <= 36
  );
}

function isValidEvaluation(value: unknown): value is SaveEvaluationRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SaveEvaluationRequest>;
  if (
    !Array.isArray(v.triage) ||
    v.triage.length !== TRIAGE.length ||
    !v.triage.every((b) => typeof b === "boolean")
  )
    return false;
  if (typeof v.targetMonths !== "number" || v.targetMonths < 1) return false;
  if (!v.answers || typeof v.answers !== "object") return false;
  const ids = new Set(getQuestionPoolSnapshot().map((q) => q.id));
  return Object.entries(v.answers).every(
    ([id, val]) =>
      ids.has(id) &&
      typeof val === "number" &&
      Number.isInteger(val) &&
      val >= 0 &&
      val <= SCORE_MAX
  );
}

function filterInitiatives(url: URL): StoredInitiative[] {
  const search = url.searchParams.get("search")?.trim().toLowerCase();
  const statuses = url.searchParams.getAll("status");
  const squads = url.searchParams.getAll("squadId");
  const tallas = url.searchParams.getAll("talla");
  return all().filter((i) => {
    if (search && !i.name.toLowerCase().includes(search)) return false;
    if (statuses.length && !statuses.includes(i.status)) return false;
    if (squads.length && !squads.includes(i.squadId)) return false;
    if (tallas.length && !(i.evaluation && tallas.includes(i.evaluation.talla)))
      return false;
    return true;
  });
}

function stats(): InitiativesStats {
  const active = all().filter((i) => i.status === "Active");
  const order = buildEvaluationModel().bands.map((b) => b.talla);
  const counts = new Map<string, number>();
  active.forEach((i) => {
    const t = i.evaluation?.talla ?? "";
    counts.set(t, (counts.get(t) ?? 0) + 1);
  });
  return {
    total: all().length,
    unevaluated: all().filter((i) => !i.evaluation).length,
    active: active.length,
    // Las cinco tallas siempre, también en cero: la card dibuja la escala completa.
    activeByTalla: order.map((t) => ({ talla: t, count: counts.get(t) ?? 0 })),
    fteDemand:
      Math.round(
        active.reduce((a, i) => a + (i.evaluation?.fteExpected ?? 0), 0) * 100
      ) / 100,
  };
}

const notFound = () =>
  HttpResponse.json({ message: "Iniciativa no encontrada" }, { status: 404 });

export const initiativesHandlers = [
  http.get(`${BASE}/evaluation-model`, () =>
    HttpResponse.json(buildEvaluationModel())
  ),

  http.get(`${BASE}/stats`, () => HttpResponse.json(stats())),

  http.get(BASE, ({ request }) => {
    const url = new URL(request.url);
    const { page, pageSize } = clampPagination(
      Number(url.searchParams.get("page")) || null,
      Number(url.searchParams.get("pageSize")) || null
    );
    return HttpResponse.json(paginate(filterInitiatives(url).map(respond), page, pageSize));
  }),

  http.get(`${BASE}/:id`, ({ params }) => {
    const found = all().find((i) => i.id === params.id);
    return found ? HttpResponse.json(respond(found)) : notFound();
  }),

  http.post(BASE, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidInput(body))
      return HttpResponse.json(
        { message: "Iniciativa inválida" },
        { status: 400 }
      );
    const created: StoredInitiative = {
      id: `ini-${Date.now().toString(36)}`,
      name: body.name.trim(),
      squadId: body.squadId,
      squadName: squadName(body.squadId),
      productOwner: body.productOwner.trim(),
      targetMonths: body.targetMonths,
      status: "Evaluating",
      evaluation: null,
      createdAtUtc: new Date().toISOString(),
    };
    initiatives = [created, ...all()];
    return HttpResponse.json(respond(created), { status: 201 });
  }),

  http.put(`${BASE}/:id`, async ({ params, request }) => {
    const index = all().findIndex((i) => i.id === params.id);
    if (index < 0) return notFound();
    const body = await request.json().catch(() => null);
    if (!isValidInput(body))
      return HttpResponse.json(
        { message: "Iniciativa inválida" },
        { status: 400 }
      );
    const current = all()[index];
    // El plazo recalcula el FTE de la evaluación guardada; la talla no cambia (RN-34).
    const evaluation = current.evaluation
      ? evaluate(
          {
            triage: current.evaluation.triage,
            answers: current.evaluation.answers,
            targetMonths: body.targetMonths,
          },
          current.evaluation.savedAtUtc
        )
      : null;
    const updated: StoredInitiative = {
      ...current,
      name: body.name.trim(),
      squadId: body.squadId,
      squadName: squadName(body.squadId),
      productOwner: body.productOwner.trim(),
      targetMonths: body.targetMonths,
      evaluation,
    };
    initiatives = all().map((i) => (i.id === updated.id ? updated : i));
    return HttpResponse.json(respond(updated));
  }),

  http.put(`${BASE}/:id/status`, async ({ params, request }) => {
    const current = all().find((i) => i.id === params.id);
    if (!current) return notFound();
    const body = (await request.json().catch(() => null)) as {
      status?: string;
    } | null;
    const status = body?.status as InitiativeStatus | undefined;
    if (!status || !STATUSES.includes(status)) {
      return HttpResponse.json({ message: "Estado inválido" }, { status: 400 });
    }
    if (status === "Active" && !current.evaluation) {
      return HttpResponse.json(
        { message: "Para activar una iniciativa primero hay que evaluarla" },
        { status: 400 }
      );
    }
    // La regla es del dominio —el backend real la hace cumplir en
    // ChangeInitiativeStatusUseCase—, así que el mock la sostiene igual: si sólo
    // la vigilara la pantalla, contra mocks se vería un camino que el servidor
    // rechaza. Excluir la propia es lo que deja reactivar la que ya está activa
    // sin que choque consigo misma.
    if (status === "Active" && squadHasOtherActive(current)) {
      return HttpResponse.json(
        {
          message:
            "La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra.",
        },
        { status: 400 }
      );
    }
    if (status === "Closed" && current.status !== "Active") {
      return HttpResponse.json(
        { message: "Sólo se cierra una iniciativa activa" },
        { status: 400 }
      );
    }
    const updated = { ...current, status };
    initiatives = all().map((i) => (i.id === updated.id ? updated : i));
    return HttpResponse.json(respond(updated));
  }),

  http.put(`${BASE}/:id/evaluation`, async ({ params, request }) => {
    const current = all().find((i) => i.id === params.id);
    if (!current) return notFound();
    const body = await request.json().catch(() => null);
    if (!isValidEvaluation(body))
      return HttpResponse.json(
        { message: "Evaluación inválida" },
        { status: 400 }
      );
    const updated: StoredInitiative = {
      ...current,
      targetMonths: body.targetMonths,
      evaluation: evaluate(body, new Date().toISOString()),
    };
    initiatives = all().map((i) => (i.id === updated.id ? updated : i));
    return HttpResponse.json(respond(updated));
  }),
];
