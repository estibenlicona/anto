import React from "react";
import { Tooltip } from "@tuya-ui/components";
import type { BalanceSignal } from "../services/dedicationService";
import {
  demandFigures,
  formatDeltaRate,
  formatPoints,
  toleranceLabel,
} from "../adapters/DedicationAdapter";

/**
 * El relleno lleva el rol de color de la señal para que la columna se lea de
 * un barrido vertical. No es el veredicto —ése vive en su propia columna— sino
 * el eco del que ya se calculó.
 */
const FILL_BY_SIGNAL: Record<BalanceSignal, string> = {
  PossibleOverload: "bg-danger-bold",
  PossibleUnderload: "bg-warning-bold",
  Usual: "bg-neutral-bold",
  NotEvaluable: "bg-neutral-subtle-pressed",
};

const DEVIATION_TONE: Record<BalanceSignal, string> = {
  PossibleOverload: "text-danger-default",
  PossibleUnderload: "text-warning-default",
  Usual: "text-neutral-subtle",
  NotEvaluable: "text-neutral-subtle",
};

/**
 * La demanda del sprint en SP, contra el histórico del propio colaborador.
 *
 * La marca vertical es su mediana —la referencia— y la marca secundaria,
 * atenuada, la de su célula, que es contexto y nunca sustituto. El relleno son
 * los SP del sprint. La escala llega hasta lo más alto que haya que dibujar,
 * porque una demanda por encima del histórico **no es un exceso sobre un
 * tope**: es una desviación de lo habitual, y la barra tiene que poder
 * mostrarla entera.
 */

export type DemandBarVariant = "row" | "card" | "compact";

const BAR_HEIGHT: Record<DemandBarVariant, string> = {
  row: "h-1.5",
  card: "h-2",
  compact: "h-1",
};

export interface DemandBarProps {
  committedPoints: number;
  /** Mediana histórica del colaborador; `null` sin histórico suficiente. */
  ownMedian: number | null;
  /**
   * Mediana de su célula; `null` sin célula o sin histórico. En la fila no se
   * dibuja: a ese ancho dos marcas se confunden, y el contexto de célula vive
   * en el dashboard.
   */
  squadMedian?: number | null;
  /** Desviación frente al habitual, en %; `null` sin histórico. */
  deviationRate?: number | null;
  /** La señal, que da el rol de color del relleno y de la desviación. */
  signal?: BalanceSignal;
  variant?: DemandBarVariant;
  /** Las cifras "28 SP · habitual 22 · +36 %" sobre la barra. */
  figures?: boolean;
  /** El pie con la tolerancia; sólo la fila del listado lo lleva. */
  tolerance?: boolean;
  /** Nombre accesible: de quién o de qué sprint es la demanda. */
  label: string;
  className?: string;
}

export const DemandBar: React.FC<DemandBarProps> = ({
  committedPoints,
  ownMedian,
  squadMedian = null,
  deviationRate = null,
  signal = "Usual",
  variant = "row",
  figures = true,
  tolerance = false,
  label,
  className = "",
}) => {
  const figuresText = demandFigures(committedPoints, ownMedian);
  const name = `${label}: ${figuresText}`;

  // Sin histórico no hay contra qué dibujar: sólo la cifra. Una barra sin
  // referencia sugeriría una comparación que no existe.
  if (ownMedian === null) {
    return (
      <span
        className={`text-body-sm font-semibold tabular-nums leading-5 text-neutral-default ${className}`}
      >
        {formatPoints(committedPoints)}
        <span className="font-normal text-neutral-subtle"> SP</span>
      </span>
    );
  }

  // La marca de célula sólo donde hay ancho para distinguirla de la propia.
  const showSquadMark = squadMedian !== null && variant !== "row";
  const scale =
    Math.max(committedPoints, ownMedian, showSquadMark ? squadMedian! : 0, 1) *
    1.1;
  const pct = (value: number) =>
    Math.max(0, Math.min(100, (value / scale) * 100));

  const deviation = formatDeltaRate(deviationRate);
  const toleranceText = toleranceLabel(deviationRate);

  const tooltip =
    squadMedian === null
      ? figuresText
      : `${figuresText} · célula ${formatPoints(squadMedian)}`;

  return (
    <Tooltip content={tooltip}>
      <div
        role="img"
        aria-label={name}
        tabIndex={0}
        className={`flex w-full flex-col gap-1 rounded-control outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring ${className}`}
      >
        {figures && (
          <span className="text-body-sm font-semibold tabular-nums leading-5 text-neutral-default">
            {formatPoints(committedPoints)} SP
            <span className="font-normal text-neutral-subtle">
              {` · habitual ${formatPoints(ownMedian)}`}
            </span>
            {deviation && (
              <span className={`ml-2 ${DEVIATION_TONE[signal]}`}>
                {deviation}
              </span>
            )}
          </span>
        )}
        <div className="relative w-full">
          <div
            className={`relative w-full overflow-hidden rounded-control bg-neutral-subtle ${BAR_HEIGHT[variant]}`}
          >
            <div
              data-part="fill"
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 ${FILL_BY_SIGNAL[signal]}`}
              style={{ width: `${pct(committedPoints)}%` }}
            />
          </div>
          {showSquadMark && (
            <span
              data-part="squad-mark"
              aria-hidden="true"
              className="absolute -inset-y-0.5 w-0.5 -translate-x-1/2 rounded-pill bg-neutral-subtle-pressed"
              style={{ left: `${pct(squadMedian!)}%` }}
            />
          )}
          <span
            data-part="own-mark"
            aria-hidden="true"
            className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-pill bg-neutral-bold"
            style={{ left: `${pct(ownMedian)}%` }}
          />
        </div>
        {/* El umbral de la evidencia de demanda, no el de la señal: ésta sigue
            saliendo de la concurrencia y vive en su propia columna. */}
        {tolerance && toleranceText && (
          <span className="text-label font-normal tracking-normal text-neutral-subtle">
            {toleranceText}
          </span>
        )}
      </div>
    </Tooltip>
  );
};
