import type { PersonFormValues } from "../adapters/PersonAdapter";
import type { Modality } from "../services/personService";

// La escala de seniority no se repite acá. Había una constante con las
// etiquetas prefijadas por su número ("1 · Principiante") que no usaba nadie:
// quedó huérfana cuando el nivel SFIA se fusionó con seniority. Los niveles
// llegan del catálogo — el Select del formulario los toma de ahí, y en el
// listado los dibuja `SeniorityCard`, que trae la escala con él. Duplicarla
// en la app es exactamente el código local que la migración vino a sacar.

export const MODALITY_OPTIONS: { value: Modality; label: string }[] = [
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "OnSite", label: "OnSite" },
];

export type FieldErrors = Partial<Record<keyof PersonFormValues, string>>;

export function validate(values: PersonFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = "El nombre es obligatorio";
  else if (values.name.length > 200)
    errors.name = "El nombre no puede superar los 200 caracteres";

  if (!values.documentId.trim())
    errors.documentId = "El documento es obligatorio";
  else if (values.documentId.length > 50)
    errors.documentId = "El documento no puede superar los 50 caracteres";

  if (!values.userPrincipalName.trim())
    errors.userPrincipalName = "El usuario principal es obligatorio";
  else if (values.userPrincipalName.length > 250)
    errors.userPrincipalName =
      "El usuario principal no puede superar los 250 caracteres";

  if (!values.position.trim()) errors.position = "El cargo es obligatorio";
  else if (values.position.length > 100)
    errors.position = "El cargo no puede superar los 100 caracteres";

  // El rol sale de un catálogo cerrado: lo único que puede faltar es la
  // elección. No se valida el largo porque no hay dónde escribirlo.
  if (!values.role) errors.role = "Selecciona un rol";

  if (!values.seniority) errors.seniority = "Selecciona una seniority";

  if (!values.modality) errors.modality = "Selecciona una modalidad";

  if (!values.startDate) errors.startDate = "La fecha de inicio es obligatoria";

  if (values.availableFte === "" || Number.isNaN(Number(values.availableFte))) {
    errors.availableFte = "El FTE disponible es obligatorio";
  } else {
    const fte = Number(values.availableFte);
    if (fte < 0 || fte > 1)
      errors.availableFte = "El FTE disponible debe estar entre 0.0 y 1.0";
  }

  if (values.monthlyCost === "" || Number.isNaN(Number(values.monthlyCost))) {
    errors.monthlyCost = "El costo mensual es obligatorio";
  } else if (Number(values.monthlyCost) < 0) {
    errors.monthlyCost = "El costo mensual no puede ser negativo";
  }

  if (values.isExternal && !values.providerId)
    errors.providerId = "Selecciona un proveedor";

  return errors;
}

// Los 8 campos de la escena "Validación de campos requeridos" (ver
// openspec/specs/people/spec.md) — FTE, costo y proveedor tienen sus propias
// reglas (rango, condicional) y no cuentan acá como "sin llenar".
export function countMissingRequiredFields(values: PersonFormValues): number {
  return [
    values.name,
    values.documentId,
    values.userPrincipalName,
    values.position,
    values.role,
    values.seniority,
    values.modality,
    values.startDate,
  ].filter((value) => !value.trim()).length;
}
