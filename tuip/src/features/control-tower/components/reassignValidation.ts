export type ReassignMode = "assign" | "move" | "raise";

export interface ReassignFormValues {
  mode: ReassignMode;
  targetSquadId: string;
  dedicationPercentage: string;
  bauPercentage: string;
  transformationPercentage: string;
}

export type ReassignFieldErrors = Partial<
  Record<keyof ReassignFormValues, string>
>;

function asNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Mismas reglas que el alta de asignación (1–100, desglose que suma la
 * dedicación) más las propias del flujo: destino obligatorio salvo al subir la
 * dedicación donde está, y al subir, la nueva dedicación debe ser mayor que la
 * actual.
 */
export function validateReassign(
  values: ReassignFormValues,
  currentDedication: number | null
): ReassignFieldErrors {
  const errors: ReassignFieldErrors = {};
  if (values.mode !== "raise" && !values.targetSquadId) {
    errors.targetSquadId = "Selecciona la célula destino";
  }
  const dedication = asNumber(values.dedicationPercentage);
  if (dedication === null) {
    errors.dedicationPercentage = "Ingresa la dedicación";
  } else if (dedication < 1 || dedication > 100) {
    errors.dedicationPercentage = "Debe estar entre 1 y 100";
  } else if (
    values.mode === "raise" &&
    currentDedication !== null &&
    dedication <= currentDedication
  ) {
    errors.dedicationPercentage = `Debe ser mayor que la actual (${currentDedication}%)`;
  }
  const bau = asNumber(values.bauPercentage);
  const transformation = asNumber(values.transformationPercentage);
  if (bau === null || bau < 0 || bau > 100) {
    errors.bauPercentage = "Entre 0 y 100";
  }
  if (transformation === null || transformation > 100 || transformation < 0) {
    errors.transformationPercentage = "Entre 0 y 100";
  }
  if (
    dedication !== null &&
    bau !== null &&
    transformation !== null &&
    bau + transformation !== dedication
  ) {
    errors.bauPercentage =
      "BAU + Transformación debe ser igual a la dedicación";
  }
  return errors;
}

export function countMissingRequiredFields(values: ReassignFormValues): number {
  const required = [values.dedicationPercentage];
  if (values.mode !== "raise") required.unshift(values.targetSquadId);
  return required.filter((v) => !String(v).trim()).length;
}
