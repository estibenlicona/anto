import { useCallback, useEffect, useState } from "react";
import { initiativeService } from "../services/initiativeService";
import type { EvaluationModel } from "../services/evaluationModel";
import {
  initiativeAdapter,
  type Initiative,
} from "../adapters/InitiativeAdapter";

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 404
  );
}

/**
 * Una iniciativa por id junto con el modelo de evaluación, con `notFound`
 * separado de `error` para el estado vacío de la ficha.
 *
 * El modelo viene con ella y no aparte porque la lectura de Fase 1 lo necesita
 * para dos cosas —la banda de talla del puntaje guardado y la escala completa
 * de tallas— y pedirlo en un segundo efecto dejaría a la ficha pintando media
 * lectura durante un frame.
 */
export const useInitiative = (initiativeId: string | undefined) => {
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [model, setModel] = useState<EvaluationModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!initiativeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mismo reset síncrono que useSquad
      setInitiative(null);
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    Promise.all([
      initiativeService.get(initiativeId),
      initiativeService.getEvaluationModel(),
    ]).then(
      ([dto, evaluationModel]) => {
        if (cancelled) return;
        setInitiative(initiativeAdapter.toEntity(dto));
        setModel(evaluationModel);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error ? err.message : "Error al cargar la iniciativa"
          );
        }
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [initiativeId, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  return { initiative, model, loading, error, notFound, refetch };
};
