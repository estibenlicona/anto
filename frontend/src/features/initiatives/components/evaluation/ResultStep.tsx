import React from "react";
import { Button, Icon, Tag } from "@tuya-ui/components";
import type {
  EvaluationModel,
  EvaluationResult,
} from "../../services/evaluationModel";
import { fteText } from "../../adapters/InitiativeAdapter";
import { Phase1Reading } from "./Phase1Reading";
import { StepFrame } from "./StepFrame";

export interface ResultStepProps {
  model: EvaluationModel;
  result: EvaluationResult;
  saving: boolean;
  onPrev: () => void;
  onSave: () => void;
}

/**
 * El último paso del asistente: el marco, el pie con la consecuencia de
 * guardar y las dos acciones. La lectura en sí vive en `Phase1Reading`, que la
 * ficha de la iniciativa muestra igual sobre la evaluación ya guardada.
 */
export const ResultStep: React.FC<ResultStepProps> = ({
  model,
  result,
  saving,
  onPrev,
  onSave,
}) => (
  <StepFrame
    title="Resultado de la evaluación temprana"
    help={`Tamizaje ${result.triageYes} de ${model.triage.length} en sí · ${result.dimensions.length} dimensiones`}
    aside={
      <Tag>
        {result.answered} de {result.totalQuestions} respondidas
      </Tag>
    }
    footerText={`Al guardar queda con talla ${result.talla} y ${fteText(result.fteExpected)} FTE de demanda. Activarla es otro paso.`}
    actions={
      <>
        <Button variant="secondary" onClick={onPrev}>
          Revisar respuestas
        </Button>
        <Button
          variant="primary"
          isLoading={saving}
          onClick={onSave}
          iconBefore={<Icon name="save" size={16} />}
        >
          Guardar evaluación
        </Button>
      </>
    }
  >
    <Phase1Reading model={model} result={result} />
  </StepFrame>
);
