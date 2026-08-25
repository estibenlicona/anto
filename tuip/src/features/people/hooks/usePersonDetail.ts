import { useCallback, useEffect, useState } from "react";
import { personDetailService } from "../services/personDetailService";
import {
  personDetailAdapter,
  type PersonDetail,
} from "../adapters/PersonDetailAdapter";

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 404
  );
}

/**
 * El detalle agregado de una persona (una sola llamada, ver design D1), con
 * `notFound` separado de `error` para el estado vacío de la página. Mismo
 * patrón que useSquad: el estado de carga del refetch se marca en el evento.
 */
export const usePersonDetail = (personId: string | undefined) => {
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    // Sin id no hay nada que pedir: el "no encontrada" se deriva abajo.
    if (!personId) return;
    let cancelled = false;
    personDetailService.getDetail(personId).then(
      (dto) => {
        if (cancelled) return;
        setDetail(personDetailAdapter.toEntity(dto));
        setNotFound(false);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error ? err.message : "Error al cargar la persona"
          );
        }
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [personId, reloadTick]);

  const refetch = useCallback(() => {
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  if (!personId) {
    return {
      detail: null,
      loading: false,
      error: null,
      notFound: true,
      refetch,
    };
  }
  return { detail, loading, error, notFound, refetch };
};
