import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import type { Seniority } from "@features/people/services/personService";
import { allocationService } from "../services/allocationService";
import {
  allocationAdapter,
  type Allocation,
} from "../adapters/AllocationAdapter";

const DEFAULT_PAGE_SIZE = 10;

export const useAllocations = (squadId: string | undefined) => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const previousSquadId = useRef(squadId);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [seniorities, setSeniorities] = useState<Seniority[]>([]);

  // Un solo camino de carga (ver useSquads): el efecto lo dispara al cambiar
  // los parámetros y `refetch` lo vuelve a correr tras una mutación.
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!squadId) {
      setAllocations([]);
      setError(null);
      setLoading(false);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    // Al cambiar de célula, la página vuelve a 1 antes de pedir — este efecto
    // se vuelve a correr cuando `page` cambie, así que no hace falta pedir acá.
    if (previousSquadId.current !== squadId) {
      previousSquadId.current = squadId;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    allocationService
      .listBySquad(
        squadId,
        page,
        pageSize,
        debouncedSearch || undefined,
        seniorities
      )
      .then(
        (result) => {
          if (cancelled) return;
          setAllocations(result.items.map(allocationAdapter.toEntity));
          setTotal(result.totalCount);
          setTotalPages(result.totalPages);
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar las asignaciones"
          );
          setLoading(false);
        }
      );
    return () => {
      cancelled = true;
    };
  }, [squadId, page, pageSize, debouncedSearch, seniorities, reloadTick]);

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

  const onSenioritiesChange = useCallback((values: Seniority[]) => {
    setPage(1);
    setSeniorities(values);
  }, []);

  return {
    allocations,
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
    seniorities,
    onSenioritiesChange,
  };
};
