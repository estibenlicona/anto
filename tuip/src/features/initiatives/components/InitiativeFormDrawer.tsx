import React, { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Input,
  Select,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type { Initiative } from "../adapters/InitiativeAdapter";
import {
  emptyInitiativeFormValues,
  TARGET_MONTHS_MAX,
  TARGET_MONTHS_MIN,
  validateInitiative,
  type InitiativeFieldErrors,
  type InitiativeFormValues,
} from "./initiativeValidation";

export interface InitiativeFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Con iniciativa es edición; sin ella, alta. */
  initiative?: Initiative;
  squadOptions: Array<{ value: string; label: string }>;
  saving: boolean;
  serverError: string | null;
  onSubmit: (values: InitiativeFormValues) => void;
}

function valuesFrom(initiative?: Initiative): InitiativeFormValues {
  if (!initiative) return emptyInitiativeFormValues;
  return {
    name: initiative.name,
    squadId: initiative.squadId,
    productOwner: initiative.productOwner,
    targetMonths: String(initiative.targetMonths),
  };
}

export const InitiativeFormDrawer: React.FC<InitiativeFormDrawerProps> = ({
  open,
  onOpenChange,
  initiative,
  squadOptions,
  saving,
  serverError,
  onSubmit,
}) => {
  const [values, setValues] = useState<InitiativeFormValues>(() =>
    valuesFrom(initiative)
  );
  const [errors, setErrors] = useState<InitiativeFieldErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateInitiative(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    onSubmit(values);
  };

  const evaluated = Boolean(initiative?.evaluation);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader
          title={initiative ? "Editar iniciativa" : "Nueva iniciativa"}
        >
          {/*
            El mismo texto en el alta y en la edición: el formulario captura
            lo mismo en los dos casos, y decirlo de dos maneras se lee como si
            significaran cosas distintas.
          */}
          <p className="mt-1 text-body-sm text-neutral-subtle">
            Qué es la iniciativa y quién la solicita. La capacidad que requiere
            se define aparte, en su evaluación.
          </p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="expertise" title="Iniciativa" first>
            <Input
              label="Nombre"
              required
              placeholder="Ej. Pago con QR en App"
              value={values.name}
              error={errors.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Célula"
                required
                placeholder="Elegir célula…"
                options={squadOptions}
                value={values.squadId || undefined}
                onValueChange={(squadId) => setValues({ ...values, squadId })}
                error={errors.squadId}
              />
              <Input
                label="Product Owner"
                required
                placeholder="Ej. Diego Cardona"
                value={values.productOwner}
                error={errors.productOwner}
                onChange={(e) =>
                  setValues({ ...values, productOwner: e.target.value })
                }
              />
            </div>
          </FormSection>
          <FormSection icon="hours-log" title="Plazo objetivo">
            <Input
              label="Meses"
              required
              type="number"
              min={TARGET_MONTHS_MIN}
              max={TARGET_MONTHS_MAX}
              value={values.targetMonths}
              error={errors.targetMonths}
              hint={
                evaluated
                  ? "Cambiar el plazo recalcula el FTE esperado; la talla no cambia."
                  : "Para cuándo la quiere el negocio. No cambia la talla: sólo cuánta gente hace falta a la vez."
              }
              onChange={(e) =>
                setValues({ ...values, targetMonths: e.target.value })
              }
            />
          </FormSection>
          {serverError && (
            <p
              role="alert"
              className="px-6 py-4 text-body-sm text-danger-default"
            >
              {serverError}
            </p>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            Guardar
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
