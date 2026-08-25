import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { Person } from "../adapters/PersonAdapter";

export interface DeletePersonConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
  deleting: boolean;
  serverError: string | null;
  onConfirm: () => void;
}

export const DeletePersonConfirmDialog: React.FC<
  DeletePersonConfirmDialogProps
> = ({ open, onOpenChange, person, deleting, serverError, onConfirm }) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader title="Eliminar persona" />
      <ModalBody>
        ¿Seguro que quieres eliminar <strong>{person?.name}</strong>? Esta
        acción no se puede deshacer.
        {serverError && (
          <p className="mt-3 text-body-sm text-danger-default">{serverError}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button variant="danger" disabled={deleting} onClick={onConfirm}>
          {deleting ? "Eliminando…" : "Eliminar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
