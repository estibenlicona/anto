import { useCallback, useEffect, useMemo, useState } from "react";
import { billingService, type PrefactureDto } from "../services/billingService";
import { billingAdapter } from "../adapters/BillingAdapter";

const LOAD_ERROR = "Error al cargar la prefacturación";

/** Las filas del período y las tres cifras del resumen, derivadas de ellas. */
export const useBillingPeriod = (period: string) => {
  const [rows, setRows] = useState<PrefactureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    billingService.listPeriod(period).then(
      (result) => {
        if (cancelled) return;
        setRows(result);
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
  }, [period, reloadTick]);

  const refetch = useCallback(() => {
    setError(null);
    setReloadTick((n) => n + 1);
  }, []);

  const items = useMemo(() => rows.map(billingAdapter.toRow), [rows]);
  const stats = useMemo(() => billingAdapter.stats(rows), [rows]);
  return { rows: items, stats, loading, error, refetch };
};
