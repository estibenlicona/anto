import { useCallback, useEffect, useState } from "react";
import { squadService, type SquadsStats } from "../services/squadService";

/**
 * Resumen agregado sobre todas las células registradas — independiente de
 * `useSquads` (página, búsqueda y filtro no lo afectan).
 */
export const useSquadsStats = () => {
  const [stats, setStats] = useState<SquadsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStats(await squadService.getStats());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el resumen"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    squadService.getStats().then(
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
  }, []);

  return { stats, loading, error, refetch: load };
};
