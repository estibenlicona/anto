import { useCallback, useEffect, useState } from "react";
import { billingService, type PrefactureDto } from "../services/billingService";

const LOAD_ERROR = "Error al cargar la prefactura";

export const useBilling = (id: string) => {
  const [billing, setBilling] = useState<PrefactureDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    billingService.get(id).then(
      (dto) => {
        if (cancelled) return;
        setBilling(dto);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) setNotFound(true);
        else setError(err instanceof Error ? err.message : LOAD_ERROR);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Las mutaciones devuelven el cierre entero: se reemplaza sin refetch. */
  const replace = useCallback((dto: PrefactureDto) => setBilling(dto), []);

  return { billing, loading, notFound, error, replace };
};
