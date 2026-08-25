import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { Initiative } from "../adapters/InitiativeAdapter";
import type { InitiativeStatus } from "../services/initiativeService";

export interface StatusConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initiative: Initiative | null;
  /** A qué estado se la lleva: sólo Active o Closed se confirman. */
  target: InitiativeStatus | null;
  changing: boolean;
  serverError: string | null;
  onConfirm: () => void;
}

/** Activar y cerrar cambian qué cuenta como demanda: se confirman. */
export const StatusConfirmDialog: React.FC<StatusConfirmDialogProps> = ({
  open,
  onOpenChange,
  initiative,
  target,
  changing,
  serverError,
  onConfirm,
}) => {
  const activating = target === "Active";
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader
        title={activating ? "Activar iniciativa" : "Cerrar iniciativa"}
      />
      <ModalBody>
        {activating ? (
          <>
            <strong>{initiative?.name}</strong> pasará a contar como demanda de
            capacidad: {initiative?.fteText} FTE con talla {initiative?.talla}.
          </>
        ) : (
          <>
            <strong>{initiative?.name}</strong> dejará de contar como demanda.
            Se puede volver a activar después.
          </>
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
        <Button variant="primary" isLoading={changing} onClick={onConfirm}>
          {activating ? "Activar" : "Cerrar iniciativa"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
