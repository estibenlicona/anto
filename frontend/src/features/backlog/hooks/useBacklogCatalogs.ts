import { useEffect, useState } from "react";
import {
  backlogService,
  type BacklogCatalogsDto,
} from "../services/backlogService";

/** Iniciativas activas, categorías BAU y motivos de rechazo: estáticos durante la sesión. */
export const useBacklogCatalogs = () => {
  const [catalogs, setCatalogs] = useState<BacklogCatalogsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    backlogService.getCatalogs().then(
      (dto) => {
        if (!cancelled) setCatalogs(dto);
      },
      (err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar los catálogos"
          );
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogs, loading: catalogs === null && error === null, error };
};
