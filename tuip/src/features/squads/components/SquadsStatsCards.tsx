import React from "react";
import { Card, CardBody, DistributionCard } from "@tuya-ui/components";
import type { SegmentedBarHeat } from "@tuya-ui/components";
import type { Criticality, SquadsStats } from "../services/squadService";
import { CRITICALITY_LABELS } from "../adapters/SquadAdapter";
import { MIX_COLORS } from "./mixColors";

// La distribución se lee como una escala de intensidad sobre la marca, de
// mayor a menor criticidad, y no con los roles semánticos del badge de cada
// fila (que siguen siendo Crítica=peligro, Alta=advertencia, Media=info,
// Baja=neutro): la card compara "cuánto de lo que tengo es grave", el badge
// dice el estado de una célula. Qué color es cada grado lo decide tuip.
const CRITICALITY_HEAT: Record<Criticality, SegmentedBarHeat> = {
  Critical: "max",
  High: "high",
  Medium: "mid",
  Low: "low",
};

export interface SquadsStatsCardsProps {
  stats: SquadsStats | null;
  loading: boolean;
}

const fte = (n: number) => n.toFixed(1);

/**
 * Tres lecturas sobre todas las células, de la misma altura y cada una
 * abriendo con la cifra que manda (el patrón del resumen de Personas): así
 * el resumen ocupa una fila y la tabla entra en el primer pantallazo.
 */
export const SquadsStatsCards: React.FC<SquadsStatsCardsProps> = ({
  stats,
  loading,
}) => {
  if (loading || !stats) {
    return null;
  }

  const assignedPct =
    stats.chapterFte > 0
      ? Math.round((stats.allocatedFte / stats.chapterFte) * 100)
      : 0;
  const freeFte = Math.max(stats.chapterFte - stats.allocatedFte, 0);
  const severeCount = stats.byCriticality
    .filter((e) => e.criticality === "Critical" || e.criticality === "High")
    .reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.2fr]">
      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <span className="text-label text-neutral-subtle">CÉLULAS</span>
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">
              {stats.totalCount}
            </span>
            <span className="text-body-sm text-neutral-subtle">
              en {stats.teamCount}{" "}
              {stats.teamCount === 1 ? "equipo" : "equipos"}
            </span>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-1 text-label font-normal tracking-normal text-neutral-subtle">
            <span>
              <span className="font-semibold tabular-nums text-neutral-default">
                {stats.withoutPeopleCount}
              </span>{" "}
              sin personas
            </span>
            <span>
              <span className="font-semibold tabular-nums text-neutral-default">
                {stats.atCapacityCount}
              </span>{" "}
              al tope
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Capacidad asignada: BAU y Transformación con los tonos de MIX_COLORS
          (los mismos de la columna Capacidad de cada fila) y lo libre como
          tramo gris, para que la leyenda en línea lleve las tres cifras. */}
      <DistributionCard
        title="CAPACIDAD ASIGNADA"
        headline={{
          value: fte(stats.allocatedFte),
          note: `de ${fte(stats.chapterFte)} FTE · ${assignedPct}% del chapter`,
        }}
        legend="inline"
        items={[
          { label: "BAU", value: stats.bauFte, color: MIX_COLORS.bau },
          {
            label: "Transformación",
            value: stats.transformationFte,
            color: MIX_COLORS.transformation,
          },
          { label: "Libre", value: freeFte, heat: "low" },
        ]}
      />

      <DistributionCard
        title="DISTRIBUCIÓN POR CRITICIDAD"
        headline={{
          value: severeCount,
          note: `de ${stats.totalCount} en criticidad alta o crítica`,
        }}
        legend="inline"
        items={stats.byCriticality.map((entry) => ({
          label: CRITICALITY_LABELS[entry.criticality],
          value: entry.count,
          heat: CRITICALITY_HEAT[entry.criticality],
        }))}
      />
    </div>
  );
};
