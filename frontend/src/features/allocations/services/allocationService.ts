import { httpClient } from "@shared/services/httpClient";
import type { PagedResult } from "@shared/services/pagination";
import type {
  Modality,
  Seniority,
} from "@features/people/services/personService";

export interface AllocationDto {
  id: string;
  personId: string;
  personName: string;
  squadId: string;
  squadName: string;
  initiativeId: string | null;
  initiativeName: string | null;
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  // Calculados por el backend: datos de la persona y su disponibilidad
  // contando todas sus células. Sólo lectura; no viajan en alta/edición.
  // Hoy los sirve el mock (brecha documentada en add-squad-detail-page).
  personPosition: string;
  personModality: Modality;
  personSeniority: Seniority;
  personSeniorityLabel: string;
  /** 100 − dedicación: una persona tiene una sola asignación. */
  personAvailablePercentage: number;
}

// El alta/edición reales no aceptan initiativeId — no hay pantalla de
// Iniciativas todavía (ver proposal.md), así que esta pantalla no lo captura.
export interface CreateAllocationRequest {
  personId: string;
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
}

// UpdateAllocationRequest real tampoco acepta personId/squadId — sólo se
// edita el desglose de dedicación.
export interface UpdateAllocationRequest {
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
}

const SQUADS_URL = "/squads";
const ALLOCATIONS_URL = "/allocations";

export const allocationService = {
  listBySquad: async (
    squadId: string,
    page: number,
    pageSize: number,
    search?: string,
    seniorities?: Seniority[]
  ): Promise<PagedResult<AllocationDto>> => {
    // Serializado a mano como personService: `seniority=A&seniority=B`.
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    seniorities?.forEach((s) => params.append("seniority", String(s)));
    const response = await httpClient.get<PagedResult<AllocationDto>>(
      `${SQUADS_URL}/${squadId}/allocations`,
      { params }
    );
    return response.data;
  },

  create: async (
    squadId: string,
    request: CreateAllocationRequest
  ): Promise<AllocationDto> => {
    const response = await httpClient.post<AllocationDto>(
      `${SQUADS_URL}/${squadId}/allocations`,
      request
    );
    return response.data;
  },

  update: async (
    id: string,
    request: UpdateAllocationRequest
  ): Promise<AllocationDto> => {
    const response = await httpClient.put<AllocationDto>(
      `${ALLOCATIONS_URL}/${id}`,
      request
    );
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${ALLOCATIONS_URL}/${id}`);
  },
};
