import { useCallback, useEffect, useState } from "react";
import {
  expertiseLinesService,
  type ExpertiseLineDto,
  type RosterPersonDto,
} from "../services/expertiseLinesService";
import {
  toLinesIndex,
  toUnassignedPeople,
  type LinesIndexView,
  type UnassignedPeopleView,
} from "../adapters/ExpertiseLinesAdapter";

/**
 * El índice y el padrón de personas llegan juntos y se piden enteros: son una
 * docena de líneas y menos de veinte personas, no un listado paginado. Van en
 * el mismo hook porque cambian a la vez — asignar a alguien mueve los dos.
 */
export const useExpertiseLines = (search: string) => {
  const [lines, setLines] = useState<ExpertiseLineDto[] | null>(null);
  const [roster, setRoster] = useState<RosterPersonDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      expertiseLinesService.list(),
      expertiseLinesService.roster(),
    ]).then(
      ([listed, people]) => {
        if (cancelled) return;
        setLines(listed);
        setRoster(people);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar las líneas"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const refetch = useCallback(() => {
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  // El filtro se aplica sobre lo que ya llegó: buscar no vuelve a pedir.
  const index: LinesIndexView | null = lines
    ? toLinesIndex(lines, search)
    : null;
  const unassigned: UnassignedPeopleView | null = roster
    ? toUnassignedPeople(roster)
    : null;

  return { lines, roster, index, unassigned, loading, error, refetch };
};
