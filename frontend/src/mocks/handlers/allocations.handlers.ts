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
import { getPeopleSnapshot } from "./people.handlers";
import {
  initialAllocationSeeds,
  SQUAD_NAMES,
  type AllocationSeed,
} from "./allocations.seeds";

const now = new Date().toISOString();

// Lo que el mock persiste: la asignación en sí. Los campos de persona y
// disponibilidad se derivan al responder (ver enrich).
type StoredAllocation = Omit<
  AllocationDto,
  | "personPosition"
  | "personModality"
  | "personLevel"
  | "personLevelLabel"
  | "personAvailablePercentage"
>;

/**
 * Las semillas viven en `allocations.seeds` porque `people.handlers` deriva
 * de ellas la utilización de cada persona. Acá sólo se resuelven los nombres a
 * ids contra el snapshot de personas, que ya está construido cuando este
 * módulo se evalúa (allocations importa a people, nunca al revés).
 */
function seedAllocations(): StoredAllocation[] {
  const idByName = new Map(getPeopleSnapshot().map((p) => [p.name, p.id]));
  return initialAllocationSeeds.flatMap(
    (seed: AllocationSeed, index: number): StoredAllocation[] => {
      const personId = idByName.get(seed.personName);
      // Una semilla que nombra a alguien que no está sembrado es un error de
      // datos, no un caso de uso: se descarta en vez de crear una asignación
      // huérfana que rompería el enriquecido.
      if (!personId) return [];
      const n = String(index + 1);
      return [
        {
          id: `a${n.repeat(7)}-${n.repeat(4)}-${n.repeat(4)}-${n.repeat(4)}-${n.repeat(12)}`,
          personId,
          personName: seed.personName,
          squadId: seed.squadId,
          squadName: SQUAD_NAMES[seed.squadId],
          initiativeId: null,
          initiativeName: null,
          dedicationPercentage: seed.dedication,
          bauPercentage: seed.bau,
          transformationPercentage: seed.dedication - seed.bau,
          createdAtUtc: now,
          updatedAtUtc: now,
        },
      ];
    }
  );
}

let allocations: StoredAllocation[] = seedAllocations();

/** Completa una asignación con los datos de la persona y su margen. */
function enrich(allocation: StoredAllocation): AllocationDto {
  const person = getPeopleSnapshot().find((p) => p.id === allocation.personId);
  return {
    ...allocation,
    personName: person?.name ?? allocation.personName,
    personPosition: person?.position ?? "",
    personModality: person?.modality ?? "Hybrid",
    personLevel: person?.level ?? 0,
    personLevelLabel: person?.levelLabel ?? "",
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
  levels: number[]
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
  if (levels.length > 0) {
    filtered = filtered.filter((a) => levels.includes(a.personLevel));
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
  allocations = seedAllocations();
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
    const levels = url.searchParams
      .getAll("level")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    const bySquad = allocations
      .filter((a) => a.squadId === squadId)
      .map(enrich);
    return HttpResponse.json(
      paginate(filterAllocations(bySquad, search, levels), page, pageSize)
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
