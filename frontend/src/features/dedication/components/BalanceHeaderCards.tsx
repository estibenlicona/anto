import React from "react";
import { Card, CardBody, Icon, type IconName } from "@tuya-ui/components";
import type { BalanceSignal } from "../services/dedicationService";
import type { SelectedSprintView } from "../adapters/DedicationAdapter";
import { formatContractualFte, formatFte } from "../adapters/DedicationAdapter";
import { CapacityFteBar } from "./CapacityFteBar";
import { DemandBar } from "./DemandBar";
import { BalanceSprintCard } from "./BalanceSprintCard";

export interface BalanceHeaderCardsProps {
  sprint: SelectedSprintView;
  personName: string;
  /** El mínimo de sprints sellados del Calendario, para el aviso de histórico corto. */
  minHistorySprints: number;
}

/** La desviación se lee en el rol de la señal, como el relleno de su barra. */
const DEVIATION_TONE: Record<BalanceSignal, string> = {
  PossibleOverload: "text-danger-default",
  PossibleUnderload: "text-warning-default",
  Usual: "text-neutral-subtle",
  NotEvaluable: "text-neutral-subtle",
};

const CardTitle: React.FC<{ children: React.ReactNode; icon: IconName }> = ({
  children,
  icon,
}) => (
  <div className="flex items-center justify-between">
    <span className="text-label text-neutral-subtle">{children}</span>
    <Icon name={icon} size={16} className="text-neutral-subtle" />
  </div>
);

/**
 * La cabecera, **desbalanceada a propósito**: el balance al frente con el
 * doble de ancho, y las dos cifras que más se consultan al lado.
 *
 * Cuatro tarjetas iguales decían que las cuatro pesaban lo mismo, y no es
 * cierto: la señal es la respuesta y la mediana histórica es un insumo. Por
 * eso la referencia ya no es una tarjeta —vive en la pestaña *Señales*, donde
 * sus tres cifras se comparan a la misma escala— y no hay línea de resumen:
 * la frase de la señal cumple esa función sin competir con ella.
 *
 * En las dos tarjetas de cifras, la cifra grande es **la medida** y lo que la
 * acompaña va un escalón abajo: "0.72" en metric y "/ 0.80 FTE" en heading;
 * "30" en metric y "SP" en heading. Todo en metric no deja leer cuál es el
 * número.
 */
export const BalanceHeaderCards: React.FC<BalanceHeaderCardsProps> = ({
  sprint,
  personName,
  minHistorySprints,
}) => (
  <div className="grid gap-group lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)_minmax(240px,1fr)]">
    <BalanceSprintCard sprint={sprint} minHistorySprints={minHistorySprints} />

    <Card>
      <CardBody className="flex h-full flex-col gap-2 p-4">
        <CardTitle icon="fte">CAPACIDAD</CardTitle>
        <span className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-metric tabular-nums text-neutral-default">
            {formatFte(sprint.capacity.availableFte)}
          </span>
          <span className="text-heading-md tabular-nums text-neutral-subtle">
            / {formatContractualFte(sprint.capacity.contractualFte)} FTE
          </span>
        </span>
        <div className="mt-auto flex flex-col gap-2">
          <CapacityFteBar
            capacity={sprint.capacity}
            variant="card"
            figures={false}
            label={`Capacidad de ${personName} en ${sprint.name}`}
          />
          {/* Sólo las horas: el desglose de días vive en el tooltip y en el
              nombre accesible de la barra, y la tarjeta se lee de un vistazo. */}
          <span className="text-body-sm tabular-nums text-neutral-subtle">
            {sprint.capacityHours}
          </span>
        </div>
      </CardBody>
    </Card>

    <Card>
      <CardBody className="flex h-full flex-col gap-2 p-4">
        <CardTitle icon="chart-line">DEMANDA VS REFERENCIA</CardTitle>
        <span className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-metric tabular-nums text-neutral-default">
            {sprint.execution.committedPoints}
          </span>
          <span className="text-heading-md text-neutral-subtle">SP</span>
          {sprint.deviationLabel && (
            <span
              className={`ml-auto text-body-sm font-semibold tabular-nums ${DEVIATION_TONE[sprint.balance.signal]}`}
            >
              {sprint.deviationLabel}
            </span>
          )}
        </span>
        <div className="mt-auto flex flex-col gap-2">
          {/* Sin la marca de célula: acá la referencia es el histórico propio,
              y la de la célula se compara en la pestaña Señales, donde hay
              ancho para tres barras a la misma escala. */}
          <DemandBar
            committedPoints={sprint.execution.committedPoints}
            ownMedian={sprint.reference.ownMedian}
            signal={sprint.balance.signal}
            variant="card"
            figures={false}
            label={`Demanda de ${personName} en ${sprint.name}`}
          />
          <span className="text-body-sm tabular-nums text-neutral-subtle">
            {sprint.referenceMarkLabel}
          </span>
        </div>
      </CardBody>
    </Card>
  </div>
);
