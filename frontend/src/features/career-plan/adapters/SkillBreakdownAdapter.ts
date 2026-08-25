import { levelLabel } from "@features/skills/adapters/SkillsAdapter";
import {
  SKILL_LEVELS,
  type SkillLevel,
} from "@features/skills/services/skillsService";
import type { SpanMatrixView, SpanPersonView } from "./SpanMatrixAdapter";

export interface BreakdownPerson {
  personId: string;
  personName: string;
  initials: string;
  position: string;
  /** Con brecha, cuántos niveles le faltan y para qué nivel. */
  gap: number | null;
  expectedLabel: string | null;
  atLevel: boolean;
}

export interface BreakdownLevel {
  level: SkillLevel;
  label: string;
  people: BreakdownPerson[];
  /** Un nivel sin nadie se muestra igual, para que el reparto se lea completo. */
  empty: boolean;
}

export interface SkillBreakdown {
  skillId: string;
  skillName: string;
  groupLabel: string;
  /** De menor a mayor: lo que se busca acá son los que están cortos. */
  levels: BreakdownLevel[];
  evaluatedCount: number;
  gapCount: number;
  pendingCount: number;
}

/**
 * Quiénes están en qué nivel de una habilidad, y dentro de cada nivel quién
 * está bien y quién corto. Dos personas en el mismo peldaño pueden estar una
 * al nivel y otra con brecha, según lo que pida su cargo: por eso la marca va
 * por persona y no por grupo.
 */
export function toSkillBreakdown(
  span: SpanMatrixView,
  skillId: string
): SkillBreakdown | null {
  const skill = span.skills.find((s) => s.skillId === skillId);
  if (!skill) return null;

  const evaluated = span.people.filter((p) => p.evaluated);
  const cellOf = (person: SpanPersonView) =>
    person.cells.find((c) => c.skillId === skillId);

  const levels: BreakdownLevel[] = SKILL_LEVELS.map((level) => {
    const people = evaluated
      .filter((p) => cellOf(p)?.level === level)
      .map((p) => {
        const cell = cellOf(p)!;
        return {
          personId: p.personId,
          personName: p.personName,
          initials: p.initials,
          position: p.position,
          gap: cell.state === "gap" ? cell.gap : null,
          expectedLabel:
            cell.expectedLevel === null ? null : levelLabel(cell.expectedLevel),
          atLevel: cell.state !== "gap",
        };
      });

    return {
      level,
      label: levelLabel(level),
      people,
      empty: people.length === 0,
    };
  });

  return {
    skillId: skill.skillId,
    skillName: skill.skillName,
    groupLabel: skill.groupLabel,
    levels,
    evaluatedCount: evaluated.filter((p) => cellOf(p)?.level !== null).length,
    gapCount: skill.gapCount,
    pendingCount: span.pendingCount,
  };
}
