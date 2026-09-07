import { httpClient } from "@shared/services/httpClient";
import type { Criticality } from "@features/squads/services/squadService";
import type {
  BalanceSignal,
  CapacityDto,
  NotEvaluableReason,
  SprintRefDto,
} from "@features/dedication/services/dedicationService";
import type { PersonDto } from "./personService";

/**
 * Detalle agregado de una persona: una sola llamada alimenta toda la página
 * (ver design.md D1). DevOps y capacidades no existen aún en el backend — el
 * contrato lo fija el mock y el backend real deberá honrarlo. La plataforma
 * no registra horas: nada del detalle sale de un reporte de horas.
 */

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
  requiredLevel: number;
}

/**
 * La señal de balance del sprint en curso de la persona, con las reglas de la
 * capability `real-dedication`: la demanda en SP contra su propio histórico y
 * la capacidad medida del sprint, nunca los puntos traducidos a FTE. La
 * calcula el servidor con la misma cuenta que el módulo Dedicación real; acá
 * sólo se muestra, con el enlace a su dashboard para el detalle.
 */
export interface CurrentSprintBalanceDto {
  sprint: SprintRefDto;
  committedPoints: number;
  /** Mediana histórica de SP comprometidos; `null` sin histórico suficiente. */
  ownMedianPoints: number | null;
  /** Desviación frente a lo habitual, en %; `null` sin histórico. */
  ownDeviationRate: number | null;
  /** El FTE disponible sobre el contractual, con sus horas. */
  capacity: CapacityDto;
  signal: BalanceSignal;
  /** Sólo cuando `signal` es `NotEvaluable`. */
  notEvaluableReason: NotEvaluableReason | null;
  /** Cuántas evidencias concurrentes sostienen la señal. */
  evidenceCount: number;
}

export interface DevOpsIdentityDto {
  /** Identificador del usuario en Azure DevOps. */
  id: string;
  userName: string;
  linkedAt: string;
  /** `null` cuando Azure DevOps no devuelve sprints para esa persona. */
  currentSprint: CurrentSprintBalanceDto | null;
}

/**
 * Un usuario de Azure DevOps tal como lo devuelve la búsqueda por correo. Es
 * lo que el Líder de Expertise ve antes de vincular: quién es y en qué
 * proyectos, equipos y tableros aparece. El backend real todavía no expone
 * esta búsqueda; el contrato lo fija el mock.
 */
export interface DevOpsUserDto {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  projects: string[];
  teams: string[];
  boards: string[];
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
  requiredLevel: number;
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
  devOpsIdentity: DevOpsIdentityDto | null;
  stacks: PersonStackDetailDto[];
  costReading: CostReading;
  /** Sólo sin célula: células que piden la capacidad principal de la persona. */
  suggestedSquads: SuggestedSquadDto[];
}

const PEOPLE_URL = "/people";
const DEVOPS_USERS_URL = "/devops/users";

export const personDetailService = {
  getDetail: async (personId: string): Promise<PersonDetailDto> => {
    const response = await httpClient.get<PersonDetailDto>(
      `${PEOPLE_URL}/${personId}/detail`
    );
    return response.data;
  },

  /**
   * El usuario de Azure DevOps con ese correo. Un `404` significa que ningún
   * usuario lo tiene: quien llama lo lee como "sin coincidencia", no como
   * falla — por eso se propaga tal cual en vez de traducirse acá.
   */
  searchDevOpsUser: async (email: string): Promise<DevOpsUserDto> => {
    const response = await httpClient.get<DevOpsUserDto>(DEVOPS_USERS_URL, {
      params: { email },
    });
    return response.data;
  },

  /**
   * `identityId` es el identificador del usuario de Azure DevOps que devolvió
   * la búsqueda por correo: la relación se guarda con él y el backend resuelve
   * lo demás cuando lo necesita.
   */
  linkDevOpsIdentity: async (
    personId: string,
    identityId: string
  ): Promise<void> => {
    await httpClient.post(`${PEOPLE_URL}/${personId}/devops-identity`, {
      identityId,
    });
  },
};
