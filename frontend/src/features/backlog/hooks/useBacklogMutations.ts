import { useState } from "react";
import {
  backlogService,
  type ClassifyRequest,
  type RejectRequest,
} from "../services/backlogService";
import { notifyBacklogChanged } from "./backlogEvents";

type MutationResult = { success: boolean; error?: string };

function messageOf(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response
    ?.data;
  if (data?.message) return data.message;
  return err instanceof Error ? err.message : fallback;
}

export const useBacklogMutations = () => {
  const [saving, setSaving] = useState(false);

  const run = async (
    fn: () => Promise<void>,
    fallback: string
  ): Promise<MutationResult> => {
    try {
      setSaving(true);
      await fn();
      notifyBacklogChanged();
      return { success: true };
    } catch (err) {
      return { success: false, error: messageOf(err, fallback) };
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    classify: (id: string, request: ClassifyRequest) =>
      run(
        () => backlogService.classify(id, request),
        "No se pudo guardar la clasificación"
      ),
    skip: (id: string) =>
      run(() => backlogService.skip(id), "No se pudo saltar la historia"),
    undo: (id: string) =>
      run(() => backlogService.undo(id), "No se pudo deshacer"),
    reject: (id: string, request: RejectRequest) =>
      run(
        () => backlogService.reject(id, request),
        "No se pudo rechazar la historia"
      ),
  };
};
