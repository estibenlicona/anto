import type {
  CostReading,
  CurrentHoursReportDto,
  DevOpsCandidateDto,
  DevOpsIdentityDto,
  PersonStackDetailDto,
  PersonDetailAllocationDto,
  PersonDetailDto,
  SprintHoursDto,
  SuggestedSquadDto,
} from "../services/personDetailService";
import type { PersonDto } from "../services/personService";
import { getPersonInitials } from "./PersonAdapter";
import { CRITICALITY_LABELS } from "@features/squads/adapters/SquadAdapter";
import type { OverviewPerson } from "@features/control-tower/adapters/CapacityOverviewAdapter";

/**
 * Entidad de UI del detalle de persona. Todas las derivaciones viven acá
 * (design.md D6); los componentes sólo presentan.
 */

export const MODALITY_LABELS: Record<string, string> = {
  Remote: "Remoto",
  Hybrid: "Híbrido",
  OnSite: "Presencial",
};

export type SfiaGap = "Adequate" | "Insufficient";

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

export interface PersonDetailSprint extends SprintHoursDto {
  /** Horas que cuentan (sin libres). */
  workedHours: number;
  validated: boolean;
}

export interface PersonDetailAllocation extends PersonDetailAllocationDto {
  criticalityLabel: string;
  freePercentage: number;
  freeFte: number;
  sinceLabel: string;
  sfiaGap: SfiaGap;
}

export interface PersonDetail {
  person: PersonDto;
  initials: string;
  sfiaLevel: number;
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
  assignedFte: number;
  realFte: number | null;
  /** Diferencia en puntos porcentuales entre el real y el asignado (null sin real). */
  deltaPoints: number | null;
  currentReport: CurrentHoursReportDto | null;
  hoursWithinTolerance: boolean | null;
  sprints: PersonDetailSprint[];
  /** Horas que corresponden a la dedicación asignada en un sprint. */
  expectedHours: number;
  /** Sprints validados seguidos (desde el último) por encima de las horas esperadas. */
  overReportingStreak: number;
  devOpsIdentity: DevOpsIdentityDto | null;
  devOpsCandidates: DevOpsCandidateDto[];
  stacks: PersonDetailStack[];
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

export const personDetailAdapter = {
  toEntity: (dto: PersonDetailDto, today: Date = new Date()): PersonDetail => {
    const { person } = dto;
    const assignedPct = dto.allocation?.dedicationPercentage ?? 0;
    const assignedFte = round2((person.availableFte * assignedPct) / 100);
    const realFte = dto.realFte;
    const deltaPoints =
      realFte === null
        ? null
        : Math.round(
            (realFte / (person.availableFte || 1)) * 100 - assignedPct
          );

    const sprintHours =
      dto.sprints[0]?.sprintHours ?? dto.currentReport?.sprintHours ?? 80;
    const expectedHours = Math.round((sprintHours * assignedPct) / 100);
    const sprints: PersonDetailSprint[] = dto.sprints.map((s) => ({
      ...s,
      workedHours: s.bauHours + s.initiativeHours,
      validated: s.status === "Validated",
    }));
    let overReportingStreak = 0;
    for (let i = sprints.length - 1; i >= 0; i -= 1) {
      const s = sprints[i];
      if (!s.validated) continue;
      if (s.workedHours > expectedHours) overReportingStreak += 1;
      else break;
    }

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
          sfiaGap:
            person.seniority >= dto.allocation.requiredSfia
              ? "Adequate"
              : "Insufficient",
        }
      : null;

    const report = dto.currentReport;
    const reported = report
      ? report.bauHours + report.initiativeHours + report.freeHours
      : 0;

    return {
      person,
      initials: getPersonInitials(person.name),
      sfiaLevel: person.seniority,
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
      realFte,
      deltaPoints,
      currentReport: report,
      hoursWithinTolerance:
        report && report.status !== "NotReported"
          ? reported >= report.toleranceMin && reported <= report.toleranceMax
          : null,
      sprints,
      expectedHours,
      overReportingStreak,
      devOpsIdentity: dto.devOpsIdentity,
      devOpsCandidates: dto.devOpsCandidates,
      stacks: dto.stacks.map((s) => ({
        ...s,
        busFactorOne: s.otherCoverers === 0,
        levelLabel: STACK_LEVEL_LABELS[s.level] ?? String(s.level),
      })),
      costReading: dto.costReading,
      costReadingLabel: COST_LABELS[dto.costReading](person.seniorityLabel),
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
      seniorityLabel: detail.person.seniorityLabel,
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
