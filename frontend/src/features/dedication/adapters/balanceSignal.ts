import type {
  BalanceEvidenceDto,
  BalanceSignal,
  BalanceSignalDto,
  EvidenceDirection,
  EvidenceId,
  NotEvaluableReason,
  SquadContext,
} from "../services/dedicationService";
import { pointsPerAvailableFte } from "./capacityFte";

/**
 * La señal de balance: **una señal, no una sentencia**.
 *
 * El tablero no dice "esta persona está sobreasignada". Dice que varias
 * evidencias independientes apuntan a la vez en la misma dirección, y muestra
 * cuáles. Dos reglas lo sostienen:
 *
 * 1. **Ningún indicador individual determina la categoría.** Se cuentan
 *    evidencias concordantes, no se suma un puntaje ponderado. Un contador es
 *    auditable de un vistazo y hace literalmente cierta esa regla; con pesos,
 *    un peso alto podría decidir solo sin que se note.
 * 2. **La célula puede ser la causa.** Si el equipo entero se desvía igual que
 *    la persona, la señal lo dice —"la célula se comporta igual"— sin atenuarse:
 *    el caso "Dev 9 SP / célula 9 SP" deja de ser un veredicto sobre el Dev,
 *    pero una célula entera desviada sigue siendo algo que hay que ver.
 *
 * Los umbrales viven acá, juntos y con nombre. Son convenciones razonables, no
 * verdades: ajustarlos con el uso debe ser cambiar una constante, no una
 * arqueología por el módulo.
 */

// ---------------------------------------------------------------------------
// Umbrales
// ---------------------------------------------------------------------------

/** Desvío relativo de la demanda que empieza a contar, y el que es "fuerte". */
export const DEMAND_DEVIATION_PCT = 25;
export const DEMAND_DEVIATION_STRONG_PCT = 50;

/** Caída de cumplimiento frente al histórico, en puntos porcentuales. */
export const COMPLETION_DROP_PP = 15;
export const COMPLETION_DROP_STRONG_PP = 30;

/** Exceso de carry-over frente al histórico, en puntos porcentuales. */
export const CARRY_OVER_EXCESS_PP = 10;
export const CARRY_OVER_EXCESS_STRONG_PP = 25;

/** Proporción de trabajo que entró después del inicio del sprint. */
export const UNPLANNED_RATE_PCT = 20;
export const UNPLANNED_RATE_STRONG_PCT = 50;

/** Fragmentación de atención: épicas simultáneas y HUs a la vez en curso. */
export const MULTITASKING_INITIATIVES = 3;
export const MULTITASKING_INITIATIVES_STRONG = 5;
export const MULTITASKING_WIP = 4;
export const MULTITASKING_WIP_STRONG = 6;

/**
 * Cuán parecidas deben ser las desviaciones del colaborador y de su célula
 * para decir que "la célula se comporta igual", en puntos porcentuales.
 */
export const SQUAD_SAME_DIRECTION_TOLERANCE_PP = 10;

/**
 * Evidencias concordantes que hacen falta para una señal accionable.
 *
 * Dos, no tres: sin un escalón intermedio al cual mandar los casos de dos
 * evidencias, exigir tres los dejaría en "carga habitual" — que es justo lo
 * que antes se llamaba "Revisar" y sí merece una mirada.
 */
export const STRONG_MIN_EVIDENCES = 2;

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

export interface BalanceInput {
  hasIdentity: boolean;
  hasSprint: boolean;
  /** `false` cuando faltan sprints sellados para el mínimo configurado. */
  hasSufficientHistory: boolean;

  /** Demanda del sprint que se mira. */
  committedPoints: number;
  availableFte: number;

  /** Mediana histórica propia de SP comprometidos; `null` sin histórico. */
  ownMedianPoints: number | null;
  /** Mediana histórica propia de SP por FTE disponible. */
  ownMedianPointsPerFte: number | null;

  /**
   * `true` sólo cuando el sprint que se mira ya tiene snapshot sellado. Un
   * sprint en curso lleva la mitad del trabajo sin cerrar: leer ahí un
   * cumplimiento bajo o un carry-over alto sería confundir "todavía no" con
   * "no se pudo". Ver `evaluateCompletion`.
   */
  executionSealed: boolean;

  /**
   * `true` cuando el sprint que se mira cerró sin snapshot. No es lo mismo que
   * `!executionSealed`: el sprint en curso tampoco está sellado, pero todavía
   * puede estarlo.
   */
  executionMissing: boolean;

