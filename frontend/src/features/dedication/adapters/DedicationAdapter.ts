import type { OverviewPerson } from "@features/control-tower/adapters/CapacityOverviewAdapter";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type {
  ActivityDayDto,
  BalanceEvidenceDto,
  BalanceSignalDto,
  CapacityBreakdownDto,
  CapacityDto,
  CollaboratorDedicationDetailDto,
  CollaboratorDedicationListDto,
  CollaboratorDedicationRowDto,
  CollaboratorDedicationSummaryDto,
  ConcurrentInitiativeDto,
  DedicationAllocationDto,
  MultitaskingDto,
  ListSprintDto,
  ReferenceDto,
  SelectedSprintDto,
  SnapshotStatus,
  SprintActivityTotalsDto,
  SprintExecutionDto,
  SprintTrendPointDto,
  UnplannedWorkDto,
  WorkItemDto,
  WorkItemTag,
} from "../services/dedicationService";
import {
  DEMAND_DEVIATION_PCT,
  EVIDENCE_LABELS,
  MULTITASKING_WIP,
  MULTITASKING_WIP_STRONG,
  NOT_EVALUABLE_LABELS,
  SIGNAL_LABELS,
} from "./balanceSignal";

/**
 * Entidades de UI del listado y del dashboard de balance, y todo su formato.
 * Las derivaciones viven acá; los componentes sólo presentan. Las reglas —los
 * umbrales, la agregación, el modificador de célula— viven en
 * `balanceSignal.ts` y el adapter nunca las reescribe: las rotula.
 *
 * Tres unidades y tres formatos, sin mezclarlos nunca:
 * **FTE** con dos decimales, **SP** entero, **porcentajes** con un decimal.
 */

/** Signo menos tipográfico: "−11", no "-11". */
export const MINUS = "−";
const EN_DASH = "–";
/** Espacio duro: la cifra y su signo no se parten al final de una línea. */
const NBSP = "\u00a0";

/** El FTE disponible, siempre con dos decimales: "0.80". */
export function formatFte(value: number): string {
  return value.toFixed(2);
}

/**
 * El FTE contractual, que es una cifra redonda de contrato: "1.0", "0.50",
 * "0.25". La jornada completa se escribe "1.0" y no "1.00" porque no es una
 * medición sino un tope.
 */
export function formatContractualFte(value: number): string {
  return Number.isInteger(value) ? value.toFixed(1) : value.toFixed(2);
}

/** "0.80 / 1.0 FTE" — lo disponible sobre lo contractual. */
export function capacityFigures(capacity: CapacityDto): string {
  return `${formatFte(capacity.availableFte)} / ${formatContractualFte(capacity.contractualFte)} FTE`;
}

/**
 * "72 h · −8 h por ausencias" — la misma capacidad en la unidad con la que el
 * lead habla con su gente. Sin descuentos no hay resta que mostrar: un "−0 h"
 * sólo ocuparía espacio.
 *
 * No son horas trabajadas: nadie las reporta, salen de los días del sprint.
 */
export function capacityHours(capacity: CapacityDto): string {
  const available = `${capacity.availableHours} h`;
  return capacity.deductedHours > 0
    ? `${available} · ${MINUS}${capacity.deductedHours} h por ausencias`
    : available;
}

/** Los SP son enteros: la demanda no se parte en decimales. */
export function formatPoints(value: number): string {
  return String(Math.round(value));
}

/**
 * "78.6 %" · "−57.1 %" — un decimal, espacio duro antes del signo y el menos
 * tipográfico, como el resto de las cifras de la pantalla.
 */
export function formatRate(value: number | null): string {
  if (value === null) return EN_DASH;
  const written = Math.abs(value).toFixed(1);
  return `${value < 0 ? MINUS : ""}${written}${NBSP}%`;
}

/** "+6 SP" · "−11 SP" · "0 SP". */
export function formatDeltaPoints(value: number): string {
  const abs = formatPoints(Math.abs(value));
  if (value > 0) return `+${abs} SP`;
  if (value < 0) return `${MINUS}${abs} SP`;
  return `${abs} SP`;
}

/** "+27 %" · "−55 %"; la desviación se lee en enteros, que es como se decide. */
export function formatDeltaRate(value: number | null): string | null {
  if (value === null) return null;
  const abs = Math.round(Math.abs(value));
  if (value > 0) return `+${abs}${NBSP}%`;
  if (value < 0) return `${MINUS}${abs}${NBSP}%`;
  return `0${NBSP}%`;
}

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
const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** "17 ago". */
export function shortDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "mié 19 ago". */
export function weekdayShortDate(iso: string): string {
  return `${WEEKDAYS[parseIsoDate(iso).getDay()]} ${shortDate(iso)}`;
}

/** "17 ago – 30 ago". */
export function sprintRangeLabel(startDate: string, endDate: string): string {
  return `${shortDate(startDate)} ${EN_DASH} ${shortDate(endDate)}`;
}

