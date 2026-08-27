import React, { useId, useState } from "react";
import {
  Badge,
  Button,
  DateField,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  FileInput,
  Icon,
  Input,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type {
  ImputationDto,
  PrefactureDto,
  RegisterPrefactureRequest,
} from "../services/billingService";
import {
  IMPUTATION_FIELDS,
  digitsOnly,
  formatDigits,
  money,
  periodLabel,
  shortDate,
} from "../adapters/BillingAdapter";

export interface RegisterInvoiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * La prefactura que se registra. Trae todo lo que el formulario muestra:
   * persona, proveedor, período, tarifa, novedades, esperado y, si está
   * objetada, la objeción y el documento anterior.
   */
  billing: PrefactureDto;
  saving: boolean;
  serverError: string | null;
  onSubmit: (invoice: RegisterPrefactureRequest) => void;
}

const labelOf = (key: keyof ImputationDto) =>
  IMPUTATION_FIELDS.find((f) => f.key === key)!.label;

/** Un ejemplo por campo, con la forma que suele traer el documento. */
const IMPUTATION_PLACEHOLDERS: Record<keyof ImputationDto, string> = {
  costObject: "Ej. Backend Platform",
  concept: "Ej. Servicios profesionales",
  accountName: "Ej. Servicios técnicos",
  accountNumber: "Ej. 5135-05",
  costCenter: "Ej. CC-1001",
  purchaseOrder: "Ej. OC-2026-0142",
  paymentAccount: "Ej. Bancolombia 4567",
};

/** Cómo se llega al esperado, para leerlo junto a la cifra. */
function expectedBreakdown(billing: PrefactureDto): string {
  const parts = [`Tarifa ${money(billing.monthlyCost)}`];
  if (billing.absenceDiscount) {
    const { businessDays, amount } = billing.absenceDiscount;
    parts.push(
      `− ${businessDays} ${businessDays === 1 ? "día" : "días"} de ausencia ${money(amount)}`
    );
  }
  if (billing.adjustment && billing.adjustment.amount !== 0) {
    const { amount } = billing.adjustment;
    parts.push(`${amount > 0 ? "+" : "−"} ajuste ${money(Math.abs(amount))}`);
  }
  return parts.join(" ");
}

/**
 * La factura llega en papel: acá se registra lo que dice el documento —
 * número, fecha y monto— y se concilia a la vista contra lo que la plataforma
 * espera. Nada de lo que se digita acá reemplaza a las novedades, que vienen
 * de sus módulos. La imputación es opcional: suele llegar después.
 */
