import { useState } from "react";
import { teamService } from "../services/teamService";
import {
  teamAdapter,
  type Team,
  type TeamFormValues,
} from "../adapters/TeamAdapter";

type MutationResult = { success: boolean; error?: string };

/**
 * A diferencia de `useSquadMutations` (que sólo lee `err.message`), acá se
 * lee primero el cuerpo de la respuesta: el guard de eliminación (409) y el
 * nombre duplicado (400) viajan en `{ message }`, y `err.message` de axios
 * sólo trae el texto genérico del status ("Request failed with status code
 * 409"). Mismo patrón que `useSkillMutations`/`useLineMutations`.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response
    ?.data;
  return data?.message ?? (err instanceof Error ? err.message : fallback);
}

export const useTeamMutations = () => {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const create = async (values: TeamFormValues): Promise<MutationResult> => {
    try {
      setCreating(true);
      await teamService.create(teamAdapter.toCreateRequest(values));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al crear el equipo"),
      };
    } finally {
      setCreating(false);
    }
  };

  const update = async (
    team: Team,
    values: TeamFormValues
  ): Promise<MutationResult> => {
    try {
      setUpdating(true);
      await teamService.update(team.id, teamAdapter.toUpdateRequest(values));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al editar el equipo"),
      };
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (team: Team): Promise<MutationResult> => {
    try {
      setRemoving(true);
      await teamService.remove(team.id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "Error al eliminar el equipo"),
      };
    } finally {
      setRemoving(false);
    }
  };

  return { create, update, remove, creating, updating, removing };
};
