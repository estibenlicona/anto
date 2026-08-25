import type { PersonStackDto } from "../../services/personService";

export interface StacksErrors {
  primary?: string;
  duplicates?: string;
}

/** Un único principal, obligatorio si hay stacks; sin repetidos; niveles 1–4. */
export function validateStacks(stacks: PersonStackDto[]): StacksErrors {
  const errors: StacksErrors = {};
  const primaries = stacks.filter((s) => s.isPrimary).length;
  if (stacks.length > 0 && primaries === 0) {
    errors.primary = "Selecciona el stack principal";
  }
  if (primaries > 1) {
    errors.primary = "Sólo un stack puede ser el principal";
  }
  const names = stacks.map((s) => s.name);
  if (new Set(names).size !== names.length) {
    errors.duplicates = "Hay stacks repetidos";
  }
  return errors;
}

export function isStacksValid(stacks: PersonStackDto[]): boolean {
  return Object.keys(validateStacks(stacks)).length === 0;
}
