import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@tuya-ui/components";
import type { PrefactureDto } from "../services/billingService";
import { money, periodLabel, signedMoney } from "../adapters/BillingAdapter";

export type BillingDecision = "Approved" | "Objected";

export interface BillingDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billing: PrefactureDto | null;
  decision: BillingDecision | null;
  busy: boolean;
  serverError: string | null;
  /** El texto va vacío cuando no hace falta (aprobar sin diferencia). */
  onConfirm: (text: string) => void;
}

/**
 * Las dos decisiones sobre una prefactura. Objetar siempre exige motivo, que
 * queda trazado — mismo patrón que el rechazo en curación y en ausencias.
 * Aprobar con diferencia exige una nota: aceptar una diferencia es una
 * decisión y tiene que quedar justificada.
 */
export const BillingDecisionDialog: React.FC<BillingDecisionDialogProps> = ({
  open,
  onOpenChange,
  billing,
  decision,
  busy,
  serverError,
  onConfirm,
}) => {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const approving = decision === "Approved";
  const difference = billing?.difference ?? 0;
  const needsText = !approving || difference !== 0;
  const textError =
    submitted && needsText && text.trim() === ""
      ? approving
        ? "Escribe la nota que justifica aprobar con diferencia"
        : "Escribe el motivo de la objeción"
      : undefined;

  const handleConfirm = () => {
    setSubmitted(true);
    if (needsText && text.trim() === "") return;
    onConfirm(text.trim());
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader
        title={approving ? "Aprobar factura" : "Objetar prefactura"}
      />
      <ModalBody>
        {billing && (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-neutral-default">
              <strong>{billing.providerName}</strong> ·{" "}
              {periodLabel(billing.period)}
              {billing.document ? ` · ${billing.document.number}` : null}
            </p>
            {approving ? (
              difference === 0 ? (
                <p className="text-body-sm text-neutral-default">
                  Lo prefacturado coincide con lo esperado (
                  <strong>{money(billing.expected)}</strong>). Después de
                  aprobar, la prefactura queda de sólo lectura.
                </p>
              ) : (
                <p className="text-body-sm text-neutral-default">
                  La factura llega <strong>{signedMoney(difference)}</strong>{" "}
                  respecto de lo esperado ({money(billing.expected)}). Aprobarla
                  acepta esa diferencia.
                </p>
              )
            ) : (
              <p className="text-body-sm text-neutral-default">
                La factura vuelve al proveedor. El motivo queda trazado y la
                factura deja de editarse hasta que llegue la corregida.
              </p>
            )}
            {needsText && (
              <Textarea
                label={
                  approving ? "Nota de aprobación" : "Motivo de la objeción"
                }
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  approving
                    ? "Se acepta la diferencia porque…"
                    : "No aplicaron el descuento de…"
                }
                rows={3}
                error={textError}
              />
            )}
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
        <Button
          variant={approving ? "primary" : "danger"}
          isLoading={busy}
          onClick={handleConfirm}
        >
          {approving ? "Aprobar" : "Objetar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
