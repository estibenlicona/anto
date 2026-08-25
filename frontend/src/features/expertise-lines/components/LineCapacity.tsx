import React from "react";
import { Card, CardBody, Tooltip } from "@tuya-ui/components";
import type { LineCapacityView } from "../adapters/ExpertiseLinesAdapter";

interface LineCapacityProps {
  capacity: LineCapacityView;
}

/**
 * Las cuatro cifras de una línea, con el mismo tratamiento de indicador que
 * los resúmenes del resto del producto: una card por cifra, el rótulo arriba
 * y el número en tamaño de métrica.
 *
 * Antes eran una rejilla pelada dentro de una sola card, y se leían como
 * cuatro datos sueltos en vez del resumen que son. Las cifras no cambian:
 * cambia cómo se presentan.
 */
const Indicator: React.FC<{
  label: string;
  value: string;
  note?: React.ReactNode;
}> = ({ label, value, note }) => (
  <Card>
    <CardBody className="flex h-full flex-col gap-2">
      <span className="text-label uppercase text-neutral-subtle">{label}</span>
      <span className="text-metric tabular-nums text-neutral-default">
        {value}
      </span>
      {/* `mt-auto` para que la nota quede abajo y las cuatro cards se alineen
          aunque sólo algunas la tengan. */}
      {note && (
        <span className="mt-auto text-body-sm text-neutral-subtle">{note}</span>
      )}
    </CardBody>
  </Card>
);

export const LineCapacity: React.FC<LineCapacityProps> = ({ capacity }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Indicator
      label="Personas"
      value={String(capacity.peopleCount)}
      note={capacity.peopleCount === 0 ? "Sin nadie asignado" : undefined}
    />
    <Indicator label="FTE disponible" value={capacity.availableFteLabel} />
    <Indicator
      label="FTE asignado"
      value={capacity.allocatedFteLabel}
      note={
        capacity.overAllocated ? (
          /*
            El asignado por encima del disponible no es un error de cuenta:
            es el criterio con el que la Torre calcula el asignado, que no
            mira el FTE parcial de cada persona. Se explica en vez de
            esconderse, porque quien lo ve necesita saber si desconfiar.
          */
          <Tooltip content="El FTE asignado se calcula sobre la dedicación a las células, sin descontar el FTE parcial de cada persona — el mismo criterio de la Torre de control.">
            <span className="text-warning-default">Supera al disponible</span>
          </Tooltip>
        ) : undefined
      }
    />
    <Indicator
      label="FTE libre"
      value={capacity.freeFteLabel}
      note={`${capacity.unallocatedPercentage} % sin asignar`}
    />
  </div>
);
