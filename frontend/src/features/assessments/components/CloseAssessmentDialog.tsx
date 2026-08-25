import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { AssessmentView } from "../adapters/AssessmentAdapter";

interface CloseAssessmentDialogProps {
  assessment: AssessmentView;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * La confirmación de cierre. Antes esto se decía con una línea permanente
 * debajo de los botones, y ahí no frenaba nada: cerrar ocurría de un clic.
 * Una advertencia que se lee siempre deja de leerse, y el momento en que
 * importa es aquel en que se está por apretar.
 *
 * Dice las tres cosas que el Chapter Lead necesita antes de decidir: qué
 * queda fijado, qué se habilita, y que no se deshace.
 */
export const CloseAssessmentDialog: React.FC<CloseAssessmentDialogProps> = ({
  assessment,
  open,
  saving,
  onOpenChange,
  onConfirm,
}) => (
  <Modal open={open} onOpenChange={onOpenChange}>
    <ModalHeader title={`¿Cerrar la evaluación de ${assessment.personName}?`} />

    <ModalBody>
      <div className="flex flex-col gap-3">
        <p className="text-body text-neutral-default">
          Se fijan los niveles de las {assessment.totalCount} habilidades y los
          criterios que marcaste, y se abre el plan de carrera de{" "}
          {assessment.personName}.
        </p>
        {/*
          Lo irreversible se dice aparte y con peso: es lo único de este
          diálogo que el lector no puede deducir de la acción que pidió.
        */}
        <p className="text-body font-medium text-neutral-default">
          No se deshace. Para corregir una evaluación cerrada hay que evaluar de
          nuevo, y ésta queda como historia.
        </p>
        {assessment.gapCount > 0 && (
          <p className="text-body-sm text-neutral-subtle">
            {assessment.gapCount === 1
              ? "Queda 1 brecha registrada, que pasa al plan."
              : `Quedan ${assessment.gapCount} brechas registradas, que pasan al plan.`}
          </p>
        )}
      </div>
    </ModalBody>

    <ModalFooter>
      {/*
        La salida primero y sin peso: la acción de este diálogo es destructiva,
        así que desistir tiene que ser lo más fácil de acertar.
      */}
      <Button variant="secondary" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      {/* El mismo nombre que el botón que abrió el diálogo: confirmar es el
          mismo paso, no uno nuevo. */}
      <Button variant="primary" isLoading={saving} onClick={onConfirm}>
        Cerrar evaluación
      </Button>
    </ModalFooter>
  </Modal>
);
