import { http, HttpResponse } from "msw";
import type {
  AllocationDto,
  CreateAllocationRequest,
  UpdateAllocationRequest,
} from "@features/allocations/services/allocationService";
import { clampPagination, paginate } from "@shared/services/pagination";
// Segunda excepción al "cada mock vive solo" (la primera es squads.handlers):
// la fila del equipo necesita cargo, modalidad, seniority y disponibilidad de
// la persona, y eso sólo lo sabe el mock de personas. Lectura en un solo
// sentido (allocations → people); people no importa a nadie, así que no hay
// ciclo.
import { getPeopleSnapshot, peopleFor } from "./people.handlers";

const now = new Date().toISOString();

// Lo que el mock persiste: la asignación en sí. Los campos de persona y
// disponibilidad se derivan al responder (ver enrich).
type StoredAllocation = Omit<
  AllocationDto,
  | "personPosition"
  | "personModality"
  | "personSeniority"
  | "personSeniorityLabel"
  | "personAvailablePercentage"
>;

// Nombres de ejemplo de las semillas — el nombre real sale de la persona en
// memoria al responder; esto sólo cubre el `personName` guardado.
const PERSON_NAMES: Record<string, string> = {
  "p1111111-1111-1111-1111-111111111111": "María González",
  "p2222222-2222-2222-2222-222222222222": "Laura Ruiz",
  "p3333333-3333-3333-3333-333333333333": "Carlos López",
  // Ids de las personas generadas en people.handlers.ts (una letra repetida
  // por índice: a = Andrés, b = Paula, c = Diego, d = Valentina, e = Sebastián).
  "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa": "Andrés Martínez",
  "pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb": "Paula Ramírez",
  "pccccccc-cccc-cccc-cccc-cccccccccccc": "Diego Salazar",
  "pddddddd-dddd-dddd-dddd-dddddddddddd": "Valentina Ospina",
  "peeeeeee-eeee-eeee-eeee-eeeeeeeeeeee": "Sebastián Cárdenas",
  "phhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh": "Isabella Moreno",
};

const SQUAD_NAMES: Record<string, string> = {
  "11111111-1111-1111-1111-111111111111": "Backend Platform",
  "22222222-2222-2222-2222-222222222222": "Canales Digitales",
  "33333333-3333-3333-3333-333333333333": "Fraude Tarjetas",
  "44444444-4444-4444-4444-444444444444": "Pagos Instantáneos",
  "55555555-5555-5555-5555-555555555555": "Plataforma de Datos",
};

// Semillas con variedad a propósito: Backend Platform tiene 4 personas (para
// que el listado de Células muestre el "+N" de avatares), Pagos Instantáneos
// no tiene ninguna, y ninguna persona supera el 100% sumando células (RN-12).
const seed = (
  n: number,
  personId: string,
  squadId: string,
  dedication: number,
  bau: number
): StoredAllocation => ({
  id: `a${String(n).repeat(7)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(12)}`,
  personId,
  personName: PERSON_NAMES[personId],
  squadId,
  squadName: SQUAD_NAMES[squadId],
  initiativeId: null,
  initiativeName: null,
  dedicationPercentage: dedication,
  bauPercentage: bau,
  transformationPercentage: dedication - bau,
  createdAtUtc: now,
  updatedAtUtc: now,
});

const BACKEND = "11111111-1111-1111-1111-111111111111";
const CANALES = "22222222-2222-2222-2222-222222222222";
const FRAUDE = "33333333-3333-3333-3333-333333333333";
const DATOS = "55555555-5555-5555-5555-555555555555";

// Una persona pertenece a una sola célula: ninguna aparece dos veces. Isabella
// (h) completa las 4 personas de Backend Platform para que el listado de
// Células muestre el "+N" de avatares.
const initialAllocations: StoredAllocation[] = [
  seed(1, "p1111111-1111-1111-1111-111111111111", BACKEND, 80, 50),
  seed(2, "p3333333-3333-3333-3333-333333333333", BACKEND, 100, 60),
  seed(3, "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", BACKEND, 50, 20),
  seed(4, "phhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh", BACKEND, 50, 30),
  seed(5, "p2222222-2222-2222-2222-222222222222", CANALES, 100, 30),
  seed(6, "pccccccc-cccc-cccc-cccc-cccccccccccc", CANALES, 100, 70),
  seed(7, "pddddddd-dddd-dddd-dddd-dddddddddddd", FRAUDE, 60, 20),
  seed(8, "peeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", DATOS, 100, 50),
  seed(9, "pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", DATOS, 60, 60),
];

let allocations: StoredAllocation[] = initialAllocations.map((a) => ({ ...a }));

/** Completa una asignación con los datos de la persona y su margen. */
function enrich(allocation: StoredAllocation): AllocationDto {
  const person = getPeopleSnapshot().find((p) => p.id === allocation.personId);
  return {
    ...allocation,
    personName: person?.name ?? allocation.personName,
    personPosition: person?.position ?? "",
    personModality: person?.modality ?? "Hybrid",
    personSeniority: person?.seniority ?? 0,
    personSeniorityLabel: person?.seniorityLabel ?? "",
    // Una persona tiene una sola asignación: su margen es lo que no dedica acá.
    personAvailablePercentage: Math.max(
      0,
      100 - allocation.dedicationPercentage
    ),
  };
}

