import React from "react";
import type { AttentionStep, CellState } from "../adapters/SpanMatrixAdapter";
import { cellFillClass } from "./SpanCell";

interface LegendEntry {
  state: CellState;
  attention: AttentionStep | null;
  label: string;
}

/**
 * De más urgente a menos, que es el orden en que se mira el mapa. Los tres
 * pasos de color primero y los tres casos sin color después, separados por el
 * subtítulo: la separación es la que dice que lo de abajo no pide nada.
 */
const GAPS: LegendEntry[] = [
  { state: "gap", attention: "high", label: "Le faltan 3 niveles" },
  { state: "gap", attention: "medium", label: "Le faltan 2" },
  { state: "gap", attention: "low", label: "Le falta 1" },
];

const CLEAR: LegendEntry[] = [
  { state: "met", attention: null, label: "Al nivel o por encima" },
  { state: "undefined", attention: null, label: "Su cargo no declara nivel" },
  { state: "unevaluated", attention: null, label: "Sin evaluar" },
];

const Swatch: React.FC<{ entry: LegendEntry }> = ({ entry }) => (
  <li className="flex items-center gap-2">
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-control ${cellFillClass(
        entry.state,
        entry.attention
      )}`}
      style={{ width: "14px", height: "14px" }}
    />
    <span className="text-body-sm text-neutral-subtle">{entry.label}</span>
  </li>
);

/**
 * Un mapa cuyo color no se puede interpretar sin abrir una celda no informa
 * nada, así que la leyenda va al lado y no detrás de un ícono de ayuda. Cada
 * paso se nombra en palabras además de en color, que es también lo que lo
 * vuelve legible para quien no distingue el rojo del ámbar.
 */
export const SpanLegend: React.FC = () => (
  <div className="flex shrink-0 flex-col gap-3 rounded-surface border-default border-neutral-default bg-neutral-default p-4">
    <div className="flex flex-col gap-2">
      <p className="text-label font-semibold text-neutral-default">
        Dónde enfocarse
      </p>
      <ul className="flex flex-col gap-1.5">
        {GAPS.map((entry) => (
          <Swatch key={entry.label} entry={entry} />
        ))}
      </ul>
    </div>

    <div className="flex flex-col gap-2">
      <p className="text-label font-semibold text-neutral-subtle">
        Sin nada que hacer
      </p>
      <ul className="flex flex-col gap-1.5">
        {CLEAR.map((entry) => (
          <Swatch key={entry.label} entry={entry} />
        ))}
      </ul>
    </div>
  </div>
);
