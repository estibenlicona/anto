import type { AbsenceSquadImpactDto } from "./absenceService";

/**
 * La aritmética de la ausencia vive acá, una sola vez: la usan el handler de
 * mock (que responde los días y los impactos calculados) y el formulario de
 * alta (que muestra los días contados antes de enviar). Días hábiles = lunes a
 * viernes, sin festivos — decisión de la Fase A anotada en design.md.
 */

/** Parsea "YYYY-MM-DD" a medianoche local; null si no tiene esa forma. */
export function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // Rechaza fechas que "ruedan" (2026-02-31 → 3 de marzo).
  if (date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) {
    return null;
  }
  return date;
}

export function formatIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/** Días hábiles del rango, ambos extremos incluidos. 0 si el rango es inválido. */
export function countBusinessDays(start: Date, end: Date): number {
  if (end < start) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (isBusinessDay(cursor)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/** Primer y último día del mes "YYYY-MM"; null si no tiene esa forma. */
export function monthBounds(month: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0),
  };
}

/** Intersección de dos rangos inclusivos; null si no se tocan. */
export function clampRange(
  start: Date,
  end: Date,
  boundStart: Date,
  boundEnd: Date
): { start: Date; end: Date } | null {
  const s = start > boundStart ? start : boundStart;
  const e = end < boundEnd ? end : boundEnd;
  return s <= e ? { start: s, end: e } : null;
}

/** La dedicación que reparte un impacto: el subconjunto de la asignación que la fórmula necesita. */
export interface AllocationShare {
  squadId: string;
  squadName: string;
  dedicationPercentage: number;
}

/**
 * Impacto de una ausencia sobre un mes, repartido entre las células de la
 * persona en proporción a su dedicación: días hábiles ausentes dentro del mes
 * ÷ días hábiles del mes × FTE disponible × dedicación. Sin células, sin
 * impacto (la lista queda vacía y la pantalla muestra "—").
 */
export function computeSquadImpacts(
  businessDaysInMonth: number,
  monthBusinessDays: number,
  availableFte: number,
  shares: AllocationShare[]
): AbsenceSquadImpactDto[] {
  if (monthBusinessDays <= 0 || businessDaysInMonth <= 0) {
    return shares.map((share) => ({
      squadId: share.squadId,
      squadName: share.squadName,
      dedicationPct: share.dedicationPercentage,
      fteImpact: 0,
    }));
  }
  const monthShare = businessDaysInMonth / monthBusinessDays;
  return shares.map((share) => ({
    squadId: share.squadId,
    squadName: share.squadName,
    dedicationPct: share.dedicationPercentage,
    fteImpact: monthShare * availableFte * (share.dedicationPercentage / 100),
  }));
}
