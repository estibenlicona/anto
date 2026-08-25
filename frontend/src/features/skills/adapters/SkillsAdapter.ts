import { STACK_LEVEL_LABELS } from "@features/people/adapters/PersonDetailAdapter";
import type {
  PositionExpectationDto,
  SkillDto,
  SkillGroup,
  SkillLevel,
  SkillsCatalogDto,
} from "../services/skillsService";

export const GROUP_LABELS: Record<SkillGroup, string> = {
  human: "Humanas",
  technical: "Técnicas",
};

/** El singular, para el detalle de una habilidad. */
export const GROUP_LABELS_SINGULAR: Record<SkillGroup, string> = {
  human: "Humana",
  technical: "Técnica",
};

/**
 * La escala es la que la app ya usa para seniority y stacks. Se referencia en
 * vez de redefinirse: si algún día cambian los nombres, cambian en un lugar.
 */
export function levelLabel(level: SkillLevel): string {
  return STACK_LEVEL_LABELS[level] ?? String(level);
}

export interface SkillLevelView {
  level: SkillLevel;
  label: string;
  criteria: string[];
  /** Su propia cantidad: ningún nivel hereda la de otro. */
  count: number;
  empty: boolean;
}

export interface SkillView {
  id: string;
  name: string;
  group: SkillGroup;
  groupLabel: string;
  description: string;
  active: boolean;
  levels: SkillLevelView[];
  /** Suma de los cuatro niveles — lo que el índice muestra por habilidad. */
  totalCriteria: number;
  /** Una habilidad con algún nivel sin criterios todavía no sirve para evaluar. */
  incomplete: boolean;
  /** Niveles sin criterios, para decir cuál falta y no sólo que falta alguno. */
  emptyLevels: SkillLevel[];
  expectations: PositionExpectationView[];
  /** Cuántos cargos tienen nivel declarado, sobre el total de cargos. */
  declaredExpectations: number;
}

export interface PositionExpectationView {
  position: string;
  level: SkillLevel | null;
  /** "Avanzado" o "Sin definir" — sin definir no es cero. */
  label: string;
  defined: boolean;
}

export interface SkillGroupView {
  group: SkillGroup;
  label: string;
  skills: SkillView[];
}

export interface SkillsCatalogView {
  version: number;
  positions: string[];
  skills: SkillView[];
  /** Técnicas primero, como el artboard: es el grupo que más se consulta. */
  groups: SkillGroupView[];
  total: number;
  /** Cuántas habilidades tienen algún nivel sin criterios. */
  incompleteCount: number;
  empty: boolean;
}

function toExpectationView(
  dto: PositionExpectationDto
): PositionExpectationView {
  return {
    position: dto.position,
    level: dto.level,
    label: dto.level === null ? "Sin definir" : levelLabel(dto.level),
    defined: dto.level !== null,
  };
}

export function toSkillView(dto: SkillDto): SkillView {
  const levels: SkillLevelView[] = dto.levels.map((l) => ({
    level: l.level,
    label: levelLabel(l.level),
    criteria: l.criteria,
    count: l.criteria.length,
    empty: l.criteria.length === 0,
  }));
  const emptyLevels = levels.filter((l) => l.empty).map((l) => l.level);
  const expectations = dto.expectations.map(toExpectationView);

  return {
    id: dto.id,
    name: dto.name,
    group: dto.group,
    groupLabel: GROUP_LABELS_SINGULAR[dto.group],
    description: dto.description,
    active: dto.active,
    levels,
    totalCriteria: levels.reduce((total, l) => total + l.count, 0),
    incomplete: emptyLevels.length > 0,
    emptyLevels,
    expectations,
    declaredExpectations: expectations.filter((e) => e.defined).length,
  };
}

const GROUP_ORDER: SkillGroup[] = ["technical", "human"];

export function toCatalogView(dto: SkillsCatalogDto): SkillsCatalogView {
  const skills = dto.skills.map(toSkillView);

  return {
    version: dto.version,
    positions: dto.positions,
    skills,
    groups: GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      skills: skills.filter((s) => s.group === group),
    })),
    total: skills.length,
    incompleteCount: skills.filter((s) => s.incomplete).length,
    empty: skills.length === 0,
  };
}

/**
 * Cómo se nombra lo que le falta a una habilidad incompleta. Nombrar el nivel
 * y no sólo decir "incompleta" es lo que convierte el aviso en una tarea.
 */
export function incompleteLabel(skill: SkillView): string | null {
  if (!skill.incomplete) return null;
  const names = skill.emptyLevels.map((l) => levelLabel(l));
  return names.length === 1
    ? `${names[0]} sin criterios`
    : `${names.length} niveles sin criterios`;
}
