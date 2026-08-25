import { useState } from "react";
import {
  skillsService,
  type SkillLevel,
  type UpsertSkillRequest,
} from "../services/skillsService";

export interface MutationResult {
  success: boolean;
  error?: string;
  /**
   * El 400 de borrar una habilidad en uso trae la salida adentro. La pantalla
   * la necesita para ofrecer desactivar en vez de repetir el intento.
   */
  canDeactivate?: boolean;
}

function errorOf(err: unknown, fallback: string): MutationResult {
  const data = (
    err as {
      response?: { data?: { message?: string; canDeactivate?: boolean } };
    }
  )?.response?.data;
  return {
    success: false,
    error: data?.message ?? (err instanceof Error ? err.message : fallback),
    canDeactivate: data?.canDeactivate === true,
  };
}

export const useSkillMutations = () => {
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
    create: (request: UpsertSkillRequest) =>
      run(() => skillsService.create(request), "No se pudo crear la habilidad"),
    update: (id: string, request: UpsertSkillRequest) =>
      run(
        () => skillsService.update(id, request),
        "No se pudo guardar la habilidad"
      ),
    setCriteria: (id: string, level: SkillLevel, criteria: string[]) =>
      run(
        () => skillsService.setCriteria(id, level, criteria),
        "No se pudieron guardar los criterios"
      ),
    setExpectation: (id: string, position: string, level: SkillLevel | null) =>
      run(
        () => skillsService.setExpectation(id, position, level),
        "No se pudo guardar el nivel esperado"
      ),
    remove: (id: string) =>
      run(() => skillsService.remove(id), "No se pudo eliminar la habilidad"),
    deactivate: (id: string) =>
      run(
        () => skillsService.deactivate(id),
        "No se pudo desactivar la habilidad"
      ),
    activate: (id: string) =>
      run(() => skillsService.activate(id), "No se pudo activar la habilidad"),
  };
};
