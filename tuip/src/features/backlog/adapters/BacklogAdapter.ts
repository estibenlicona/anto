import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import { formatDate } from "@features/people/adapters/PersonDetailAdapter";
import type {
  BacklogCatalogsDto,
  BacklogQueueDto,
  BacklogStoryDto,
  BacklogSummaryDto,
  ClassificationKind,
  RejectReason,
} from "../services/backlogService";

export const DEVOPS_STATE_LABELS: Record<string, string> = {
  New: "Nueva",
  Active: "Activa",
  Resolved: "Resuelta",
  Closed: "Cerrada",
};

export const KIND_LABELS: Record<ClassificationKind, string> = {
  Initiative: "Iniciativa",
  Bau: "BAU",
  Discard: "Descartada",
};

export interface BacklogStory extends BacklogStoryDto {
  initials: string;
  devOpsStateLabel: string;
  ingestedLabel: string;
  /** Cambió de asignado desde la última clasificación (RN-54). */
  changedAssignee: boolean;
  /** Iniciativa a preseleccionar, si el Epic está mapeado. */
  suggestedInitiativeId: string | null;
  /** "Iniciativa · Kafka Migration", "BAU · Documentación técnica", "Descartada", "Rechazada · Duplicado". */
  outcomeLabel: string | null;
}

export interface BacklogSummary extends BacklogSummaryDto {
  /** Porcentaje del día: clasificadas hoy sobre (clasificadas hoy + pendientes). */
  progressPercentage: number;
}

export interface BacklogQueue {
  items: BacklogStory[];
  summary: BacklogSummary;
}

function outcomeLabel(
  dto: BacklogStoryDto,
  catalogs: BacklogCatalogsDto | null
): string | null {
  if (dto.status === "Rejected") {
    const reason = catalogs?.rejectReasons.find(
      (r) => r.value === dto.rejectReason
    )?.label;
    return reason ? `Rechazada · ${reason}` : "Rechazada";
  }
  const c = dto.classification;
  if (!c) return null;
  if (c.kind === "Initiative") {
    const name = catalogs?.initiatives.find(
      (i) => i.id === c.initiativeId
    )?.name;
    return `Iniciativa · ${name ?? c.initiativeId}`;
  }
  if (c.kind === "Bau") return `BAU · ${c.bauCategory}`;
  return "Descartada";
}

export const backlogAdapter = {
  toStory: (
    dto: BacklogStoryDto,
    catalogs: BacklogCatalogsDto | null = null
  ): BacklogStory => ({
    ...dto,
    initials: dto.personName ? getPersonInitials(dto.personName) : "",
    devOpsStateLabel: DEVOPS_STATE_LABELS[dto.devOpsState] ?? dto.devOpsState,
    ingestedLabel: formatDate(dto.ingestedAt),
    changedAssignee: dto.previousAssignedTo !== null,
    suggestedInitiativeId: dto.epicInitiativeId,
    outcomeLabel: outcomeLabel(dto, catalogs),
  }),

  toQueue: (
    dto: BacklogQueueDto,
    catalogs: BacklogCatalogsDto | null = null
  ): BacklogQueue => {
    const done = dto.summary.classifiedToday;
    const base = done + dto.summary.pending;
    return {
      items: dto.items.map((s) => backlogAdapter.toStory(s, catalogs)),
      summary: {
        ...dto.summary,
        progressPercentage: base === 0 ? 100 : Math.round((done / base) * 100),
      },
    };
  },
};

export const REJECT_REASON_LABELS: Record<RejectReason, string> = {
  OtherPerson: "Es de otra persona",
  DevOpsMistake: "Error de asignación en DevOps",
  Duplicate: "Duplicado",
  OtherTeam: "Trabajo de otro equipo",
  Other: "Otro",
};
