import type { TeamFormValues } from "../adapters/TeamAdapter";

export type FieldErrors = Partial<Record<keyof TeamFormValues, string>>;

export function validate(values: TeamFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "El nombre es obligatorio";
  else if (values.name.length > 100)
    errors.name = "El nombre no puede superar los 100 caracteres";

  if (values.description.length > 500)
    errors.description = "La descripción no puede superar los 500 caracteres";

  return errors;
}

/** Cuántos obligatorios faltan: el pie del Drawer lo muestra tras un intento de envío. */
export function countMissingRequiredFields(values: TeamFormValues): number {
  return [values.name].filter((value) => !value.trim()).length;
}