  /** % de cumplimiento del sprint y su mediana histórica; `null` sin sellar. */
  completionRate: number | null;
  ownMedianCompletionRate: number | null;

  /** % de carry-over del sprint y su mediana histórica. */
  carryOverRate: number | null;
  ownMedianCarryOverRate: number | null;

  /** % de SP que entraron después del inicio del sprint. */
  unplannedRate: number | null;

  concurrentInitiatives: number | null;
  /** Máximo de HUs a la vez en estado activo; `null` si no se pudo reconstruir. */
  wip: number | null;

  /** Desviación relativa del colaborador y de su célula, para el modificador. */
  ownDeviationRate: number | null;
  squadDeviationRate: number | null;
}

// ---------------------------------------------------------------------------
// Evidencias
// ---------------------------------------------------------------------------

const unknown = (id: EvidenceId): BalanceEvidenceDto => ({
  id,
  direction: "Unknown",
  value: null,
  threshold: null,
  strong: false,
});

/**
 * Demanda contra el propio histórico, en SP y en SP por FTE disponible.
 * La segunda separa el efecto de las ausencias del efecto de la carga: bajar
 * de 22 a 11 SP en un sprint con media jornada libre no es subasignación.
 */
function evaluateDeviation(
  id: EvidenceId,
  current: number | null,
  reference: number | null
): BalanceEvidenceDto {
  if (current === null || reference === null || reference === 0) {
    return unknown(id);
  }
  const rate = ((current - reference) / reference) * 100;
  const magnitude = Math.abs(rate);
  const strong = magnitude >= DEMAND_DEVIATION_STRONG_PCT;
  const value = Math.round(rate * 10) / 10;

  if (rate > DEMAND_DEVIATION_PCT) {
    return {
      id,
      direction: "Over",
      value,
      threshold: DEMAND_DEVIATION_PCT,
      strong,
    };
  }
  if (rate < -DEMAND_DEVIATION_PCT) {
    return {
      id,
      direction: "Under",
      value,
      threshold: -DEMAND_DEVIATION_PCT,
      strong,
    };
  }
  return {
    id,
    direction: "Neutral",
    value,
    threshold: DEMAND_DEVIATION_PCT,
    strong: false,
  };
}

/**
 * Cumplimiento. Caer respecto de lo habitual sugiere sobrecarga; cumplir el
 * 100 % aporta a subasignación **sólo si la demanda ya venía por debajo** —un
 * 100 % con demanda normal es sencillamente un buen sprint—.
 *
 * Antes del cierre sólo la mitad de la evidencia existe: a mitad de sprint
 * todo el mundo va "por debajo de su cumplimiento habitual" y eso no dice
 * nada, mientras que haber cerrado ya todo lo comprometido sí dice algo. Por
 * eso, sin snapshot sellado, la caída no se evalúa y el 100 % sí.
 */
function evaluateCompletion(
  completionRate: number | null,
  reference: number | null,
  demandDirection: EvidenceDirection,
  sealed: boolean
): BalanceEvidenceDto {
  const id: EvidenceId = "completion";
  if (completionRate === null || reference === null) return unknown(id);
  if (!sealed && completionRate < 100) return unknown(id);

  const dropPp = reference - completionRate;
  const value = Math.round(completionRate * 10) / 10;

  if (dropPp > COMPLETION_DROP_PP) {
    return {
      id,
      direction: "Over",
      value,
      threshold: Math.round((reference - COMPLETION_DROP_PP) * 10) / 10,
      strong: dropPp >= COMPLETION_DROP_STRONG_PP,
    };
  }
  if (completionRate >= 100 && demandDirection === "Under") {
    return { id, direction: "Under", value, threshold: 100, strong: false };
  }
  return {
    id,
    direction: "Neutral",
    value,
    threshold: Math.round((reference - COMPLETION_DROP_PP) * 10) / 10,
    strong: false,
  };
}

/**
 * Carry-over. Sólo apunta a sobrecarga: un carry-over bajo es una buena
 * noticia, no un indicio de subasignación. Y sólo existe al cierre: nada se
 * arrastra a un sprint que todavía no terminó.
 */
function evaluateCarryOver(
  carryOverRate: number | null,
  reference: number | null,
  sealed: boolean
): BalanceEvidenceDto {
  const id: EvidenceId = "carryOver";
  if (!sealed) return unknown(id);
  if (carryOverRate === null || reference === null) return unknown(id);

  const excessPp = carryOverRate - reference;
  const value = Math.round(carryOverRate * 10) / 10;
  const threshold = Math.round((reference + CARRY_OVER_EXCESS_PP) * 10) / 10;

  if (excessPp > CARRY_OVER_EXCESS_PP) {
    return {
      id,
      direction: "Over",
      value,
      threshold,
      strong: excessPp >= CARRY_OVER_EXCESS_STRONG_PP,
    };
  }
  return { id, direction: "Neutral", value, threshold, strong: false };
}

