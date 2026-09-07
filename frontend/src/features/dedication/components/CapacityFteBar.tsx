import React from "react";
import { Tooltip } from "@tuya-ui/components";
import type { CapacityDto } from "../services/dedicationService";
import {
  capacityBreakdownLabel,
  capacityDeductions,
  type CapacityDeduction,
  capacityFigures,
  capacityHours,
  formatContractualFte,
  formatFte,
} from "../adapters/DedicationAdapter";

/**
 * La capacidad del sprint: **la pista es el FTE contractual y el relleno el
 * disponible**. Las muescas marcan dónde se fue cada día descontado, así que
 * la forma dice "esto cabe dentro de aquello", que es exactamente lo que pasa
 * con una capacidad: nadie puede tener más disponible que contratado.
 *
 * El desglose viaja siempre en el tooltip y en el nombre accesible: una
 * capacidad sin su origen es un número que nadie puede discutir.
 */

export type CapacityFteBarVariant = "row" | "card" | "compact";

const BAR_HEIGHT: Record<CapacityFteBarVariant, string> = {
  row: "h-1.5",
  card: "h-2",
  compact: "h-1",
};

/** Una muesca ya posicionada: `end` sólo sirve para encadenar la siguiente. */
interface CapacityDeductionMark extends CapacityDeduction {
  end: number;
  left: number;
  width: number;
}

export interface CapacityFteBarProps {
  capacity: CapacityDto;
  variant?: CapacityFteBarVariant;
  /** Las cifras "0.80 / 1.0 FTE" sobre la barra. */
  figures?: boolean;
  /** Nombre accesible: de quién o de qué sprint es la capacidad. */
  label: string;
  className?: string;
}

export const CapacityFteBar: React.FC<CapacityFteBarProps> = ({
  capacity,
  variant = "row",
  figures = true,
  label,
  className = "",
}) => {
  const { contractualFte, availableFte, breakdown } = capacity;
  const scale = contractualFte > 0 ? contractualFte : 1;
  const pct = (value: number) =>
    Math.max(0, Math.min(100, (value / scale) * 100));

  const deductions = capacityDeductions(breakdown);
  const breakdownText = capacityBreakdownLabel(breakdown);
  const figuresText = capacityFigures(capacity);
  const name = `${label}: ${figuresText} · ${breakdownText}`;

  // Cada muesca queda donde ese concepto empieza a descontar, contando desde
  // el extremo del relleno hacia la derecha: la primera arranca en el FTE
  // disponible y cada siguiente donde terminó la anterior.
  const marks = deductions.reduce<Array<CapacityDeductionMark>>(
    (acc, deduction) => {
      const width =
        breakdown.businessDays > 0
          ? (deduction.days / breakdown.businessDays) * contractualFte
          : 0;
      const left = acc.length === 0 ? availableFte : acc[acc.length - 1].end;
      acc.push({
        ...deduction,
        end: left + width,
        left: pct(left),
        width: pct(left + width) - pct(left),
      });
      return acc;
    },
    []
  );

  const bar = (
    <div
      role="img"
      aria-label={name}
      tabIndex={0}
      className={`flex w-full flex-col gap-1 rounded-control outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring ${className}`}
    >
      {figures && (
        <span className="text-body-sm font-semibold tabular-nums leading-5 text-neutral-default">
          {formatFte(availableFte)}
          <span className="font-normal text-neutral-subtle">
            {` / ${formatContractualFte(contractualFte)} FTE`}
          </span>
        </span>
      )}
      <div
        className={`relative w-full overflow-hidden rounded-control bg-neutral-subtle ${BAR_HEIGHT[variant]}`}
      >
        {/* Grafito y no rojo: el rojo Tuya es la acción primaria, el foco y
            la posición en la navegación, nunca el relleno de un gráfico
            (DESIGN.md, «The One Red Rule»). La capacidad no es una alerta. */}
        <div
          data-part="fill"
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-neutral-bold"
          style={{ width: `${pct(availableFte)}%` }}
        />
        {marks.map((mark) => (
          <span
            key={mark.key}
            data-notch={mark.key}
            aria-hidden="true"
            className="absolute inset-y-0 bg-neutral-subtle-pressed"
            style={{ left: `${mark.left}%`, width: `${mark.width}%` }}
          />
        ))}
      </div>
      {/* La misma capacidad en horas: la unidad con la que el lead habla con
          su gente. No son horas trabajadas — salen de los días del sprint. */}
      {figures && (
        <span className="text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
          {capacityHours(capacity)}
        </span>
      )}
    </div>
  );

  return <Tooltip content={breakdownText}>{bar}</Tooltip>;
};
