import type {
  CostReading,
  DevOpsIdentityDto,
  PersonStackDetailDto,
  PersonDetailAllocationDto,
  PersonDetailDto,
  SuggestedSquadDto,
} from "../services/personDetailService";
import type { PersonDto } from "../services/personService";
import { getPersonInitials } from "./PersonAdapter";
import { CRITICALITY_LABELS } from "@features/squads/adapters/SquadAdapter";
import type { OverviewPerson } from "@features/control-tower/adapters/CapacityOverviewAdapter";
import type {
  BalanceSignalDto,
  SnapshotStatus,
} from "@features/dedication/services/dedicationService";

/**
 * Entidad de UI del detalle de persona. Todas las derivaciones viven acá
 * (design.md D6); los componentes sólo presentan.
 */

export const MODALITY_LABELS: Record<string, string> = {
  Remote: "Remoto",
  Hybrid: "Híbrido",
  OnSite: "Presencial",
};

export type LevelGap = "Adequate" | "Insufficient";

export interface PersonDetailStack extends PersonStackDetailDto {
  busFactorOne: boolean;
  /** Nombre del nivel en la escala Tuya. */
  levelLabel: string;
}

export const STACK_LEVEL_LABELS: Record<number, string> = {
  1: "Principiante",
  2: "Competente",
  3: "Avanzado",
  4: "Experto",
};

export interface PersonDetailAllocation extends PersonDetailAllocationDto {
  criticalityLabel: string;
  freePercentage: number;
  freeFte: number;
  sinceLabel: string;
  levelGap: LevelGap;
}

/**
 * Lo único que la ficha muestra del sprint: el resumen ya resuelto por
 * Capacidad, como badge + un dato. Nada de SP, barras ni horas — el detalle
 * vive en `dedicacion/<id>` (relativa a la base del módulo).
 */
export interface SprintPointer {
  /** `unlinked` = sin identidad DevOps; `noSprint` = identidad sin sprint. */
  kind: "unlinked" | "noSprint" | "sprint";
  /** La señal para el badge; sólo en `sprint`. */
  balance: BalanceSignalDto | null;
  /** "4 de 6 señales · S18 · en curso"; para No evaluable, sólo sprint y estado. */
  meta: string | null;
}

const SPRINT_STATE_LABELS: Record<SnapshotStatus, string> = {
  Provisional: "en curso",
  Sealed: "finalizado",
  Missing: "sin snapshot",
};

