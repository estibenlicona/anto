import { useCallback, useEffect, useState } from "react";
import { capacityOverviewService } from "../services/capacityOverviewService";
import {
  capacityOverviewAdapter,
  peopleWithMargin,
  squadsByNeed,
  unassignedPeople,
  type CapacityOverview,
} from "../adapters/CapacityOverviewAdapter";

export const useCapacityOverview = () => {
  const [overview, setOverview] = useState<CapacityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    capacityOverviewService.getOverview().then(
      (dto) => {
        if (cancelled) return;
        setOverview(capacityOverviewAdapter.toEntity(dto));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el resumen"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  // El estado de carga se marca acá (evento), no dentro del efecto.
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  return {
    overview,
    loading,
    error,
    refetch,
    peopleWithMargin: overview ? peopleWithMargin(overview.people) : [],
    unassignedPeople: overview ? unassignedPeople(overview.people) : [],
    squadsByNeed: overview ? squadsByNeed(overview.squads) : [],
  };
};
