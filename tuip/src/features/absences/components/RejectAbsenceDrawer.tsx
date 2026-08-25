import React, { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Textarea,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type { Absence } from "../adapters/AbsenceAdapter";
import type { AbsenceType } from "../services/absenceService";

// El artículo concuerda por tipo: "las vacaciones", no "la vacaciones".
const TYPE_WITH_ARTICLE: Record<AbsenceType, string> = {
  Vacation: "las vacaciones",
  Leave: "el permiso",
  SickLeave: "la incapacidad",
};

export interface RejectAbsenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absence: Absence;
  saving: boolean;
  serverError: string | null;
  onSubmit: (reason: string) => void;
}

/**
 * Rechazo con motivo obligatorio y trazado — el mismo patrón del rechazo en
 * la curación del backlog. Una rechazada no cuenta en nada; registrar de
 * nuevo es el camino de corrección.
 */
export const RejectAbsenceDrawer: React.FC<RejectAbsenceDrawerProps> = ({
  open,
  onOpenChange,
  absence,
  saving,
  serverError,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const firstName = absence.personName.split(" ")[0];
  const reasonError =
    submitted && reason.trim() === "" ? "Escribe el motivo" : undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (reason.trim() === "") return;
    onSubmit(reason.trim());
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        {/*
          El mismo panel sirve para no aprobar y para revertir una aprobación:
          el acto y el resultado son el mismo, y dos formularios que hacen lo
          mismo se desincronizan. Lo que cambia es el encabezado, porque la
          consecuencia no es la misma: sobre una solicitada la capacidad nunca
          se descontó; sobre una aprobada, vuelve.
        */}
        <DrawerHeader
          title={
            absence.status === "Approved"
              ? `Revertir ${TYPE_WITH_ARTICLE[absence.type]} de ${firstName}`
              : `Rechazar ${TYPE_WITH_ARTICLE[absence.type]} de ${firstName}`
          }
        >
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {absence.rangeLabel} · {absence.businessDays}{" "}
            {absence.businessDays === 1 ? "día hábil" : "días hábiles"}.{" "}
            {absence.status === "Approved"
              ? "Estaba aprobada: la capacidad vuelve al mes y el motivo queda trazado."
              : "No contará en la capacidad y el motivo queda trazado."}
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="comment" title="Motivo" first>
            <Textarea
              label="¿Por qué se rechaza?"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Coincide con el cierre del sprint, fechas equivocadas…"
              rows={3}
              error={reasonError}
            />
            {serverError && (
              <p className="text-body-sm text-danger-default">{serverError}</p>
            )}
          </FormSection>
        </DrawerBody>
        <DrawerFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="danger" isLoading={saving}>
            Rechazar ausencia
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
