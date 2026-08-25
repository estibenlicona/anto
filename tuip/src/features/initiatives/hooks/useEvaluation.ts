import { useCallback, useEffect, useMemo, useState } from "react";
import {
  computeEvaluation,
  type EvaluationInput,
  type EvaluationModel,
  type EvaluationResult,
} from "../services/evaluationModel";
import {
  initiativeService,
  type InitiativeDto,
} from "../services/initiativeService";
import {
  initiativeAdapter,
  type Initiative,
} from "../adapters/InitiativeAdapter";
import { RESULT_STEP, TRIAGE_STEP } from "../adapters/EvaluationAdapter";
import type { MutationResult } from "./useInitiativeMutations";

export const TARGET_MONTH_OPTIONS = [3, 6, 9, 12] as const;

const LOAD_ERROR = "Error al cargar la evaluación";

function draftFrom(
  dto: InitiativeDto,
  model: EvaluationModel
): EvaluationInput {
  const saved = dto.evaluation;
  return {
    triage: saved ? [...saved.triage] : model.triage.map(() => false),
    answers: saved ? { ...saved.answers } : {},
    targetMonths: saved?.targetMonths ?? dto.targetMonths,
  };
}

/**
 * La evaluación de una iniciativa: iniciativa + modelo servido, el borrador
 * (respuestas y plazo) y el resultado en vivo calculado en el cliente con el
 * mismo motor que persiste el backend (design.md D1/D3).
 */
export const useEvaluation = (initiativeId: string) => {
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [model, setModel] = useState<EvaluationModel | null>(null);
  const [draft, setDraft] = useState<EvaluationInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(TRIAGE_STEP);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      initiativeService.get(initiativeId),
      initiativeService.getEvaluationModel(),
    ]).then(
      ([dto, m]) => {
        if (cancelled) return;
        setInitiative(initiativeAdapter.toEntity(dto));
        setModel(m);
        setDraft(draftFrom(dto, m));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) setNotFound(true);
        else setError(err instanceof Error ? err.message : LOAD_ERROR);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [initiativeId]);

  const result: EvaluationResult | null = useMemo(
    () => (model && draft ? computeEvaluation(model, draft) : null),
    [model, draft]
  );

  const setTriage = useCallback((index: number, value: boolean) => {
    setDraft((d) => {
      if (!d) return d;
      const triage = [...d.triage];
      triage[index] = value;
      return { ...d, triage };
    });
  }, []);

  const setAnswer = useCallback((questionId: string, value: number) => {
    setDraft((d) =>
      d ? { ...d, answers: { ...d.answers, [questionId]: value } } : d
    );
  }, []);

  const setTargetMonths = useCallback((months: number) => {
    setDraft((d) => (d ? { ...d, targetMonths: months } : d));
  }, []);

  const save = useCallback(async (): Promise<MutationResult> => {
    if (!draft) return { success: false, error: "Nada que guardar" };
    try {
      setSaving(true);
      const dto = await initiativeService.saveEvaluation(initiativeId, draft);
      setInitiative(initiativeAdapter.toEntity(dto));
      return { success: true };
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string } } })
        ?.response?.data;
      return {
        success: false,
        error:
          data?.message ??
          (err instanceof Error
            ? err.message
            : "Error al guardar la evaluación"),
      };
    } finally {
      setSaving(false);
    }
  }, [draft, initiativeId]);

  const dimensionCount = model?.dimensions.length ?? 0;
  const next = useCallback(
    () => setStep((s) => Math.min(RESULT_STEP, s + 1)),
    []
  );
  const prev = useCallback(
    () => setStep((s) => Math.max(TRIAGE_STEP, s - 1)),
    []
  );

  return {
    initiative,
    model,
    draft,
    result,
    loading,
    notFound,
    error,
    step,
    setStep,
    next,
    prev,
    dimensionCount,
    setTriage,
    setAnswer,
    setTargetMonths,
    save,
    saving,
  };
};
