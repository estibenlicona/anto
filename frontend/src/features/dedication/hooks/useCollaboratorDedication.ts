import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { dedicationService } from "../services/dedicationService";
import {
  dedicationAdapter,
  type CollaboratorList,
} from "../adapters/DedicationAdapter";

const DEFAULT_PAGE_SIZE = 10;

interface Settled {
  /** La petición a la que responde lo guardado; distinta de la vigente = cargando. */
  key: string;
  list: CollaboratorList | null;
  error: string | null;
}

/**
 * El balance de carga: una fila por colaborador del chapter, con sus
 * filtros, búsqueda con debounce y paginación. El estado de carga no se fija
 * a mano: se deriva de si la última respuesta corresponde a la petición
 * vigente, así un error conserva la lista anterior con su resumen.
 */
export const useCollaboratorDedication = (
  initialSprint: string | null = null,
  onSprintChange?: (name: string | null) => void,
  initialPageSize: number = DEFAULT_PAGE_SIZE
) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [squadIds, setSquadIds] = useState<string[]>([]);
  /**
   * El sprint del que habla el listado entero. `null` = el en curso, que es lo
   * que responde el servidor cuando no se pide otro; así el primer render no
   * tiene que saber cómo se llama.
   */
  const [sprint, setSprint] = useState<string | null>(initialSprint);
  const [reloadTick, setReloadTick] = useState(0);
  const [settled, setSettled] = useState<Settled>({
    key: "",
    list: null,
    error: null,
  });

  const requestKey = JSON.stringify([
    page,
    pageSize,
    debouncedSearch,
    squadIds,
    sprint,
    reloadTick,
  ]);

  useEffect(() => {
    let cancelled = false;
    dedicationService
      .listCollaborators(
        { search: debouncedSearch, squadIds },
        { page, pageSize },
        sprint ?? undefined
      )
      .then(
        (dto) => {
          if (cancelled) return;
          setSettled({
            key: requestKey,
            list: dedicationAdapter.toCollaboratorList(dto),
            error: null,
          });
        },
        (err) => {
          if (cancelled) return;
          setSettled((prev) => ({
            key: requestKey,
            list: prev.list,
            error:
              err instanceof Error
                ? err.message
                : "Error al cargar el balance de carga",
          }));
        }
      );
    return () => {
      cancelled = true;
    };
  }, [
    page,
    pageSize,
    debouncedSearch,
    squadIds,
    sprint,
    reloadTick,
    requestKey,
  ]);

  const loading = settled.key !== requestKey;
  const { list } = settled;
  const error = loading ? null : settled.error;

  const refetch = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  const onPageSizeChange = useCallback((next: number) => {
    setPage(1);
    setPageSize(next);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const onSquadIdsChange = useCallback((values: string[]) => {
    setPage(1);
    setSquadIds(values);
  }, []);

  /**
   * Moverse un sprint. El servidor sabe cuáles hay y cuál sigue; el hook sólo
   * conoce el que está mostrando, así que la navegación se resuelve contra la
   * última respuesta y vuelve a la primera página: cambiar de sprint cambia
   * quién aparece primero.
   */
  const onSprintStep = useCallback(
    (direction: "previous" | "next") => {
      const current = settled.list?.sprint;
      if (!current) return;
      const next =
        direction === "previous" ? current.previousName : current.nextName;
      if (next === null) return;
      setPage(1);
      setSprint(next);
      onSprintChange?.(next);
    },
    [settled.list, onSprintChange]
  );

  return {
    rows: list?.rows ?? [],
    summary: list?.summary ?? null,
    sprint: list?.sprint ?? null,
    historyWindowSprints: list?.historyWindowSprints ?? null,
    minHistorySprints: list?.minHistorySprints ?? null,
    hoursPerSprint: list?.hoursPerSprint ?? null,
    lastSyncedAt: list?.lastSyncedAt ?? null,
    /** Si ya llegó al menos una respuesta: los indicadores no se desmontan al refrescar. */
    loaded: list !== null,
    loading,
    error,
    refetch,
    page,
    pageSize,
    total: list?.totalCount ?? 0,
    totalPages: list?.totalPages ?? 0,
    onPageChange: setPage,
    onPageSizeChange,
    search,
    onSearchChange,
    squadIds,
    onSquadIdsChange,
    onSprintStep,
  };
};
