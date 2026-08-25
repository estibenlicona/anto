import { useState } from "react";
import {
  expertiseLinesService,
  type UpsertExpertiseLineRequest,
} from "../services/expertiseLinesService";

export interface MutationResult {
  success: boolean;
  error?: string;
}

function errorOf(err: unknown, fallback: string): MutationResult {
  const message = (err as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return {
    success: false,
    error: message ?? (err instanceof Error ? err.message : fallback),
  };
}

export const useLineMutations = () => {
  const [saving, setSaving] = useState(false);

  const run = async (
    action: () => Promise<unknown>,
    fallback: string
  ): Promise<MutationResult> => {
    setSaving(true);
    try {
      await action();
      return { success: true };
    } catch (err) {
      return errorOf(err, fallback);
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    create: (request: UpsertExpertiseLineRequest) =>
      run(
        () => expertiseLinesService.create(request),
        "No se pudo crear la línea"
      ),
    update: (id: string, request: UpsertExpertiseLineRequest) =>
      run(
        () => expertiseLinesService.update(id, request),
        "No se pudo guardar la línea"
      ),
    setLead: (id: string, personId: string | null) =>
      run(
        () => expertiseLinesService.setLead(id, personId),
        "No se pudo cambiar el lead"
      ),
    addPeople: (id: string, personIds: string[]) =>
      run(
        () => expertiseLinesService.addPeople(id, personIds),
        "No se pudieron asignar las personas"
      ),
    removePerson: (id: string, personId: string) =>
      run(
        () => expertiseLinesService.removePerson(id, personId),
        "No se pudo quitar a la persona"
      ),
    archive: (id: string) =>
      run(
        () => expertiseLinesService.archive(id),
        "No se pudo archivar la línea"
      ),
    reactivate: (id: string) =>
      run(
        () => expertiseLinesService.reactivate(id),
        "No se pudo reactivar la línea"
      ),
  };
};
