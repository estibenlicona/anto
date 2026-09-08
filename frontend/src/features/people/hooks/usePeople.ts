import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import {
  scopeParam,
  useCapacityScope,
} from "@features/capacity-shell/CapacityScopeContext";
import {
  personService,
  type Level,
  type Seniority,
} from "../services/personService";
import { personAdapter, type Person } from "../adapters/PersonAdapter";

const DEFAULT_PAGE_SIZE = 10;

/**
 * `initialPageSize` existe para consumidores que necesitan (casi) todas las
 * personas de una — por ejemplo el selector de persona del formulario de
 * asignaciones en `AllocationsContainer` — sin duplicar el hook. La pantalla
 * de Personas no lo pasa, así que sigue arrancando en 10 como siempre.
 */
export const usePeople = (initialPageSize: number = DEFAULT_PAGE_SIZE) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [levels, setLevels] = useState<Level[]>([]);
  const [seniorities, setSeniorities] = useState<Seniority[]>([]);
  const [stacks, setStacks] = useState<string[]>([]);
  // El alcance lo declara la ruta: "Mi Línea" pide recorte, el resto no.
  const scope = scopeParam(useCapacityScope());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await personService.list(
        page,
        pageSize,
        debouncedSearch,
        levels,
        seniorities,
        stacks,
        scope
      );
      setPeople(result.items.map(personAdapter.toEntity));
      setTotal(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las personas"
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, levels, seniorities, stacks, scope]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset síncrono anterior a la regla; se mantiene tal cual (deuda ajena a este change)
    setLoading(true);
    setError(null);
    personService
      .list(page, pageSize, debouncedSearch, levels, seniorities, stacks, scope)
      .then(
        (result) => {
          if (cancelled) return;
          setPeople(result.items.map(personAdapter.toEntity));
          setTotal(result.totalCount);
          setTotalPages(result.totalPages);
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          setError(
            err instanceof Error ? err.message : "Error al cargar las personas"
          );
          setLoading(false);
        }
      );
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, levels, seniorities, stacks, scope]);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPage(1);
    setPageSize(newPageSize);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const onStacksChange = useCallback((values: string[]) => {
    setPage(1);
    setStacks(values);
  }, []);

  const onLevelsChange = useCallback((values: Level[]) => {
    setPage(1);
    setLevels(values);
  }, []);

  const onSenioritiesChange = useCallback((values: Seniority[]) => {
    setPage(1);
    setSeniorities(values);
  }, []);

  return {
    people,
    loading,
    error,
    refetch: load,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange: setPage,
    onPageSizeChange,
    search,
    onSearchChange,
    levels,
    onLevelsChange,
    seniorities,
    onSenioritiesChange,
    stacks,
    onStacksChange,
  };
};
