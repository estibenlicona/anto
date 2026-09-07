import React from "react";
import { Icon, type IconName } from "@tuya-ui/components";
import type { EvidenceRow } from "../adapters/DedicationAdapter";

/**
 * *Por qué esta señal*: las seis evidencias con su cifra y su tolerancia.
 *
 * **Se listan siempre las seis**, incluidas las neutras y las que no se
 * pudieron evaluar, para que se vea también qué no se pudo mirar. Cada fila
 * dice su veredicto en palabras —"Fuera de tolerancia"— en vez de dejar que el
 * lector compare la cifra con el umbral de al lado.
 *
 * Es una tabla en cuadrícula y no un `<Table>`: las dos columnas de cifras
 * miden lo mismo siempre (120px) para que el ojo baje en línea recta por los
 * valores, cosa que una tabla que reparte el ancho por contenido no garantiza.
 */

const DIRECTION_ICONS: Record<
  EvidenceRow["direction"],
  { name: IconName; className: string }
> = {
  Over: { name: "trend-up", className: "text-danger-default" },
  Under: { name: "trend-down", className: "text-warning-default" },
  Neutral: { name: "check", className: "text-neutral-subtle" },
  Unknown: { name: "status-empty", className: "text-neutral-subtlest" },
};

export interface EvidenceListProps {
  evidences: EvidenceRow[];
  className?: string;
}

const GRID =
  "grid grid-cols-[minmax(0,1fr)_7.5rem_7.5rem] items-center gap-x-4";

export const EvidenceList: React.FC<EvidenceListProps> = ({
  evidences,
  className = "",
}) => (
  <div className={`flex flex-col ${className}`}>
    <p className="border-b border-neutral-default px-4 py-3 text-body-sm text-neutral-subtle">
      Cada señal tiene una tolerancia. Cuando el valor del sprint la excede, la
      señal cuenta hacia la señal de balance.
    </p>
    <div
      className={`${GRID} border-b border-neutral-default bg-neutral-subtlest px-4 py-2`}
    >
      <span className="text-label text-neutral-subtle">SEÑAL</span>
      <span className="text-right text-label text-neutral-subtle">VALOR</span>
      <span className="text-right text-label text-neutral-subtle">
        TOLERANCIA
      </span>
    </div>
    <ul className="flex flex-col">
      {evidences.map((evidence) => {
        const icon = DIRECTION_ICONS[evidence.direction];
        return (
          <li
            key={evidence.id}
            className={`${GRID} border-b border-neutral-default px-4 py-3 last:border-b-0 hover:bg-neutral-subtlest`}
          >
            <span className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center ${icon.className}`}
              >
                <Icon name={icon.name} size={16} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-body-sm font-medium text-neutral-default">
                  {evidence.label}
                </span>
                <span className="text-body-sm text-neutral-subtle">
                  {evidence.verdict}
                </span>
              </span>
            </span>
            <span
              className={`text-right text-body-sm font-semibold tabular-nums ${
                evidence.counts ? "text-danger-default" : "text-neutral-default"
              }`}
            >
              {evidence.value ?? "—"}
            </span>
            <span className="text-right text-body-sm tabular-nums text-neutral-subtle">
              {evidence.threshold ?? "—"}
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);
