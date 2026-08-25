import { httpClient } from "@shared/services/httpClient";

/**
 * La cola de triage del backlog. Los work items de DevOps no existen aún en
 * el backend: el contrato lo fija el mock (design.md D1).
 */

export type TriageStatus = "Pending" | "Classified" | "Rejected";
export type ClassificationKind = "Initiative" | "Bau" | "Discard";
export type RejectReason =
  "OtherPerson" | "DevOpsMistake" | "Duplicate" | "OtherTeam" | "Other";

export interface StoryClassificationDto {
  kind: ClassificationKind;
  initiativeId: string | null;
  bauCategory: string | null;
  /** ISO date. */
  classifiedAt: string;
}

export interface BacklogStoryDto {
  id: string;
  /** Número del work item en DevOps. */
  number: number;
  title: string;
  description: string;
  type: "UserStory";
  points: number;
  devOpsState: string;
  board: string;
  sprint: string;
  epicTitle: string | null;
  /** Iniciativa a la que está mapeado el Epic, si lo está (RN-55). */
  epicInitiativeId: string | null;
  /** Usuario DevOps asignado. */
  assignedTo: string;
  /** Usuario DevOps anterior, cuando el asignado cambió desde la última clasificación (RN-54). */
  previousAssignedTo: string | null;
  /** Persona resuelta por la identidad vinculada (null = excluida de la cola). */
  personId: string | null;
  personName: string | null;
  personPosition: string | null;
  squadId: string | null;
  squadName: string | null;
  /** ISO date de la ingesta. */
  ingestedAt: string;
  status: TriageStatus;
  classification: StoryClassificationDto | null;
  rejectReason: RejectReason | null;
  rejectDetail: string | null;
  /** Orden en la cola (menor primero). */
  order: number;
}

export interface BacklogSummaryDto {
  total: number;
  pending: number;
  classifiedToday: number;
  pendingBySquad: Array<{
    squadId: string;
    squadName: string;
    pending: number;
  }>;
  /** Historias fuera de la cola por usuarios DevOps sin persona vinculada. */
  excludedWithoutIdentity: number;
}

export interface BacklogQueueDto {
  items: BacklogStoryDto[];
  summary: BacklogSummaryDto;
}

export interface BacklogQueueFilters {
  squadId?: string;
  personId?: string;
  status?: TriageStatus;
}

export interface InitiativeDto {
  id: string;
  name: string;
  squadId: string;
}

export interface BacklogCatalogsDto {
  initiatives: InitiativeDto[];
  bauCategories: string[];
  rejectReasons: Array<{ value: RejectReason; label: string }>;
}

export interface ClassifyRequest {
  kind: ClassificationKind;
  initiativeId?: string;
  bauCategory?: string;
}

export interface RejectRequest {
  reason: RejectReason;
  reassignToPersonId?: string;
  detail?: string;
}

const BACKLOG_URL = "/backlog";

export const backlogService = {
  getQueue: async (
    filters: BacklogQueueFilters = {}
  ): Promise<BacklogQueueDto> => {
    const params = new URLSearchParams();
    if (filters.squadId) params.set("squadId", filters.squadId);
    if (filters.personId) params.set("personId", filters.personId);
    if (filters.status) params.set("status", filters.status);
    const response = await httpClient.get<BacklogQueueDto>(
      `${BACKLOG_URL}/queue`,
      {
        params,
      }
    );
    return response.data;
  },

  getCatalogs: async (): Promise<BacklogCatalogsDto> => {
    const response = await httpClient.get<BacklogCatalogsDto>(
      `${BACKLOG_URL}/catalogs`
    );
    return response.data;
  },

  classify: async (
    storyId: string,
    request: ClassifyRequest
  ): Promise<void> => {
    await httpClient.post(`${BACKLOG_URL}/items/${storyId}/classify`, request);
  },

  skip: async (storyId: string): Promise<void> => {
    await httpClient.post(`${BACKLOG_URL}/items/${storyId}/skip`);
  },

  undo: async (storyId: string): Promise<void> => {
    await httpClient.post(`${BACKLOG_URL}/items/${storyId}/undo`);
  },

  reject: async (storyId: string, request: RejectRequest): Promise<void> => {
    await httpClient.post(`${BACKLOG_URL}/items/${storyId}/reject`, request);
  },
};
