import {
  CRITICALITY_LABELS,
  CRITICALITY_ORDER,
  type SquadFormValues,
} from "../adapters/SquadAdapter";
import type { Criticality } from "../services/squadService";

// Etiqueta en español, código hacia el backend — el mismo mapa que usan el
// listado, el filtro y la card de distribución.
export const CRITICALITY_OPTIONS: { value: Criticality; label: string }[] =
  CRITICALITY_ORDER.map((value) => ({
    value,
    label: CRITICALITY_LABELS[value],
  }));

export type FieldErrors = Partial<Record<keyof SquadFormValues, string>>;

export function validate(values: SquadFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "El nombre es obligatorio";
  else if (values.name.length > 200)
    errors.name = "El nombre no puede superar los 200 caracteres";

  if (!values.team.trim()) errors.team = "El equipo es obligatorio";
  else if (values.team.length > 100)
    errors.team = "El equipo no puede superar los 100 caracteres";

  if (!values.criticality) errors.criticality = "Selecciona una criticidad";

  if (values.description.length > 500)
    errors.description = "La descripción no puede superar los 500 caracteres";

  return errors;
}

/** Cuántos obligatorios faltan: el pie del Drawer lo muestra tras un intento de envío. */
export function countMissingRequiredFields(values: SquadFormValues): number {
  return [values.name, values.team, values.criticality].filter(
    (value) => !String(value).trim()
  ).length;
}
