import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@tuya-ui/components";
import type { Absence } from "../adapters/AbsenceAdapter";

interface ApproveAbsenceDialogProps {
  absence: Absence;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * La confirmación de aprobar. Antes aprobar era un clic inmediato, con el
 * botón pegado al de rechazar — que sí abre un panel y exige escribir un
 * motivo. La acción reversible costaba más que la que descuenta capacidad.
 *
 * Lo que evita el error no es preguntar "¿confirmás?" (quien apretó ya
 * decidió apretar), sino poner delante la consecuencia que hoy hay que ir a
 * buscar a la fila: de quién es y cuánto descuenta. Por eso el texto sale de
 * esta ausencia y no es fijo: un diálogo que siempre dice lo mismo se aprende
 * a saltar.
 */
export const ApproveAbsenceDialog: React.FC<ApproveAbsenceDialogProps> = ({
  absence,
  open,
  saving,
  onOpenChange,
  onConfirm,
}) => (
  <Modal open={open} onOpenChange={onOpenChange}>
    <ModalHeader title={`¿Aprobar la ausencia de ${absence.personName}?`} />

    <ModalBody>
      <div className="flex flex-col gap-3">
        <p className="text-body text-neutral-default">
          {absence.typeLabel} del {absence.rangeLabel}, {absence.businessDays}{" "}
          {absence.businessDays === 1 ? "día hábil" : "días hábiles"}.
        </p>
        {/*
          La cifra es lo que la fila ya muestra, traída acá: es el dato que
          convierte "aprobar" en una decisión sobre capacidad y no en un
          trámite. Sin impacto en el mes visible se dice igual, porque
          "descuenta 0.0" y "no descuenta" no son lo mismo para quien decide.
        */}
        <p className="text-body font-medium text-neutral-default">
          {absence.monthFteImpact > 0 ? (
            <>
              {/* Dos decimales, como la fila: con uno solo, un impacto de
                  0.03 se anuncia como "0.0 FTE" y el diálogo contradice a la
                  fila desde la que se lo abrió. */}
              Descuenta {absence.monthFteImpact.toFixed(2)} FTE de la capacidad
              del mes
              {absence.mainSquadName ? `, en ${absence.mainSquadName}` : ""}.
            </>
          ) : (
            <>No descuenta capacidad de este mes.</>
          )}
        </p>
        <p className="text-body-sm text-neutral-subtle">
          Si fue un error, se revierte rechazándola: queda el motivo registrado
          y la capacidad vuelve.
        </p>
      </div>
    </ModalBody>

    <ModalFooter>
      {/* La salida primero y sin peso, como en el cierre de una evaluación. */}
      <Button variant="secondary" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      {/* El mismo nombre que el botón que abrió el diálogo. */}
      <Button variant="primary" isLoading={saving} onClick={onConfirm}>
        Aprobar
      </Button>
    </ModalFooter>
  </Modal>
);
