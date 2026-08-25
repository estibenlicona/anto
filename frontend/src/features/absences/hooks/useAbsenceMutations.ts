import { useState } from "react";
import {
  absenceService,
  type CreateAbsenceRequest,
} from "../services/absenceService";

function messageOf(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response
    ?.data;
  if (data?.message) return data.message;
  return err instanceof Error ? err.message : fallback;
}

export const useAbsenceMutations = () => {
  const [saving, setSaving] = useState(false);

  const run = async (
    action: () => Promise<unknown>,
    fallback: string
  ): Promise<{ success: boolean; error?: string }> => {
    setSaving(true);
    try {
      await action();
      return { success: true };
    } catch (err) {
      return { success: false, error: messageOf(err, fallback) };
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    create: (request: CreateAbsenceRequest) =>
      run(
        () => absenceService.create(request),
        "No se pudo registrar la ausencia"
      ),
    approve: (id: string) =>
      run(() => absenceService.approve(id), "No se pudo aprobar la ausencia"),
    reject: (id: string, reason: string) =>
      run(
        () => absenceService.reject(id, reason),
        "No se pudo rechazar la ausencia"
      ),
  };
};
