import React, { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Input,
  Select,
  Textarea,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type { PrefactureDto } from "../services/billingService";
import { money, REASON_OPTIONS } from "../adapters/BillingAdapter";
import {
  emptyAdjustmentFormValues,
  validateAdjustment,
  type AdjustmentFieldErrors,
  type AdjustmentFormValues,
} from "./adjustmentValidation";

export interface AdjustLineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: PrefactureDto | null;
  saving: boolean;
  serverError: string | null;
  onSubmit: (values: AdjustmentFormValues) => void;
}

function valuesFrom(line: PrefactureDto | null): AdjustmentFormValues {
  if (!line?.adjustment) return emptyAdjustmentFormValues;
  return {
    amount: String(line.adjustment.amount),
    reason: line.adjustment.reason,
    note: line.adjustment.note,
  };
}

/** Un ajuste por línea: monto con signo, motivo obligatorio, nota opcional. */
export const AdjustLineDrawer: React.FC<AdjustLineDrawerProps> = ({
  open,
  onOpenChange,
  line,
  saving,
  serverError,
  onSubmit,
}) => {
  const [values, setValues] = useState<AdjustmentFormValues>(() =>
    valuesFrom(line)
  );
  const [errors, setErrors] = useState<AdjustmentFieldErrors>({});

  const amount = Number(values.amount);
  // La base del esperado es la tarifa menos el descuento por ausencias, que no
  // se edita acá: el ajuste se suma sobre eso.
  const base = line
    ? line.monthlyCost - (line.absenceDiscount?.amount ?? 0)
    : 0;
  const preview =
    line && values.amount.trim() !== "" && Number.isFinite(amount)
      ? money(base + amount)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateAdjustment(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="sm">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={line ? `Ajustar a ${line.personName}` : "Ajustar"}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {line ? `Tarifa ${money(line.monthlyCost)}. ` : ""}
            {line?.absenceDiscount
              ? `Ya descuenta ${money(line.absenceDiscount.amount)} por ausencias aprobadas. `
              : ""}
            Un ajuste por línea: guardar reemplaza el anterior.
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="percent" title="Ajuste" first>
            <Input
              label="Monto"
              required
              type="number"
              step={1}
              placeholder="Ej. -1200000"
              value={values.amount}
              error={errors.amount}
              hint={
                preview
                  ? `La línea quedaría en ${preview}. Un monto negativo descuenta.`
                  : "En pesos, sin decimales. Un monto negativo descuenta."
              }
              onChange={(e) => setValues({ ...values, amount: e.target.value })}
            />
            <Select
              label="Motivo"
              required
              placeholder="Elegir motivo…"
              options={REASON_OPTIONS}
              value={values.reason || undefined}
              onValueChange={(reason) =>
                setValues({
                  ...values,
                  reason: reason as AdjustmentFormValues["reason"],
                })
              }
              error={errors.reason}
            />
            <Textarea
              label="Nota"
              rows={3}
              placeholder="Ej. 4 días no laborados (15 al 18)."
              value={values.note}
              error={errors.note}
              onChange={(e) => setValues({ ...values, note: e.target.value })}
            />
          </FormSection>
          {serverError && (
            <p
              role="alert"
              className="px-6 py-4 text-body-sm text-danger-default"
            >
              {serverError}
            </p>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            Guardar ajuste
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
