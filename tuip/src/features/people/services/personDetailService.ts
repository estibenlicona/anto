import { httpClient } from "@shared/services/httpClient";
import type { Criticality } from "@features/squads/services/squadService";
import type { PersonDto } from "./personService";

/**
 * Detalle agregado de una persona: una sola llamada alimenta toda la página
 * (ver design.md D1). Horas, DevOps y capacidades no existen aún en el
 * backend — el contrato lo fija el mock y el backend real deberá honrarlo.
 */

export type HoursReportStatus =
  "NotReported" | "Draft" | "Submitted" | "Validated";

export interface PersonDetailAllocationDto {
  id: string;
  squadId: string;
  squadName: string;
  squadCriticality: Criticality;
  squadTribe: string;
  squadDescription: string;
  /** Nombres de las demás personas de la célula. */
  teammates: string[];
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
  /** ISO date: desde cuándo está en esa célula. */
  since: string;
  /** Nivel SFIA que la célula pide para la capacidad principal de la persona. */
  requiredSfia: number;
}

export interface SprintHoursDto {
  sprint: string;
  /** Horas del sprint (todas las personas reportan contra el mismo total). */
  sprintHours: number;
  bauHours: number;
  initiativeHours: number;
  freeHours: number;
  status: HoursReportStatus;
}

export interface CurrentHoursReportDto extends SprintHoursDto {
  toleranceMin: number;
  toleranceMax: number;
  submittedAt: string | null;
  closesAt: string;
}

export interface DevOpsIdentityDto {
  id: string;
  userName: string;
  linkedAt: string;
  activeItems: number;
  initiativeItems: number;
  bauItems: number;
  pendingCuration: number;
}

export interface DevOpsCandidateDto {
  id: string;
  userName: string;
  displayName: string;
}

/** Un stack de la persona con su cobertura en el chapter, derivada del mock de personas. */
export interface PersonStackDetailDto {
  name: string;
  /** Nivel en la escala Tuya (1–4). */
  level: number;
  isPrimary: boolean;
  /** Cuántas personas más del chapter lo tienen. */
  otherCoverers: number;
  /** Hasta tres de ellas, para los avatares. */
  coverers: Array<{ id: string; name: string }>;
}

export interface SuggestedSquadDto {
  id: string;
  name: string;
  criticality: Criticality;
  reason: string;
  requiredSfia: number;
  allocatedFte: number;
  teamAvailableFte: number;
}

export type CostReading = "InRange" | "High" | "Low";

export interface PersonDetailDto {
  person: PersonDto;
  providerName: string | null;
  contractEndsAt: string | null;
  /**
   * El chapter de la persona y quien lo lidera. Es la relación que decide qué
   * ve ese lead en sus pantallas: la que muestra la ficha y la que acota el
   * listado son la misma, para que nadie figure a cargo de alguien que no la
   * ve. La línea de expertise sigue existiendo y sigue teniendo su líder, pero
   * no decide alcance — por eso son dos pares de campos y no uno.
   */
  chapterName: string | null;
  chapterLeadName: string | null;
  expertiseLineName: string | null;
  expertiseLineLeadName: string | null;
  allocation: PersonDetailAllocationDto | null;
  /** FTE real del último sprint validado (horas sin libres / horas del sprint), o null. */
  realFte: number | null;
  currentReport: CurrentHoursReportDto | null;
  /** Últimos seis sprints, del más antiguo al más reciente. */
  sprints: SprintHoursDto[];
  devOpsIdentity: DevOpsIdentityDto | null;
  devOpsCandidates: DevOpsCandidateDto[];
  stacks: PersonStackDetailDto[];
  costReading: CostReading;
  /** Sólo sin célula: células que piden la capacidad principal de la persona. */
  suggestedSquads: SuggestedSquadDto[];
}

const PEOPLE_URL = "/people";

export const personDetailService = {
  getDetail: async (personId: string): Promise<PersonDetailDto> => {
    const response = await httpClient.get<PersonDetailDto>(
      `${PEOPLE_URL}/${personId}/detail`
    );
    return response.data;
  },

  validateHours: async (personId: string, sprint: string): Promise<void> => {
    await httpClient.post(`${PEOPLE_URL}/${personId}/hours/${sprint}/validate`);
  },

  linkDevOpsIdentity: async (
    personId: string,
    identityId: string
  ): Promise<void> => {
    await httpClient.post(`${PEOPLE_URL}/${personId}/devops-identity`, {
      identityId,
    });
  },
};
