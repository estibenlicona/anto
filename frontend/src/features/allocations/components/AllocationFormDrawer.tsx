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
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";

import {
  emptyAllocationFormValues,
  allocationAdapter,
  type Allocation,
  type AllocationFormValues,
} from "../adapters/AllocationAdapter";
import {
  countMissingRequiredFields,
  validate,
  type FieldErrors,
} from "./allocationFormValidation";

export interface AllocationFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation?: Allocation;
  squadName: string;
  /** Personas elegibles para el alta: sin célula (lo mínimo que el selector necesita). */
  people: Array<{ id: string; name: string }>;
  peopleLoading: boolean;
  saving: boolean;
  serverError: string | null;
  onSubmit: (values: AllocationFormValues) => void;
}

// Mismo patrón que PersonFormDrawer y SquadFormDrawer: panel lateral con
// secciones, obligatorios marcados y contador de faltantes en el pie.
export const AllocationFormDrawer: React.FC<AllocationFormDrawerProps> = ({
  open,
  onOpenChange,
  allocation,
  squadName,
  people,
  peopleLoading,
  saving,
  serverError,
  onSubmit,
}) => {
  const editing = allocation !== undefined;
  const [values, setValues] = useState<AllocationFormValues>(
    allocation
      ? allocationAdapter.toFormValues(allocation)
      : emptyAllocationFormValues
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const missingRequiredCount = submitted
    ? countMissingRequiredFields(values, { editing })
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    onSubmit(values);
  };

  const personOptions = people.map((person) => ({
    value: person.id,
    label: person.name,
  }));

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={editing ? "Editar asignación" : "Asignar persona"}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            Célula:{" "}
            <strong className="font-semibold text-neutral-default">
              {squadName}
            </strong>
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="user" title="Persona" first>
            {/* UpdateAllocationRequest real no acepta personId/squadId — en
                edición la persona se muestra fija, no editable. */}
            {allocation ? (
              <div className="flex flex-col gap-1">
                <span className="text-label text-neutral-subtle">PERSONA</span>
                <span className="text-body text-neutral-default">
                  {allocation.personName}
                </span>
              </div>
            ) : (
              <Select
                label="Persona"
                required
                placeholder="Seleccionar persona…"
                options={personOptions}
                loading={peopleLoading}
                value={values.personId || undefined}
                error={errors.personId}
                onValueChange={(value) =>
                  setValues({ ...values, personId: value })
                }
              />
            )}
          </FormSection>

          <FormSection icon="fte" title="Dedicación">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  label="Dedicación"
                  required
                  suffix="%"
                  hint="BAU + Transformación debe ser igual a la dedicación."
                  placeholder="Ej. 80"
                  value={values.dedicationPercentage}
                  error={errors.dedicationPercentage}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      dedicationPercentage: e.target.value,
                    })
                  }
                />
              </div>
              <Input
                type="number"
                label="BAU"
                suffix="%"
                placeholder="Ej. 50"
                value={values.bauPercentage}
                error={errors.bauPercentage}
                onChange={(e) =>
                  setValues({ ...values, bauPercentage: e.target.value })
                }
              />
              <Input
                type="number"
                label="Transformación"
                suffix="%"
                placeholder="Ej. 30"
                value={values.transformationPercentage}
                error={errors.transformationPercentage}
                onChange={(e) =>
                  setValues({
                    ...values,
                    transformationPercentage: e.target.value,
                  })
                }
              />
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
              iconBefore={<Icon name={editing ? "save" : "plus"} size={20} />}
            >
              {saving
                ? "Guardando…"
                : editing
                  ? "Guardar cambios"
                  : "Asignar persona"}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
