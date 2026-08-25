import {
  GROUP_LABELS,
  levelLabel,
} from "@features/skills/adapters/SkillsAdapter";
import type {
  SkillGroup,
  SkillLevel,
} from "@features/skills/services/skillsService";
import type {
  AssessmentDto,
  AssessmentSkillDto,
  AssessmentStatus,
} from "../services/assessmentService";

export const STATUS_LABELS: Record<AssessmentStatus, string> = {
  InProgress: "En curso",
  Closed: "Cerrada",
};

/** Lo que el índice necesita saber de una habilidad de un vistazo. */
export type SkillProgress = "pending" | "evaluated";

/**
 * Cómo queda una habilidad frente a lo que pide el cargo. Se separa de la
 * cifra de la brecha porque "sin definir" y "sin brecha" no son el mismo
 * hecho: uno es que no hay nada contra qué comparar, el otro que se comparó
 * y alcanzó.
 */
export type GapState = "undefined" | "met" | "gap" | "unevaluated";

export interface AssessmentLevelView {
  level: SkillLevel;
  label: string;
  criteria: { text: string; met: boolean }[];
  /** Su propio total: ningún nivel hereda la cantidad de otro. */
  total: number;
  metCount: number;
  /** "cumple 5 de 6" — la evidencia de la decisión, no la decisión. */
  counterLabel: string;
}

export interface AssessmentSkillView {
  skillId: string;
  skillName: string;
  group: SkillGroup;
  level: SkillLevel | null;
  levelLabel: string | null;
  note: string;
  levels: AssessmentLevelView[];
  expectedLevel: SkillLevel | null;
  expectedLabel: string;
  gap: number | null;
  gapState: GapState;
  /** "Le falta 1 nivel" / "Al nivel" / "Sin nivel definido para su cargo". */
  gapLabel: string;
  missingCriteria: string[];
  progress: SkillProgress;
  /** La nota se exige sólo cuando hay brecha. */
  noteRequired: boolean;
}

export interface AssessmentGroupView {
  group: SkillGroup;
  label: string;
  skills: AssessmentSkillView[];
}

export interface AssessmentView {
  id: string;
  personId: string;
  personName: string;
  position: string;
  cycle: string;
  status: AssessmentStatus;
  statusLabel: string;
  catalogVersion: number;
  closedAtUtc: string | null;
  readOnly: boolean;
  skills: AssessmentSkillView[];
  /** Técnicas primero, igual que el catálogo. */
  groups: AssessmentGroupView[];
  evaluatedCount: number;
  totalCount: number;
  /** "6 de 9 habilidades evaluadas". */
  progressLabel: string;
  complete: boolean;
  /** Nombres de las que faltan, para poder decir cuáles al intentar cerrar. */
  pendingNames: string[];
  /** Brechas abiertas entre las habilidades ya evaluadas. */
  gapCount: number;
}

function gapStateOf(dto: AssessmentSkillDto): GapState {
  // "Sin definir" va primero a propósito: que el cargo no declare nivel es un
  // hecho del catálogo, y se sabe antes de evaluar. Decir "sin evaluar" ahí
  // escondería que aunque se evalúe no va a haber brecha que registrar.
  if (dto.expectedLevel === null) return "undefined";
  if (dto.level === null) return "unevaluated";
  return (dto.gap ?? 0) > 0 ? "gap" : "met";
}

function gapLabelOf(state: GapState, gap: number | null): string {
  switch (state) {
    case "unevaluated":
      return "Sin evaluar";
    case "undefined":
      return "Su cargo no declara nivel en esta habilidad";
    case "met":
      return "Al nivel que pide su cargo";
    case "gap":
      return `Le ${gap === 1 ? "falta 1 nivel" : `faltan ${gap} niveles`}`;
  }
}

