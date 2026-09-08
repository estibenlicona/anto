import React from "react";
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { Team } from "../adapters/TeamAdapter";

export interface DeleteTeamConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  deleting: boolean;
  serverError: string | null;
  onConfirm: () => void;
}

/**
 * `team.squadCount` ya viaja con la fila (sin pedirlo aparte): si es mayor a
 * cero, el diálogo muestra el aviso de bloqueo en vez del de confirmación —
 * "sin abrir el diálogo de confirmación como si fuera a proceder" (spec de
 * `teams`, eliminación bloqueada). Mismo componente `Modal`, contenido
 * distinto: no hace falta un diálogo aparte para explicar sin proceder.
 */
export const DeleteTeamConfirmDialog: React.FC<
  DeleteTeamConfirmDialogProps
> = ({ open, onOpenChange, team, deleting, serverError, onConfirm }) => {
  if (team && team.squadCount > 0) {
    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalHeader title="No se puede eliminar este equipo" />
        <ModalBody>
          <Alert variant="warning" title="Tiene células asociadas">
            {team.squadCount}{" "}
            {team.squadCount === 1 ? "célula pertenece" : "células pertenecen"}{" "}
            a <strong>{team.name}</strong>; reasignalas o eliminalas antes de
            eliminar el equipo.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader title="Eliminar equipo" />
      <ModalBody>
        ¿Seguro que quieres eliminar <strong>{team?.name}</strong>? Esta acción
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