export const RegisterInvoiceDrawer: React.FC<RegisterInvoiceDrawerProps> = ({
  open,
  onOpenChange,
  billing,
  saving,
  serverError,
  onSubmit,
}) => {
  const isCorrection = billing.status === "Objected";
  const expected = billing.expected;
  const amountId = useId();

  // El PDF se queda en el cliente por ahora: no viaja en la petición hasta
  // que el backend sepa leerlo.
  const [pdf, setPdf] = useState<File | null>(null);

  const [number, setNumber] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  // Se guarda como dígitos y se muestra con puntos de miles: el campo se lee
  // como el resto de cifras de la pantalla, y un `type="number"` no admite
  // separadores. El cursor cae al final en cada tecla; el valor es un entero
  // corto que se escribe de corrido, así que no estorba.
  const [amountDigits, setAmountDigits] = useState("");
  // La imputación puede llegar incompleta a propósito: en la práctica el
  // documento llega antes que la orden de compra, y bloquear el registro
  // esconde prefacturas que ya están sobre la mesa. Lo vacío viaja como null
  // y el detalle lo marca como faltante. Arranca con lo que ya se sabe: la
  // célula de la persona, o la imputación del documento objetado.
  const [imputation, setImputation] = useState<Record<string, string>>(() => {
    if (isCorrection && billing.document) {
      const previous = billing.document.imputation;
      return Object.fromEntries(
        IMPUTATION_FIELDS.map((f) => [f.key, previous[f.key] ?? ""])
      );
    }
    return { costObject: billing.squadName ?? "" };
  });
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: string, value: string) =>
    setImputation((current) => ({ ...current, [key]: value }));
  const field = (key: keyof ImputationDto): string | null => {
    const value = (imputation[key] ?? "").trim();
    return value === "" ? null : value;
  };

  const parsedAmount = Number(amountDigits);
  const amountValid = amountDigits !== "" && parsedAmount > 0;

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
      amount: parsedAmount,
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

  const imputationInput = (key: keyof ImputationDto) => (
    <Input
      label={labelOf(key)}
      value={imputation[key] ?? ""}
      placeholder={IMPUTATION_PLACEHOLDERS[key]}
      onChange={(event) => setField(key, event.target.value)}
    />
  );

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
          {/* La unidad es la persona: va primero, y el proveedor y el mes la
              sitúan. */}
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {billing.personName} · {billing.providerName} ·{" "}
            {periodLabel(billing.period)}
            {isCorrection ? " · vuelve a revisión con las cifras nuevas" : null}
          </p>
        </DrawerHeader>
        {/* `padding: 0` inline además de `p-0`: `cn` del sistema de diseño
            sólo concatena clases y `.px-6` va después de `.p-0` en su CSS, así
            que sin el estilo inline el cuerpo suma sus 24px a los 24px de
            cada FormSection. */}
        <DrawerBody className="p-0" style={{ padding: 0 }}>
          <FormSection icon="document" title="Prefactura" first>
            {/* El PDF que manda el proveedor. Hoy sólo se adjunta y se muestra
                su nombre: la lectura automática de número, fecha y valor es
                del backend y vendrá después. */}
            <FileInput
              label="Cargar PDF"
              value={pdf}
              onValueChange={setPdf}
              accept="application/pdf"
            />

            {/* Lo que se objetó queda a la vista mientras se digita la
                corregida: es lo que el documento nuevo tiene que arreglar. */}
            {isCorrection && billing.objection && billing.document && (
              <div className="flex items-start gap-2 rounded-control bg-neutral-subtle px-4 py-3">
                <Icon
                  name="status-error"
                  size={16}
                  className="mt-1 shrink-0 text-neutral-subtle"
                />
                <div>
                  <p className="text-body-sm font-semibold text-neutral-default">
                    Objetada el {shortDate(billing.objection.objectedAtUtc)} ·{" "}
                    {billing.document.number} por{" "}
                    {money(billing.document.amount)}
                  </p>
                  <p className="text-body-sm text-neutral-subtle">
                    «{billing.objection.reason}»
                  </p>
                </div>
              </div>
            )}

            {/* Número y fecha son cortos y se leen juntos como "el documento";
                el valor va solo porque es el que se compara. */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número de prefactura"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="Ej. PF-2049"
                error={numberError}
              />
              <DateField
                label="Fecha de recepción"
                value={receivedAt}
                onValueChange={setReceivedAt}
                error={dateError}
              />
            </div>

            <div className="flex flex-col gap-1">
              {/* Rótulo a mano: Input no tiene dónde poner un control junto
                  a su label, y "Usar el esperado" va ahí. */}
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={amountId}
                  className="text-body-sm font-medium text-neutral-default"
                >
                  Valor total
                </label>
                <Button
                  type="button"
                  variant="link"
                  size="small"
                  onClick={() => setAmountDigits(String(expected))}
                >
                  Usar el esperado
                </Button>
              </div>
              <Input
                id={amountId}
                inputMode="numeric"
                prefix="COP"
                value={formatDigits(amountDigits)}
                onChange={(event) =>
                  setAmountDigits(digitsOnly(event.target.value))
                }
                placeholder="Ej. 11.500.000"
                error={amountError}
              />
            </div>

            {/* La conciliación a la vista: de dónde sale el esperado y cuánto
                se le aleja lo digitado. La diferencia no bloquea: se registra
                igual y el detalle dirá de dónde sale. */}
            <div className="flex flex-col gap-2 rounded-control border-default border-neutral-default bg-neutral-subtlest px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-body-sm text-neutral-subtle">
                  Esperado del período
                </span>
                <span className="text-body-sm font-semibold tabular-nums text-neutral-default">
                  {money(expected)}
                </span>
              </div>
              <p className="text-body-sm tabular-nums text-neutral-subtlest">
                {expectedBreakdown(billing)}
              </p>
              {difference !== null && (
                <>
                  <div className="border-t-default border-neutral-default" />
                  <div className="flex items-start gap-2">
                    <Icon
                      name={
                        difference === 0 ? "status-success" : "status-warning"
                      }
                      size={16}
                      className={
                        difference === 0
                          ? "mt-1 shrink-0 text-success-default"
                          : "mt-1 shrink-0 text-warning-default"
                      }
                    />
                    <div>
                      <p
                        className={
                          difference === 0
                            ? "text-body-sm font-semibold text-success-default"
                            : "text-body-sm font-semibold tabular-nums text-warning-default"
                        }
                      >
                        {difference === 0
                          ? "Sin diferencia contra lo esperado"
                          : `Difiere en ${difference > 0 ? "+" : "−"}${money(Math.abs(difference))}`}
                      </p>
                      {difference !== 0 && (
                        <p className="text-body-sm text-neutral-subtle">
                          Se registra igual: el detalle dirá de dónde sale la
                          diferencia.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {serverError && (
              <p className="text-body-sm text-danger-default">{serverError}</p>
            )}
          </FormSection>

          {/* Sin texto explicativo: la etiqueta "Opcional" ya dice lo que hay
              que saber, y el detalle marca lo que falte. */}
          <FormSection
            icon="fte"
            title="Datos de prefactura"
            badge={<Badge variant="neutral">Opcional</Badge>}
          >
            {imputationInput("costObject")}
            {imputationInput("concept")}
            <div className="grid grid-cols-2 gap-4">
              {imputationInput("accountName")}
              {imputationInput("accountNumber")}
              {imputationInput("costCenter")}
              {imputationInput("purchaseOrder")}
            </div>
            {imputationInput("paymentAccount")}
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
            {isCorrection ? "Registrar corregida" : "Registrar"}
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
