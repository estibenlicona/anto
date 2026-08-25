import { http, HttpResponse } from "msw";
import type {
  Criticality,
  CreateSquadRequest,
  SquadDto,
  SquadsStats,
  SquadTeamStats,
  SquadActiveInitiativeDto,
} from "@features/squads/services/squadService";
import { clampPagination, paginate } from "@shared/services/pagination";
// Única excepción al "cada mock vive solo": equipo y capacidad por célula se
// calculan sobre las asignaciones reales en memoria (y el FTE del chapter sobre
// las personas), para que lo que se asigna en Capacidades se vea en Células en
// la misma sesión. La dependencia va en una sola dirección (squads → los otros
// dos) y es de sólo lectura, así que no hay ciclo ni mutación cruzada.
import { getAllocationsSnapshot } from "./allocations.handlers";
import { availableFteOf, fteOfPercentages, round1 } from "./fte";
import { vistaDe, type Vista } from "./scope";
import { getInitiativesSnapshot } from "./initiatives.handlers";

const SQUADS_URL = "/squads";
const SQUADS_STATS_URL = "/squads/stats";
const CRITICALITY_VALUES: Criticality[] = ["Critical", "High", "Medium", "Low"];
const MEMBER_SAMPLE_SIZE = 3;

const now = new Date().toISOString();

// Lo que el mock persiste: los atributos que se capturan en el formulario.
// Los campos calculados (personas, capacidad, iniciativas) se derivan al responder.
export type StoredSquad = Omit<
  SquadDto,
  | "memberCount"
  | "members"
  | "allocatedFte"
  | "bauFte"
  | "transformationFte"
  | "peopleAvailableFte"
  | "activeInitiative"
>;

// Cubren las 4 criticidades y 4 equipos; Pagos Instantáneos queda sin personas a
// propósito (ver las semillas de allocations.handlers.ts).
const initialSquads: StoredSquad[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Backend Platform",
    team: "Ecosistema Digital",
    criticality: "High",
    description: "Servicios core y APIs compartidas.",
    createdAtUtc: now,
    updatedAtUtc: now,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Canales Digitales",
    team: "Ecosistema Digital",
    criticality: "Critical",
    description: "App móvil y banca en línea.",
    createdAtUtc: now,
    updatedAtUtc: now,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Fraude Tarjetas",
    team: "Riesgo y Fraude",
    criticality: "Critical",
    description:
      "Motor de scoring transaccional, reglas antifraude y monitoreo en tiempo real de las operaciones con tarjeta.",
    createdAtUtc: now,
    updatedAtUtc: now,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Pagos Instantáneos",
    team: "Pagos",
    criticality: "Low",
    description: null,
    createdAtUtc: now,
    updatedAtUtc: now,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Plataforma de Datos",
    team: "Datos y Analítica",
    criticality: "Medium",
    description: "Lakehouse, pipelines y gobierno de datos.",
    createdAtUtc: now,
    updatedAtUtc: now,
  },
];

let squads: StoredSquad[] = initialSquads.map((s) => ({ ...s }));

/**
 * Σ availableFte de las personas que aparecen en estas asignaciones.
 *
 * Las asignaciones que llegan acá salen de la vista, así que su persona está
 * entre las visibles y el `?? 0` no se dispara. Si alguna vez se le pasaran
 * las asignaciones sin acotar, ese cero silencioso haría que la célula
 * pareciera al tope sin que nada fallara: por eso el cruce se hace siempre
 * contra `vista.people` y no contra el snapshot completo.
 */
function peopleAvailableFteOf(
  own: ReturnType<typeof getAllocationsSnapshot>,
  people: Vista["people"]
): number {
  return availableFteOf(
    own.map((a) => ({
      availableFte: people.find((p) => p.id === a.personId)?.availableFte ?? 0,
    }))
  );
}

/**
 * La iniciativa activa de la célula, derivada del mock de iniciativas — igual
 * que las cifras de capacidad se derivan del de asignaciones. Derivarla en vez
 * de guardarla en la célula es lo que hace que activar o cerrar una iniciativa
 * se vea acá dentro de la misma sesión, sin sincronizar dos puntas.
 *
 * `find` y no `filter[0]`: la célula tiene una activa o ninguna —activar una
 * segunda se rechaza, ver initiatives.handlers—, y buscar dice eso; quedarse
 * con el primero de varios diría que el resto se descarta.
 */
