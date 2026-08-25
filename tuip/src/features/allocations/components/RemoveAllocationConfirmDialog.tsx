import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { Allocation } from "../adapters/AllocationAdapter";

export interface RemoveAllocationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: Allocation | null;
  removing: boolean;
  serverError: string | null;
  onConfirm: () => void;
}

export const RemoveAllocationConfirmDialog: React.FC<
  RemoveAllocationConfirmDialogProps
> = ({ open, onOpenChange, allocation, removing, serverError, onConfirm }) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader title="Quitar asignación" />
      <ModalBody>
        ¿Seguro que quieres quitar a <strong>{allocation?.personName}</strong>{" "}
        de esta célula? Esta acción no se puede deshacer.
        {serverError && (
          <p className="mt-3 text-body-sm text-danger-default">{serverError}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button variant="danger" disabled={removing} onClick={onConfirm}>
          {removing ? "Quitando…" : "Quitar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
