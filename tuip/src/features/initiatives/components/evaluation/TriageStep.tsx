import React from "react";
import {
  Alert,
  Badge,
  Button,
  Icon,
  SegmentedControl,
  Tag,
} from "@tuya-ui/components";
import type {
  EvaluationModel,
  EvaluationResult,
} from "../../services/evaluationModel";
import { TRIAGE_RECOMMENDATIONS } from "../../adapters/EvaluationAdapter";
import { StepFrame } from "./StepFrame";

export interface TriageStepProps {
  model: EvaluationModel;
  triage: boolean[];
  result: EvaluationResult;
  saving: boolean;
  onTriageChange: (index: number, value: boolean) => void;
  onNext: () => void;
  onSaveFastTrack: () => void;
}

export const TriageStep: React.FC<TriageStepProps> = ({
  model,
  triage,
  result,
  saving,
  onTriageChange,
  onNext,
  onSaveFastTrack,
}) => {
  const reco = TRIAGE_RECOMMENDATIONS[result.triageVerdict];
  const critical = model.triage.some((t, i) => t.critical && triage[i]);
  return (
    <StepFrame
      title="Tamizaje"
      help="Seis preguntas de sí o no. Con el resultado se decide si hace falta la evaluación completa."
      aside={<Tag>{model.triage.length} preguntas</Tag>}
      footerText={`${result.triageYes} de ${model.triage.length} en sí${critical ? " · incluye una crítica" : ""}`}
      actions={
        <>
          {reco.fastTrack && (
            <Button
              variant="secondary"
              isLoading={saving}
              onClick={onSaveFastTrack}
            >
              Guardar como vía rápida
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onNext}
            iconAfter={<Icon name="chevron-right" size={16} />}
          >
            Comenzar evaluación
          </Button>
        </>
      }
    >
      <ul className="flex flex-col">
        {model.triage.map((q, i) => (
          <li
            key={q.id}
            className="flex items-center justify-between gap-4 border-b border-neutral-default px-5 py-3.5"
          >
            <span className="flex items-center gap-2.5 text-body-sm text-neutral-default">
              {q.text}
              {q.critical && <Badge variant="danger">Crítica</Badge>}
            </span>
            <SegmentedControl
              label={q.text}
              options={[
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
              ]}
              value={triage[i] ? "si" : "no"}
              onValueChange={(v) => onTriageChange(i, v === "si")}
            />
          </li>
        ))}
      </ul>
      <div className="px-5 py-4">
        <Alert variant={reco.variant} title={reco.title}>
          {reco.text}
        </Alert>
      </div>
    </StepFrame>
  );
};
