import { useCallback, useEffect, useState } from "react";
import { absenceService } from "../services/absenceService";
import { absenceAdapter, type AbsencesMonth } from "../adapters/AbsenceAdapter";

/** El mes visible es estado del servidor: se pide entero y se muestra lo que llega. */
export const useAbsencesMonth = (monthKey: string) => {
  const [month, setMonth] = useState<AbsencesMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    absenceService.getByMonth(monthKey).then(
      (dto) => {
        if (cancelled) return;
        setMonth(absenceAdapter.toMonth(dto));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar las ausencias"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [monthKey, reloadTick]);

  // El estado de carga se marca acá (evento), no dentro del efecto.
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  return { month, loading, error, refetch };
};
