import type { SkillLevel } from "@features/skills/services/skillsService";
import type { PlanActionStatus } from "@features/career-plan/services/careerPlanService";
import { PAULA, CARLOS, MARIA } from "./assessments.seeds";

/**
 * Acciones de ejemplo del plan de carrera.
 *
 * Cada una nace de una brecha real de las evaluaciones sembradas. Paula lleva
 * dos sobre la misma brecha —una en curso y otra ya cumplida— para que se vea
 * el caso que importa: la acción está cumplida y la brecha sigue abierta,
 * porque cerrarla es reevaluar. María tiene una brecha sin ninguna acción, que
 * es lo que la pantalla tiene que señalar.
 */

const NEGOCIO = "s1000000-0000-0000-0000-000000000001";
const DESARROLLO = "s1000000-0000-0000-0000-000000000002";
const ARQUITECTURA = "s1000000-0000-0000-0000-000000000005";
const COMUNICACION = "s2000000-0000-0000-0000-000000000002";

export interface ActionSeed {
  id: string;
  personId: string;
  skillId: string;
  fromLevel: SkillLevel;
  targetLevel: SkillLevel;
  dueMonth: string;
  title: string;
  status: PlanActionStatus;
}

/** Meses relativos al corriente: con fechas fijas el plan se ve vencido solo. */
function monthKey(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const actionSeeds: ActionSeed[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    personId: PAULA,
    skillId: NEGOCIO,
    fromLevel: 2,
    targetLevel: 3,
    dueMonth: monthKey(4),
    title: "Acompañar el rediseño del motor de cobranza",
    status: "InProgress",
  },
  {
    // Cumplida, y la brecha de Conocimiento del negocio sigue abierta: es la
    // regla del change hecha dato.
    id: "a1000000-0000-0000-0000-000000000002",
    personId: PAULA,
    skillId: NEGOCIO,
    fromLevel: 2,
    targetLevel: 3,
    dueMonth: monthKey(-1),
    title: "Curso interno de dominio de riesgo y cobranza",
    status: "Done",
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    personId: PAULA,
    skillId: ARQUITECTURA,
    fromLevel: 1,
    targetLevel: 2,
    dueMonth: monthKey(2),
    title: "Pareja con arquitectura en el pipeline de ingesta",
    status: "InProgress",
  },
  {
    id: "a1000000-0000-0000-0000-000000000004",
    personId: CARLOS,
    skillId: COMUNICACION,
    fromLevel: 2,
    targetLevel: 3,
    dueMonth: monthKey(3),
    title: "Presentar la hoja de ruta técnica en el comité de arquitectura",
    status: "InProgress",
  },
  // María González queda con su brecha de Desarrollo de software sin ninguna
  // acción, para que la pantalla la señale como pendiente de plan.
];

export const SEED_SKILL_WITHOUT_ACTION = DESARROLLO;
export const SEED_PERSON_WITHOUT_ACTION = MARIA;
