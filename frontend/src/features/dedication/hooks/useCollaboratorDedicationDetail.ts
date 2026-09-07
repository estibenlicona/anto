import { useCallback, useEffect, useState } from "react";
import { dedicationService } from "../services/dedicationService";
import {
  dedicationAdapter,
  type CollaboratorDetail,
} from "../adapters/DedicationAdapter";

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as { response?: { status?: number } }).response?.status === 404
  );
}

interface Settled {
  /** La petición a la que responde lo guardado; distinta de la vigente = cargando. */
  key: string;
  detail: CollaboratorDetail | null;
  error: string | null;
  notFound: boolean;
}

/**
 * La dedicación real de una capacidad en el sprint pedido (o el en curso).
 * Cambiar de sprint vuelve a pedir el detalle sin tirar el anterior, para que
 * la página no parpadee; `refetch` repite la última llamada (tras actualizar
 * desde DevOps o reasignar).
 */
export const useCollaboratorDedicationDetail = (
  personId: string | undefined,
  sprint: string | null
) => {
  const [reloadTick, setReloadTick] = useState(0);
  const [settled, setSettled] = useState<Settled>({
    key: "",
    detail: null,
    error: null,
    notFound: false,
  });

  const requestKey = JSON.stringify([personId ?? null, sprint, reloadTick]);

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    dedicationService.getCollaborator(personId, sprint ?? undefined).then(
      (dto) => {
        if (cancelled) return;
        setSettled({
          key: requestKey,
          detail: dedicationAdapter.toCollaboratorDetail(dto),
          error: null,
          notFound: false,
        });
      },
      (err) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setSettled({
            key: requestKey,
            detail: null,
            error: null,
            notFound: true,
          });
        } else {
          setSettled((prev) => ({
            key: requestKey,
            detail: prev.detail,
            error:
              err instanceof Error
                ? err.message
                : "Error al cargar la dedicación real",
            notFound: false,
          }));
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [personId, sprint, reloadTick, requestKey]);

  const refetch = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  // Sin id no hay a quién pedir: es "no encontrada" sin pasar por la red.
  if (!personId) {
    return {
      detail: null,
      loading: false,
      error: null,
      notFound: true,
      refetch,
    };
  }

  const loading = settled.key !== requestKey;
  return {
    detail: settled.detail,
    loading,
    error: loading ? null : settled.error,
    notFound: loading ? false : settled.notFound,
    refetch,
  };
};
