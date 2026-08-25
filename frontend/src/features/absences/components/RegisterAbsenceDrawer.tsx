import React, { useState } from "react";
import {
  Button,
  DateRangeField,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  Select,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type {
  AbsenceType,
  CreateAbsenceRequest,
} from "../services/absenceService";
import { countBusinessDays, parseIsoDate } from "../services/businessDays";
import { TYPE_LABELS } from "../adapters/AbsenceAdapter";

export interface AbsencePersonOption {
  id: string;
  name: string;
}

export interface RegisterAbsenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: AbsencePersonOption[];
  peopleLoading: boolean;
  saving: boolean;
  serverError: string | null;
  onSubmit: (request: CreateAbsenceRequest) => void;
}

const TYPE_OPTIONS = (
  Object.entries(TYPE_LABELS) as Array<[AbsenceType, string]>
).map(([value, label]) => ({ value, label }));

/**
 * Alta de una ausencia: persona, tipo y rango. Los días hábiles se muestran
 * contados antes de enviar — la misma aritmética que responde el servidor
 * (businessDays.ts, una sola fuente). Toda ausencia nace Solicitada: aprobar
 * es un acto aparte, en la fila (design.md).
 */
export const RegisterAbsenceDrawer: React.FC<RegisterAbsenceDrawerProps> = ({
  open,
  onOpenChange,
  people,
  peopleLoading,
  saving,
  serverError,
  onSubmit,
}) => {
  const [personId, setPersonId] = useState("");
  const [type, setType] = useState<AbsenceType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const rangeComplete = start !== null && end !== null;
  const rangeInverted = rangeComplete && end < start;
  const businessDays =
    rangeComplete && !rangeInverted ? countBusinessDays(start, end) : null;

  const personError =
    submitted && personId === "" ? "Selecciona la persona" : undefined;
  const typeError = submitted && type === "" ? "Selecciona el tipo" : undefined;
  const rangeError = !submitted
    ? undefined
    : !rangeComplete
      ? "Selecciona el rango completo"
      : rangeInverted
        ? "El fin no puede ser anterior al inicio"
        : undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (personId === "" || type === "" || !rangeComplete || rangeInverted) {
      return;
    }
    onSubmit({ personId, type, startDate, endDate });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title="Registrar ausencia">
          <p className="mt-1 text-body-sm text-neutral-subtle">
            Nace solicitada: aprobarla es lo que descuenta capacidad del
            período.
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="user" title="Persona" first>
            <Select
              label="Persona del chapter"
              options={people.map((p) => ({ value: p.id, label: p.name }))}
              value={personId || undefined}
              onValueChange={setPersonId}
              placeholder={peopleLoading ? "Cargando…" : "Elegir persona…"}
              disabled={peopleLoading}
              error={personError}
            />
          </FormSection>
          <FormSection icon="calendar" title="Ausencia">
            <Select
              label="Tipo"
              options={TYPE_OPTIONS}
              value={type || undefined}
              onValueChange={(value) => setType(value as AbsenceType)}
              placeholder="Vacaciones, permiso o incapacidad…"
              error={typeError}
            />
            <div className="flex flex-col gap-1.5">
              <DateRangeField
                label="Rango de fechas"
                startValue={startDate}
                endValue={endDate}
                onRangeChange={(startValue, endValue) => {
                  setStartDate(startValue);
                  setEndDate(endValue);
                }}
                error={rangeError}
              />
              {businessDays !== null && (
                <span className="text-body-sm text-neutral-subtle">
                  <b className="font-bold tabular-nums text-neutral-default">
                    {businessDays}
                  </b>{" "}
                  {businessDays === 1 ? "día hábil" : "días hábiles"} (lunes a
                  viernes, sin festivos)
                </span>
              )}
            </div>
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
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            iconBefore={<Icon name="plus" size={20} />}
          >
            Registrar
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
