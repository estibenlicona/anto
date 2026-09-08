import React, { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  Input,
  Textarea,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import {
  emptyTeamFormValues,
  teamAdapter,
  type Team,
  type TeamFormValues,
} from "../adapters/TeamAdapter";
import {
  countMissingRequiredFields,
  validate,
  type FieldErrors,
} from "./teamFormValidation";

export interface TeamFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
  saving: boolean;
  serverError: string | null;
  onSubmit: (values: TeamFormValues) => void;
}

// Drawer y no Modal, mismo patrón que Personas y Células: encabezado con
// título y subtítulo según el modo, una sola sección (nombre y descripción
// son toda la captura), contador de obligatorios en el pie.
export const TeamFormDrawer: React.FC<TeamFormDrawerProps> = ({
  open,
  onOpenChange,
  team,
  saving,
  serverError,
  onSubmit,
}) => {
  const [values, setValues] = useState<TeamFormValues>(
    team ? teamAdapter.toFormValues(team) : emptyTeamFormValues
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={team ? "Editar equipo" : "Crear equipo"}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            {team
              ? "Actualiza la información de este equipo."
              : "Registra un nuevo equipo."}
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="folder" title="Identificación" first>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                required
                placeholder="Ej. Ecosistema Digital"
                value={values.name}
                error={errors.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
              <div className="sm:col-span-2">
                {/* Textarea, no Input: el campo admite 500 caracteres, mismo
                    criterio que la descripción de célula. */}
                <Textarea
                  label="Descripción"
                  placeholder="Propósito y alcance del equipo"
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
              iconBefore={<Icon name={team ? "save" : "plus"} size={20} />}
            >
              {saving
                ? "Guardando…"
                : team
                  ? "Guardar cambios"
                  : "Crear equipo"}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
