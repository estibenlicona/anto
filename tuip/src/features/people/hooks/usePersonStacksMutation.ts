import { useState } from "react";
import { personService, type PersonStackDto } from "../services/personService";

type MutationResult = { success: boolean; error?: string };

export const usePersonStacksMutation = () => {
  const [saving, setSaving] = useState(false);

  const replaceStacks = async (
    personId: string,
    stacks: PersonStackDto[]
  ): Promise<MutationResult> => {
    try {
      setSaving(true);
      await personService.replaceStacks(personId, stacks);
      return { success: true };
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      return {
        success: false,
        error:
          message ??
          (err instanceof Error
            ? err.message
            : "No se pudieron guardar los stacks"),
      };
    } finally {
      setSaving(false);
    }
  };

  return { replaceStacks, saving };
};
