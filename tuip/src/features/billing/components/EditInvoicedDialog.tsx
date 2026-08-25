import React, { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { PrefactureDto } from "../services/billingService";
import { money } from "../adapters/BillingAdapter";

export interface EditInvoicedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefacture: PrefactureDto | null;
  busy: boolean;
  serverError: string | null;
  onConfirm: (invoiced: number) => void;
}

/**
 * Cada línea arranca facturada por la tarifa, que es lo que el proveedor
 * factura por defecto. Cuando la prefactura sí trae desglose y una línea difiere,
 * se corrige acá — es lo único que se digita de la prefactura.
 */
export const EditInvoicedDialog: React.FC<EditInvoicedDialogProps> = ({
  open,
  onOpenChange,
  prefacture: line,
  busy,
  serverError,
  onConfirm,
}) => {
  const [value, setValue] = useState(() => String(line?.prefactured ?? ""));
  const [submitted, setSubmitted] = useState(false);

  const parsed = Number(value);
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;
  const error =
    submitted && !valid ? "Escribe el monto prefacturado, en pesos" : undefined;
  const difference = valid && line ? parsed - line.expected : null;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!valid) return;
    onConfirm(Math.round(parsed));
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader
        title={
          line
            ? `Valor prefacturado de ${line.personName}`
            : "Valor prefacturado"
        }
      />
      <ModalBody>
        {line && (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-neutral-subtle">
              Lo esperado para esta persona es{" "}
              <strong className="text-neutral-default">
                {money(line.expected)}
              </strong>
              . Corregí acá lo que el proveedor facturó por ella.
            </p>
            <Input
              label="Valor prefacturado"
              type="number"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              error={error}
              hint={
                error || difference === null
                  ? undefined
                  : difference === 0
                    ? "Coincide con lo esperado."
                    : `Quedaría una diferencia de ${money(Math.abs(difference))}.`
              }
            />
          </div>
        )}
        {serverError && (
          <p role="alert" className="mt-3 text-body-sm text-danger-default">
            {serverError}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button variant="primary" isLoading={busy} onClick={handleConfirm}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
