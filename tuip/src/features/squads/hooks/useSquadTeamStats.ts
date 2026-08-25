import { useCallback, useEffect, useState } from "react";
import { squadService, type SquadTeamStats } from "../services/squadService";

/** Resumen de las personas de una célula — se refetchea tras cada cambio de asignaciones. */
export const useSquadTeamStats = (squadId: string | undefined) => {
  const [stats, setStats] = useState<SquadTeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!squadId) {
      setStats(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    squadService.getTeamStats(squadId).then(
      (result) => {
        if (cancelled) return;
        setStats(result);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el resumen"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [squadId, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  return { stats, loading, error, refetch };
};
