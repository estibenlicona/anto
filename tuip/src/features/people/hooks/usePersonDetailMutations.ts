import { useState } from "react";
import { personDetailService } from "../services/personDetailService";

type MutationResult = { success: boolean; error?: string };

function extractErrorMessage(err: unknown, fallback: string): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 409) return "El reporte ya no está pendiente de validar";
  if (status === 404) return "La identidad ya no está disponible";
  return err instanceof Error ? err.message : fallback;
}

/** Mutaciones propias del detalle: validar horas y vincular identidad DevOps. */
export const usePersonDetailMutations = () => {
  const [validating, setValidating] = useState(false);
  const [linking, setLinking] = useState(false);

  const validateHours = async (
    personId: string,
    sprint: string
  ): Promise<MutationResult> => {
    try {
      setValidating(true);
      await personDetailService.validateHours(personId, sprint);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "No se pudo validar el reporte"),
      };
    } finally {
      setValidating(false);
    }
  };

  const linkIdentity = async (
    personId: string,
    identityId: string
  ): Promise<MutationResult> => {
    try {
      setLinking(true);
      await personDetailService.linkDevOpsIdentity(personId, identityId);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, "No se pudo vincular la identidad"),
      };
    } finally {
      setLinking(false);
    }
  };

  return { validateHours, linkIdentity, validating, linking };
};
