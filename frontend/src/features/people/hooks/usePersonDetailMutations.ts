import { useState } from "react";
import { personDetailService } from "../services/personDetailService";

type MutationResult = { success: boolean; error?: string };

type HttpError = {
  response?: { status?: number; data?: { message?: string } };
};

/**
 * El 409 trae el mensaje del servidor porque dice *quién* tiene esa identidad:
 * "ya está vinculada" a secas no le dice al lead a quién mirar.
 */
function linkErrorMessage(err: unknown): string {
  const response = (err as HttpError)?.response;
  if (response?.status === 409) {
    return (
      response.data?.message ?? "Esa identidad ya está vinculada a otra persona"
    );
  }
  if (response?.status === 404) {
    return "Ese usuario ya no existe en Azure DevOps";
  }
  return err instanceof Error
    ? err.message
    : "No se pudo vincular la identidad";
}

/** Mutaciones propias del detalle: vincular la identidad DevOps. */
export const usePersonDetailMutations = () => {
  const [linking, setLinking] = useState(false);

  /** `devOpsUserId`: el identificador del usuario de Azure DevOps encontrado por correo. */
  const linkIdentity = async (
    personId: string,
    devOpsUserId: string
  ): Promise<MutationResult> => {
    try {
      setLinking(true);
      await personDetailService.linkDevOpsIdentity(personId, devOpsUserId);
      return { success: true };
    } catch (err) {
      return { success: false, error: linkErrorMessage(err) };
    } finally {
      setLinking(false);
    }
  };

  return { linkIdentity, linking };
};
