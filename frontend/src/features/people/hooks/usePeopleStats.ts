import { useCallback, useEffect, useState } from "react";
import { personService, type PeopleStats } from "../services/personService";

/**
 * Resumen agregado sobre todas las personas registradas — independiente de
 * `usePeople` (página, búsqueda y filtros no lo afectan).
 */
export const usePeopleStats = () => {
  const [stats, setStats] = useState<PeopleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await personService.getStats();
      setStats(result);
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
    personService.getStats().then(
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
