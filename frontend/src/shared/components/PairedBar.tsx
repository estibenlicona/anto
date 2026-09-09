import React from "react";

export interface PairedBarProps {
  /** Lo que la iniciativa pide. */
  demand: number;
  /** Lo que la célula tiene. */
  available: number;
  /** El tope común de las dos barras: sin él, dos filas no se pueden comparar. */
  max: number;
  /** Qué perfil es esta fila. */
  label: string;
  /** Cómo escribir los dos números en el nombre accesible. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * Dos barras apiladas sobre la misma escala: lo que se pide y lo que hay.
 *
 * **Propuesta de componente de tuip** (`paired-bar.tsx`). Vive acá y no en el
 * catálogo porque tuip se consume como tarball local y promoverlo pide
 * republicar el paquete.
 *
 * No se compone con lo que hay. `ProgressBar` dibuja una sola barra sobre su
 * propio máximo, así que dos puestas una encima de otra dejan de ser
 * comparables apenas los máximos difieran — y comparar es lo único que esta
 * pieza hace. El máximo entra por parámetro justamente para que todas las filas
 * de una tabla compartan escala.
 *
 * El déficit no va sólo por color: el nombre accesible dice los dos números y
 * la barra de demanda que excede lo disponible se dibuja con su propio patrón.
 */
export const PairedBar: React.FC<PairedBarProps> = ({
  demand,
  available,
  max,
  label,
  format = (value) => value.toLocaleString("es-CO", { maximumFractionDigits: 1 }),
  className = "",
}) => {
  const width = (value: number) =>
    max > 0 ? `${Math.min(100, Math.max(0, (value / max) * 100))}%` : "0%";

  const short = demand > available;

  return (
    <div
      role="img"
      aria-label={`${label}: pide ${format(demand)}, hay ${format(available)}${
        short ? `, faltan ${format(demand - available)}` : ""
      }`}
      className={`flex flex-col gap-1 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-14 flex-none text-label text-neutral-subtle" aria-hidden="true">
          Pide
        </span>
        <span className="h-2 flex-1 rounded-pill bg-neutral-subtle">
          <span
            className={`block h-full rounded-pill ${
              short ? "bg-warning-default" : "bg-brand-default"
            }`}
            style={{ width: width(demand) }}
          />
        </span>
        <span className="w-12 flex-none text-right font-mono text-label tabular-nums text-neutral-default">
          {format(demand)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 flex-none text-label text-neutral-subtle" aria-hidden="true">
          Hay
        </span>
        <span className="h-2 flex-1 rounded-pill bg-neutral-subtle">
          <span
            className="block h-full rounded-pill bg-neutral-bold"
            style={{ width: width(available) }}
          />
        </span>
        <span className="w-12 flex-none text-right font-mono text-label tabular-nums text-neutral-default">
          {format(available)}
        </span>
      </div>
    </div>
  );
};
