import React from "react";
import { Badge } from "@tuya-ui/components";
import type { BalanceSignalDto } from "../services/dedicationService";
import {
  NOT_EVALUABLE_LABELS,
  SIGNAL_LABELS,
  SIGNAL_PHRASES,
  SIGNAL_VARIANTS,
} from "../adapters/balanceSignal";

/**
 * La señal donde hay espacio y un solo sujeto —el dashboard, la ficha—: una
 * marca de estado con su nombre y, debajo, la frase que dice qué significa.
 * Cuatro estados siguen siendo un vocabulario que hay que aprender, y la frase
 * es lo que lo enseña sin que nadie tenga que consultarlo.
 *
 * Cuando la célula se comporta igual que la persona, la anotación va junto a la
 * señal. No la atenúa —no hay escalón al cual bajar— pero cambia a quién hay
 * que mirar: al equipo, no al individuo.
 */

export interface BalanceSignalBadgeProps {
  balance: BalanceSignalDto;
  /** La frase debajo de la marca. Encendida salvo donde no quepa. */
  phrase?: boolean;
  className?: string;
}

/** Se dice sólo cuando aporta: en las señales accionables. */
const SQUAD_NOTE = "La célula se comporta igual";

export const BalanceSignalBadge: React.FC<BalanceSignalBadgeProps> = ({
  balance,
  phrase = true,
  className = "",
}) => {
  const label = SIGNAL_LABELS[balance.signal];
  const reason = balance.notEvaluableReason
    ? NOT_EVALUABLE_LABELS[balance.notEvaluableReason]
    : null;
  const squadNote =
    balance.squadContext === "SameDirection" &&
    balance.signal !== "NotEvaluable";
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <span className="flex flex-wrap items-center gap-2">
        <Badge variant={SIGNAL_VARIANTS[balance.signal]}>{label}</Badge>
        {reason && (
          <span className="text-body-sm text-neutral-subtle">{reason}</span>
        )}
      </span>
      {phrase && (
        <p className="text-body-sm text-neutral-subtle">
          {SIGNAL_PHRASES[balance.signal]}
        </p>
      )}
      {squadNote && (
        <p className="text-label font-normal tracking-normal text-neutral-subtle">
          {SQUAD_NOTE}
        </p>
      )}
    </div>
  );
};
