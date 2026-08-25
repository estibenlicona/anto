import React from "react";
import { SegmentedBar } from "@tuya-ui/components";
import { MIX_COLORS } from "@features/squads/components/mixColors";

export interface DedicationCellProps {
  bauPercentage: number;
  transformationPercentage: number;
  /** Encabezado opcional: la célula y la dedicación total, para la Torre de control. */
  squadName?: string;
  dedicationPercentage?: number;
  className?: string;
}

/**
 * Desglose BAU / Transformación de una dedicación: mini barra en los tonos de
 * acento del sistema y el texto debajo. La usan la tabla del equipo (sin
 * encabezado) y la Torre de control (con la célula y el total arriba).
 */
export const DedicationCell: React.FC<DedicationCellProps> = ({
  bauPercentage,
  transformationPercentage,
  squadName,
  dedicationPercentage,
  className = "w-40",
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {squadName !== undefined && (
      <div className="flex items-baseline justify-between gap-2 text-label tracking-normal">
        <span className="font-medium text-neutral-default">{squadName}</span>
        <span className="font-semibold tabular-nums text-neutral-default">
          {dedicationPercentage}%
        </span>
      </div>
    )}
    <SegmentedBar
      separated
      size="sm"
      total={squadName !== undefined ? 100 : undefined}
      segments={[
        { value: bauPercentage, label: "BAU", color: MIX_COLORS.bau },
        {
          value: transformationPercentage,
          label: "Transformación",
          color: MIX_COLORS.transformation,
        },
      ]}
    />
    <span className="text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
      BAU {bauPercentage}% · Transf. {transformationPercentage}%
    </span>
  </div>
);
