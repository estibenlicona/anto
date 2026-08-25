import type { AllocationFormValues } from "../adapters/AllocationAdapter";

export type FieldErrors = Partial<Record<keyof AllocationFormValues, string>>;

export function validate(values: AllocationFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.personId) errors.personId = "Selecciona una persona";

  const dedicationValid =
    values.dedicationPercentage !== "" &&
    !Number.isNaN(Number(values.dedicationPercentage)) &&
    Number(values.dedicationPercentage) >= 1 &&
    Number(values.dedicationPercentage) <= 100;
  if (!dedicationValid) {
    errors.dedicationPercentage = "El % de dedicación debe estar entre 1 y 100";
  }

  const bauValid =
    values.bauPercentage !== "" &&
    !Number.isNaN(Number(values.bauPercentage)) &&
    Number(values.bauPercentage) >= 0 &&
    Number(values.bauPercentage) <= 100;
  if (!bauValid) {
    errors.bauPercentage = "El % BAU debe estar entre 0 y 100";
  }

  const transformationValid =
    values.transformationPercentage !== "" &&
    !Number.isNaN(Number(values.transformationPercentage)) &&
    Number(values.transformationPercentage) >= 0 &&
    Number(values.transformationPercentage) <= 100;
  if (!transformationValid) {
    errors.transformationPercentage =
      "El % de transformación debe estar entre 0 y 100";
  }

  if (
    dedicationValid &&
    bauValid &&
    transformationValid &&
    Number(values.bauPercentage) + Number(values.transformationPercentage) !==
      Number(values.dedicationPercentage)
  ) {
    errors.bauPercentage = "BAU + Transformación debe sumar el % de dedicación";
  }

  return errors;
}

/**
 * Cuántos obligatorios faltan: el pie del Drawer lo muestra tras un intento
 * de envío. En edición la persona es fija (no se captura), así que no cuenta.
 */
export function countMissingRequiredFields(
  values: AllocationFormValues,
  options: { editing: boolean } = { editing: false }
): number {
  const required = options.editing
    ? [values.dedicationPercentage]
    : [values.personId, values.dedicationPercentage];
  return required.filter((value) => !String(value).trim()).length;
}
