import { httpClient } from "@shared/services/httpClient";
import type {
  SkillGroup,
  SkillLevel,
} from "@features/skills/services/skillsService";

/**
 * La lectura del span: una fila por persona, una columna por habilidad activa.
 *
 * El agregado se arma del lado del dato a partir de las evaluaciones cerradas
 * y del catálogo. La comparación es siempre celda contra el cargo de esa fila:
 * no existe un umbral por habilidad, porque en un mismo span conviven cargos
 * que exigen niveles distintos y una sola línea de corte mentiría.
 */

export interface SpanSkillDto {
  skillId: string;
  skillName: string;
  group: SkillGroup;
}

export interface SpanCellDto {
  skillId: string;
  /** Nivel evaluado. `null` = esta persona no tiene evaluación cerrada. */
  level: SkillLevel | null;
  /** Lo que pide el cargo de esta persona. `null` = sin declarar para su cargo. */
  expectedLevel: SkillLevel | null;
  /**
   * Niveles que le faltan. `null` cuando no hay con qué comparar —sin evaluar
   * o sin nivel declarado—; `0` es "al nivel o por encima", que no es lo mismo
   * que no saberlo.
   */
  gap: number | null;
}

export interface SpanPersonDto {
  personId: string;
  personName: string;
  position: string;
  /** Sin evaluación cerrada no suma ni resta a ningún total. */
  evaluated: boolean;
  cells: SpanCellDto[];
}

export interface SpanMatrixDto {
  skills: SpanSkillDto[];
  people: SpanPersonDto[];
}

/** Una persona nombrada en un indicador: lo justo para dibujar su avatar. */
export interface SpanPersonRefDto {
  personId: string;
  personName: string;
  /** Cuántas brechas acumula. Es el criterio con el que entró al indicador. */
  gapCount: number;
}

/** Un punto de la serie: de qué ciclo habla y cuántas brechas había. */
export interface SpanCyclePointDto {
  cycle: string;
  totalGaps: number;
}

/** Una habilidad que concentra brecha en el chapter. */
export interface SpanFocusSkillDto {
  skillId: string;
  skillName: string;
  /** Suma de los niveles que faltan: tres a un nivel pesan menos que tres a tres. */
  weight: number;
  peopleWithGap: number;
  /** El nivel más alto que algún cargo pide entre quienes tienen brecha. */
  expectedLevel: SkillLevel | null;
}

/** Lo que quedó por gestionar en el módulo, ya contado del lado del dato. */
export interface SpanPendingDto {
  unassessed: number;
  overduePlans: number;
  positionsWithoutLevel: number;
  gapsWithoutPlan: number;
}

/**
 * La lectura de situación del chapter, calculada sobre el span completo.
 *
 * Va aparte de la matriz por dos motivos: no depende del recorte de
 * habilidades que el usuario tenga puesto —son la situación del chapter, no la
 * de la vista— y dos de sus cifras (`overduePlans`, `gapsWithoutPlan`) viven
 * en los planes individuales, que el cliente tendría que pedir uno por uno.
 */
export interface SpanSummaryDto {
  totalGaps: number;
  /** Brechas de dos niveles o más: las que no se cierran con la operación diaria. */
  criticalGaps: number;
  evaluatedPeople: number;
  totalPeople: number;
  /** Tres brechas o más. Con nombre, porque el indicador dibuja sus avatares. */
  peopleAtRisk: SpanPersonRefDto[];
  /**
   * El ciclo cerrado anterior al vigente, o `null` cuando no hay ninguno: sin
   * él la variación no es cero, es que no hay con qué comparar.
   */
  previousCycle: SpanCyclePointDto | null;
  /** Del ciclo más viejo al vigente. Un solo punto cuando no hay historial. */
  trend: SpanCyclePointDto[];
  topSkills: SpanFocusSkillDto[];
  pending: SpanPendingDto;
}

/**
 * El plan de una persona: su perfil evaluado y las acciones acordadas.
 *
 * La brecha no se guarda como texto: sale del nivel evaluado contra lo que
 * pide su cargo, y su contenido de los criterios que la evaluación dejó sin
 * marcar. Una acción, en cambio, sí es un acuerdo — y por eso siempre nace de
 * una brecha registrada.
 */

export type PlanActionStatus = "InProgress" | "Done";

export interface PlanSkillDto {
  skillId: string;
  skillName: string;
  group: SkillGroup;
  level: SkillLevel;
  expectedLevel: SkillLevel | null;
  /** `null` = sin nivel declarado para su cargo; `0` = al nivel o por encima. */
  gap: number | null;
  /** Lo que cumple en el nivel que alcanzó, tal como lo registró la evaluación. */
  metCriteria: string[];
  /** Total de criterios de su nivel, para poder decir "5 de 5". */
  levelTotal: number;
  /** Lo que le falta del nivel que su cargo pide; vacío si no hay brecha. */
  missingCriteria: string[];
  /** Total de criterios del nivel exigido. */
  expectedTotal: number;
  /** La nota con la que se justificó la brecha en la evaluación. */
  note: string;
}

export interface PlanActionDto {
  id: string;
  personId: string;
  /** De qué brecha nace. Una acción sin esto no existe. */
  skillId: string;
  skillName: string;
  /** Desde dónde y hacia dónde, para leer el objetivo sin abrir nada. */
  fromLevel: SkillLevel;
  targetLevel: SkillLevel;
  /** Para cuándo se comprometió, "YYYY-MM". */
  dueMonth: string;
  title: string;
  status: PlanActionStatus;
}

export interface PersonPlanDto {
  personId: string;
  personName: string;
  position: string;
  /** `null` cuando no tiene ninguna evaluación cerrada. */
  assessmentClosedAtUtc: string | null;
  cycle: string | null;
  skills: PlanSkillDto[];
  actions: PlanActionDto[];
}

export interface CreatePlanActionRequest {
  skillId: string;
  targetLevel: SkillLevel;
  dueMonth: string;
  title: string;
}

const PLAN_URL = "/career-plan/people";

const SPAN_URL = "/career-plan/span";
const SPAN_SUMMARY_URL = "/career-plan/span/summary";

export const careerPlanService = {
  getSpan: async (): Promise<SpanMatrixDto> => {
    const response = await httpClient.get<SpanMatrixDto>(SPAN_URL);
    return response.data;
  },

  getSpanSummary: async (): Promise<SpanSummaryDto> => {
    const response = await httpClient.get<SpanSummaryDto>(SPAN_SUMMARY_URL);
    return response.data;
  },

  getPlan: async (personId: string): Promise<PersonPlanDto> => {
    const response = await httpClient.get<PersonPlanDto>(
      `${PLAN_URL}/${personId}/plan`
    );
    return response.data;
  },

  createAction: async (
    personId: string,
    request: CreatePlanActionRequest
  ): Promise<PersonPlanDto> => {
    const response = await httpClient.post<PersonPlanDto>(
      `${PLAN_URL}/${personId}/plan/actions`,
      request
    );
    return response.data;
  },

  /** Marca la acción como cumplida. No cierra la brecha: eso es reevaluar. */
  completeAction: async (
    personId: string,
    actionId: string
  ): Promise<PersonPlanDto> => {
    const response = await httpClient.put<PersonPlanDto>(
      `${PLAN_URL}/${personId}/plan/actions/${actionId}/status`,
      { status: "Done" }
    );
    return response.data;
  },
};
