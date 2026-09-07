import { useCallback, useState } from "react";
import { dedicationService } from "../services/dedicationService";
import { notifyDedicationChanged } from "./dedicationEvents";

type SyncResult = { success: boolean; lastSyncedAt?: string; error?: string };

/**
 * Actualizar desde Azure DevOps: todas las colaboradores a cargo o una sola.
 * Nunca lanza: devuelve `{ success, error }` para que quien llama decida qué
 * mostrar. El error queda también en el hook para pintarlo en la pantalla y
 * conservar los datos anteriores con su hora.
 */
export const useDedicationSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      call: () => Promise<{ lastSyncedAt: string }>
    ): Promise<SyncResult> => {
      try {
        setSyncing(true);
        setError(null);
        const result = await call();
        notifyDedicationChanged();
        return { success: true, lastSyncedAt: result.lastSyncedAt };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar desde Azure DevOps";
        setError(message);
        return { success: false, error: message };
      } finally {
        setSyncing(false);
      }
    },
    []
  );

  const syncAll = useCallback(
    () => run(() => dedicationService.syncAll()),
    [run]
  );

  const syncCollaborator = useCallback(
    (personId: string) =>
      run(() => dedicationService.syncCollaborator(personId)),
    [run]
  );

  const clearError = useCallback(() => setError(null), []);

  return { syncAll, syncCollaborator, syncing, error, clearError };
};
