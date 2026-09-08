import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { teamService } from "../services/teamService";
import { teamAdapter, type Team } from "../adapters/TeamAdapter";

const DEFAULT_PAGE_SIZE = 10;
// Suficiente para traer el catálogo completo en una sola página: el resumen
// (total de equipos y de células agrupadas) tiene que leerse sobre el
// conjunto completo, nunca sobre la búsqueda o la página activas del
// listado — por eso se pide aparte, sin término de búsqueda.
const ALL_TEAMS_PAGE_SIZE = 1000;

export const useTeams = (initialPageSize: number = DEFAULT_PAGE_SIZE) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [totalTeamsCount, setTotalTeamsCount] = useState(0);
  const [totalSquadCount, setTotalSquadCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mismo criterio que useSquads
    setLoading(true);
    setError(null);
    teamService.list(page, pageSize, debouncedSearch || undefined).then(
      (result) => {
        if (cancelled) return;
        setTeams(result.items.map(teamAdapter.toEntity));
        setTotal(result.totalCount);
        setTotalPages(result.totalPages);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar los equipos"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, reloadTick]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mismo criterio que el efecto de arriba
    setStatsLoading(true);
    teamService.list(1, ALL_TEAMS_PAGE_SIZE).then(
      (result) => {
        if (cancelled) return;
        setTotalTeamsCount(result.totalCount);
        setTotalSquadCount(
          result.items.reduce((sum, t) => sum + t.squadCount, 0)
        );
        setStatsLoading(false);
      },
      () => {
        if (cancelled) return;
        setStatsLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

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

  return {
    teams,
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
    totalTeamsCount,
    totalSquadCount,
    statsLoading,
  };
};
