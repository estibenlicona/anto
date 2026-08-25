import { useState } from "react";
import { allocationService } from "../services/allocationService";
import {
  allocationAdapter,
  type Allocation,
  type AllocationFormValues,
} from "../adapters/AllocationAdapter";

type MutationResult = { success: boolean; error?: string };

function extractErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const useAllocationMutations = () => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const create = async (
    squadId: string,
    values: AllocationFormValues
  ): Promise<MutationResult> => {
    try {
      setCreating(true);
      await allocationService.create(
        squadId,
        allocationAdapter.toCreateRequest(values)
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al asignar la persona"),
      };
    } finally {
      setCreating(false);
    }
  };

  const update = async (
    allocation: Allocation,
    values: AllocationFormValues
  ): Promise<MutationResult> => {
    try {
      setUpdating(true);
      await allocationService.update(
        allocation.id,
        allocationAdapter.toUpdateRequest(values)
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al editar la asignación"),
      };
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (allocation: Allocation): Promise<MutationResult> => {
    try {
      setRemoving(true);
      await allocationService.remove(allocation.id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al quitar la asignación"),
      };
    } finally {
      setRemoving(false);
    }
  };

  return { create, update, remove, creating, updating, removing };
};
