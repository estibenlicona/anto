import { useState } from "react";
import { squadService } from "../services/squadService";
import {
  squadAdapter,
  type Squad,
  type SquadFormValues,
} from "../adapters/SquadAdapter";

type MutationResult = { success: boolean; error?: string };

function extractErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const useSquadMutations = () => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const create = async (values: SquadFormValues): Promise<MutationResult> => {
    try {
      setCreating(true);
      await squadService.create(squadAdapter.toCreateRequest(values));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al crear la célula"),
      };
    } finally {
      setCreating(false);
    }
  };

  const update = async (
    squad: Squad,
    values: SquadFormValues
  ): Promise<MutationResult> => {
    try {
      setUpdating(true);
      await squadService.update(squad.id, squadAdapter.toUpdateRequest(values));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al editar la célula"),
      };
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (squad: Squad): Promise<MutationResult> => {
    try {
      setRemoving(true);
      await squadService.remove(squad.id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al eliminar la célula"),
      };
    } finally {
      setRemoving(false);
    }
  };

  return { create, update, remove, creating, updating, removing };
};
