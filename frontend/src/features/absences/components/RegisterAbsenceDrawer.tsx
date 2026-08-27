import React, { useState } from "react";
import {
  Button,
  DateField,
  DateRangeField,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  OptionCard,
  OptionCardGroup,
  RadioGroup,
  Select,
} from "@tuya-ui/components";
import type { IconName } from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type {
  AbsenceType,
  CreateAbsenceRequest,
} from "../services/absenceService";
import {
  countBusinessDays,
  formatBusinessDays,
  parseIsoDate,
} from "../services/businessDays";
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

/** El icono con el que se reconoce cada tipo en las tarjetas. */
const TYPE_ICONS: Record<AbsenceType, IconName> = {
  Vacation: "calendar",
  Leave: "hours-log",
  SickLeave: "sick-leave",
};

const TYPE_OPTIONS = (
  Object.entries(TYPE_LABELS) as Array<[AbsenceType, string]>
).map(([value, label]) => ({ value, label, icon: TYPE_ICONS[value] }));

/**
 * Alta de una ausencia: persona, tipo y rango. Los días hábiles se muestran
 * contados antes de enviar — la misma aritmética que responde el servidor
 * (businessDays.ts, una sola fuente). Toda ausencia nace Solicitada: aprobar
 * es un acto aparte, en la fila (design.md).
 *
 * El tipo se elige entre tres tarjetas y no en un desplegable: son tres
 * opciones fijas y el drawer tiene sitio de sobra para tenerlas a la vista.
 *
 * Un permiso dura un día completo, medio día o varios días; los dos primeros
 * piden un solo día y el tercero un rango por días completos. Unas vacaciones
 * y una incapacidad piden siempre rango, y el medio día no existe para ellas.
 */

/** Cuánto dura un permiso: es la única pregunta extra que hace el formulario. */
type LeaveMode = "full" | "half" | "range";

const LEAVE_MODE_OPTIONS: Array<{ value: LeaveMode; label: string }> = [
  { value: "full", label: "Día completo" },
  { value: "half", label: "Medio día" },
  { value: "range", label: "Varios días" },
];
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
  /** La fecha del permiso de un día: entero o a medias, no ocupa un rango. */
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveMode, setLeaveMode] = useState<LeaveMode>("full");
  const [submitted, setSubmitted] = useState(false);

  // Un permiso se pide por un día —entero o a medias— o por varios días; unas
  // vacaciones y una incapacidad se piden por rango y siempre por días
  // completos. Un permiso de varios días se pide igual que unas vacaciones:
  // la única condición que reparte entre "un día" y "rango" es esta.
  const isLeave = type === "Leave";
  const singleDay = isLeave && leaveMode !== "range";

  const start = parseIsoDate(singleDay ? leaveDate : startDate);
  const end = parseIsoDate(singleDay ? leaveDate : endDate);
  const rangeComplete = start !== null && end !== null;
  const rangeInverted = rangeComplete && end < start;

  // Por debajo el contrato sigue siendo el mismo: un permiso de un día viaja
  // como un rango de un día con las dos banderas iguales; el de varios días,
  // como unas vacaciones.
  const edges =
    singleDay && leaveMode === "half"
      ? { startsHalfDay: true, endsHalfDay: true }
      : { startsHalfDay: false, endsHalfDay: false };

  const businessDays =
    rangeComplete && !rangeInverted
      ? countBusinessDays(start, end, edges)
      : null;

  const personError =
    submitted && personId === "" ? "Selecciona la persona" : undefined;
  const typeError = submitted && type === "" ? "Selecciona el tipo" : undefined;
  const dateError = !submitted
    ? undefined
    : !rangeComplete
      ? singleDay
        ? "Selecciona el día del permiso"
        : "Selecciona el rango completo"
      : rangeInverted
        ? "El fin no puede ser anterior al inicio"
        : businessDays === 0
          ? singleDay
            ? "Ese día no es hábil"
            : "El rango no tiene días hábiles que registrar"
          : undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (
      personId === "" ||
      type === "" ||
      !rangeComplete ||
      rangeInverted ||
      businessDays === 0
    ) {
      return;
    }
    const day = singleDay ? leaveDate : null;
    onSubmit({
      personId,
      type,
      startDate: day ?? startDate,
      endDate: day ?? endDate,
      ...edges,
    });
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
            {/* Sin rótulo propio: la sección ya se titula "Persona". El nombre
                accesible viaja en `aria-label` para quien no ve el título. */}
            <Select
              aria-label="Persona"
              options={people.map((p) => ({ value: p.id, label: p.name }))}
              value={personId || undefined}
              onValueChange={setPersonId}
              placeholder={peopleLoading ? "Cargando…" : "Elegir persona…"}
              disabled={peopleLoading}
              error={personError}
            />
          </FormSection>
          <FormSection icon="calendar" title="Ausencia">
            <div className="flex flex-col gap-1.5">
              <OptionCardGroup
                label="Tipo"
                columns={3}
                value={type || undefined}
                onValueChange={(value) => setType(value as AbsenceType)}
              >
                {TYPE_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    value={option.value}
                    title={option.label}
                    icon={option.icon}
                  />
                ))}
              </OptionCardGroup>
              {typeError && (
                <p className="text-body-sm text-danger-default">{typeError}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {/* Un permiso pregunta primero cuánto dura, porque de eso depende
                  qué fecha pide después: un día suelto para "día completo" y
                  "medio día", un rango para "varios días". Pedir siempre rango
                  obligaba a elegir dos veces la misma fecha para algo que dura
                  una tarde. */}
              {isLeave && (
                <RadioGroup
                  label="Duración"
                  value={leaveMode}
                  onValueChange={(value) => setLeaveMode(value as LeaveMode)}
                  options={LEAVE_MODE_OPTIONS}
                />
              )}
              {singleDay ? (
                <DateField
                  label="Día del permiso"
                  value={leaveDate}
                  onValueChange={setLeaveDate}
                  error={dateError}
                />
              ) : (
                <DateRangeField
                  label="Rango de fechas"
                  startValue={startDate}
                  endValue={endDate}
                  onRangeChange={(startValue, endValue) => {
                    setStartDate(startValue);
                    setEndDate(endValue);
                  }}
                  error={dateError}
                />
              )}
              {businessDays !== null && businessDays > 0 && (
                <div className="flex items-center gap-2 rounded-control bg-neutral-subtle px-3 py-2">
                  <Icon
                    name="status-pending"
                    size={16}
                    className="shrink-0 text-neutral-subtle"
                  />
                  <span className="text-body-sm text-neutral-subtle">
                    <b className="font-bold tabular-nums text-neutral-default">
                      {formatBusinessDays(businessDays)}
                    </b>{" "}
                    {businessDays === 1 ? "día hábil" : "días hábiles"} (lunes a
                    viernes, sin festivos)
                  </span>
                </div>
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
