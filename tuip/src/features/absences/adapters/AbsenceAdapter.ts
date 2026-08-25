import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type {
  AbsenceDto,
  AbsencesMonthDto,
  AbsenceStatus,
  AbsenceType,
} from "../services/absenceService";

export const TYPE_LABELS: Record<AbsenceType, string> = {
  Vacation: "Vacaciones",
  Leave: "Permiso",
  SickLeave: "Incapacidad",
};

export const STATUS_LABELS: Record<AbsenceStatus, string> = {
  Requested: "Solicitada",
  Approved: "Aprobada",
  Rejected: "Rechazada",
};

/**
 * Solicitada pide una decisión (warning), Aprobada es un hecho (success) y
 * Rechazada es terminal sin alarma: no cuenta en nada, neutral alcanza.
 */
export const STATUS_VARIANTS: Record<
  AbsenceStatus,
  "warning" | "success" | "neutral"
> = {
  Requested: "warning",
  Approved: "success",
  Rejected: "neutral",
};

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MONTH_ABBR = [
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

/** "Agosto 2026" a partir de "2026-08". Devuelve la clave si no tiene esa forma. */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return month;
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** Clave "YYYY-MM" del mes corriente. */
export function currentMonthKey(today: Date = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

/** Suma meses a una clave "YYYY-MM" (delta puede ser negativo). */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayMonth(iso: string): string {
  const m = Number(iso.slice(5, 7));
  return `${Number(iso.slice(8, 10))} ${MONTH_ABBR[m - 1]}`;
}

/** "21 jul" / "6 – 8 jul" / "28 ago – 1 sep", como el artboard aprobado. */
export function formatRange(startIso: string, endIso: string): string {
  if (startIso === endIso) return dayMonth(startIso);
  if (startIso.slice(0, 7) === endIso.slice(0, 7)) {
    return `${Number(startIso.slice(8, 10))} – ${dayMonth(endIso)}`;
  }
  return `${dayMonth(startIso)} – ${dayMonth(endIso)}`;
}

export interface Absence extends AbsenceDto {
  typeLabel: string;
  statusLabel: string;
  statusVariant: "warning" | "success" | "neutral";
  rangeLabel: string;
  initials: string;
  /** "Planta" o el nombre del proveedor — el subtexto bajo el nombre. */
  originLabel: string;
  /** Célula de mayor dedicación (empate: alfabético); null sin asignaciones. */
  mainSquadName: string | null;
  /** Impacto total del mes visible: suma del reparto entre células. */
  monthFteImpact: number;
}

export interface AbsencesMonth {
  monthKey: string;
  monthTitle: string;
  monthBusinessDays: number;
  items: Absence[];
  /** Ausencias que tocan el mes y sus días hábiles dentro de él. */
  totalCount: number;
  totalBusinessDaysInMonth: number;
  /** Impacto en FTE del mes: sólo lo Aprobado. */
  approvedFteImpact: number;
  /** Célula que más FTE aprobado pierde en el mes; null si nada aprobado. */
  mostAffectedSquadName: string | null;
  pendingCount: number;
}

function toAbsence(dto: AbsenceDto): Absence {
  const ranked = [...dto.squadImpacts].sort(
    (a, b) =>
      b.dedicationPct - a.dedicationPct ||
      a.squadName.localeCompare(b.squadName)
  );
  return {
    ...dto,
    typeLabel: TYPE_LABELS[dto.type],
    statusLabel: STATUS_LABELS[dto.status],
    statusVariant: STATUS_VARIANTS[dto.status],
    rangeLabel: formatRange(dto.startDate, dto.endDate),
    initials: getPersonInitials(dto.personName),
    originLabel: dto.providerName ?? "Planta",
    mainSquadName: ranked[0]?.squadName ?? null,
    monthFteImpact: dto.squadImpacts.reduce((acc, i) => acc + i.fteImpact, 0),
  };
}

export const absenceAdapter = {
  toMonth(dto: AbsencesMonthDto): AbsencesMonth {
    const items = dto.items.map(toAbsence);
    const approved = items.filter((a) => a.status === "Approved");
    // Célula más afectada: el reparto completo, no sólo la célula principal.
    const bySquad = new Map<string, { name: string; impact: number }>();
    for (const absence of approved) {
      for (const impact of absence.squadImpacts) {
        const current = bySquad.get(impact.squadId);
        bySquad.set(impact.squadId, {
          name: impact.squadName,
          impact: (current?.impact ?? 0) + impact.fteImpact,
        });
      }
    }
    const mostAffected =
      [...bySquad.values()]
        .filter((s) => s.impact > 0)
        .sort((a, b) => b.impact - a.impact || a.name.localeCompare(b.name))[0]
        ?.name ?? null;
    return {
      monthKey: dto.month,
      monthTitle: monthLabel(dto.month),
      monthBusinessDays: dto.monthBusinessDays,
      items,
      totalCount: items.length,
      totalBusinessDaysInMonth: items.reduce(
        (acc, a) => acc + a.businessDaysInMonth,
        0
      ),
      approvedFteImpact: approved.reduce((acc, a) => acc + a.monthFteImpact, 0),
      mostAffectedSquadName: mostAffected,
      pendingCount: items.filter((a) => a.status === "Requested").length,
    };
  },
};
