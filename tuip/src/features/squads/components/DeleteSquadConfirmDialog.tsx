import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { Squad } from "../adapters/SquadAdapter";

export interface DeleteSquadConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  squad: Squad | null;
  deleting: boolean;
  serverError: string | null;
  onConfirm: () => void;
}

export const DeleteSquadConfirmDialog: React.FC<
  DeleteSquadConfirmDialogProps
> = ({ open, onOpenChange, squad, deleting, serverError, onConfirm }) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader title="Eliminar célula" />
      <ModalBody>
        ¿Seguro que quieres eliminar <strong>{squad?.name}</strong>? Esta acción
        no se puede deshacer.
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
