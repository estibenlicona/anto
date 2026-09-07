import React from "react";
import { Card, CardBody } from "@tuya-ui/components";
import type { SprintMetric } from "../adapters/DedicationAdapter";

export interface SprintMetricsRowProps {
  metrics: SprintMetric[];
}

/**
 * Las cuatro cifras que acompañan a la cabecera —cumplimiento, trabajo no
 * planificado, carry-over y foco—, cada una con lo que la sostiene al lado.
 *
 * Son de una línea a propósito: son contexto de la señal, no la señal. La que
 * se pasó de su tolerancia se pinta, y quién se pasó lo decide la evidencia,
 * no esta fila (ver `sprintMetrics` en el adapter).
 */
export const SprintMetricsRow: React.FC<SprintMetricsRowProps> = ({
  metrics,
}) => (
  <div className="grid gap-group sm:grid-cols-2 xl:grid-cols-4">
    {metrics.map((metric) => (
      <Card key={metric.label}>
        <CardBody className="flex flex-col gap-1 px-4 py-3">
          <span className="text-label text-neutral-subtle">
            {metric.label.toUpperCase()}
          </span>
          <span className="flex flex-wrap items-baseline gap-2">
            {/* Heading LG, no metric: es una cifra de contexto, un escalón por
                debajo de las tres de la cabecera. */}
            <span
              className={`text-heading-lg tabular-nums ${
                metric.outOfTolerance
                  ? "text-danger-default"
                  : "text-neutral-default"
              }`}
            >
              {metric.value}
            </span>
            <span className="text-body-sm tabular-nums text-neutral-subtle">
              {metric.detail}
            </span>
          </span>
        </CardBody>
      </Card>
    ))}
  </div>
);
