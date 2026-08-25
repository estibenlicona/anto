import React from "react";
import { Button, Chip, Icon, Tag } from "@tuya-ui/components";
import type {
  EvaluationModel,
  EvaluationResult,
} from "../../services/evaluationModel";
import { QUESTION_KIND_LABELS } from "../../adapters/EvaluationAdapter";
import { StepFrame } from "./StepFrame";

export interface DimensionStepProps {
  model: EvaluationModel;
  /** 0-based dentro de `model.dimensions`. */
  dimensionIndex: number;
  answers: Record<string, number>;
  result: EvaluationResult;
  onAnswer: (questionId: string, value: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const DimensionStep: React.FC<DimensionStepProps> = ({
  model,
  dimensionIndex,
  answers,
  result,
  onAnswer,
  onPrev,
  onNext,
}) => {
  const dimension = model.dimensions[dimensionIndex];
  const questions = model.questions.filter((q) => q.dimension === dimension);
  const dim = result.dimensions[dimensionIndex];
  const last = dimensionIndex === model.dimensions.length - 1;

  return (
    <StepFrame
      title={dimension}
      help={`Dimensión ${dimensionIndex + 1} de ${model.dimensions.length}`}
      aside={
        <>
          <Tag>{questions.length} preguntas</Tag>
          <Tag>Aporta {dim.weightPct}% del puntaje</Tag>
        </>
      }
      footerText={`${dim.answered} de ${dim.total} respondidas · ${dim.pct}% de complejidad en esta dimensión`}
      actions={
        <>
          <Button
            variant="secondary"
            onClick={onPrev}
            iconBefore={<Icon name="arrow-left" size={16} />}
          >
            Anterior
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            iconAfter={<Icon name="chevron-right" size={16} />}
          >
            {last ? "Ver resultado" : "Siguiente"}
          </Button>
        </>
      }
    >
      <ul className="flex flex-col">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex flex-col gap-3 border-b border-neutral-default px-5 py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-body-sm text-neutral-default">
                <span className="mr-2 font-mono text-neutral-subtle">
                  {q.id}
                </span>
                {q.text}
              </span>
              <span className="flex flex-none items-center gap-1.5">
                <Tag>{QUESTION_KIND_LABELS[q.kind]}</Tag>
                <Tag>Peso {q.weight}</Tag>
              </span>
            </div>
            {/* Chip seleccionable con contador: el contador es el valor 0–4.
                Elegir uno reemplaza al anterior; no se deselecciona. */}
            <div
              role="group"
              aria-label={q.text}
              className="flex flex-wrap items-center gap-2"
            >
              {q.scale.map((label, value) => (
                <Chip
                  key={value}
                  selectable
                  selected={answers[q.id] === value}
                  count={value}
                  onSelectedChange={() => onAnswer(q.id, value)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </StepFrame>
  );
};
