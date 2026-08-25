import { useCallback, useEffect, useState } from "react";
import {
  careerPlanService,
  type CreatePlanActionRequest,
  type PersonPlanDto,
} from "../services/careerPlanService";
import {
  toPersonPlanView,
  type PersonPlanView,
} from "../adapters/PersonPlanAdapter";

export interface PlanMutationResult {
  success: boolean;
  error?: string;
}

function errorOf(err: unknown, fallback: string): PlanMutationResult {
  const data = (err as { response?: { data?: { message?: string } } })?.response
    ?.data;
  return {
    success: false,
    error: data?.message ?? (err instanceof Error ? err.message : fallback),
  };
}

export const usePersonPlan = (personId: string) => {
  const [plan, setPlan] = useState<PersonPlanView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    careerPlanService.getPlan(personId).then(
      (dto) => {
        if (cancelled) return;
        setPlan(toPersonPlanView(dto));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el plan"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [personId, reloadTick]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  const run = async (
    action: () => Promise<PersonPlanDto>,
    fallback: string
  ): Promise<PlanMutationResult> => {
    setSaving(true);
    try {
      // Cada mutación devuelve el plan entero recalculado, así que se
      // reemplaza en vez de volver a pedirlo.
      setPlan(toPersonPlanView(await action()));
      return { success: true };
    } catch (err) {
      return errorOf(err, fallback);
    } finally {
      setSaving(false);
    }
  };

  return {
    plan,
    loading,
    error,
    saving,
    refetch,
    createAction: (request: CreatePlanActionRequest) =>
      run(
        () => careerPlanService.createAction(personId, request),
        "No se pudo registrar la acción"
      ),
    completeAction: (actionId: string) =>
      run(
        () => careerPlanService.completeAction(personId, actionId),
        "No se pudo marcar la acción"
      ),
  };
};
