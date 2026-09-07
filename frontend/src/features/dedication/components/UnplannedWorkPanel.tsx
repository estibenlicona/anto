import React from "react";
import type { SelectedSprintView } from "../adapters/DedicationAdapter";
import { formatPoints } from "../adapters/DedicationAdapter";

export interface UnplannedWorkPanelProps {
  sprint: SelectedSprintView;
}

/**
 * Lo comprometido al inicio frente a lo que entró después, como una sola barra
 * partida en dos. Va junto a la referencia porque sin esto "se comprometió a
 * 22 y entregó 20" se lee como incumplimiento cuando en realidad recibió 8 SP
 * más en el camino.
 *
 * Va sin marco de panel: es media columna de la pestaña *Señales*.
 */
export const UnplannedWorkPanel: React.FC<UnplannedWorkPanelProps> = ({
  sprint,
}) => {
  const { committedAtStartPoints, addedDuringSprintPoints, totalWorkedPoints } =
    sprint.unplannedWork;
  const scale = Math.max(totalWorkedPoints, 1);
  const pct = (value: number) => (value / scale) * 100;

  return (
    <section className="flex flex-col gap-3 border-t border-neutral-default pt-4">
      <h3 className="text-label text-neutral-subtle">TRABAJO NO PLANIFICADO</h3>
      <div
        role="img"
        aria-label={`Comprometido al inicio ${formatPoints(committedAtStartPoints)} SP, trabajo agregado ${formatPoints(addedDuringSprintPoints)} SP, total trabajado ${formatPoints(totalWorkedPoints)} SP`}
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-control bg-neutral-subtle"
      >
        <span
          data-part="committed"
          className="bg-info-bold"
          style={{ width: `${pct(committedAtStartPoints)}%` }}
        />
        <span
          data-part="added"
          className="bg-warning-bold"
          style={{ width: `${pct(addedDuringSprintPoints)}%` }}
        />
      </div>
      <dl className="grid grid-cols-3 gap-3">
        {(
          [
            ["Al inicio", committedAtStartPoints, "bg-info-bold"],
            ["Agregado", addedDuringSprintPoints, "bg-warning-bold"],
            ["Total", totalWorkedPoints, null],
          ] as const
        ).map(([label, value, swatch]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-label font-normal tracking-normal text-neutral-subtle">
              {swatch && (
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-compact ${swatch}`}
                />
              )}
              {label}
            </dt>
            <dd className="text-body-sm font-semibold tabular-nums text-neutral-default">
              {label === "Agregado" && addedDuringSprintPoints > 0 ? "+" : ""}
              {formatPoints(value)} SP
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