/** Trabajo no planificado. También sólo hacia sobrecarga. */
function evaluateUnplanned(unplannedRate: number | null): BalanceEvidenceDto {
  const id: EvidenceId = "unplannedWork";
  if (unplannedRate === null) return unknown(id);

  const value = Math.round(unplannedRate * 10) / 10;
  if (unplannedRate > UNPLANNED_RATE_PCT) {
    return {
      id,
      direction: "Over",
      value,
      threshold: UNPLANNED_RATE_PCT,
      strong: unplannedRate > UNPLANNED_RATE_STRONG_PCT,
    };
  }
  return {
    id,
    direction: "Neutral",
    value,
    threshold: UNPLANNED_RATE_PCT,
    strong: false,
  };
}

/**
 * Multitarea. 28 SP en una iniciativa y 28 SP en cuatro no cargan igual. Se
 * reporta el número de iniciativas —lo que el lead lee primero— y el WIP entra
 * como disparador alternativo.
 */
function evaluateMultitasking(
  concurrentInitiatives: number | null,
  wip: number | null
): BalanceEvidenceDto {
  const id: EvidenceId = "multitasking";
  if (concurrentInitiatives === null && wip === null) return unknown(id);

  const initiatives = concurrentInitiatives ?? 0;
  const over =
    initiatives >= MULTITASKING_INITIATIVES ||
    (wip !== null && wip >= MULTITASKING_WIP);
  const strong =
    initiatives >= MULTITASKING_INITIATIVES_STRONG ||
    (wip !== null && wip >= MULTITASKING_WIP_STRONG);

  return {
    id,
    direction: over ? "Over" : "Neutral",
    value: concurrentInitiatives,
    threshold: MULTITASKING_INITIATIVES,
    strong: over && strong,
  };
}

// ---------------------------------------------------------------------------
// Agregación
// ---------------------------------------------------------------------------

/**
 * ¿La célula se desvía como el colaborador? Misma dirección y magnitud dentro
 * de la tolerancia. Si sí, se descuenta una evidencia: baja un escalón sin
 * borrar la información, porque una célula entera desviada también interesa.
 */
export function resolveSquadContext(
  ownDeviationRate: number | null,
  squadDeviationRate: number | null
): SquadContext {
  if (squadDeviationRate === null || ownDeviationRate === null)
    return "NoSquad";
  const sameSign =
    (ownDeviationRate > 0 && squadDeviationRate > 0) ||
    (ownDeviationRate < 0 && squadDeviationRate < 0);
  if (!sameSign) return "Different";
  const gap = Math.abs(ownDeviationRate - squadDeviationRate);
  return gap <= SQUAD_SAME_DIRECTION_TOLERANCE_PP
    ? "SameDirection"
    : "Different";
}

/**
 * De los conteos a la señal.
 *
 * | concordantes | señal |
 * |---|---|
 * | 0, o 1 no fuerte | Carga habitual |
 * | 1 fuerte, o ≥ 2 | Posible sobre/subasignación |
 * | ≥ 1 en cada dirección | Carga habitual |
 *
 * Las direcciones opuestas caen a habitual y no a la dominante: dar una señal
 * accionable a alguien cuyas evidencias se contradicen es peor que no decir
 * nada. La explicación sigue mostrando las dos direcciones.
 */
function aggregate(
  overCount: number,
  underCount: number,
  anyStrong: boolean
): BalanceSignal {
  const mixed = overCount > 0 && underCount > 0;
  if (mixed) return "Usual";

  const dominant = Math.max(overCount, underCount);
  if (dominant === 0) return "Usual";
  if (dominant < STRONG_MIN_EVIDENCES && !anyStrong) return "Usual";
  return overCount > 0 ? "PossibleOverload" : "PossibleUnderload";
}

