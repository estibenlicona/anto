import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import {
  initiativeService,
  type InitiativeFilters,
  type InitiativeStatus,
} from "../services/initiativeService";
import {
  initiativeAdapter,
  type Initiative,
} from "../adapters/InitiativeAdapter";

const DEFAULT_PAGE_SIZE = 10;
const LOAD_ERROR = "Error al cargar las iniciativas";

export const useInitiatives = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statuses, setStatuses] = useState<InitiativeStatus[]>([]);
  const [squadIds, setSquadIds] = useState<string[]>([]);
  const [tallas, setTallas] = useState<string[]>([]);

  const filters: InitiativeFilters = {
    search: debouncedSearch,
    status: statuses,
    squadId: squadIds,
    talla: tallas,
  };

  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    initiativeService
      .list(page, pageSize, {
        search: debouncedSearch,
        status: statuses,
        squadId: squadIds,
        talla: tallas,
      })
      .then(
        (result) => {
          if (cancelled) return;
          setInitiatives(result.items.map(initiativeAdapter.toEntity));
          setTotal(result.totalCount);
          setTotalPages(result.totalPages);
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
  }, [page, pageSize, debouncedSearch, statuses, squadIds, tallas, reloadTick]);

  // El estado de carga se fija en el evento, no en el efecto (regla de hooks del repo).
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((n) => n + 1);
  }, []);

  // Cualquier cambio de filtro vuelve a la primera página.
  const onPageSizeChange = useCallback((v: number) => {
    setLoading(true);
    setPage(1);
    setPageSize(v);
  }, []);
  const onSearchChange = useCallback((v: string) => {
    setPage(1);
    setSearch(v);
  }, []);
  const onStatusesChange = useCallback((v: InitiativeStatus[]) => {
    setLoading(true);
    setPage(1);
    setStatuses(v);
  }, []);
  const onSquadIdsChange = useCallback((v: string[]) => {
    setLoading(true);
    setPage(1);
    setSquadIds(v);
  }, []);
  const onTallasChange = useCallback((v: string[]) => {
    setLoading(true);
    setPage(1);
    setTallas(v);
  }, []);

  return {
    initiatives,
    loading,
    error,
    refetch: load,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange: useCallback((p: number) => {
      setLoading(true);
      setPage(p);
    }, []),
    onPageSizeChange,
    search,
    onSearchChange,
    statuses,
    onStatusesChange,
    squadIds,
    onSquadIdsChange,
    tallas,
    onTallasChange,
    filters,
  };
};
