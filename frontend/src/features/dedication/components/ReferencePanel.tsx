import React from "react";
import type { BalanceSignal } from "../services/dedicationService";
import type { SelectedSprintView } from "../adapters/DedicationAdapter";

export interface ReferencePanelProps {
  sprint: SelectedSprintView;
}

/**
 * Sólo la barra del sprint actual toma el rol de la señal; las dos históricas
 * son referencia y van en neutro, la de la célula un paso más tenue que la
 * propia. Ninguna en rojo Tuya: ese rol es de la acción primaria.
 */
const CURRENT_FILL: Record<BalanceSignal, string> = {
  PossibleOverload: "bg-danger-bold",
  PossibleUnderload: "bg-warning-bold",
  Usual: "bg-neutral-bold",
  NotEvaluable: "bg-neutral-subtle-pressed",
};

const FILL_BY_LINE = {
  own: "bg-neutral-bold",
  squad: "bg-neutral-subtle-pressed",
} as const;

/**
 * Tres cifras alineadas a la misma escala —histórico del colaborador,
 * histórico de la célula y sprint actual—, no una gráfica. Es la forma que
 * hace evidente de un vistazo la diferencia entre "el colaborador se desvió"
 * (las dos primeras filas se separan) y "la célula se desvió" (bajan juntas).
 *
 * Sin célula son dos filas, no un hueco: no hay equipo del cual hablar.
 *
 * Va sin marco de panel: es media columna de la pestaña *Señales*, y un
 * recuadro dentro de otro recuadro sólo agrega un borde.
 */
export const ReferencePanel: React.FC<ReferencePanelProps> = ({ sprint }) => {
  const lines = sprint.referenceLines;
  const scale = Math.max(...lines.map((l) => l.points ?? 0), 1) * 1.1;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-label text-neutral-subtle">
        REFERENCIA · {sprint.historyLabel.toUpperCase()}
      </h3>
      {lines.map((line) => (
        <div key={line.key} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-body-sm">
            <span className="text-neutral-default">{line.label}</span>
            <span className="flex items-baseline gap-1.5 tabular-nums">
              <span className="font-semibold text-neutral-default">
                {line.value ?? "—"}
              </span>
              {line.deviation && (
                <span className="text-neutral-subtle">{line.deviation}</span>
              )}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-pill bg-neutral-subtle">
            <div
              aria-hidden="true"
              className={`h-full ${
                line.key === "current"
                  ? CURRENT_FILL[sprint.balance.signal]
                  : FILL_BY_LINE[line.key]
              }`}
              style={{
                width: `${Math.min(100, ((line.points ?? 0) / scale) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </section>
  );
};