function filterAllocations(
  source: AllocationDto[],
  search: string | null,
  seniorities: number[]
): AllocationDto[] {
  let filtered = source;
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.personName.toLowerCase().includes(term) ||
        a.personPosition.toLowerCase().includes(term)
    );
  }
  if (seniorities.length > 0) {
    filtered = filtered.filter((a) => seniorities.includes(a.personSeniority));
  }
  return filtered;
}

/**
 * Lectura del estado vigente para otros handlers (hoy sólo squads.handlers, que
 * calcula equipo y capacidad por célula). Es una función y no el array
 * exportado porque cada mutación reasigna `allocations`: un import del binding
 * quedaría apuntando al valor viejo. Sólo lectura — nadie más muta acá.
 */
export function getAllocationsSnapshot(): StoredAllocation[] {
  return allocations;
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan mutaciones. */
export function resetAllocationsMock() {
  allocations = initialAllocations.map((a) => ({ ...a }));
}

function isValidCreateRequest(
  value: unknown
): value is CreateAllocationRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<CreateAllocationRequest>;
  return (
    typeof v.personId === "string" &&
    v.personId.length > 0 &&
    typeof v.dedicationPercentage === "number" &&
    v.dedicationPercentage >= 1 &&
    v.dedicationPercentage <= 100 &&
    typeof v.bauPercentage === "number" &&
    v.bauPercentage >= 0 &&
    v.bauPercentage <= 100 &&
    typeof v.transformationPercentage === "number" &&
    v.transformationPercentage >= 0 &&
    v.transformationPercentage <= 100 &&
    v.bauPercentage + v.transformationPercentage === v.dedicationPercentage
  );
}

function isValidUpdateRequest(
  value: unknown
): value is UpdateAllocationRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<UpdateAllocationRequest>;
  return (
    typeof v.dedicationPercentage === "number" &&
    v.dedicationPercentage >= 1 &&
    v.dedicationPercentage <= 100 &&
    typeof v.bauPercentage === "number" &&
    v.bauPercentage >= 0 &&
    v.bauPercentage <= 100 &&
    typeof v.transformationPercentage === "number" &&
    v.transformationPercentage >= 0 &&
    v.transformationPercentage <= 100 &&
    v.bauPercentage + v.transformationPercentage === v.dedicationPercentage
  );
}

export const allocationsHandlers = [
  http.get("/squads/:squadId/allocations", ({ request, params }) => {
    const { squadId } = params;
    const url = new URL(request.url);
    const { page, pageSize } = clampPagination(
      Number(url.searchParams.get("page")) || null,
      Number(url.searchParams.get("pageSize")) || null
    );
    const search = url.searchParams.get("search");
    const seniorities = url.searchParams
      .getAll("seniority")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    // Sólo las asignaciones de la gente a cargo de quien pide. Acá se usa
    // `peopleFor` y no la vista de scope.ts para no importar en círculo: este
    // módulo es el dueño de las asignaciones y scope.ts las lee de él.
    const visibles = new Set(peopleFor(request).map((p) => p.id));
    const bySquad = allocations
      .filter((a) => a.squadId === squadId && visibles.has(a.personId))
      .map(enrich);
    return HttpResponse.json(
      paginate(filterAllocations(bySquad, search, seniorities), page, pageSize)
    );
  }),

  http.post("/squads/:squadId/allocations", async ({ request, params }) => {
    const { squadId } = params;
    const body = await request.json().catch(() => null);
    if (!isValidCreateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de asignación inválidos" },
        { status: 400 }
      );
    }
    // Una persona pertenece a una sola célula (cubre también RN-13).
    if (allocations.some((a) => a.personId === body.personId)) {
      return HttpResponse.json(
        { message: "La persona ya está asignada a una célula" },
        { status: 400 }
      );
    }
    const nowIso = new Date().toISOString();
    const created: StoredAllocation = {
      id: crypto.randomUUID(),
      personId: body.personId,
      personName:
        getPeopleSnapshot().find((p) => p.id === body.personId)?.name ??
        PERSON_NAMES[body.personId] ??
        "Persona",
      squadId: squadId as string,
      squadName: SQUAD_NAMES[squadId as string] ?? "Célula",
      initiativeId: null,
      initiativeName: null,
      dedicationPercentage: body.dedicationPercentage,
      bauPercentage: body.bauPercentage,
      transformationPercentage: body.transformationPercentage,
      createdAtUtc: nowIso,
      updatedAtUtc: nowIso,
    };
    allocations = [...allocations, created];
    return HttpResponse.json(enrich(created), { status: 201 });
  }),

  http.put("/allocations/:id", async ({ request, params }) => {
    const { id } = params;
    const existing = allocations.find((a) => a.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Asignación no encontrada" },
        { status: 404 }
      );
    }
    const body = await request.json().catch(() => null);
    if (!isValidUpdateRequest(body)) {
      return HttpResponse.json(
        { message: "Datos de asignación inválidos" },
        { status: 400 }
      );
    }
    const updated: StoredAllocation = {
      ...existing,
      dedicationPercentage: body.dedicationPercentage,
      bauPercentage: body.bauPercentage,
      transformationPercentage: body.transformationPercentage,
      updatedAtUtc: new Date().toISOString(),
    };
    allocations = allocations.map((a) => (a.id === id ? updated : a));
    return HttpResponse.json(enrich(updated));
  }),

  http.delete("/allocations/:id", ({ params }) => {
    const { id } = params;
    const existing = allocations.find((a) => a.id === id);
    if (!existing) {
      return HttpResponse.json(
        { message: "Asignación no encontrada" },
        { status: 404 }
      );
    }
    allocations = allocations.filter((a) => a.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
