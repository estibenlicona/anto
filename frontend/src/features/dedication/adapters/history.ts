import type {
  ReferenceDto,
  SnapshotStatus,
} from "../services/dedicationService";

/**
 * Contra qué se compara la demanda de un colaborador.
 *
 * La referencia principal es **su propio histórico**, no el de su célula. Un
 * colaborador con 9 SP frente a su mediana de 22 no dice lo mismo si su célula
 * entera también cayó a 9: en el primer caso la desviación es suya, en el
 * segundo es del equipo. Por eso las dos medianas viajan juntas y la de la
 * célula es contexto, nunca sustituto.
 *
 * Sólo entran sprints con snapshot **sellado**. Un sprint que cerró sin sellar
 * ya no dice lo que ocurrió —los equipos limpiaron las HUs después— y meterlo
 * en la mediana la envenena con datos que nadie midió.
 */

/** Lo mínimo que la referencia necesita de un sprint. */
export interface HistorySprint {
  committedPoints: number;
  snapshotStatus: SnapshotStatus;
  isCurrent: boolean;
}

/**
 * Mediana, no promedio: un sprint atípico —una semana de incidentes, un sprint
 * partido por vacaciones— arrastra el promedio y deja la mediana quieta, y en
 * esta métrica los atípicos son la norma. En longitud par, promedio de los dos
 * centrales.
 */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const raw =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return Math.round(raw * 10) / 10;
}

/** Los sprints que pueden alimentar el histórico: sellados y ya cerrados. */
export function sealedSprints(
  sprints: HistorySprint[],
  windowSprints: number
): HistorySprint[] {
  return sprints
    .filter((s) => !s.isCurrent && s.snapshotStatus === "Sealed")
    .slice(-windowSprints);
}

/** Desviación relativa en porcentaje; `null` si no hay contra qué comparar. */
function deviationRate(
  current: number,
  reference: number | null
): number | null {
  if (reference === null || reference === 0) return null;
  return Math.round(((current - reference) / reference) * 1000) / 10;
}

export interface ReferenceInput {
  /** Todos los sprints del colaborador, del más antiguo al en curso. */
  sprints: HistorySprint[];
  /** SP comprometidos en el sprint que se está mirando. */
  currentPoints: number;
  windowSprints: number;
  minSprints: number;
  /**
   * Los sprints de la célula, ya agregados por colaborador. `null` cuando el
   * colaborador no tiene célula: entonces no hay contexto de equipo, pero él
   * sigue siendo evaluable con su propio histórico.
   */
  squadSprints: HistorySprint[] | null;
  /** SP del sprint actual de la célula, por colaborador. `null` sin célula. */
  squadCurrentPoints: number | null;
}

export function buildReference(input: ReferenceInput): ReferenceDto {
  const {
    sprints,
    currentPoints,
    windowSprints,
    minSprints,
    squadSprints,
    squadCurrentPoints,
  } = input;

  const own = sealedSprints(sprints, windowSprints);
  const ownMedian = median(own.map((s) => s.committedPoints));
  const sealedSprintCount = own.length;
  const sufficient = sealedSprintCount >= minSprints;

  const squadMedian =
    squadSprints === null
      ? null
      : median(
          sealedSprints(squadSprints, windowSprints).map(
            (s) => s.committedPoints
          )
        );

  return {
    ownMedian,
    squadMedian,
    sealedSprintCount,
    sufficient,
    ownDeviationPoints:
      ownMedian === null
        ? null
        : Math.round((currentPoints - ownMedian) * 10) / 10,
    ownDeviationRate: deviationRate(currentPoints, ownMedian),
    squadDeviationRate:
      squadCurrentPoints === null
        ? null
        : deviationRate(squadCurrentPoints, squadMedian),
  };
}