function activeInitiativeOf(squadId: string): SquadActiveInitiativeDto | null {
  const active = getInitiativesSnapshot().find(
    (i) => i.squadId === squadId && i.status === "Active"
  );
  // Sólo se activa lo evaluado, así que la talla está; el `?? ""` es para el
  // tipo, no para un caso que el mock pueda producir.
  return active
    ? { id: active.id, name: active.name, talla: active.evaluation?.talla ?? "" }
    : null;
}

/**
 * Suma equipo y capacidad de una célula desde las asignaciones vigentes —las
 * de las personas que quien pidió alcanza a ver, ver scope.ts—.
 */
function enrich(squad: StoredSquad, vista: Vista): SquadDto {
  const own = vista.allocations.filter((a) => a.squadId === squad.id);
  // La fórmula vive en ./fte: Torre, Células y Líneas comparten la cuenta.
  const sum = (pick: (a: (typeof own)[number]) => number) =>
    fteOfPercentages(own.map(pick));
  return {
    ...squad,
    memberCount: own.length,
    members: [...own]
      .sort((a, b) => a.personName.localeCompare(b.personName))
      .slice(0, MEMBER_SAMPLE_SIZE)
      .map((a) => ({ id: a.personId, name: a.personName })),
    allocatedFte: sum((a) => a.dedicationPercentage),
    bauFte: sum((a) => a.bauPercentage),
    transformationFte: sum((a) => a.transformationPercentage),
    peopleAvailableFte: peopleAvailableFteOf(own, vista.people),
    activeInitiative: activeInitiativeOf(squad.id),
  };
}

/** Resumen del equipo de una célula: sus asignaciones cruzadas con las personas. */
function computeTeamStats(squad: StoredSquad, vista: Vista): SquadTeamStats {
  const own = vista.allocations.filter((a) => a.squadId === squad.id);
  const people = vista.people;
  const members = own
    .map((a) => people.find((p) => p.id === a.personId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  // La fórmula vive en ./fte: Torre, Células y Líneas comparten la cuenta.
  const sum = (pick: (a: (typeof own)[number]) => number) =>
    fteOfPercentages(own.map(pick));
  return {
    memberCount: own.length,
    members: [...own]
      .sort((a, b) => a.personName.localeCompare(b.personName))
      .map((a) => ({ id: a.personId, name: a.personName })),
    expertCount: members.filter((p) => p.seniority === 4).length,
    beginnerCount: members.filter((p) => p.seniority === 1).length,
    allocatedFte: sum((a) => a.dedicationPercentage),
    bauFte: sum((a) => a.bauPercentage),
    transformationFte: sum((a) => a.transformationPercentage),
    peopleAvailableFte: peopleAvailableFteOf(own, vista.people),
  };
}

function filterSquads(
  source: StoredSquad[],
  search: string | null,
  criticalities: Criticality[]
): StoredSquad[] {
  let filtered = source;
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.team.toLowerCase().includes(term)
    );
  }
  if (criticalities.length > 0) {
    filtered = filtered.filter((s) => criticalities.includes(s.criticality));
  }
  return filtered;
}

function computeStats(source: StoredSquad[], vista: Vista): SquadsStats {
  const enriched = source.map((s) => enrich(s, vista));
  const total = (pick: (s: SquadDto) => number) =>
    round1(enriched.reduce((acc, s) => acc + pick(s), 0));
  return {
    totalCount: source.length,
    withoutPeopleCount: enriched.filter((s) => s.memberCount === 0).length,
    atCapacityCount: enriched.filter(
      (s) => s.memberCount > 0 && s.allocatedFte >= s.peopleAvailableFte
    ).length,
    teamCount: new Set(source.map((s) => s.team)).size,
    allocatedFte: total((s) => s.allocatedFte),
    bauFte: total((s) => s.bauFte),
    transformationFte: total((s) => s.transformationFte),
    chapterFte: availableFteOf(vista.people),
    byCriticality: CRITICALITY_VALUES.map((criticality) => ({
      criticality,
      count: source.filter((s) => s.criticality === criticality).length,
    })),
  };
}

