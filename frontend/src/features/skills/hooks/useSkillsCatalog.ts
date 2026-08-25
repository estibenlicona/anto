import { useCallback, useEffect, useState } from "react";
import { skillsService } from "../services/skillsService";
import {
  toCatalogView,
  type SkillsCatalogView,
} from "../adapters/SkillsAdapter";

/**
 * El catálogo se pide entero y se muestra lo que llega: es una pantalla de
 * Admin sobre una docena de habilidades, no un listado paginado.
 */
export const useSkillsCatalog = () => {
  const [catalog, setCatalog] = useState<SkillsCatalogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    skillsService.get().then(
      (dto) => {
        if (cancelled) return;
        setCatalog(toCatalogView(dto));
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar el catálogo"
        );
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  return { catalog, loading, error, refetch };
};
