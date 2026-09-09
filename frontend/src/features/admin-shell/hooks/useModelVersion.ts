import { useCallback, useEffect, useState } from "react";
import type { EstimationModelVersion } from "@features/initiatives/services/evaluationModel";
import {
  estimationModelService,
  type ModelChangeEntry,
  type ModelValidationReport,
  type ModelVersionDiff,
  type ModelVersionStatus,
  type SaveDimensionsRequest,
  type SaveDriversRequest,
  type SaveMixRequest,
  type SaveTallaRulesRequest,
} from "../services/estimationModelService";

export interface UseModelVersion {
  version: EstimationModelVersion | null;
  status: ModelVersionStatus | null;
  report: ModelValidationReport | null;
  diff: ModelVersionDiff | null;
  history: ModelChangeEntry[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  /** Cuántos guardados lleva sin publicar. Lo cuenta el historial, no la pantalla. */
  unpublishedChanges: number;
  editable: boolean;
  saveDimensions: (request: Omit<SaveDimensionsRequest, "author">) => Promise<boolean>;
  saveDrivers: (request: Omit<SaveDriversRequest, "author">) => Promise<boolean>;
  saveTallaRules: (request: Omit<SaveTallaRulesRequest, "author">) => Promise<boolean>;
  saveMix: (request: Omit<SaveMixRequest, "author">) => Promise<boolean>;
  publish: (effectiveFrom: string, note: string) => Promise<boolean>;
  reload: () => Promise<void>;
}

const AUTHOR_FALLBACK = "Administrador";

/**
 * Una versión con todo lo que el editor necesita: su contenido, el estado de la
 * validación, el diff contra la vigente y el historial.
 *
 * La validación **no se calcula acá**. Cada guardado la devuelve y el hook la
 * guarda tal cual: si la pantalla la recalculara, mentiría apenas cambie una
 * regla en el servidor (design.md — D6).
 */
export function useModelVersion(
  modelId: string,
  versionNumber: number,
  author = AUTHOR_FALLBACK
): UseModelVersion {
  const [version, setVersion] = useState<EstimationModelVersion | null>(null);
  const [status, setStatus] = useState<ModelVersionStatus | null>(null);
  const [report, setReport] = useState<ModelValidationReport | null>(null);
  const [diff, setDiff] = useState<ModelVersionDiff | null>(null);
  const [history, setHistory] = useState<ModelChangeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [content, validation, changes, models] = await Promise.all([
        estimationModelService.getVersion(modelId, versionNumber),
        estimationModelService.getValidation(modelId, versionNumber),
        estimationModelService.getHistory(modelId, versionNumber),
        estimationModelService.getModels(),
      ]);

      setVersion(content);
      setReport(validation);
      setHistory(changes);
      setStatus(
        models
          .find((m) => m.id === modelId)
          ?.versions.find((v) => v.number === versionNumber)?.status ?? null
      );

      // El diff sólo tiene sentido si hay una vigente distinta con la que
      // compararse; el endpoint lo resuelve y devuelve `fromVersion` nulo.
      setDiff(await estimationModelService.getDiff(modelId, versionNumber));
    } catch {
      setError("No se pudo cargar la versión del modelo.");
    } finally {
      setLoading(false);
    }
  }, [modelId, versionNumber]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const write = useCallback(
    async (call: () => Promise<ModelValidationReport>) => {
      setSaving(true);
      setError(null);
      try {
        setReport(await call());
        await reload();
        return true;
      } catch (caught) {
        const code = (caught as { response?: { status?: number } }).response?.status;
        setError(
          code === 409
            ? "Esta versión ya está publicada y no se edita. Se crea una nueva a partir de ella."
            : "No se pudo guardar el cambio."
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [reload]
  );

  const publish = useCallback(
    async (effectiveFrom: string, note: string) => {
      setSaving(true);
      setError(null);
      try {
        const outcome = await estimationModelService.publish(modelId, versionNumber, {
          author,
          effectiveFrom,
          note,
        });
        setReport(outcome.report);
        await reload();
        return outcome.published;
      } catch {
        setError("No se pudo publicar la versión.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [author, modelId, versionNumber, reload]
  );

  return {
    version,
    status,
    report,
    diff,
    history,
    loading,
    saving,
    error,
    // Las entradas de secciones son los guardados; las de "publicar" son la
    // creación y la publicación, que no son cambios pendientes.
    unpublishedChanges: history.filter((entry) => entry.section !== "publicar").length,
    editable: status === "Borrador",
    saveDimensions: (request) =>
      write(() =>
        estimationModelService.saveDimensions(modelId, versionNumber, { author, ...request })
      ),
    saveDrivers: (request) =>
      write(() =>
        estimationModelService.saveDrivers(modelId, versionNumber, { author, ...request })
      ),
    saveTallaRules: (request) =>
      write(() =>
        estimationModelService.saveTallaRules(modelId, versionNumber, { author, ...request })
      ),
    saveMix: (request) =>
      write(() => estimationModelService.saveMix(modelId, versionNumber, { author, ...request })),
    publish,
    reload,
  };
}