/** "Actualizado hace 12 min" · "Actualizado hace un momento" · "Sin actualizar". */
export function syncedAtLabel(
  iso: string | null,
  now: Date = new Date()
): string {
  if (!iso) return "Sin actualizar";
  const minutes = Math.floor(
    (now.getTime() - new Date(iso).getTime()) / 60_000
  );
  if (minutes < 1) return "Actualizado hace un momento";
  if (minutes < 60) return `Actualizado hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Actualizado hace ${hours} h`;
  return `Actualizado el ${shortDate(iso.slice(0, 10))}`;
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// ── Procedencia del snapshot ────────────────────────────────────────────────

export const SNAPSHOT_LABELS: Record<SnapshotStatus, string> = {
  Sealed: "Sellado",
  Provisional: "Provisional",
  Missing: "Sin snapshot",
};

/** El rol de color de cada procedencia: sellado neutro, en curso informativo, ausente en advertencia. */
export type SnapshotVariant = "neutral" | "info" | "warning";

export const SNAPSHOT_VARIANTS: Record<SnapshotStatus, SnapshotVariant> = {
  Sealed: "neutral",
  Provisional: "info",
  Missing: "warning",
};

/** "Sellado el 16 ago" · "Provisional" · "Sin snapshot". */
export function snapshotLabel(
  status: SnapshotStatus,
  sealedAt: string | null
): string {
  if (status === "Sealed" && sealedAt)
    return `Sellado el ${shortDate(sealedAt.slice(0, 10))}`;
  return SNAPSHOT_LABELS[status];
}

export const SNAPSHOT_NOTES: Record<SnapshotStatus, string | null> = {
  Sealed: null,
  Provisional: "El sprint sigue en curso: estas cifras pueden cambiar.",
  Missing:
    "El sprint cerró sin sellar snapshot. Tras la limpieza de HUs, lo que Azure DevOps responde hoy ya no es lo que ocurrió, así que este sprint no cuenta en el histórico ni en la tendencia.",
};

// ── Capacidad ───────────────────────────────────────────────────────────────

/** Cada concepto que descuenta capacidad, con su rótulo, para el desglose. */
const BREAKDOWN_PARTS: Array<{
  key: keyof Omit<CapacityBreakdownDto, "businessDays">;
  one: string;
  many: string;
}> = [
  { key: "holidays", one: "festivo", many: "festivos" },
  { key: "vacationDays", one: "vacaciones", many: "vacaciones" },
  { key: "absenceDays", one: "ausencia", many: "ausencias" },
  { key: "otherUnavailableDays", one: "otra", many: "otras" },
];

const formatDays = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * "10 días laborales · −1 festivo · −1 ausencia". El desglose acompaña siempre
 * al número: una capacidad sin su origen es una capacidad que nadie puede
 * discutir.
 */
export function capacityBreakdownLabel(
  breakdown: CapacityBreakdownDto
): string {
  const parts = [
    `${breakdown.businessDays} ${breakdown.businessDays === 1 ? "día laboral" : "días laborales"}`,
  ];
  for (const part of BREAKDOWN_PARTS) {
    const days = breakdown[part.key];
    if (days > 0)
      parts.push(
        `${MINUS}${formatDays(days)} ${days === 1 ? part.one : part.many}`
      );
  }
  return parts.join(" · ");
}

/** Cada descuento como una muesca de la barra de capacidad. */
export interface CapacityDeduction {
  key: string;
  label: string;
  days: number;
}

export function capacityDeductions(
  breakdown: CapacityBreakdownDto
): CapacityDeduction[] {
  return BREAKDOWN_PARTS.filter((p) => breakdown[p.key] > 0).map((p) => ({
    key: p.key,
    label:
      breakdown[p.key] === 1
        ? `1 ${p.one}`
        : `${formatDays(breakdown[p.key])} ${p.many}`,
    days: breakdown[p.key],
  }));
}

// ── Demanda y referencia ────────────────────────────────────────────────────

/** "28 SP · habitual 22", o sólo "28 SP" sin histórico contra qué compararla. */
export function demandFigures(
  committedPoints: number,
  ownMedian: number | null
): string {
  const demand = `${formatPoints(committedPoints)} SP`;
  return ownMedian === null
    ? demand
    : `${demand} · habitual ${formatPoints(ownMedian)}`;
}

/**
 * El pie de la columna de demanda: el umbral cuando la desviación se sale de
 * él, y que está dentro cuando no.
 *
 * Es el umbral de **la evidencia de demanda**, no el de la señal: la señal
 * sigue saliendo de la concurrencia de evidencias, y por eso el icono de
 * balance vive en su propia columna con su propio tooltip.
 */
export function toleranceLabel(deviationRate: number | null): string | null {
  if (deviationRate === null) return null;
  return Math.abs(deviationRate) > DEMAND_DEVIATION_PCT
    ? `Tolerancia ±${DEMAND_DEVIATION_PCT}${NBSP}%`
    : "Dentro de la tolerancia";
}

/** "+6 SP · +27 %"; `null` sin histórico. */
export function deviationLabel(reference: ReferenceDto): string | null {
  if (reference.ownDeviationPoints === null) return null;
  const rate = formatDeltaRate(reference.ownDeviationRate);
  const points = formatDeltaPoints(reference.ownDeviationPoints);
  return rate ? `${points} · ${rate}` : points;
}

/** "5 sprints sellados" · "Faltan 1 de 3 sprints sellados". */
export function historyLabel(
  reference: ReferenceDto,
  minSprints: number
): string {
  if (reference.sufficient)
    return `${plural(reference.sealedSprintCount, "sprint sellado", "sprints sellados")}`;
  const missing = Math.max(minSprints - reference.sealedSprintCount, 0);
  return `Faltan ${missing} de ${minSprints} sprints sellados (hay ${reference.sealedSprintCount})`;
}

// ── Señal ───────────────────────────────────────────────────────────────────

/** "Posible sobreasignación · 4 señales concurrentes" · "No evaluable · Sin identidad DevOps". */
export function signalTooltip(balance: BalanceSignalDto): string {
  const label = SIGNAL_LABELS[balance.signal];
  if (balance.notEvaluableReason)
    return `${label} · ${NOT_EVALUABLE_LABELS[balance.notEvaluableReason]}`;
  const count = Math.max(balance.overCount, balance.underCount);
  const parts = [label];
  if (count > 0)
    parts.push(plural(count, "señal concurrente", "señales concurrentes"));
  // La anotación de célula viaja también en la fila: sin ella, el lead actuaría
  // sobre la persona cuando el que se movió fue el equipo.
  if (balance.squadContext === "SameDirection")
    parts.push("la célula se comporta igual");
  return parts.join(" · ");
}

/** Cómo se lee una evidencia en el panel *Por qué esta señal*. */
export interface EvidenceRow {
  id: string;
  label: string;
  direction: BalanceEvidenceDto["direction"];
  strong: boolean;
  /** "28 SP · +27 %" o la cifra cruda de esa evidencia; `null` sin evaluar. */
  value: string | null;
  /** "Hasta 25 %", "Mínimo 60 %" o "Hasta 2 iniciativas"; `null` cuando no aplica. */
  threshold: string | null;
  /**
   * El veredicto en palabras: "Fuera de tolerancia · desviación fuerte",
   * "Dentro de la tolerancia", "No se pudo evaluar: sprint en curso".
   *
   * Se dice contra la **tolerancia**, no contra la dirección: quien lee la
   * tabla ya sabe hacia dónde apunta la señal por el icono, y lo que necesita
   * saber de cada fila es si su cifra se pasó del margen o no. "Cuenta hacia
   * sobrecarga" obligaba a comparar la cifra con el umbral de al lado.
   */
  verdict: string;
  counts: boolean;
}

/**
 * Por qué una evidencia quedó sin evaluar en este sprint. El motivo no viene
 * por evidencia en el contrato —no hace falta—: cuando una evidencia no se
 * puede evaluar en un sprint provisional o sin sellar, es por el sprint.
 */
function unknownReason(snapshotStatus: SnapshotStatus | null): string | null {
  if (snapshotStatus === "Provisional") return "sprint en curso";
  if (snapshotStatus === "Missing") return "sprint sin snapshot";
  return null;
}

function evidenceVerdict(
  evidence: BalanceEvidenceDto,
  snapshotStatus: SnapshotStatus | null
): string {
  if (evidence.direction === "Unknown") {
    const reason = unknownReason(snapshotStatus);
    return reason ? `No se pudo evaluar: ${reason}` : "No se pudo evaluar";
  }
  if (evidence.direction === "Neutral") return "Dentro de la tolerancia";
  return evidence.strong
    ? "Fuera de tolerancia · desviación fuerte"
    : "Fuera de tolerancia";
}

/** Con qué unidad se lee la cifra de cada evidencia. */
const EVIDENCE_UNITS: Record<string, "rate" | "count"> = {
  demandVsOwnHistory: "rate",
  demandPerAvailableFte: "rate",
  completion: "rate",
  carryOver: "rate",
  unplannedWork: "rate",
  multitasking: "count",
};

function evidenceValueLabel(evidence: BalanceEvidenceDto): string | null {
  if (evidence.value === null) return null;
  if (EVIDENCE_UNITS[evidence.id] === "count")
    return plural(evidence.value, "iniciativa", "iniciativas");
  return formatRate(evidence.value);
}

/**
 * La tolerancia dicha como límite y no como cifra suelta: "Hasta 25 %" para
 * lo que no debe pasarse, "Mínimo 75.9 %" para lo que no debe bajar. Es la
 * misma comparación que hace la evidencia, escrita en la dirección en que se
 * lee: el cumplimiento es el único que cuenta hacia abajo.
 *
 * Las convenciones (25 %, 20 %) se escriben redondas; los límites que salen
 * del histórico del colaborador (el piso de cumplimiento, el techo de
 * carry-over) conservan su decimal, porque son una medida y no un acuerdo.
 * El foco se dice en iniciativas: el umbral es la tercera, así que se admiten
 * hasta dos.
 */
function evidenceThresholdLabel(evidence: BalanceEvidenceDto): string | null {
  if (evidence.threshold === null) return null;
  if (EVIDENCE_UNITS[evidence.id] === "count")
    return `Hasta ${plural(evidence.threshold - 1, "iniciativa", "iniciativas")}`;
  const value = Math.abs(evidence.threshold);
  const written = Number.isInteger(value) ? String(value) : value.toFixed(1);
  const bound = evidence.id === "completion" ? "Mínimo" : "Hasta";
  return `${bound} ${written}${NBSP}%`;
}

export function toEvidenceRow(
  evidence: BalanceEvidenceDto,
  snapshotStatus: SnapshotStatus | null = null
): EvidenceRow {
  return {
    id: evidence.id,
    label: EVIDENCE_LABELS[evidence.id],
    direction: evidence.direction,
    strong: evidence.strong,
    value: evidenceValueLabel(evidence),
    threshold: evidenceThresholdLabel(evidence),
    verdict: evidenceVerdict(evidence, snapshotStatus),
    counts: evidence.direction === "Over" || evidence.direction === "Under",
  };
}

/**
 * La anotación de contexto de célula; `null` cuando el equipo no acompaña.
 *
 * **No baja la señal**: dice a quién conviene preguntarle. Sobrecarga sigue
 * siendo sobrecarga aunque la comparta toda la célula.
 */
/**
 * "3 señales" — cuántas evidencias concurrentes sostienen la señal, dicho
 * corto porque acompaña al titular y no tiene que competir con él.
 */
export function signalEvidenceLabel(balance: BalanceSignalDto): string {
  const count = balance.overCount + balance.underCount;
  return count === 0 ? "Sin señales" : plural(count, "señal", "señales");
}

export function squadModifierLabel(balance: BalanceSignalDto): string | null {
  if (balance.squadContext !== "SameDirection") return null;
  return "Contexto de célula: el equipo entero se comporta igual, así que la conversación probablemente no es con la persona sino con la célula.";
}

// ── Foco ────────────────────────────────────────────────────────────────────
// "Foco" es como se llama en la pantalla; `multitasking` y `wip` son los
// nombres del modelo y del contrato, y siguen así para rastrear el origen.

/** Una iniciativa simultánea, con su nombre cuando la épica está mapeada. */
export interface InitiativeRow {
  id: string;
  /** El nombre de la iniciativa, o el título de la épica cuando no está mapeada. */
  name: string;
  /**
   * La épica que se contó, cuando su nombre no es ya el de la fila. Dos épicas
   * de la misma iniciativa se cuentan por separado mientras el mapeo no exista:
   * sin este renglón la fila se repetiría sin decir por qué.
   */
  epicTitle: string | null;
  /** `true` cuando lo que se muestra es la épica porque no hay iniciativa. */
  isUnmappedEpic: boolean;
  points: number;
  pointsLabel: string;
}

export function toInitiativeRow(dto: ConcurrentInitiativeDto): InitiativeRow {
  return {
    id: dto.epicId,
    name: dto.initiativeName ?? dto.epicTitle,
    epicTitle: dto.initiativeName === null ? null : dto.epicTitle,
    isUnmappedEpic: dto.initiativeName === null,
    points: dto.points,
    pointsLabel: `${formatPoints(dto.points)} SP`,
  };
}

const initiativesNoun = (count: number) =>
  count === 1 ? "iniciativa" : "iniciativas";

// "HUs" y no "WIP": el campo se sigue llamando `wip` en el contrato —es el
// nombre de Azure y del backend—, pero la pantalla no tiene por qué explicar
// una sigla. Y tampoco "HUs abiertas": es la única clase de HU que se cuenta
// acá, así que el adjetivo no distingue nada. La métrica de Foco de la ficha
// lo dice entero una vez —"4 HUs abiertas a la vez"— y ahí queda definido.
const wipNoun = (wip: number) => (wip === 1 ? "HU" : "HUs");

/** "3 iniciativas · 4 HUs" · "1 iniciativa" cuando el WIP no se pudo reconstruir. */
export function multitaskingLabel(multitasking: MultitaskingDto): string {
  const n = multitasking.concurrentInitiatives;
  const initiatives = `${n} ${initiativesNoun(n)}`;
  return multitasking.wip === null
    ? initiatives
    : `${initiatives} · ${multitasking.wip} ${wipNoun(multitasking.wip)}`;
}

/** Tramos del medidor de foco: uno por escalón de dispersión. */
export const FOCUS_LEVELS = 4;

/**
 * Cuánta atención está repartida, en cuatro escalones, a partir de las HUs
 * abiertas a la vez. `null` cuando el historial de estados no alcanzó para
 * reconstruirlas: sin dato no se pinta un medidor en cero, que se leería como
 * foco pleno.
 *
 * Los cortes son los umbrales que ya usa la evidencia de multitarea, no unos
 * propios: el medidor y la señal no pueden decir cosas distintas de la misma
 * fila.
 *
 * 1. una sola HU en curso — el trabajo va de a uno
 * 2. dos o tres — repartido, todavía por debajo del umbral
 * 3. `MULTITASKING_WIP` o más — ya cuenta hacia sobrecarga
 * 4. `MULTITASKING_WIP_STRONG` o más — desviación fuerte
 */
export function focusLevel(wip: number | null): number | null {
  if (wip === null) return null;
  if (wip <= 1) return 1;
  if (wip < MULTITASKING_WIP) return 2;
  if (wip < MULTITASKING_WIP_STRONG) return 3;
  return FOCUS_LEVELS;
}

/**
 * El foco de una fila: el medidor y, debajo, las dos cifras que lo explican.
 *
 * El medidor existe para el barrido de la columna —la altura del escalón se ve
 * sin leer— y las cifras para la fila que uno se detiene a mirar.
 */
export interface MultitaskingCell {
  /** "2 iniciativas · 4 HUs" · "2 iniciativas" sin WIP reconstruido. */
  label: string;
  /** 1–4; `null` cuando no hay WIP con el cual medir el foco. */
  level: number | null;
}

export function multitaskingCell(
  multitasking: MultitaskingDto
): MultitaskingCell {
  return {
    label: multitaskingLabel(multitasking),
    level: focusLevel(multitasking.wip),
  };
}

// ── Listado ─────────────────────────────────────────────────────────────────

export interface CollaboratorRow {
  id: string;
  name: string;
  position: string;
  initials: string;
  avatarUrl: string | null;
  hasIdentity: boolean;
  hasSprint: boolean;
  squadId: string | null;
  squadName: string | null;
  /**
   * Las iniciativas que sus historias tocaron en el sprint, **sin nombres
   * repetidos**: la primera se nombra y el resto se cuenta en
   * `extraInitiatives`. La cuenta de foco sí las cuenta todas.
   */
  initiatives: InitiativeRow[];
  shownInitiatives: InitiativeRow[];
  extraInitiatives: number;
  sprintName: string | null;
  sprintRange: string | null;
  snapshotStatus: SnapshotStatus | null;
  snapshotLabel: string | null;
  capacity: CapacityDto;
  /** "0.80 / 1.0 FTE"; `null` sin sprint que medir. */
  capacityFigures: string | null;
  capacityHours: string | null;
  capacityBreakdown: string | null;
  committedPoints: number;
  /** "28 SP · habitual 22"; `null` sin sprint. */
  demandFigures: string | null;
  /** "+36 %"; `null` sin histórico contra qué comparar. */
  deviation: string | null;
  /** "Tolerancia ±25 %" o "Dentro de la tolerancia"; `null` sin histórico. */
  tolerance: string | null;
  reference: ReferenceDto;
  multitasking: MultitaskingDto;
  /** "3 iniciativas · 4 HUs"; `null` sin sprint. */
  multitaskingLabel: string | null;
  /** Las mismas cifras en piezas, para la celda de dos renglones; `null` sin sprint. */
  multitaskingCell: MultitaskingCell | null;
  balance: BalanceSignalDto;
  signalTooltip: string;
}

/**
 * Cuántas marcas de iniciativa se nombran antes del "+N".
 *
 * Una. La columna dice *en qué anduvo* la persona, y para eso alcanza con el
 * frente principal y cuántos más hubo; el espacio que se ahorra se lo llevan
 * las barras de capacidad y demanda, que es donde se decide. Los nombres que
 * quedan fuera van en el `title` del "+N", no se pierden.
 */
export const SHOWN_INITIATIVES = 1;

/** La primera de cada nombre, en el orden en que llegaron. */
function uniqueByName(initiatives: InitiativeRow[]): InitiativeRow[] {
  const seen = new Set<string>();
  return initiatives.filter((initiative) => {
    if (seen.has(initiative.name)) return false;
    seen.add(initiative.name);
    return true;
  });
}

export interface CollaboratorList {
  rows: CollaboratorRow[];
  summary: CollaboratorDedicationSummaryDto;
  /** El sprint del que habla todo el listado; `null` sin sprints. */
  sprint: CollaboratorDedicationListDto["sprint"];
  historyWindowSprints: number;
  minHistorySprints: number;
  hoursPerSprint: number;
  lastSyncedAt: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function toCollaboratorRow(
  dto: CollaboratorDedicationRowDto
): CollaboratorRow {
  const hasSprint = dto.sprint !== null;
  // Por nombre, no por id: dos épicas mapeadas a la misma iniciativa son dos
  // frentes para la multitarea —y así las cuenta la evidencia— pero una sola
  // marca en la fila. Repetir el rótulo no diría nada más de en qué anduvo.
  const initiatives = uniqueByName(dto.sprintInitiatives.map(toInitiativeRow));
  return {
    id: dto.person.id,
    name: dto.person.name,
    position: dto.person.position,
    initials: getPersonInitials(dto.person.name),
    avatarUrl: dto.person.avatarUrl,
    hasIdentity: dto.hasIdentity,
    hasSprint,
    squadId: dto.allocation?.squadId ?? null,
    squadName: dto.allocation?.squadName ?? null,
    initiatives,
    shownInitiatives: initiatives.slice(0, SHOWN_INITIATIVES),
    extraInitiatives: Math.max(initiatives.length - SHOWN_INITIATIVES, 0),
    sprintName: dto.sprint?.name ?? null,
    sprintRange: dto.sprint
      ? sprintRangeLabel(dto.sprint.startDate, dto.sprint.endDate)
      : null,
    snapshotStatus: dto.sprint?.snapshotStatus ?? null,
    snapshotLabel: dto.sprint
      ? snapshotLabel(dto.sprint.snapshotStatus, dto.sprint.sealedAt)
      : null,
    capacity: dto.capacity,
    capacityFigures: hasSprint ? capacityFigures(dto.capacity) : null,
    capacityHours: hasSprint ? capacityHours(dto.capacity) : null,
    capacityBreakdown: hasSprint
      ? capacityBreakdownLabel(dto.capacity.breakdown)
      : null,
    committedPoints: dto.execution.committedPoints,
    demandFigures: hasSprint
      ? demandFigures(dto.execution.committedPoints, dto.reference.ownMedian)
      : null,
    deviation: hasSprint
      ? formatDeltaRate(dto.reference.ownDeviationRate)
      : null,
    tolerance: hasSprint
      ? toleranceLabel(dto.reference.ownDeviationRate)
      : null,
    reference: dto.reference,
    multitasking: dto.multitasking,
    multitaskingLabel: hasSprint ? multitaskingLabel(dto.multitasking) : null,
    multitaskingCell: hasSprint ? multitaskingCell(dto.multitasking) : null,
    balance: dto.balance,
    signalTooltip: signalTooltip(dto.balance),
  };
}

export function toCollaboratorList(
  dto: CollaboratorDedicationListDto
): CollaboratorList {
  return {
    rows: dto.items.map(toCollaboratorRow),
    summary: dto.summary,
    sprint: dto.sprint,
    historyWindowSprints: dto.settings.historyWindowSprints,
    minHistorySprints: dto.settings.minHistorySprints,
    hoursPerSprint: dto.settings.hoursPerSprint,
    lastSyncedAt: dto.lastSyncedAt,
    page: dto.page,
    pageSize: dto.pageSize,
    totalCount: dto.totalCount,
    totalPages: dto.totalPages,
  };
}

// ── Dashboard del colaborador ───────────────────────────────────────────────

/** Un sprint en la pestaña del selector y en la tendencia. */
export interface SprintRow {
  name: string;
  /** ISO; el navegador de sprint las necesita para su rango. */
  startDate: string;
  endDate: string;
  rangeLabel: string;
  isCurrent: boolean;
  snapshotStatus: SnapshotStatus;
  snapshotLabel: string;
  /** `false` en los sprints sin snapshot: no entran en el cálculo. */
  countsForHistory: boolean;
  execution: SprintExecutionDto;
  committedLabel: string;
  completedLabel: string;
  completionLabel: string;
  carryOverLabel: string;
  activity: SprintActivityTotalsDto;
}

export type WorkItemKind = "Initiative" | "Bau" | "Untagged";

export interface WorkItemRow {
  id: string;
  number: number;
  title: string;
  kind: WorkItemKind;
  /** "Iniciativa · Kafka Migration" · "Iniciativa" · "BAU" · "Sin etiqueta". */
  tagLabel: string;
  /** El nombre de la iniciativa mapeada; `null` sin mapeo o en el BAU. */
  initiativeName: string | null;
  /** El título de la épica; `null` cuando la historia no cuelga de ninguna. */
  epicTitle: string | null;
  /** `true` cuando la épica no está mapeada a una iniciativa. */
  epicUnmapped: boolean;
  addedAfterSprintStart: boolean;
  board: string;
  points: number;
  state: string;
  url: string;
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface ActivityCell {
  /** ISO date. */
  date: string;
  dayOfMonth: number;
  isWeekend: boolean;
  isToday: boolean;
  isFuture: boolean;
  /** `false` en los huecos que completan la semana antes y después del sprint. */
  inSprint: boolean;
  commits: number;
  releases: number;
  features: number;
  total: number;
  level: ActivityLevel;
  /** "mié 19 ago · 3 commits · 1 release". */
  label: string;
}

export interface ActivityCalendar {
  /** Semanas de lunes a domingo. */
  weeks: ActivityCell[][];
  totals: SprintActivityTotalsDto & { total: number };
  activeDays: number;
  elapsedDays: number;
  /** "8 de 13 días con actividad". */
  activeDaysLabel: string;
  /** "Última actividad el jue 20 ago"; `null` sin actividad. */
  lastActivityLabel: string | null;
  hasActivity: boolean;
}

/** Las tres cifras comparables del bloque de referencia. */
export interface ReferenceLine {
  key: "own" | "squad" | "current";
  label: string;
  /** "22 SP"; `null` cuando esa cifra no existe. */
  value: string | null;
  points: number | null;
  /** "+6 SP · +27 %"; `null` cuando no hay desviación que mostrar. */
  deviation: string | null;
}

/**
 * Una de las cuatro métricas que acompañan a la cabecera: la cifra que se lee
 * de lejos y, al lado, lo que la sostiene.
 *
 * El tono va acá y no en el componente porque la que se pasó de su tolerancia
 * es la misma que cuenta como evidencia: si lo decidiera la vista, la tarjeta
 * y la tabla de señales podrían discrepar de la misma cifra.
 */
export interface SprintMetric {
  /** "CUMPLIMIENTO" · "FOCO". */
  label: string;
  /** "40 %" · "2" — la cifra grande. */
  value: string;
  /** "12 de 30 SP en Closed" — qué la sostiene. */
  detail: string;
  /** La cifra se salió de su tolerancia y se lee en rol de peligro. */
  outOfTolerance: boolean;
}

export interface SelectedSprintView {
  name: string;
  rangeLabel: string;
  isCurrent: boolean;
  snapshotStatus: SnapshotStatus;
  snapshotLabel: string;
  snapshotNote: string | null;
  capacity: CapacityDto;
  capacityFigures: string;
  /** "72 h · −8 h por ausencias". */
  capacityHours: string;
  capacityBreakdown: string;
  capacityDeductions: CapacityDeduction[];
  execution: SprintExecutionDto;
  committedLabel: string;
  completedLabel: string;
  notCompletedLabel: string;
  completionLabel: string;
  carryOverLabel: string;
  unplannedWork: UnplannedWorkDto;
  unplannedRateLabel: string;
  multitasking: MultitaskingDto;
  multitaskingLabel: string;
  initiatives: InitiativeRow[];
  reference: ReferenceDto;
  referenceLines: ReferenceLine[];
  /** "+27 %": la desviación sola, para acompañar la cifra de demanda. */
  deviationRate: string | null;
  deviationLabel: string | null;
  /** "Marca: histórico de 22 SP"; "Sin histórico" cuando no hay contra qué. */
  referenceMarkLabel: string;
  historyLabel: string;
  balance: BalanceSignalDto;
  signalTooltip: string;
  /** "3 señales" · "1 señal" · "Sin señales": cuántas sostienen la señal. */
  signalEvidence: string;
  evidences: EvidenceRow[];
  /** Cumplimiento, Trabajo no planificado, Carry-over y Foco, en ese orden. */
  metrics: SprintMetric[];
  squadModifier: string | null;
  /** "28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18 % carry-over histórico". */
  summaryLine: string;
  workItems: WorkItemRow[];
  /** El recuento del pie de la pestaña Historias. */
  storiesSummary: StoriesSummary;
  calendar: ActivityCalendar;
}

/**
 * Las cuatro métricas que acompañan a la cabecera.
 *
 * Cuál va en rojo no se decide acá: se lee de la evidencia del mismo nombre.
 * Una tarjeta que se pintara con su propio criterio podría decir que el
 * cumplimiento está bien mientras la tabla de señales lo cuenta hacia
 * sobrecarga, y las dos cifras son la misma.
 */
function sprintMetrics(detail: SelectedSprintDto): SprintMetric[] {
  const evidences = detail.balance.evidences;
  const counts = (id: string) =>
    evidences.some(
      (e) => e.id === id && (e.direction === "Over" || e.direction === "Under")
    );
  const { execution, unplannedWork, multitasking } = detail;
  const wip = multitasking.wip;
  return [
    {
      label: "Cumplimiento",
      value: formatRate(execution.completionRate),
      detail: `${execution.completedPoints === null ? EN_DASH : formatPoints(execution.completedPoints)} de ${pointsOrDash(execution.committedPoints)} en Closed`,
      outOfTolerance: counts("completion"),
    },
    {
      label: "Trabajo no planificado",
      value: formatRate(unplannedWork.unplannedRate),
      detail: `+${unplannedWork.addedDuringSprintPoints} SP sobre ${unplannedWork.committedAtStartPoints}`,
      outOfTolerance: counts("unplannedWork"),
    },
    {
      label: "Carry-over",
      value: formatRate(execution.carryOverRate),
      detail: pointsOrDash(execution.carryOverPoints),
      outOfTolerance: counts("carryOver"),
    },
    {
      // La cifra grande son las iniciativas: es la que separa "28 SP en un
      // frente" de "28 SP en cuatro". Las HUs la acompañan en la lectura.
      label: "Foco",
      value: String(multitasking.concurrentInitiatives),
      detail:
        wip === null
          ? initiativesNoun(multitasking.concurrentInitiatives)
          : `${initiativesNoun(multitasking.concurrentInitiatives)} · ${wip} ${wipNoun(wip)} ${wip === 1 ? "abierta" : "abiertas"} a la vez`,
      outOfTolerance: counts("multitasking"),
    },
  ];
}

export type DashboardTabId = "signals" | "stories" | "activity" | "trend";

/**
 * Una pestaña de la ficha con su resumen.
 *
 * El subtítulo es lo que hace que las pestañas no escondan nada: dice qué hay
 * dentro sin abrirlas, así que el lead decide si entra en vez de recorrer las
 * cuatro.
 */
export interface DashboardTab {
  id: DashboardTabId;
  label: string;
  /** "3 de 6 hacia sobrecarga" · "6 historias · 30 SP". */
  subtitle: string;
}

/**
 * "3 de 6 hacia sobrecarga" — con la dirección cuando todas las evidencias que
 * cuentan apuntan al mismo lado, que es lo habitual, y neutro cuando se mezclan
 * o no hay ninguna.
 */
function signalsSubtitle(evidences: EvidenceRow[]): string {
  const over = evidences.filter((e) => e.direction === "Over").length;
  const under = evidences.filter((e) => e.direction === "Under").length;
  const counting = over + under;
  const of = `${counting} de ${evidences.length}`;
  if (counting === 0) return `${of} fuera de tolerancia`;
  if (under === 0) return `${of} hacia sobrecarga`;
  if (over === 0) return `${of} hacia subasignación`;
  return `${of} fuera de tolerancia`;
}

/** "7 sprints · +0.4 %": cuántos hay y cómo se movió el cumplimiento. */
function trendSubtitle(sprints: SprintRow[]): string {
  const label = plural(sprints.length, "sprint", "sprints");
  const sealed = sprints.filter(
    (s) => s.countsForHistory && s.execution.completionRate !== null
  );
  if (sealed.length < 2) return label;
  const first = sealed[0].execution.completionRate as number;
  const last = sealed[sealed.length - 1].execution.completionRate as number;
  const delta = last - first;
  const written = Math.abs(delta).toFixed(1);
  const sign = delta > 0 ? "+" : delta < 0 ? MINUS : "";
  return `${label} · ${sign}${written}${NBSP}%`;
}

function dashboardTabs(
  selected: SelectedSprintView,
  sprints: SprintRow[]
): DashboardTab[] {
  return [
    {
      id: "signals",
      label: "Señales",
      subtitle: signalsSubtitle(selected.evidences),
    },
    {
      id: "stories",
      label: "Historias",
      subtitle: `${plural(selected.workItems.length, "historia", "historias")} · ${selected.committedLabel}`,
    },
    {
      id: "activity",
      label: "Actividad",
      subtitle: `${plural(selected.calendar.activeDays, "día activo", "días activos")} · ${plural(selected.calendar.totals.commits, "commit", "commits")}`,
    },
    { id: "trend", label: "Tendencia", subtitle: trendSubtitle(sprints) },
  ];
}

/**
 * El recuento que cierra la pestaña Historias: qué se cerró, qué no, y cuánto
 * de lo comprometido entró con el sprint ya arrancado.
 *
 * Se cuenta sobre las historias que la pestaña muestra, no sobre las cifras de
 * ejecución: el pie explica la tabla que está encima, así que tiene que sumar
 * exactamente lo que ahí se ve.
 */
export interface StoriesSummary {
  closedPoints: number;
  closedCount: number;
  openPoints: number;
  lateCount: number;
  /** El mismo cumplimiento de la métrica, para cerrar la cuenta. */
  completionLabel: string;
}

function storiesSummaryOf(
  workItems: WorkItemDto[],
  completionLabel: string
): StoriesSummary {
  const closed = workItems.filter((w) => w.state === "Closed");
  const closedPoints = closed.reduce((sum, w) => sum + w.points, 0);
  const total = workItems.reduce((sum, w) => sum + w.points, 0);
  return {
    closedPoints,
    closedCount: closed.length,
    openPoints: total - closedPoints,
    lateCount: workItems.filter((w) => w.addedAfterSprintStart).length,
    completionLabel,
  };
}

/**
 * El sprint elegido de la ficha, en la forma que el navegador entiende: con
 * sus vecinos por nombre. Es el mismo componente del listado, así que la ficha
 * se adapta a su contrato en vez de tener un navegador propio.
 */
export function detailSprintNavigation(
  sprints: SprintRow[],
  selectedName: string | null
): ListSprintDto | null {
  const index = sprints.findIndex((s) => s.name === selectedName);
  if (index < 0) return null;
  const sprint = sprints[index];
  return {
    name: sprint.name,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    isCurrent: sprint.isCurrent,
    previousName: index > 0 ? sprints[index - 1].name : null,
    nextName: index < sprints.length - 1 ? sprints[index + 1].name : null,
  };
}

export interface CollaboratorDetail {
  person: {
    id: string;
    name: string;
    position: string;
    levelLabel: string;
    initials: string;
    avatarUrl: string | null;
    contractualFte: number;
  };
  allocation: DedicationAllocationDto | null;
  hasIdentity: boolean;
  hasSprints: boolean;
  /** "80 % declarado por la célula"; `null` sin célula. */
  declaredLabel: string | null;
  sprints: SprintRow[];
  selected: SelectedSprintView | null;
  /** Las cuatro pestañas con su resumen; vacío sin sprint que resumir. */
  tabs: DashboardTab[];
  historyWindowSprints: number;
  minHistorySprints: number;
  lastSyncedAt: string | null;
}

function tagLabelOf(item: WorkItemDto): string {
  if (item.tag === "Bau") return "BAU";
  if (item.tag === "Initiative")
    return item.initiativeName
      ? `Iniciativa · ${item.initiativeName}`
      : "Iniciativa";
  return "Sin etiqueta";
}

const kindOf = (tag: WorkItemTag): WorkItemKind =>
  tag === null ? "Untagged" : tag;

export function toWorkItemRow(item: WorkItemDto): WorkItemRow {
  return {
    id: item.id,
    number: item.number,
    title: item.title,
    kind: kindOf(item.tag),
    tagLabel: tagLabelOf(item),
    initiativeName: item.initiativeName,
    epicTitle: item.epicTitle,
    epicUnmapped: item.epicId !== null && item.initiativeId === null,
    addedAfterSprintStart: item.addedAfterSprintStart,
    board: item.board,
    points: item.points,
    state: item.state,
    url: item.url,
  };
}

function activityLabel(
  date: string,
  day: Pick<ActivityCell, "commits" | "releases" | "features" | "isFuture">
): string {
  const when = weekdayShortDate(date);
  if (day.isFuture) return `${when} · por venir`;
  const parts: string[] = [];
  if (day.commits > 0) parts.push(plural(day.commits, "commit", "commits"));
  if (day.releases > 0) parts.push(plural(day.releases, "release", "releases"));
  if (day.features > 0)
    parts.push(plural(day.features, "feature creada", "features creadas"));
  return `${when} · ${parts.length > 0 ? parts.join(" · ") : "sin actividad"}`;
}

function levelOf(total: number, max: number): ActivityLevel {
  if (total <= 0 || max <= 0) return 0;
  return Math.min(
    4,
    Math.max(1, Math.ceil((total / max) * 4))
  ) as ActivityLevel;
}

/** Hueco que completa la semana: no es un día del sprint. */
function gapCell(date: Date, todayIso: string): ActivityCell {
  const iso = toIsoDate(date);
  return {
    date: iso,
    dayOfMonth: date.getDate(),
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
    isToday: iso === todayIso,
    isFuture: iso > todayIso,
    inSprint: false,
    commits: 0,
    releases: 0,
    features: 0,
    total: 0,
    level: 0,
    label: "",
  };
}

/**
 * El calendario del sprint: una celda por día, agrupadas por semana de lunes
 * a domingo, con el nivel de cada día según el total de su actividad respecto
 * del día más activo del sprint (cuatro escalones más el vacío).
 */
export function buildActivityCalendar(
  startDate: string,
  endDate: string,
  days: ActivityDayDto[],
  today: Date = new Date()
): ActivityCalendar {
  const todayIso = toIsoDate(today);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);

  const sprintDays: ActivityCell[] = [];
  let max = 0;
  for (
    const cursor = new Date(start);
    cursor <= end;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const iso = toIsoDate(cursor);
    const day = byDate.get(iso);
    const commits = day?.commits ?? 0;
    const releases = day?.releases ?? 0;
    const features = day?.features ?? 0;
    const total = commits + releases + features;
    max = Math.max(max, total);
    const isFuture = iso > todayIso;
    sprintDays.push({
      date: iso,
      dayOfMonth: cursor.getDate(),
      isWeekend: cursor.getDay() === 0 || cursor.getDay() === 6,
      isToday: iso === todayIso,
      isFuture,
      inSprint: true,
      commits,
      releases,
      features,
      total,
      level: 0,
      label: activityLabel(iso, { commits, releases, features, isFuture }),
    });
  }
  for (const cell of sprintDays) cell.level = levelOf(cell.total, max);

  // Rellenar hasta el lunes anterior y el domingo siguiente.
  const cells: ActivityCell[] = [];
  const leading = (start.getDay() + 6) % 7;
  for (let i = leading; i > 0; i -= 1) {
    const date = new Date(start);
    date.setDate(start.getDate() - i);
    cells.push(gapCell(date, todayIso));
  }
  cells.push(...sprintDays);
  const trailing = (7 - ((end.getDay() + 6) % 7) - 1) % 7;
  for (let i = 1; i <= trailing; i += 1) {
    const date = new Date(end);
    date.setDate(end.getDate() + i);
    cells.push(gapCell(date, todayIso));
  }
  const weeks: ActivityCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const totals = sprintDays.reduce(
    (acc, d) => ({
      commits: acc.commits + d.commits,
      releases: acc.releases + d.releases,
      features: acc.features + d.features,
      total: acc.total + d.total,
    }),
    { commits: 0, releases: 0, features: 0, total: 0 }
  );
  const activeDays = sprintDays.filter((d) => d.total > 0).length;
  const elapsedDays = sprintDays.filter((d) => !d.isFuture).length;
  const last = [...sprintDays].reverse().find((d) => d.total > 0);

  return {
    weeks,
    totals,
    activeDays,
    elapsedDays,
    activeDaysLabel: `${activeDays} de ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"} con actividad`,
    lastActivityLabel: last
      ? `Última actividad el ${weekdayShortDate(last.date)}`
      : null,
    hasActivity: totals.total > 0,
  };
}

const pointsOrDash = (value: number | null) =>
  value === null ? EN_DASH : `${formatPoints(value)} SP`;

function sprintRowOf(sprint: SprintTrendPointDto): SprintRow {
  return {
    name: sprint.name,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    rangeLabel: sprintRangeLabel(sprint.startDate, sprint.endDate),
    isCurrent: sprint.isCurrent,
    snapshotStatus: sprint.snapshotStatus,
    snapshotLabel: snapshotLabel(sprint.snapshotStatus, sprint.sealedAt),
    countsForHistory: sprint.snapshotStatus === "Sealed",
    execution: sprint.execution,
    committedLabel: pointsOrDash(sprint.execution.committedPoints),
    completedLabel: pointsOrDash(sprint.execution.completedPoints),
    completionLabel: formatRate(sprint.execution.completionRate),
    carryOverLabel: formatRate(sprint.execution.carryOverRate),
    activity: sprint.activity,
  };
}

/**
 * La mediana de carry-over de los sprints sellados: lo que la línea de resumen
 * llama "carry-over histórico". Sólo entra lo sellado, como en la referencia.
 */
function historicCarryOverRate(sprints: SprintTrendPointDto[]): number | null {
  const rates = sprints
    .filter((s) => s.snapshotStatus === "Sealed")
    .map((s) => s.execution.carryOverRate)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  if (rates.length === 0) return null;
  const mid = Math.floor(rates.length / 2);
  const raw =
    rates.length % 2 === 0 ? (rates[mid - 1] + rates[mid]) / 2 : rates[mid];
  return Math.round(raw * 10) / 10;
}

/**
 * La respuesta completa en una frase, debajo de las cuatro tarjetas:
 * "28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas ·
 * 18 % carry-over histórico".
 */
export function summaryLine(
  committedPoints: number,
  ownMedian: number | null,
  concurrentInitiatives: number,
  historicCarryOver: number | null
): string {
  const parts = [
    ownMedian === null
      ? `${formatPoints(committedPoints)} SP comprometidos`
      : `${formatPoints(committedPoints)} SP comprometidos vs ${formatPoints(ownMedian)} SP habituales`,
    `${plural(concurrentInitiatives, "iniciativa activa", "iniciativas activas")}`,
  ];
  if (historicCarryOver !== null)
    parts.push(`${formatRate(historicCarryOver)} carry-over histórico`);
  return parts.join(" · ");
}

function referenceLinesOf(
  reference: ReferenceDto,
  committedPoints: number,
  hasSquad: boolean
): ReferenceLine[] {
  const lines: ReferenceLine[] = [
    {
      key: "own",
      label: "Histórico colaborador",
      value:
        reference.ownMedian === null ? null : pointsOrDash(reference.ownMedian),
      points: reference.ownMedian,
      deviation: null,
    },
  ];
  // Sin célula la fila no se muestra: son dos cifras, no tres. No es un hueco,
  // es que no hay equipo del cual hablar.
  if (hasSquad) {
    lines.push({
      key: "squad",
      label: "Histórico célula",
      value:
        reference.squadMedian === null
          ? null
          : pointsOrDash(reference.squadMedian),
      points: reference.squadMedian,
      deviation: formatDeltaRate(reference.squadDeviationRate),
    });
  }
  lines.push({
    key: "current",
    label: "Sprint actual",
    value: pointsOrDash(committedPoints),
    points: committedPoints,
    deviation: deviationLabel(reference),
  });
  return lines;
}

export function toCollaboratorDetail(
  dto: CollaboratorDedicationDetailDto,
  today: Date = new Date()
): CollaboratorDetail {
  const sprints = dto.sprints.map(sprintRowOf);
  const s = dto.selectedSprint;
  const hasSquad = dto.allocation !== null;

  const selected: SelectedSprintView | null = s
    ? {
        name: s.name,
        rangeLabel: sprintRangeLabel(s.startDate, s.endDate),
        isCurrent: sprints.find((r) => r.name === s.name)?.isCurrent ?? false,
        snapshotStatus: s.snapshotStatus,
        snapshotLabel: snapshotLabel(s.snapshotStatus, s.sealedAt),
        snapshotNote: SNAPSHOT_NOTES[s.snapshotStatus],
        capacity: s.capacity,
        capacityFigures: capacityFigures(s.capacity),
        capacityHours: capacityHours(s.capacity),
        capacityBreakdown: capacityBreakdownLabel(s.capacity.breakdown),
        capacityDeductions: capacityDeductions(s.capacity.breakdown),
        execution: s.execution,
        committedLabel: pointsOrDash(s.execution.committedPoints),
        completedLabel: pointsOrDash(s.execution.completedPoints),
        notCompletedLabel: pointsOrDash(s.execution.notCompletedPoints),
        completionLabel: formatRate(s.execution.completionRate),
        carryOverLabel:
          s.execution.carryOverPoints === null
            ? EN_DASH
            : `${pointsOrDash(s.execution.carryOverPoints)} · ${formatRate(s.execution.carryOverRate)}`,
        unplannedWork: s.unplannedWork,
        unplannedRateLabel: formatRate(s.unplannedWork.unplannedRate),
        multitasking: s.multitasking,
        multitaskingLabel: multitaskingLabel(s.multitasking),
        initiatives: s.multitasking.initiatives.map(toInitiativeRow),
        reference: s.reference,
        referenceLines: referenceLinesOf(
          s.reference,
          s.execution.committedPoints,
          hasSquad
        ),
        deviationRate: formatDeltaRate(s.reference.ownDeviationRate),
        deviationLabel: deviationLabel(s.reference),
        referenceMarkLabel:
          s.reference.ownMedian === null
            ? "Sin histórico contra el cual comparar"
            : `Marca: histórico de ${formatPoints(s.reference.ownMedian)} SP`,
        historyLabel: historyLabel(s.reference, dto.settings.minHistorySprints),
        balance: s.balance,
        signalTooltip: signalTooltip(s.balance),
        signalEvidence: signalEvidenceLabel(s.balance),
        evidences: s.balance.evidences.map((e) =>
          toEvidenceRow(e, s.snapshotStatus)
        ),
        metrics: sprintMetrics(s),
        squadModifier: squadModifierLabel(s.balance),
        summaryLine: summaryLine(
          s.execution.committedPoints,
          s.reference.ownMedian,
          s.multitasking.concurrentInitiatives,
          historicCarryOverRate(dto.sprints)
        ),
        workItems: s.workItems.map(toWorkItemRow),
        storiesSummary: storiesSummaryOf(
          s.workItems,
          formatRate(s.execution.completionRate)
        ),
        calendar: buildActivityCalendar(
          s.startDate,
          s.endDate,
          s.activity,
          today
        ),
      }
    : null;

  return {
    person: {
      id: dto.person.id,
      name: dto.person.name,
      position: dto.person.position,
      levelLabel: dto.person.levelLabel,
      initials: getPersonInitials(dto.person.name),
      avatarUrl: dto.person.avatarUrl,
      contractualFte: dto.person.contractualFte,
    },
    allocation: dto.allocation,
    hasIdentity: dto.hasIdentity,
    hasSprints: dto.sprints.length > 0,
    // Lo que la célula reporta, rotulado como tal: acompaña, no evalúa.
    declaredLabel: dto.allocation
      ? `${dto.allocation.declaredDedicationPercentage}${NBSP}% declarado por la célula`
      : null,
    sprints,
    selected,
    tabs: selected ? dashboardTabs(selected, sprints) : [],
    historyWindowSprints: dto.settings.historyWindowSprints,
    minHistorySprints: dto.settings.minHistorySprints,
    lastSyncedAt: dto.lastSyncedAt,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** La forma que el drawer de reasignación de la Torre espera. */
export function toOverviewPerson(detail: CollaboratorDetail): OverviewPerson {
  const a = detail.allocation;
  const marginPercentage = a
    ? Math.max(0, 100 - a.declaredDedicationPercentage)
    : 100;
  return {
    id: detail.person.id,
    name: detail.person.name,
    position: detail.person.position,
    levelLabel: detail.person.levelLabel,
    availableFte: detail.person.contractualFte,
    allocation: a
      ? {
          id: a.id,
          squadId: a.squadId,
          squadName: a.squadName,
          dedicationPercentage: a.declaredDedicationPercentage,
          bauPercentage: a.declaredBauPercentage,
          transformationPercentage: a.declaredTransformationPercentage,
        }
      : null,
    marginPercentage,
    marginFte: round1((detail.person.contractualFte * marginPercentage) / 100),
  };
}

export const dedicationAdapter = {
  toCollaboratorList,
  toCollaboratorRow,
  toCollaboratorDetail,
  toOverviewPerson,
};
