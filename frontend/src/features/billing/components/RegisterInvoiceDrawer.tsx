import React, { useState } from "react";
import {
  Button,
  DateField,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Input,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type {
  ImputationDto,
  RegisterPrefactureRequest,
} from "../services/billingService";
import {
  IMPUTATION_FIELDS,
  money,
  periodLabel,
} from "../adapters/BillingAdapter";

export interface RegisterInvoiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerName: string;
  period: string;
  /** Lo que la plataforma espera: se muestra para comparar al digitar. */
  expected: number;
  /** Registrar la corregida de una objetada, en vez de la primera. */
  isCorrection: boolean;
  saving: boolean;
  serverError: string | null;
  onSubmit: (invoice: RegisterPrefactureRequest) => void;
}

/**
 * La factura llega en papel: acá se registra lo que dice el documento —
 * número, fecha y monto. La conciliación la arma la plataforma; nada de lo
 * que se digita acá reemplaza a las novedades, que vienen de sus módulos.
 */
export const RegisterInvoiceDrawer: React.FC<RegisterInvoiceDrawerProps> = ({
  open,
  onOpenChange,
  providerName,
  period,
  expected,
  isCorrection,
  saving,
  serverError,
  onSubmit,
}) => {
  const [number, setNumber] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  const [amount, setAmount] = useState("");
  // La imputación puede llegar incompleta a propósito: en la práctica el
  // documento llega antes que la orden de compra, y bloquear el registro
  // esconde prefacturas que ya están sobre la mesa. Lo vacío viaja como null
  // y el detalle lo marca como faltante.
  const [imputation, setImputation] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: string, value: string) =>
    setImputation((current) => ({ ...current, [key]: value }));
  const field = (key: keyof ImputationDto): string | null => {
    const value = (imputation[key] ?? "").trim();
    return value === "" ? null : value;
  };

  const parsedAmount = Number(amount);
  const amountValid =
    amount.trim() !== "" && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const numberError =
    submitted && number.trim() === "" ? "Escribe el número" : undefined;
  const dateError =
    submitted && !/^\d{4}-\d{2}-\d{2}$/.test(receivedAt)
      ? "Selecciona la fecha de recepción"
      : undefined;
  const amountError =
    submitted && !amountValid ? "Escribe el valor de la prefactura" : undefined;

  const difference = amountValid ? parsedAmount - expected : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (number.trim() === "" || !amountValid) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(receivedAt)) return;
    onSubmit({
      number: number.trim(),
      receivedAt,
      amount: Math.round(parsedAmount),
      currency: "COP",
      imputation: {
        costObject: field("costObject"),
        concept: field("concept"),
        accountName: field("accountName"),
        accountNumber: field("accountNumber"),
        costCenter: field("costCenter"),
        purchaseOrder: field("purchaseOrder"),
        paymentAccount: field("paymentAccount"),
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="sm">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader
          title={
            isCorrection
              ? "Registrar prefactura corregida"
              : "Registrar prefactura"
          }
        >
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {providerName} · {periodLabel(period)}
            {isCorrection ? " · vuelve a revisión con las cifras nuevas" : null}
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="document" title="El documento" first>
            <Input
              label="Número de prefactura"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="FE-2049"
              error={numberError}
            />
            <DateField
              label="Fecha de recepción"
              value={receivedAt}
              onValueChange={setReceivedAt}
              error={dateError}
            />
            <Input
              label="Valor total"
              type="number"
              prefix="COP"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              hint={
                amountError
                  ? undefined
                  : `Esperado del período: ${money(expected)}`
              }
              error={amountError}
            />
            {difference !== null && difference !== 0 && (
              <p className="text-body-sm text-warning-default">
                Difiere del esperado en {money(Math.abs(difference))}. Se
                registra igual: el detalle dirá de dónde sale la diferencia.
              </p>
            )}
            {serverError && (
              <p className="text-body-sm text-danger-default">{serverError}</p>
            )}
          </FormSection>

          {/* Se puede completar después: lo que falte queda marcado en el
              detalle, que es lo que permite ir a buscarlo. */}
          <FormSection icon="fte" title="Imputación">
            {IMPUTATION_FIELDS.map((f) => (
              <Input
                key={f.key}
                label={f.label}
                value={imputation[f.key] ?? ""}
                onChange={(event) => setField(f.key, event.target.value)}
              />
            ))}
          </FormSection>
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
            Registrar
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
