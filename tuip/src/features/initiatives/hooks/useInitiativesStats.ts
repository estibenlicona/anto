import { useCallback, useEffect, useState } from "react";
import {
  initiativeService,
  type InitiativesStats,
} from "../services/initiativeService";

const LOAD_ERROR = "Error al cargar el resumen";

/** Resumen sobre todas las iniciativas: la búsqueda y los filtros del listado no lo afectan. */
export const useInitiativesStats = () => {
  const [stats, setStats] = useState<InitiativesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStats(await initiativeService.getStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    initiativeService.getStats().then(
      (result) => {
        if (cancelled) return;
        setStats(result);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : LOAD_ERROR);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error, refetch: load };
};
