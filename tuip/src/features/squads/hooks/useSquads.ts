import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { squadService, type Criticality } from "../services/squadService";
import { squadAdapter, type Squad } from "../adapters/SquadAdapter";

const DEFAULT_PAGE_SIZE = 10;

/**
 * `initialPageSize` existe para consumidores que necesitan (casi) todas las
 * células de una — por ejemplo el selector de célula en `AllocationsContainer`
 * — sin duplicar el hook. La pantalla de Células no lo pasa, así que sigue
 * arrancando en 10 como siempre.
 */
export const useSquads = (initialPageSize: number = DEFAULT_PAGE_SIZE) => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [criticalities, setCriticalities] = useState<Criticality[]>([]);

  // Un solo camino de carga: el efecto lo dispara al cambiar los parámetros y
  // `refetch` lo vuelve a correr tras una mutación. El `cancelled` evita que
  // una respuesta vieja pise a una más nueva si los parámetros cambian rápido.
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    squadService
      .list(page, pageSize, debouncedSearch || undefined, criticalities)
      .then(
        (result) => {
          if (cancelled) return;
          setSquads(result.items.map(squadAdapter.toEntity));
          setTotal(result.totalCount);
          setTotalPages(result.totalPages);
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          setError(
            err instanceof Error ? err.message : "Error al cargar las células"
          );
          setLoading(false);
        }
      );
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, criticalities, reloadTick]);

  const refetch = useCallback(() => {
    setReloadTick((tick) => tick + 1);
  }, []);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPage(1);
    setPageSize(newPageSize);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const onCriticalitiesChange = useCallback((values: Criticality[]) => {
    setPage(1);
    setCriticalities(values);
  }, []);

  return {
    squads,
    loading,
    error,
    refetch,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange: setPage,
    onPageSizeChange,
    search,
    onSearchChange,
    criticalities,
    onCriticalitiesChange,
  };
};
