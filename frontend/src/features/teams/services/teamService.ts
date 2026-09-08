import { httpClient } from "@shared/services/httpClient";
import type { PagedResult } from "@shared/services/pagination";

export interface TeamDto {
  id: string;
  name: string;
  description: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  /** Cuántas células pertenecen a este equipo — calculado, nunca viaja en alta/edición. */
  squadCount: number;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export type UpdateTeamRequest = CreateTeamRequest;

const TEAMS_URL = "/teams";

export const teamService = {
  list: async (
    page: number,
    pageSize: number,
    search?: string
  ): Promise<PagedResult<TeamDto>> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    const response = await httpClient.get<PagedResult<TeamDto>>(TEAMS_URL, {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<TeamDto> => {
    const response = await httpClient.get<TeamDto>(`${TEAMS_URL}/${id}`);
    return response.data;
  },

  create: async (request: CreateTeamRequest): Promise<TeamDto> => {
    const response = await httpClient.post<TeamDto>(TEAMS_URL, request);
    return response.data;
  },

  update: async (id: string, request: UpdateTeamRequest): Promise<TeamDto> => {
    const response = await httpClient.put<TeamDto>(
      `${TEAMS_URL}/${id}`,
      request
    );
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${TEAMS_URL}/${id}`);
  },
};
