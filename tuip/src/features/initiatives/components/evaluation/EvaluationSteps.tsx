import React from "react";
import { Progress } from "@tuya-ui/components";
import type { EvaluationResult } from "../../services/evaluationModel";
import { evaluationSteps, pctText } from "../../adapters/EvaluationAdapter";

export interface EvaluationStepsProps {
  result: EvaluationResult;
  step: number;
  onStepChange: (step: number) => void;
}

/**
 * Los pasos de la evaluación. tuip no tiene stepper: es una lista de botones
 * neutros con el paso actual resaltado, sin imitar un componente que no
 * existe (brecha anotada en el proposal).
 */
export const EvaluationSteps: React.FC<EvaluationStepsProps> = ({
  result,
  step,
  onStepChange,
}) => (
  <section className="overflow-hidden rounded-surface border border-neutral-default bg-neutral-default lg:sticky lg:top-4">
    <div className="flex items-center justify-between border-b border-neutral-default px-4 py-3">
      <h2 className="text-body font-semibold text-neutral-default">
        Evaluación
      </h2>
      <span className="text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
        {result.answered} de {result.totalQuestions} respondidas
      </span>
    </div>
    <ol
      className="flex flex-col gap-0.5 p-2"
      aria-label="Pasos de la evaluación"
    >
      {evaluationSteps(result).map((s) => {
        const current = s.index === step;
        return (
          <li key={s.index}>
            <button
              type="button"
              aria-current={current ? "step" : undefined}
              onClick={() => onStepChange(s.index)}
              className={`grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body-sm ${
                current
                  ? "bg-neutral-subtlest font-semibold text-neutral-default"
                  : "text-neutral-default hover:bg-neutral-subtlest"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-pill border text-label font-semibold tracking-normal ${
                  current
                    ? "border-brand-default text-brand-default"
                    : s.done
                      ? "border-neutral-bold bg-neutral-bold text-neutral-inverse"
                      : "border-neutral-default text-neutral-subtle"
                }`}
              >
                {s.code}
              </span>
              <span className="truncate">{s.label}</span>
              <span className="font-mono text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
                {s.detail}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
    <div className="flex flex-col gap-2 border-t border-neutral-default px-4 py-3">
      <div className="flex items-center justify-between text-body-sm">
        <span className="text-neutral-subtle">Complejidad acumulada</span>
        <span className="font-semibold tabular-nums text-neutral-default">
          {pctText(result.pct)}
        </span>
      </div>
      <Progress value={result.pct} label="Complejidad acumulada" />
      <span className="text-label font-normal tracking-normal text-neutral-subtle">
        El plazo no cambia la talla: sólo el FTE necesario.
      </span>
    </div>
  </section>
);
