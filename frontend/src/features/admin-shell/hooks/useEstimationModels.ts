import { useCallback, useEffect, useState } from "react";
import {
  estimationModelService,
  type EstimationModelListItem,
  type ModelVersionListItem,
} from "../services/estimationModelService";

export interface UseEstimationModels {
  models: EstimationModelListItem[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  /** Crea una versión nueva a partir de otra y devuelve su número. */
  createVersionFrom: (modelId: string, sourceVersion: number) => Promise<number | null>;
  reload: () => Promise<void>;
}

/**
 * Qué acción le corresponde a una versión según su estado. Una versión
 * publicada no ofrece "editar" en gris: ofrece la única salida que tiene, que
 * es crear una nueva a partir de ella.
 */
export type VersionAction = "edit" | "createFrom" | "view";

export function actionFor(version: ModelVersionListItem): VersionAction {
  if (version.status === "Borrador") return "edit";
  if (version.status === "Vigente") return "createFrom";
  return "view";
}

/** Un modelo sin versión vigente no sirve para estimar, y la lista lo dice. */
export function hasCurrentVersion(model: EstimationModelListItem): boolean {
  return model.versions.some((v) => v.status === "Vigente");
}

/** El autor viaja en cada escritura desde la sesión; el backend no lo deduce. */
const AUTHOR_FALLBACK = "Administrador";

export function useEstimationModels(author = AUTHOR_FALLBACK): UseEstimationModels {
  const [models, setModels] = useState<EstimationModelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await estimationModelService.getModels();
      setModels(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar los modelos de estimación.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createVersionFrom = useCallback(
    async (modelId: string, sourceVersion: number) => {
      setCreating(true);
      setError(null);
      try {
        const created = await estimationModelService.createVersion(modelId, {
          author,
          sourceVersion,
        });
        await reload();
        return created.number;
      } catch (caught) {
        const status = (caught as { response?: { status?: number } }).response?.status;
        setError(
          status === 409
            ? "Ya hay un borrador abierto. Se publica o se descarta antes de abrir otro."
            : "No se pudo crear la versión."
        );
        return null;
      } finally {
        setCreating(false);
      }
    },
    [author, reload]
  );

  return { models, loading, error, creating, createVersionFrom, reload };
}
