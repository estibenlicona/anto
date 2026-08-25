import React, { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  Input,
  Select,
  Textarea,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import {
  emptySquadFormValues,
  squadAdapter,
  type Squad,
  type SquadFormValues,
} from "../adapters/SquadAdapter";
import type { Criticality } from "../services/squadService";
import {
  CRITICALITY_OPTIONS,
  countMissingRequiredFields,
  validate,
  type FieldErrors,
} from "./squadFormValidation";

export interface SquadFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  squad?: Squad;
  criticalities: Criticality[];
  criticalitiesLoading: boolean;
  saving: boolean;
  serverError: string | null;
  onSubmit: (values: SquadFormValues) => void;
}

// Drawer y no Modal: el mismo patrón de captura que Personas (secciones con
// ícono, grilla de dos columnas, obligatorios marcados, contador en el pie),
// para que los tres formularios de la app se lean igual.
export const SquadFormDrawer: React.FC<SquadFormDrawerProps> = ({
  open,
  onOpenChange,
  squad,
  criticalities,
  criticalitiesLoading,
  saving,
  serverError,
  onSubmit,
}) => {
  const [values, setValues] = useState<SquadFormValues>(
    squad ? squadAdapter.toFormValues(squad) : emptySquadFormValues
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const missingRequiredCount = submitted
    ? countMissingRequiredFields(values)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    onSubmit(values);
  };

  const options =
    criticalities.length > 0
      ? CRITICALITY_OPTIONS.filter((o) => criticalities.includes(o.value))
      : CRITICALITY_OPTIONS;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={squad ? "Editar célula" : "Crear célula"}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {squad
              ? "Actualiza la información de esta célula."
              : "Registra una nueva célula del chapter."}
          </p>
        </DrawerHeader>
        {/* p-0: cada sección pone su propio px-6 py-5, para que los filetes
            que las separan lleguen de borde a borde. */}
        <DrawerBody className="p-0">
          <FormSection icon="cell" title="Identificación" first>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                required
                placeholder="Ej. Backend Platform"
                value={values.name}
                error={errors.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
              <Input
                label="Equipo"
                required
                placeholder="Ej. Ecosistema Digital"
                value={values.team}
                error={errors.team}
                onChange={(e) => setValues({ ...values, team: e.target.value })}
              />
            </div>
          </FormSection>

          <FormSection icon="grid" title="Clasificación">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Criticidad"
                required
                placeholder="Seleccionar criticidad…"
                options={options}
                loading={criticalitiesLoading}
                value={values.criticality || undefined}
                error={errors.criticality}
                onValueChange={(value) =>
                  setValues({ ...values, criticality: value as Criticality })
                }
              />
              <div className="sm:col-span-2">
                {/*
                  Textarea y no Input: el campo admite 500 caracteres, y
                  ofrecer un renglón para escribirlos contradice lo que su
                  propio texto de ayuda anuncia.
                */}
                <Textarea
                  label="Descripción"
                  placeholder="Propósito y alcance de la célula"
                  hint="Opcional, máximo 500 caracteres."
                  rows={4}
                  value={values.description}
                  error={errors.description}
                  onChange={(e) =>
                    setValues({ ...values, description: e.target.value })
                  }
                />
              </div>
            </div>
            {serverError && (
              <p className="text-body-sm text-danger-default">{serverError}</p>
            )}
          </FormSection>
        </DrawerBody>
        <DrawerFooter className="flex items-center justify-between">
          <div>
            {missingRequiredCount > 0 && (
              <p className="text-body-sm text-danger-default">
                {missingRequiredCount}{" "}
                {missingRequiredCount === 1
                  ? "campo obligatorio sin llenar"
                  : "campos obligatorios sin llenar"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
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
              disabled={saving}
              iconBefore={<Icon name={squad ? "save" : "plus"} size={20} />}
            >
              {saving
                ? "Guardando…"
                : squad
                  ? "Guardar cambios"
                  : "Crear célula"}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
