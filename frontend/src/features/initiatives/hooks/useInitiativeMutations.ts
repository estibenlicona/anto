import { useState } from "react";
import {
  initiativeService,
  type InitiativeInput,
  type InitiativeStatus,
} from "../services/initiativeService";

export type MutationResult = { success: boolean; error?: string };

function message(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response
    ?.data;
  if (data?.message) return data.message;
  return err instanceof Error ? err.message : fallback;
}

export const useInitiativeMutations = () => {
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const run = async (
    setFlag: (v: boolean) => void,
    fn: () => Promise<unknown>,
    fallback: string
  ): Promise<MutationResult> => {
    try {
      setFlag(true);
      await fn();
      return { success: true };
    } catch (err) {
      return { success: false, error: message(err, fallback) };
    } finally {
      setFlag(false);
    }
  };

  return {
    saving,
    changingStatus,
    create: (input: InitiativeInput) =>
      run(
        setSaving,
        () => initiativeService.create(input),
        "Error al crear la iniciativa"
      ),
    update: (id: string, input: InitiativeInput) =>
      run(
        setSaving,
        () => initiativeService.update(id, input),
        "Error al guardar la iniciativa"
      ),
    setStatus: (id: string, status: InitiativeStatus) =>
      run(
        setChangingStatus,
        () => initiativeService.setStatus(id, status),
        "Error al cambiar el estado"
      ),
  };
};