export function toSkillView(dto: AssessmentSkillDto): AssessmentSkillView {
  const gapState = gapStateOf(dto);

  return {
    skillId: dto.skillId,
    skillName: dto.skillName,
    group: dto.group,
    level: dto.level,
    levelLabel: dto.level === null ? null : levelLabel(dto.level),
    note: dto.note,
    levels: dto.levels.map((l) => {
      const metCount = l.criteria.filter((c) => c.met).length;
      return {
        level: l.level,
        label: levelLabel(l.level),
        criteria: l.criteria,
        total: l.criteria.length,
        metCount,
        counterLabel:
          l.criteria.length === 0
            ? "Sin criterios"
            : `cumple ${metCount} de ${l.criteria.length}`,
      };
    }),
    expectedLevel: dto.expectedLevel,
    expectedLabel:
      dto.expectedLevel === null
        ? "Sin definir"
        : levelLabel(dto.expectedLevel),
    gap: dto.gap,
    gapState,
    gapLabel: gapLabelOf(gapState, dto.gap),
    missingCriteria: dto.missingCriteria,
    progress: dto.level === null ? "pending" : "evaluated",
    noteRequired: gapState === "gap",
  };
}

const GROUP_ORDER: SkillGroup[] = ["technical", "human"];

export function toAssessmentView(dto: AssessmentDto): AssessmentView {
  const skills = dto.skills.map(toSkillView);
  const evaluated = skills.filter((s) => s.progress === "evaluated");
  const pending = skills.filter((s) => s.progress === "pending");

  return {
    id: dto.id,
    personId: dto.personId,
    personName: dto.personName,
    position: dto.position,
    cycle: dto.cycle,
    status: dto.status,
    statusLabel: STATUS_LABELS[dto.status],
    catalogVersion: dto.catalogVersion,
    closedAtUtc: dto.closedAtUtc,
    // Una evaluación cerrada no se corrige: se evalúa de nuevo.
    readOnly: dto.status === "Closed",
    skills,
    groups: GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      skills: skills.filter((s) => s.group === group),
    })),
    evaluatedCount: evaluated.length,
    totalCount: skills.length,
    progressLabel: `${evaluated.length} de ${skills.length} habilidades evaluadas`,
    complete: pending.length === 0,
    pendingNames: pending.map((s) => s.skillName),
    gapCount: skills.filter((s) => s.gapState === "gap").length,
  };
}

/** Lo que la brecha dice, recalculado mientras se decide. */
export type GapPreview = Pick<
  AssessmentSkillView,
  "gap" | "gapState" | "gapLabel" | "missingCriteria" | "noteRequired"
>;

/**
 * La brecha se muestra contra lo que se está eligiendo, no contra lo último
 * guardado: el punto del diseño es que quede armada mientras se decide, y una
 * brecha que sólo aparece después de guardar obliga a guardar para verla.
 *
 * Es la misma derivación que hace el handler, y sigue siendo él quien la
 * guarda: acá sólo se adelanta lo que va a responder.
 */
export function previewGap(
  skill: AssessmentSkillView,
  level: SkillLevel | null,
  met: string[][]
): GapPreview {
  if (skill.expectedLevel === null) {
    return {
      gap: null,
      gapState: "undefined",
      gapLabel: gapLabelOf("undefined", null),
      missingCriteria: [],
      noteRequired: false,
    };
  }
  if (level === null) {
    return {
      gap: null,
      gapState: "unevaluated",
      gapLabel: gapLabelOf("unevaluated", null),
      missingCriteria: [],
      noteRequired: false,
    };
  }

  const gap = Math.max(0, skill.expectedLevel - level);
  const state: GapState = gap > 0 ? "gap" : "met";
  const marked = met[skill.expectedLevel - 1] ?? [];

  return {
    gap,
    gapState: state,
    gapLabel: gapLabelOf(state, gap),
    missingCriteria:
      gap > 0
        ? skill.levels[skill.expectedLevel - 1].criteria
            .map((c) => c.text)
            .filter((text) => !marked.includes(text))
        : [],
    noteRequired: state === "gap",
  };
}

/** Qué habilidad abrir al entrar: la primera sin evaluar, o la primera. */
export function firstToWorkOn(view: AssessmentView): string | null {
  const pending = view.skills.find((s) => s.progress === "pending");
  return (pending ?? view.skills[0])?.skillId ?? null;
}
