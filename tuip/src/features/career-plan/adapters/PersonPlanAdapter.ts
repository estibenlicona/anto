import {
  GROUP_LABELS,
  levelLabel,
} from "@features/skills/adapters/SkillsAdapter";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type {
  SkillGroup,
  SkillLevel,
} from "@features/skills/services/skillsService";
import type {
  PersonPlanDto,
  PlanActionDto,
  PlanActionStatus,
  PlanSkillDto,
} from "../services/careerPlanService";

export const ACTION_STATUS_LABELS: Record<PlanActionStatus, string> = {
  InProgress: "En curso",
  Done: "Cumplida",
};

/** Los mismos tres hechos que en la matriz, con los mismos nombres. */
export type PlanSkillState = "undefined" | "met" | "gap";

export interface CriterionGroupView {
  /** "En el nivel que tiene · Competente" / "Para el que pide su cargo · Avanzado". */
  title: string;
  /** "5 de 5" — cuántos sobre el total de ese nivel, sin asumir cantidad. */
  counterLabel: string;
  criteria: string[];
}

export interface PlanSkillView {
  skillId: string;
  skillName: string;
  group: SkillGroup;
  level: SkillLevel;
  levelLabel: string;
  expectedLevel: SkillLevel | null;
  expectedLabel: string | null;
  gap: number | null;
  state: PlanSkillState;
  /** "−1 nivel" / "Al nivel" / "Su cargo no declara nivel". */
  stateLabel: string;
  note: string;
  /** Lo que cumple en su nivel; siempre presente. */
  metGroup: CriterionGroupView;
  /** Lo que le falta del exigido; `null` sin brecha — no se inventa un nivel siguiente. */
  missingGroup: CriterionGroupView | null;
}

export interface PlanGroupView {
  group: SkillGroup;
  label: string;
  skills: PlanSkillView[];
}

export interface PlanActionView extends PlanActionDto {
  statusLabel: string;
  /** "Competente → Avanzado", el objetivo legible sin abrir nada. */
  objectiveLabel: string;
  /** "dic 2026". */
  dueLabel: string;
  done: boolean;
}

export interface PersonPlanView {
  personId: string;
  personName: string;
  initials: string;
  position: string;
  assessmentClosedAtUtc: string | null;
  /** "12 de agosto de 2026", o `null` sin evaluación cerrada. */
  assessedOnLabel: string | null;
  /** Sin evaluación cerrada no hay perfil que mostrar. */
  assessed: boolean;
  skills: PlanSkillView[];
  groups: PlanGroupView[];
  openGaps: PlanSkillView[];
  openGapCount: number;
  actions: PlanActionView[];
  /** Brechas sin ninguna acción: es la información accionable de la pantalla. */
  gapsWithoutAction: PlanSkillView[];
}

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const SHORT_MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function longDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${SHORT_MONTHS[Number(month) - 1] ?? month} ${year}`;
}

function stateOf(dto: PlanSkillDto): PlanSkillState {
  if (dto.expectedLevel === null) return "undefined";
  return (dto.gap ?? 0) > 0 ? "gap" : "met";
}

function stateLabelOf(state: PlanSkillState, gap: number | null): string {
  switch (state) {
    case "undefined":
      return "Su cargo no declara nivel";
    case "met":
      return "Al nivel";
    case "gap":
      return `−${gap} ${gap === 1 ? "nivel" : "niveles"}`;
  }
}

function counter(met: number, total: number): string {
  return total === 0 ? "Sin criterios" : `${met} de ${total}`;
}

export function toPlanSkillView(dto: PlanSkillDto): PlanSkillView {
  const state = stateOf(dto);

  return {
    skillId: dto.skillId,
    skillName: dto.skillName,
    group: dto.group,
    level: dto.level,
    levelLabel: levelLabel(dto.level),
    expectedLevel: dto.expectedLevel,
    expectedLabel:
      dto.expectedLevel === null ? null : levelLabel(dto.expectedLevel),
    gap: dto.gap,
    state,
    stateLabel: stateLabelOf(state, dto.gap),
    note: dto.note,
    metGroup: {
      title: `En el nivel que tiene · ${levelLabel(dto.level)}`,
      counterLabel: counter(dto.metCriteria.length, dto.levelTotal),
      criteria: dto.metCriteria,
    },
    // Sin brecha no hay bloque de faltantes: mostrar el nivel siguiente
    // convertiría en exigencia algo que su cargo no pide.
    missingGroup:
      state === "gap" && dto.expectedLevel !== null
        ? {
            title: `Para el que pide su cargo · ${levelLabel(dto.expectedLevel)}`,
            counterLabel: counter(
              dto.expectedTotal - dto.missingCriteria.length,
              dto.expectedTotal
            ),
            criteria: dto.missingCriteria,
          }
        : null,
  };
}

const GROUP_ORDER: SkillGroup[] = ["technical", "human"];

export function toPersonPlanView(dto: PersonPlanDto): PersonPlanView {
  const skills = dto.skills.map(toPlanSkillView);
  const openGaps = skills.filter((s) => s.state === "gap");
  const withAction = new Set(dto.actions.map((a) => a.skillId));

  const actions: PlanActionView[] = dto.actions.map((a) => ({
    ...a,
    statusLabel: ACTION_STATUS_LABELS[a.status],
    objectiveLabel: `${levelLabel(a.fromLevel)} → ${levelLabel(a.targetLevel)}`,
    dueLabel: monthLabel(a.dueMonth),
    done: a.status === "Done",
  }));

  return {
    personId: dto.personId,
    personName: dto.personName,
    initials: getPersonInitials(dto.personName),
    position: dto.position,
    assessmentClosedAtUtc: dto.assessmentClosedAtUtc,
    assessedOnLabel: dto.assessmentClosedAtUtc
      ? longDate(dto.assessmentClosedAtUtc)
      : null,
    assessed: dto.skills.length > 0,
    skills,
    groups: GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      skills: skills.filter((s) => s.group === group),
    })),
    openGaps,
    openGapCount: openGaps.length,
    actions,
    gapsWithoutAction: openGaps.filter((s) => !withAction.has(s.skillId)),
  };
}
