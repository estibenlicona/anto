import type { InitiativeInput } from "../services/initiativeService";

export interface InitiativeFormValues {
  name: string;
  squadId: string;
  productOwner: string;
  /** Texto: viene de un input numérico y puede estar vacío. */
  targetMonths: string;
}

export const emptyInitiativeFormValues: InitiativeFormValues = {
  name: "",
  squadId: "",
  productOwner: "",
  targetMonths: "6",
};

export type InitiativeFieldErrors = Partial<
  Record<keyof InitiativeFormValues, string>
>;

export const TARGET_MONTHS_MIN = 1;
export const TARGET_MONTHS_MAX = 36;

export function validateInitiative(
  values: InitiativeFormValues
): InitiativeFieldErrors {
  const errors: InitiativeFieldErrors = {};
  if (!values.name.trim()) errors.name = "El nombre es obligatorio";
  else if (values.name.length > 200)
    errors.name = "El nombre no puede superar los 200 caracteres";
  if (!values.squadId)
    errors.squadId = "Selecciona la célula que la va a construir";
  if (!values.productOwner.trim())
    errors.productOwner = "El Product Owner es obligatorio";
  else if (values.productOwner.length > 100)
    errors.productOwner =
      "El Product Owner no puede superar los 100 caracteres";
  const months = Number(values.targetMonths);
  if (values.targetMonths.trim() === "" || !Number.isInteger(months))
    errors.targetMonths = "El plazo es obligatorio, en meses enteros";
  else if (months < TARGET_MONTHS_MIN || months > TARGET_MONTHS_MAX)
    errors.targetMonths = `El plazo va de ${TARGET_MONTHS_MIN} a ${TARGET_MONTHS_MAX} meses`;
  return errors;
}

export function toInitiativeInput(
  values: InitiativeFormValues
): InitiativeInput {
  return {
    name: values.name.trim(),
    squadId: values.squadId,
    productOwner: values.productOwner.trim(),
    targetMonths: Number(values.targetMonths),
  };
}