export interface PersonDetail {
  person: PersonDto;
  initials: string;
  level: number;
  modalityLabel: string;
  isExternal: boolean;
  providerName: string | null;
  contractEndsAt: string | null;
  chapterName: string | null;
  chapterLeadName: string | null;
  expertiseLineName: string | null;
  expertiseLineLeadName: string | null;
  startDateLabel: string;
  tenureLabel: string;
  allocation: PersonDetailAllocation | null;
  /** FTE asignado = disponible declarado × dedicación. Sin horas no hay "real": el trabajo se lee en DevOps. */
  assignedFte: number;
  devOpsIdentity: DevOpsIdentityDto | null;
  stacks: PersonDetailStack[];
  /** El stack marcado como principal; `null` sin stacks. Va como chip en el encabezado. */
  primaryStackName: string | null;
  sprintPointer: SprintPointer;
  costReading: CostReading;
  costReadingLabel: string;
  suggestedSquads: SuggestedSquadDto[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

const MONTHS = [
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

/** "15 may 2023" a partir de una fecha ISO. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

/** "3 años y 3 meses" / "7 meses" / "hace 18 días" desde `iso` hasta `today`. */
export function tenureLabel(iso: string, today: Date = new Date()): string {
  const start = new Date(iso.slice(0, 10) + "T00:00:00");
  const days = Math.max(
    0,
    Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  );
  if (days < 31) return `hace ${days} día${days === 1 ? "" : "s"}`;
  let months =
    (today.getFullYear() - start.getFullYear()) * 12 +
    (today.getMonth() - start.getMonth());
  if (today.getDate() < start.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = years ? `${years} año${years === 1 ? "" : "s"}` : "";
  const m = rest ? `${rest} mes${rest === 1 ? "" : "es"}` : "";
  return [y, m].filter(Boolean).join(" y ") || "menos de un mes";
}

const COST_LABELS: Record<CostReading, (level: string) => string> = {
  InRange: (level) => `en rango para ${level}`,
  High: (level) => `alto para ${level}`,
  Low: (level) => `bajo para ${level}`,
};

function toSprintPointer(identity: DevOpsIdentityDto | null): SprintPointer {
  if (!identity) return { kind: "unlinked", balance: null, meta: null };
  const current = identity.currentSprint;
  if (!current) return { kind: "noSprint", balance: null, meta: null };
  const state =
    SPRINT_STATE_LABELS[current.sprint.snapshotStatus] ??
    current.sprint.snapshotStatus;
  const where = `${current.sprint.name} · ${state}`;
  return {
    kind: "sprint",
    balance: {
      signal: current.signal,
      overCount: current.evidenceCount,
      underCount: 0,
      squadContext: "NoSquad",
      notEvaluableReason: current.notEvaluableReason,
      evidences: [],
    },
    // Para No evaluable el motivo lo dice el badge; el conteo no aplica.
    meta:
      current.signal === "NotEvaluable"
        ? where
        : `${current.evidenceCount} de 6 señales · ${where}`,
  };
}

export const personDetailAdapter = {
  toEntity: (dto: PersonDetailDto, today: Date = new Date()): PersonDetail => {
    const { person } = dto;
    const assignedPct = dto.allocation?.dedicationPercentage ?? 0;
    const assignedFte = round2((person.availableFte * assignedPct) / 100);

    const allocation: PersonDetailAllocation | null = dto.allocation
      ? {
          ...dto.allocation,
          criticalityLabel:
            CRITICALITY_LABELS[dto.allocation.squadCriticality] ??
            dto.allocation.squadCriticality,
          freePercentage: Math.max(
            0,
            100 - dto.allocation.dedicationPercentage
          ),
          freeFte: round1(
            (person.availableFte *
              Math.max(0, 100 - dto.allocation.dedicationPercentage)) /
              100
          ),
          sinceLabel: formatDate(dto.allocation.since),
          levelGap:
            person.level >= dto.allocation.requiredLevel
              ? "Adequate"
              : "Insufficient",
        }
      : null;

    return {
      person,
      initials: getPersonInitials(person.name),
      level: person.level,
      modalityLabel: MODALITY_LABELS[person.modality] ?? person.modality,
      isExternal: person.providerId !== null,
      providerName: dto.providerName,
      contractEndsAt: dto.contractEndsAt,
      chapterName: dto.chapterName,
      chapterLeadName: dto.chapterLeadName,
      expertiseLineName: dto.expertiseLineName,
      expertiseLineLeadName: dto.expertiseLineLeadName,
      startDateLabel: formatDate(person.startDate),
      tenureLabel: tenureLabel(person.startDate, today),
      allocation,
      assignedFte,
      devOpsIdentity: dto.devOpsIdentity,
      stacks: dto.stacks.map((s) => ({
        ...s,
        busFactorOne: s.otherCoverers === 0,
        levelLabel: STACK_LEVEL_LABELS[s.level] ?? String(s.level),
      })),
      primaryStackName:
        dto.stacks.find((s) => s.isPrimary)?.name ??
        dto.stacks[0]?.name ??
        null,
      sprintPointer: toSprintPointer(dto.devOpsIdentity),
      costReading: dto.costReading,
      costReadingLabel: COST_LABELS[dto.costReading](person.levelLabel),
      suggestedSquads: dto.suggestedSquads,
    };
  },

  /** La forma que el drawer de reasignación de la Torre espera. */
  toOverviewPerson: (detail: PersonDetail): OverviewPerson => {
    const a = detail.allocation;
    const marginPercentage = a ? a.freePercentage : 100;
    return {
      id: detail.person.id,
      name: detail.person.name,
      position: detail.person.position,
      levelLabel: detail.person.levelLabel,
      availableFte: detail.person.availableFte,
      allocation: a
        ? {
            id: a.id,
            squadId: a.squadId,
            squadName: a.squadName,
            dedicationPercentage: a.dedicationPercentage,
            bauPercentage: a.bauPercentage,
            transformationPercentage: a.transformationPercentage,
          }
        : null,
      marginPercentage,
      marginFte: round1((detail.person.availableFte * marginPercentage) / 100),
    };
  },
};