/**
 * Lectura del estado vigente para otros handlers (chapter.handlers arma el
 * resumen de capacidad del chapter). Sólo lectura; función por la misma razón
 * que en allocations/people: el array se reasigna en cada mutación.
 */
export function getSquadsSnapshot(): StoredSquad[] {
  return squads;
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan mutaciones. */
export function resetSquadsMock() {
  squads = initialSquads.map((s) => ({ ...s }));
}

function isValidCreateRequest(value: unknown): value is CreateSquadRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<CreateSquadRequest>;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    v.name.length <= 200 &&
    typeof v.team === "string" &&
    v.team.length > 0 &&
    v.team.length <= 100 &&
    (v.description === undefined ||
      (typeof v.description === "string" && v.description.length <= 500)) &&
    typeof v.criticality === "string" &&
    CRITICALITY_VALUES.includes(v.criticality as Criticality)
  );
}

export const squadsHandlers = [
  http.get(SQUADS_STATS_URL, ({ request }) => {
    return HttpResponse.json(computeStats(squads, vistaDe(request)));
  }),

  http.get(SQUADS_URL, ({ request }) => {
    const url = new URL(request.url);
    const { page, pageSize } = clampPagination(
      Number(url.searchParams.get("page")) || null,
      Number(url.searchParams.get("pageSize")) || null
    );
    const search = url.searchParams.get("search");
    const criticalities = url.searchParams
      .getAll("criticality")
      .filter((c): c is Criticality =>
        CRITICALITY_VALUES.includes(c as Criticality)
      );
    const filtered = filterSquads(squads, search, criticalities);
    const result = paginate(filtered, page, pageSize);
    // Las células se listan todas: son del chapter, no de una persona. Lo que
    // se acota es su equipo y las cifras que salen de él.
    const vista = vistaDe(request);
    return HttpResponse.json({
      ...result,
      items: result.items.map((s) => enrich(s, vista)),
    });
  }),

  http.get(`${SQUADS_URL}/:id/team-stats`, ({ params, request }) => {
    const existing = squads.find((s) => s.id === params.id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Célula no encontrada" },
        { status: 404 }
      );
    }
    return HttpResponse.json(computeTeamStats(existing, vistaDe(request)));
  }),

  http.get(`${SQUADS_URL}/:id`, ({ params, request }) => {
    const existing = squads.find((s) => s.id === params.id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Célula no encontrada" },
        { status: 404 }
      );
    }
    return HttpResponse.json(enrich(existing, vistaDe(request)));
  }),

  http.post(SQUADS_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de célula inválidos" },
        { status: 400 }
      );
    }
    const nowIso = new Date().toISOString();
    const created: StoredSquad = {
      id: crypto.randomUUID(),
      name: body.name,
      team: body.team,
      criticality: body.criticality,
      description: body.description ?? null,
      createdAtUtc: nowIso,
      updatedAtUtc: nowIso,
    };
    squads = [...squads, created];
    // Recién creada: sin asignaciones, así que enrich() devuelve ceros.
    return HttpResponse.json(enrich(created, vistaDe(request)), {
      status: 201,
    });
  }),

  http.put(`${SQUADS_URL}/:id`, async ({ request, params }) => {
    const { id } = params;
    const existing = squads.find((s) => s.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Célula no encontrada" },
        { status: 404 }
      );
    }
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de célula inválidos" },
        { status: 400 }
      );
    }
    const updated: StoredSquad = {
      ...existing,
      name: body.name,
      team: body.team,
      criticality: body.criticality,
      description: body.description ?? null,
      updatedAtUtc: new Date().toISOString(),
    };
    squads = squads.map((s) => (s.id === id ? updated : s));
    return HttpResponse.json(enrich(updated, vistaDe(request)));
  }),

  http.delete(`${SQUADS_URL}/:id`, ({ params }) => {
    const { id } = params;
    const existing = squads.find((s) => s.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Célula no encontrada" },
        { status: 404 }
      );
    }
    squads = squads.filter((s) => s.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/criticalities", () => {
    return HttpResponse.json(CRITICALITY_VALUES);
  }),
];
