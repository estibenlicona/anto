import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useEvaluation } from "./hooks/useEvaluation";
import { RESULT_STEP, TRIAGE_STEP } from "./adapters/EvaluationAdapter";
import { EvaluationHeader } from "./components/evaluation/EvaluationHeader";
import { EvaluationSteps } from "./components/evaluation/EvaluationSteps";
import { TriageStep } from "./components/evaluation/TriageStep";
import { DimensionStep } from "./components/evaluation/DimensionStep";
import { ResultStep } from "./components/evaluation/ResultStep";

const LIST_PATH = "/app/lead/iniciativas";

export interface InitiativeEvaluationContainerProps {
  initiativeId: string;
}

export const InitiativeEvaluationContainer: React.FC<
  InitiativeEvaluationContainerProps
> = ({ initiativeId }) => {
  const ev = useEvaluation(initiativeId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saveError, setSaveError] = useState<string | null>(null);

  // Un solo nivel final: el breadcrumb de tuip colapsa más de tres niveles
  // en "…", y "Gestionar Iniciativas" es justo lo que se perdería.
  useLeadBreadcrumbTrailing(
    ev.initiative ? `${ev.initiative.name} · Evaluación` : null
  );

  const handleSave = async () => {
    setSaveError(null);
    const result = await ev.save();
    if (result.success) {
      toast({
        message: "Evaluación guardada",
        icon: <Icon name="status-success" size={16} />,
      });
      navigate(LIST_PATH);
    } else if (result.error) {
      setSaveError(result.error);
    }
  };

  if (ev.notFound) {
    return (
      <EmptyState
        icon={<Icon name="search" size={32} />}
        title="No encontramos esa iniciativa"
        description="Puede que se haya eliminado o que el enlace esté mal."
        action={
          <Button variant="secondary" onClick={() => navigate(LIST_PATH)}>
            Volver a Iniciativas
          </Button>
        }
      />
    );
  }

  if (ev.error) {
    return (
      <Alert variant="danger" title="No se pudo cargar la evaluación">
        {ev.error}
      </Alert>
    );
  }

  if (ev.loading || !ev.initiative || !ev.model || !ev.draft || !ev.result) {
    return (
      <p className="text-body-sm text-neutral-subtle">Cargando evaluación…</p>
    );
  }

  const { initiative, model, draft, result, step } = ev;

  return (
    <div className="flex flex-col gap-5">
      <EvaluationHeader
        initiative={initiative}
        result={result}
        targetMonths={draft.targetMonths}
        onTargetMonthsChange={ev.setTargetMonths}
      />
      {saveError && (
        <Alert variant="danger" title="No se pudo guardar la evaluación">
          {saveError}
        </Alert>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <EvaluationSteps
          result={result}
          step={step}
          onStepChange={ev.setStep}
        />
        {step === TRIAGE_STEP && (
          <TriageStep
            model={model}
            triage={draft.triage}
            result={result}
            saving={ev.saving}
            onTriageChange={ev.setTriage}
            onNext={ev.next}
            onSaveFastTrack={handleSave}
          />
        )}
        {step > TRIAGE_STEP && step < RESULT_STEP && (
          <DimensionStep
            model={model}
            dimensionIndex={step - 1}
            answers={draft.answers}
            result={result}
            onAnswer={ev.setAnswer}
            onPrev={ev.prev}
            onNext={ev.next}
          />
        )}
        {step === RESULT_STEP && (
          <ResultStep
            model={model}
            result={result}
            saving={ev.saving}
            onPrev={ev.prev}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};
