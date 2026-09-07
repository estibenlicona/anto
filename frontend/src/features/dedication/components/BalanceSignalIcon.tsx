import React from "react";
import { Icon, Tooltip, type IconName } from "@tuya-ui/components";
import type {
  BalanceSignal,
  BalanceSignalDto,
} from "../services/dedicationService";
import { signalTooltip } from "../adapters/DedicationAdapter";

/**
 * La señal reducida a un icono, para la última columna del listado: **forma
 * distinta además de rol de color**, nunca sólo el color. Sin texto y sin
 * enlace — la columna es de un vistazo, y quien quiera el detalle abre el
 * dashboard.
 *
 * El nombre accesible y el tooltip llevan la señal y cuántas evidencias la
 * sostienen: una señal sin acceso a su explicación sería la sentencia que este
 * modelo existe para evitar. En el dashboard y en la ficha la señal es un
 * `BalanceSignalBadge` con texto, porque ahí hay espacio y un solo sujeto.
 */

const ICONS: Record<BalanceSignal, { name: IconName; className: string }> = {
  PossibleOverload: { name: "trend-up", className: "text-danger-default" },
  // Advertencia y no informativo: es una decisión de carga, no contexto. La
  // forma la sigue distinguiendo de la sobreasignación.
  PossibleUnderload: { name: "trend-down", className: "text-warning-default" },
  Usual: { name: "check", className: "text-success-default" },
  NotEvaluable: { name: "status-empty", className: "text-neutral-subtlest" },
};

export interface BalanceSignalIconProps {
  balance: BalanceSignalDto;
  className?: string;
}

export const BalanceSignalIcon: React.FC<BalanceSignalIconProps> = ({
  balance,
  className = "",
}) => {
  const { name, className: tone } = ICONS[balance.signal];
  const text = signalTooltip(balance);
  return (
    <Tooltip content={text}>
      <span
        role="img"
        aria-label={text}
        tabIndex={0}
        className={`inline-flex size-5 items-center justify-center rounded-control outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring ${tone} ${className}`}
      >
        <Icon name={name} size={20} />
      </span>
    </Tooltip>
  );
};
