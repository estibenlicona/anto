import {
  clampRange,
  countBusinessDays,
  parseIsoDate,
  type HalfDayEdges,
} from "@features/absences/services/businessDays";
import type {
  CapacityBreakdownDto,
  CapacityDto,
} from "../services/dedicationService";

/**
 * El FTE como **capacidad, y sólo capacidad**.
 *
 * El FTE que la célula declara en la asignación es un reporte, no una medida:
 * si la célula reporta mal, cualquier lectura construida sobre él miente. Acá
 * el FTE se mide de los días del sprint —cuántos hábiles tenía y cuántos se
 * fueron en festivos, vacaciones, ausencias aprobadas u otras
 * indisponibilidades—, así que el número siempre se puede discutir contra su
 * desglose. Por eso el desglose viaja junto al resultado y nunca se esconde.
 *
 * Los puntos de historia NO entran acá: la demanda se mide en SP y se compara
 * contra el histórico del propio colaborador. No hay conversión entre unidades.
 */

export interface CapacityInput {
  /** Dedicación de contrato: 1.0 jornada completa, 0.5 medio tiempo. */
  contractualFte: number;
  /** Días hábiles (L–V) dentro de las fechas del sprint. */
  businessDays: number;
  holidays: number;
  vacationDays: number;
  absenceDays: number;
  otherUnavailableDays: number;
  /**
   * Las horas que un colaborador a jornada completa tiene en un sprint sin
   * descuentos, del Calendario de sprints. Sólo traduce la misma capacidad a
   * la unidad con la que el lead habla con su gente; no es un parte de trabajo.
   */
  hoursPerSprint: number;
}

/** Redondeo a dos decimales sin el ruido de coma flotante de `toFixed`. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * FTE disponible = contractual × (hábiles − descuentos) / hábiles.
 *
 * Acotado a `[0, contractualFte]`: descuentos que se pasan de los días hábiles
 * (dos ausencias solapadas mal sembradas, por ejemplo) no pueden producir una
 * capacidad negativa ni mayor que el contrato.
 */
export function computeAvailableFte(input: CapacityInput): CapacityDto {
  const {
    contractualFte,
    businessDays,
    holidays,
    vacationDays,
    absenceDays,
    otherUnavailableDays,
    hoursPerSprint,
  } = input;

  const breakdown: CapacityBreakdownDto = {
    businessDays,
    holidays,
    vacationDays,
    absenceDays,
    otherUnavailableDays,
  };

  /** La misma capacidad en horas, redondeada a la hora entera. */
  const withHours = (availableFte: number): CapacityDto => ({
    contractualFte,
    availableFte,
    breakdown,
    availableHours: Math.round(availableFte * hoursPerSprint),
    deductedHours: Math.round((contractualFte - availableFte) * hoursPerSprint),
  });

  // Sin días hábiles no hay capacidad que repartir, y dividir daría infinito.
  if (businessDays <= 0) return withHours(0);

  const unavailable =
    holidays + vacationDays + absenceDays + otherUnavailableDays;
  const worked = businessDays - unavailable;
  const raw = contractualFte * (worked / businessDays);
  const clamped = Math.min(Math.max(raw, 0), contractualFte);

  return withHours(round2(clamped));
}

/** Un rango de ausencia aprobada, tal como lo guarda el módulo de Ausencias. */
export interface AbsenceRange extends HalfDayEdges {
  /** ISO date. */
  startDate: string;
  /** ISO date. */
  endDate: string;
}

/**
 * Días hábiles de un rango de ausencia que caen dentro del sprint.
 *
 * Se recorta contra las fechas del sprint antes de contar: una ausencia de dos
 * semanas que sólo solapa tres días del sprint descuenta tres, no diez. Las
 * medias jornadas de los extremos sólo cuentan si ese extremo sobrevivió al
 * recorte —si el inicio quedó fuera del sprint, su media jornada tampoco entra—.
 */
export function absenceDaysInSprint(
  absence: AbsenceRange,
  sprintStart: Date,
  sprintEnd: Date
): number {
  const start = parseIsoDate(absence.startDate);
  const end = parseIsoDate(absence.endDate);
  if (!start || !end) return 0;

  const overlap = clampRange(start, end, sprintStart, sprintEnd);
  if (!overlap) return 0;

  return countBusinessDays(overlap.start, overlap.end, {
    startsHalfDay:
      absence.startsHalfDay && overlap.start.getTime() === start.getTime(),
    endsHalfDay: absence.endsHalfDay && overlap.end.getTime() === end.getTime(),
  });
}

/** Días hábiles (L–V) entre dos fechas ISO, ambas incluidas. */
export function sprintBusinessDays(startDate: string, endDate: string): number {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 0;
  return countBusinessDays(start, end);
}

/**
 * Cuántos SP por FTE disponible. Es lo que permite comparar la demanda de un
 * colaborador que estuvo de vacaciones media semana con la suya propia de
 * otros sprints, sin traducir SP a FTE ni al revés. `null` sin capacidad: 28
 * SP sobre 0.0 FTE no es un número grande, es una situación sin sentido.
 */
export function pointsPerAvailableFte(
  points: number,
  availableFte: number
): number | null {
  if (availableFte <= 0) return null;
  return round2(points / availableFte);
}
