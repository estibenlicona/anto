import type {
  AdjustmentReason,
  BillingAdjustmentDto,
} from "../services/billingService";

export interface AdjustmentFormValues {
  /** Texto del input numérico; con signo. */
  amount: string;
  reason: AdjustmentReason | "";
  note: string;
}

export const emptyAdjustmentFormValues: AdjustmentFormValues = {
  amount: "",
  reason: "",
  note: "",
};

export type AdjustmentFieldErrors = Partial<
  Record<keyof AdjustmentFormValues, string>
>;

export function validateAdjustment(
  values: AdjustmentFormValues
): AdjustmentFieldErrors {
  const errors: AdjustmentFieldErrors = {};
  const amount = Number(values.amount);
  if (values.amount.trim() === "" || !Number.isInteger(amount)) {
    errors.amount = "Ingresa un monto entero en pesos";
  } else if (amount === 0) {
    errors.amount = "El ajuste no puede ser cero; un negativo descuenta";
  }
  if (!values.reason) errors.reason = "Selecciona el motivo del ajuste";
  if (values.note.length > 300)
    errors.note = "La nota no puede superar los 300 caracteres";
  return errors;
}

export function toAdjustment(
  values: AdjustmentFormValues
): BillingAdjustmentDto {
  return {
    amount: Number(values.amount),
    reason: values.reason as AdjustmentReason,
    note: values.note.trim(),
  };
}
