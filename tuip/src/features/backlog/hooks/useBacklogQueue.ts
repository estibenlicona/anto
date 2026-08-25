import { useCallback, useEffect, useMemo, useState } from "react";
import {
  backlogService,
  type BacklogCatalogsDto,
  type BacklogQueueFilters,
} from "../services/backlogService";
import { backlogAdapter, type BacklogQueue } from "../adapters/BacklogAdapter";

/**
 * La cola es estado del servidor (design.md D4): siempre se muestra la que
 * llega y la historia en curso es la primera. El estado de carga del refetch
 * se marca en el evento, no dentro del efecto.
 */
export const useBacklogQueue = (
  filters: BacklogQueueFilters,
  catalogs: BacklogCatalogsDto | null
) => {
  const [queue, setQueue] = useState<BacklogQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const { squadId, personId, status } = filters;

  useEffect(() => {
    let cancelled = false;
    backlogService.getQueue({ squadId, personId, status }).then(
      (dto) => {
        if (cancelled) return;
        setQueue(backlogAdapter.toQueue(dto, catalogs));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el backlog"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [squadId, personId, status, catalogs, reloadTick]);

  const refetch = useCallback(() => {
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  const items = useMemo(() => queue?.items ?? [], [queue]);
  return {
    items,
    summary: queue?.summary ?? null,
    current: items[0] ?? null,
    loading,
    error,
    refetch,
  };
};
