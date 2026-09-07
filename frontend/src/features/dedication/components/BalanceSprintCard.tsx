import React from "react";
import { Card, CardBody } from "@tuya-ui/components";
import type { SelectedSprintView } from "../adapters/DedicationAdapter";
import {
  NOT_EVALUABLE_LABELS,
  SIGNAL_LABELS,
  SIGNAL_PHRASES,
  isActionableSignal,
} from "../adapters/balanceSignal";

export interface BalanceSprintCardProps {
  sprint: SelectedSprintView;
  /** El mínimo de sprints sellados del Calendario, para el aviso de histórico corto. */
  minHistorySprints: number;
}

/** El punto y el borde toman el rol de la señal; las que no piden decisión, no. */
const TONES: Record<string, { dot: string; border: string; text: string }> = {
  PossibleOverload: {
    dot: "bg-danger-bold",
    border: "border-danger-default",
    text: "text-danger-default",
  },
  PossibleUnderload: {
    dot: "bg-warning-bold",
    border: "border-warning-default",
    text: "text-warning-default",
  },
  Usual: {
    dot: "bg-success-default",
    border: "border-neutral-default",
    text: "text-neutral-default",
  },
  NotEvaluable: {
    dot: "bg-neutral-subtle-pressed",
    border: "border-neutral-default",
    text: "text-neutral-default",
  },
};

/**
 * **La respuesta de la página.** Ocupa el doble que las tarjetas de cifras
 * porque no es una cifra: es lo que el lead vino a leer, y todo lo demás
 * existe para sustentarla.
 *
 * El borde se pinta sólo cuando la señal pide una decisión de carga. Marcar
 * también las que no piden nada convertiría el color en decoración y dejaría
 * de servir para barrer.
 */
export const BalanceSprintCard: React.FC<BalanceSprintCardProps> = ({
  sprint,
  minHistorySprints,
}) => {
  const { signal, notEvaluableReason } = sprint.balance;
  const tone = TONES[signal];
  const actionable = isActionableSignal(signal);
  const reason = notEvaluableReason
    ? NOT_EVALUABLE_LABELS[notEvaluableReason]
    : null;
  return (
    <Card className={actionable ? tone.border : undefined}>
      <CardBody className="flex h-full flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label text-neutral-subtle">
            BALANCE DEL SPRINT
          </span>
          <span className="text-body-sm text-neutral-subtle">
            {sprint.signalEvidence}
          </span>
        </div>

        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`size-3 shrink-0 rounded-pill ${tone.dot}`}
          />
          <span className={`text-display font-semibold ${tone.text}`}>
            {SIGNAL_LABELS[signal]}
          </span>
        </span>

        <p className="max-w-prose text-body text-neutral-subtle">
          {reason ?? SIGNAL_PHRASES[signal]}
        </p>

        {/* Al pie, de dónde salen las cifras: sellado, provisional o sin
            snapshot, y cuántos sprints le faltan a quien no tiene histórico. */}
        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-default pt-3 text-body-sm text-neutral-subtle">
          <span>{sprint.snapshotNote ?? sprint.snapshotLabel}</span>
          {!sprint.reference.sufficient && (
            <span>
              Hacen falta {minHistorySprints} para evaluar el balance.
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