export function computeBalanceSignal(input: BalanceInput): BalanceSignalDto {
  // Sin dato mínimo no se inventa una señal: se dice qué falta.
  let notEvaluableReason: NotEvaluableReason | null = null;
  if (!input.hasIdentity) notEvaluableReason = "NoIdentity";
  else if (!input.hasSprint) notEvaluableReason = "NoSprint";
  // Un sprint que cerró sin sellar no se evalúa aunque su demanda se vea: las
  // cifras que DevOps responde hoy ya pasaron por la limpieza de HUs, y una
  // señal construida sobre la mitad de las evidencias diría más de lo que sabe.
  else if (input.executionMissing) notEvaluableReason = "MissingSnapshot";
  else if (!input.hasSufficientHistory)
    notEvaluableReason = "InsufficientHistory";

  const demand = evaluateDeviation(
    "demandVsOwnHistory",
    input.committedPoints,
    input.ownMedianPoints
  );
  const demandPerFte = evaluateDeviation(
    "demandPerAvailableFte",
    pointsPerAvailableFte(input.committedPoints, input.availableFte),
    input.ownMedianPointsPerFte
  );
  const evidences: BalanceEvidenceDto[] = [
    demand,
    demandPerFte,
    evaluateCompletion(
      input.completionRate,
      input.ownMedianCompletionRate,
      demand.direction,
      input.executionSealed
    ),
    evaluateCarryOver(
      input.carryOverRate,
      input.ownMedianCarryOverRate,
      input.executionSealed
    ),
    evaluateUnplanned(input.unplannedRate),
    evaluateMultitasking(input.concurrentInitiatives, input.wip),
  ];

  const squadContext = resolveSquadContext(
    input.ownDeviationRate,
    input.squadDeviationRate
  );

  if (notEvaluableReason) {
    // Las evidencias viajan igual: sirven para mostrar qué sí se pudo mirar.
    return {
      signal: "NotEvaluable",
      overCount: 0,
      underCount: 0,
      squadContext,
      notEvaluableReason,
      evidences,
    };
  }

  const overCount = evidences.filter((e) => e.direction === "Over").length;
  const underCount = evidences.filter((e) => e.direction === "Under").length;

  // `squadContext` viaja como anotación y no descuenta evidencias. Con cuatro
  // señales el único peldaño al cual bajar sería "carga habitual", y mandar
  // ahí a una célula entera desviada esconde justo lo que hay que ver: el
  // problema deja de ser de la persona sin dejar de ser un problema.

  const dominantDirection: EvidenceDirection =
    overCount >= underCount ? "Over" : "Under";
  const anyStrong = evidences.some(
    (e) => e.strong && e.direction === dominantDirection
  );

  return {
    signal: aggregate(overCount, underCount, anyStrong),
    overCount,
    underCount,
    squadContext,
    notEvaluableReason: null,
    evidences,
  };
}

// ---------------------------------------------------------------------------
// Vocabulario
// ---------------------------------------------------------------------------

export const SIGNAL_LABELS: Record<BalanceSignal, string> = {
  Usual: "Carga habitual",
  PossibleOverload: "Posible sobreasignación",
  PossibleUnderload: "Posible subasignación",
  NotEvaluable: "No evaluable",
};

/** La frase que acompaña a la señal donde hay espacio para una. */
export const SIGNAL_PHRASES: Record<BalanceSignal, string> = {
  Usual: "Los indicadores están dentro de la tolerancia de sus señales.",
  PossibleOverload:
    "Varias señales apuntan consistentemente a una carga superior a la habitual.",
  PossibleUnderload:
    "La demanda observable está significativamente por debajo de la capacidad y del comportamiento habitual.",
  NotEvaluable: "Falta el dato mínimo para evaluar el balance.",
};

/** Rol de color de tuip para cada señal. */
export type SignalVariant =
  "success" | "warning" | "danger" | "info" | "neutral";

export const SIGNAL_VARIANTS: Record<BalanceSignal, SignalVariant> = {
  Usual: "success",
  PossibleOverload: "danger",
  // Advertencia y no informativo: es una decisión de carga, no contexto.
  PossibleUnderload: "warning",
  NotEvaluable: "neutral",
};

export const NOT_EVALUABLE_LABELS: Record<NotEvaluableReason, string> = {
  NoIdentity: "Sin identidad DevOps",
  NoSprint: "Sin sprint en Azure DevOps",
  MissingSnapshot: "Sprint sin snapshot",
  InsufficientHistory: "Histórico insuficiente",
};

export const EVIDENCE_LABELS: Record<EvidenceId, string> = {
  demandVsOwnHistory: "Demanda frente a su histórico",
  demandPerAvailableFte: "Demanda por FTE disponible",
  completion: "Cumplimiento",
  carryOver: "Carry-over",
  unplannedWork: "Trabajo no planificado",
  multitasking: "Foco",
};

/** Las dos señales que piden una decisión de carga: lo que cuenta el badge. */
export function isActionableSignal(signal: BalanceSignal): boolean {
  return signal === "PossibleOverload" || signal === "PossibleUnderload";
}
