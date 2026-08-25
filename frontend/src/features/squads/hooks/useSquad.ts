import { useCallback, useEffect, useState } from "react";
import { squadService } from "../services/squadService";
import { squadAdapter, type Squad } from "../adapters/SquadAdapter";

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 404
  );
}

/** Una célula por id, con `notFound` separado de `error` para el estado vacío del detalle. */
export const useSquad = (squadId: string | undefined) => {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!squadId) {
      setSquad(null);
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    squadService.getById(squadId).then(
      (dto) => {
        if (cancelled) return;
        setSquad(squadAdapter.toEntity(dto));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error ? err.message : "Error al cargar la célula"
          );
        }
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [squadId, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  return { squad, loading, error, notFound, refetch };
};
