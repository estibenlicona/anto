import { httpClient } from "@shared/services/httpClient";
import type {
  SkillGroup,
  SkillLevel,
} from "@features/skills/services/skillsService";

/**
 * Evaluación técnica de una persona contra el catálogo de habilidades. El
 * backend todavía no la conoce — el contrato lo fija el mock.
 *
 * Todo lo que se puede derivar se deriva del lado del dato: el nivel que pide
 * el cargo, si hay brecha y de qué tamaño, y qué criterios del nivel exigido
 * quedaron sin marcar. Nada de eso se acepta digitado, para que no pueda
 * quedar desincronizado con el nivel elegido.
 */

export type AssessmentStatus = "InProgress" | "Closed";

export interface AssessmentCriterionDto {
  text: string;
  met: boolean;
}

export interface AssessmentLevelDto {
  level: SkillLevel;
  /** Los criterios del catálogo para ese nivel, con su marca. Largo libre. */
  criteria: AssessmentCriterionDto[];
}

export interface AssessmentSkillDto {
  skillId: string;
  skillName: string;
  group: SkillGroup;
  /** Elegido por el líder. `null` mientras la habilidad no se evaluó. */
  level: SkillLevel | null;
  note: string;
  levels: AssessmentLevelDto[];
  /** Lo que pide el cargo de esta persona; `null` = sin definir para ese cargo. */
  expectedLevel: SkillLevel | null;
  /**
   * Niveles que faltan para llegar a lo que pide el cargo. `null` cuando el cargo
   * no declara nivel o cuando la habilidad todavía no tiene nivel evaluado;
   * `0` es "al nivel o por encima", que no es lo mismo que no saberlo.
   */
  gap: number | null;
  /** Criterios del nivel exigido que quedaron sin marcar — el contenido de la brecha. */
  missingCriteria: string[];
}

export interface AssessmentDto {
  id: string;
  personId: string;
  personName: string;
  position: string;
  /** Semestre, "YYYY-S1" | "YYYY-S2". */
  cycle: string;
  status: AssessmentStatus;
  /** Estampada al cerrar; mientras está en curso, la vigente. */
  catalogVersion: number;
  closedAtUtc: string | null;
  skills: AssessmentSkillDto[];
}

export interface SaveSkillRequest {
  level: SkillLevel;
  /** Textos de los criterios marcados, por nivel: índice 0..3 = niveles 1..4. */
  met: string[][];
  note: string;
}

const PEOPLE_URL = "/people";

function assessmentUrl(personId: string): string {
  return `${PEOPLE_URL}/${personId}/assessment`;
}

/**
 * El ciclo de evaluación es el semestre: es el ritmo al que se tiene una
 * conversación de carrera, no el del sprint ni el del mes de facturación.
 */
export function currentCycle(now = new Date()): string {
  return `${now.getFullYear()}-S${now.getMonth() < 6 ? 1 : 2}`;
}

/**
 * El ciclo `n` semestres antes del dado. Con `n = 0` devuelve el mismo.
 *
 * Restar semestres no es restar números: el semestre anterior a `2026-S1` es
 * `2025-S2`, y el cálculo cruza el año. Vive acá, junto a `currentCycle`, para
 * que quien necesite comparar contra el pasado no lo reescriba.
 */
export function cycleBefore(cycle: string, n: number): string {
  const [yearText, half] = cycle.split("-");
  // Semestres absolutos desde el año 0: la resta se hace en una sola escala y
  // el año sale de vuelta por división.
  const total = Number(yearText) * 2 + (half === "S2" ? 1 : 0) - n;
  return `${Math.floor(total / 2)}-S${total % 2 === 0 ? 1 : 2}`;
}

export function cycleLabel(cycle: string): string {
  const [year, half] = cycle.split("-");
  return `${half === "S1" ? "Primer" : "Segundo"} semestre ${year}`;
}

export const assessmentService = {
  /** La en curso; si no hay ninguna, la última cerrada; si tampoco, `null`. */
  get: async (
    personId: string,
    cycle: string
  ): Promise<AssessmentDto | null> => {
    const response = await httpClient.get<AssessmentDto | null>(
      assessmentUrl(personId),
      { params: { cycle } }
    );
    return response.data;
  },

  open: async (personId: string, cycle: string): Promise<AssessmentDto> => {
    const response = await httpClient.post<AssessmentDto>(
      assessmentUrl(personId),
      { cycle }
    );
    return response.data;
  },

  saveSkill: async (
    personId: string,
    assessmentId: string,
    skillId: string,
    request: SaveSkillRequest
  ): Promise<AssessmentDto> => {
    const response = await httpClient.put<AssessmentDto>(
      `${assessmentUrl(personId)}/${assessmentId}/skills/${skillId}`,
      request
    );
    return response.data;
  },

  close: async (
    personId: string,
    assessmentId: string
  ): Promise<AssessmentDto> => {
    const response = await httpClient.put<AssessmentDto>(
      `${assessmentUrl(personId)}/${assessmentId}/close`,
      {}
    );
    return response.data;
  },
};
