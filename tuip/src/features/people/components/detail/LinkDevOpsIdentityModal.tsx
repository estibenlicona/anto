import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioGroup,
} from "@tuya-ui/components";
import type { DevOpsCandidateDto } from "../../services/personDetailService";

export interface LinkDevOpsIdentityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  candidates: DevOpsCandidateDto[];
  linking: boolean;
  serverError: string | null;
  onConfirm: (identityId: string) => void;
}

/**
 * Elegir una identidad candidata: una decisión de una opción, por eso un
 * Modal y no un drawer.
 */
export const LinkDevOpsIdentityModal: React.FC<
  LinkDevOpsIdentityModalProps
> = ({
  open,
  onOpenChange,
  personName,
  candidates,
  linking,
  serverError,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<string>(candidates[0]?.id ?? "");
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader title="Vincular identidad DevOps" />
      <ModalBody>
        <p className="mb-3 text-body-sm text-neutral-subtle">
          Identidades del espejo de Entra ID que coinciden por nombre con{" "}
          <strong className="text-neutral-default">{personName}</strong>. Una
          identidad sólo puede vincularse a una persona.
        </p>
        <RadioGroup
          label="Identidad"
          value={selected}
          onValueChange={setSelected}
          options={candidates.map((c) => ({
            value: c.id,
            label: `${c.displayName} · ${c.userName}`,
          }))}
        />
        {serverError && (
          <p className="mt-3 text-body-sm text-danger-default">{serverError}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!selected || linking}
          onClick={() => onConfirm(selected)}
        >
          {linking ? "Vinculando…" : "Vincular"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
