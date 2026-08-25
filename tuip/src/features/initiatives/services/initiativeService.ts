import { httpClient } from "@shared/services/httpClient";
import type { PagedResult } from "@shared/services/pagination";
import type {
  DimensionResult,
  EvaluationModel,
  MixResult,
  TriageVerdict,
} from "./evaluationModel";

export type InitiativeStatus = "Evaluating" | "Active" | "Closed";

/** Lo que se guarda de una evaluación: lo respondido y lo calculado. */
export interface InitiativeEvaluationDto {
  triage: boolean[];
  answers: Record<string, number>;
  targetMonths: number;
  points: number;
  maxPoints: number;
  pct: number;
  talla: string;
  pmMin: number;
  pmMax: number;
  fteExpected: number;
  fteMin: number;
  fteMax: number;
  dimensions: DimensionResult[];
  mix: MixResult[];
  triageVerdict: TriageVerdict;
  savedAtUtc: string;
}

export interface InitiativeDto {
  id: string;
  name: string;
  squadId: string;
  squadName: string;
  productOwner: string;
  targetMonths: number;
  status: InitiativeStatus;
  evaluation: InitiativeEvaluationDto | null;
  createdAtUtc: string;
  /**
   * Si la célula de esta iniciativa ya tiene otra activa: una célula sostiene
   * un solo trabajo a la vez, así que esto es lo que decide si se puede
   * activar. Lo resuelve el servidor contra todas las iniciativas de la célula
   * —no contra la página listada—, porque la activa puede estar en otra página
   * o fuera del filtro, y ahí el cliente concluiría que no hay ninguna.
   */
  squadHasOtherActive: boolean;
}

export interface InitiativeInput {
  name: string;
  squadId: string;
  productOwner: string;
  targetMonths: number;
}

export interface SaveEvaluationRequest {
  triage: boolean[];
  answers: Record<string, number>;
  targetMonths: number;
}

export interface InitiativesStats {
  total: number;
  unevaluated: number;
  active: number;
  /** Todas las tallas del modelo en orden, con cero donde no hay activas. */
  activeByTalla: Array<{ talla: string; count: number }>;
  fteDemand: number;
}

export interface InitiativeFilters {
  search?: string;
  status?: InitiativeStatus[];
  squadId?: string[];
  talla?: string[];
}

const BASE = "/initiatives";

export const initiativeService = {
  list: async (
    page: number,
    pageSize: number,
    filters: InitiativeFilters = {}
  ): Promise<PagedResult<InitiativeDto>> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    filters.status?.forEach((s) => params.append("status", s));
    filters.squadId?.forEach((s) => params.append("squadId", s));
    filters.talla?.forEach((t) => params.append("talla", t));
    const response = await httpClient.get<PagedResult<InitiativeDto>>(
      `${BASE}?${params.toString()}`
    );
    return response.data;
  },

  get: async (id: string): Promise<InitiativeDto> => {
    const response = await httpClient.get<InitiativeDto>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (input: InitiativeInput): Promise<InitiativeDto> => {
    const response = await httpClient.post<InitiativeDto>(BASE, input);
    return response.data;
  },

  update: async (
    id: string,
    input: InitiativeInput
  ): Promise<InitiativeDto> => {
    const response = await httpClient.put<InitiativeDto>(
      `${BASE}/${id}`,
      input
    );
    return response.data;
  },

  setStatus: async (
    id: string,
    status: InitiativeStatus
  ): Promise<InitiativeDto> => {
    const response = await httpClient.put<InitiativeDto>(
      `${BASE}/${id}/status`,
      {
        status,
      }
    );
    return response.data;
  },

  saveEvaluation: async (
    id: string,
    request: SaveEvaluationRequest
  ): Promise<InitiativeDto> => {
    const response = await httpClient.put<InitiativeDto>(
      `${BASE}/${id}/evaluation`,
      request
    );
    return response.data;
  },

  getStats: async (): Promise<InitiativesStats> => {
    const response = await httpClient.get<InitiativesStats>(`${BASE}/stats`);
    return response.data;
  },

  getEvaluationModel: async (): Promise<EvaluationModel> => {
    const response = await httpClient.get<EvaluationModel>(
      `${BASE}/evaluation-model`
    );
    return response.data;
  },
};
