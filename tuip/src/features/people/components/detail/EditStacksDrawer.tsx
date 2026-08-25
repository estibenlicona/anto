import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Combobox,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  SegmentedControl,
  Select,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import type { PersonStackDto } from "../../services/personService";
import type { Seniority } from "../../services/personService";
import type { PersonDetailStack } from "../../adapters/PersonDetailAdapter";
import { validateStacks, type StacksErrors } from "./stacksValidation";

export interface EditStacksDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  /** Los stacks actuales, con su cobertura: sirven para avisar al quitar uno sin otra cobertura. */
  current: PersonDetailStack[];
  catalog: string[];
  saving: boolean;
  serverError: string | null;
  onSubmit: (stacks: PersonStackDto[]) => void;
}

const LEVELS: Array<{ value: string; label: string }> = [
  { value: "1", label: "Princ." },
  { value: "2", label: "Comp." },
  { value: "3", label: "Avanz." },
  { value: "4", label: "Exp." },
];

const DEFAULT_LEVEL: Seniority = 2;

/**
 * Editar los stacks de una persona: agregar del catálogo, nivel por stack,
 * uno principal, quitar. Todo con piezas de tuip (design.md D3).
 */
export const EditStacksDrawer: React.FC<EditStacksDrawerProps> = ({
  open,
  onOpenChange,
  personName,
  current,
  catalog,
  saving,
  serverError,
  onSubmit,
}) => {
  const [stacks, setStacks] = useState<PersonStackDto[]>(() =>
    current.map(({ name, level, isPrimary }) => ({
      name,
      level: level as Seniority,
      isPrimary,
    }))
  );
  const [submitted, setSubmitted] = useState(false);
  const errors: StacksErrors = submitted ? validateStacks(stacks) : {};

  const names = stacks.map((s) => s.name);
  const primary = stacks.find((s) => s.isPrimary)?.name ?? "";

  // Stacks que la persona tenía y nadie más cubre: si se quitan, el chapter queda sin ellos.
  const uncovered = useMemo(
    () =>
      current
        .filter((c) => c.otherCoverers === 0 && !names.includes(c.name))
        .map((c) => c.name),
    [current, names]
  );

  const setSelection = (selected: string[]) => {
    const kept = stacks.filter((s) => selected.includes(s.name));
    const added = selected
      .filter((n) => !stacks.some((s) => s.name === n))
      .map((name) => ({ name, level: DEFAULT_LEVEL, isPrimary: false }));
    const next = [...kept, ...added];
    // Si el principal se fue, el primero que quede lo hereda: nunca se guarda sin principal.
    if (next.length > 0 && !next.some((s) => s.isPrimary))
      next[0] = { ...next[0], isPrimary: true };
    setStacks(next);
  };

  const setLevel = (name: string, level: Seniority) =>
    setStacks((prev) =>
      prev.map((s) => (s.name === name ? { ...s, level } : s))
    );

  const setPrimary = (name: string) =>
    setStacks((prev) =>
      prev.map((s) => ({ ...s, isPrimary: s.name === name }))
    );

  const remove = (name: string) =>
    setSelection(names.filter((n) => n !== name));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateStacks(stacks)).length > 0) return;
    const ordered = [...stacks].sort(
      (a, b) => Number(b.isPrimary) - Number(a.isPrimary)
    );
    onSubmit(ordered);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={`Stacks de ${personName}`}>
          <p className="mt-1 text-body-sm text-neutral-subtle">
            Qué tecnologías domina y con qué nivel. Un stack es el principal.
          </p>
        </DrawerHeader>
        <DrawerBody>
          <FormSection icon="plus" title="Agregar" first>
            <Combobox
              multiple
              label="Del catálogo del chapter"
              options={catalog.map((name) => ({ value: name, label: name }))}
              value={names}
              onValueChange={setSelection}
              placeholder="Buscar un stack…"
            />
          </FormSection>

          <FormSection
            icon="expertise"
            title={`Sus stacks${stacks.length ? ` · ${stacks.length}` : ""}`}
          >
            {stacks.length === 0 ? (
              <p className="text-body-sm text-neutral-subtle">
                Todavía no tiene stacks. Agrega al menos uno arriba.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <ul className="flex flex-col overflow-hidden rounded-surface border border-neutral-default">
                  {stacks.map((s, index) => (
                    <li
                      key={s.name}
                      className={`flex items-center gap-3 px-3 py-2.5 ${
                        index > 0 ? "border-t border-neutral-default" : ""
                      }`}
                    >
                      <span className="min-w-0 flex-1 text-body-sm font-medium text-neutral-default">
                        {s.name}
                        {s.isPrimary && (
                          <span className="ml-2 text-label font-normal tracking-normal text-neutral-subtle">
                            Principal
                          </span>
                        )}
                      </span>
                      <SegmentedControl
                        label={`Nivel en ${s.name}`}
                        options={LEVELS}
                        value={String(s.level)}
                        onValueChange={(v) =>
                          setLevel(s.name, Number(v) as Seniority)
                        }
                      />
                      <Button
                        type="button"
                        variant="subtle"
                        size="small"
                        aria-label={`Quitar ${s.name}`}
                        onClick={() => remove(s.name)}
                      >
                        <Icon name="close" size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
                <Select
                  label="Stack principal"
                  options={stacks.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  value={primary || undefined}
                  onValueChange={setPrimary}
                  required
                  error={errors.primary}
                  hint={
                    errors.primary
                      ? undefined
                      : "El primero que se muestra en el listado."
                  }
                />
              </div>
            )}
            {uncovered.length > 0 && (
              <Alert
                variant="warning"
                title="El chapter quedaría sin cobertura"
              >
                Nadie más cubre {uncovered.join(", ")}. Se puede guardar igual,
                pero quedará como stack sin nadie.
              </Alert>
            )}
            {errors.duplicates && (
              <p role="alert" className="text-body-sm text-danger-default">
                {errors.duplicates}
              </p>
            )}
          </FormSection>

          {serverError && (
            <p role="alert" className="text-body-sm text-danger-default">
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
