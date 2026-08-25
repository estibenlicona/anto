import { useState } from "react";
import { personService } from "../services/personService";
import {
  personAdapter,
  type Person,
  type PersonFormValues,
} from "../adapters/PersonAdapter";

type MutationResult = { success: boolean; error?: string };

function extractErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

// El alta/edición reales no aceptan providerId — se asigna con una llamada
// aparte (ver personService.assignProvider), sólo cuando corresponde.
async function assignProviderIfNeeded(id: string, values: PersonFormValues) {
  if (values.isExternal && values.providerId) {
    await personService.assignProvider(id, values.providerId);
  }
}

export const usePersonMutations = () => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const create = async (values: PersonFormValues): Promise<MutationResult> => {
    try {
      setCreating(true);
      const created = await personService.create(
        personAdapter.toCreateRequest(values)
      );
      await assignProviderIfNeeded(created.id, values);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al crear la persona"),
      };
    } finally {
      setCreating(false);
    }
  };

  const update = async (
    person: Person,
    values: PersonFormValues
  ): Promise<MutationResult> => {
    try {
      setUpdating(true);
      await personService.update(
        person.id,
        personAdapter.toUpdateRequest(values)
      );
      await assignProviderIfNeeded(person.id, values);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al editar la persona"),
      };
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (person: Person): Promise<MutationResult> => {
    try {
      setRemoving(true);
      await personService.remove(person.id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al eliminar la persona"),
      };
    } finally {
      setRemoving(false);
    }
  };

  return { create, update, remove, creating, updating, removing };
};
