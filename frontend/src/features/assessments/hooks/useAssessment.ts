import { useCallback, useEffect, useState } from "react";
import {
  assessmentService,
  currentCycle,
  type AssessmentDto,
  type SaveSkillRequest,
} from "../services/assessmentService";
import {
  toAssessmentView,
  type AssessmentView,
} from "../adapters/AssessmentAdapter";

export interface MutationResult {
  success: boolean;
  error?: string;
  /** Las habilidades sin nivel que impidieron cerrar. */
  pending?: string[];
}

function errorOf(err: unknown, fallback: string): MutationResult {
  const data = (
    err as { response?: { data?: { message?: string; pending?: string[] } } }
  )?.response?.data;
  return {
    success: false,
    error: data?.message ?? (err instanceof Error ? err.message : fallback),
    pending: data?.pending,
  };
}

/**
 * La evaluación se pide entera y se muestra lo que llega: cada guardado
 * devuelve la evaluación recalculada, con la brecha derivada al día, así que
 * la pantalla nunca tiene que calcularla por su cuenta.
 */
export const useAssessment = (personId: string, cycle = currentCycle()) => {
  const [assessment, setAssessment] = useState<AssessmentView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    assessmentService.get(personId, cycle).then(
      (dto) => {
        if (cancelled) return;
        setAssessment(dto ? toAssessmentView(dto) : null);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar la evaluación"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [personId, cycle, reloadTick]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  const run = async (
    action: () => Promise<AssessmentDto>,
    fallback: string
  ): Promise<MutationResult> => {
    setSaving(true);
    try {
      // Cada mutación devuelve la evaluación entera recalculada, así que se
      // reemplaza en vez de recargarla: no hay un ida y vuelta de más.
      setAssessment(toAssessmentView(await action()));
      return { success: true };
    } catch (err) {
      return errorOf(err, fallback);
    } finally {
      setSaving(false);
    }
  };

  return {
    assessment,
    loading,
    error,
    saving,
    refetch,
    open: () =>
      run(
        () => assessmentService.open(personId, cycle),
        "No se pudo abrir la evaluación"
      ),
    saveSkill: (skillId: string, request: SaveSkillRequest) =>
      run(
        () =>
          assessmentService.saveSkill(
            personId,
            assessment!.id,
            skillId,
            request
          ),
        "No se pudo guardar la habilidad"
      ),
    close: () =>
      run(
        () => assessmentService.close(personId, assessment!.id),
        "No se pudo cerrar la evaluación"
      ),
  };
};
