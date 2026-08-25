import React, { useMemo, useState } from "react";
import {
  Button,
  CapacityBar,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Icon,
  Input,
  Select,
} from "@tuya-ui/components";
import { FormSection } from "@shared/components/FormSection";
import { DedicationCell } from "@shared/components/DedicationCell";
import { MIX_COLORS } from "@features/squads/components/mixColors";
import type {
  OverviewPerson,
  OverviewSquad,
} from "../adapters/CapacityOverviewAdapter";
import {
  countMissingRequiredFields,
  validateReassign,
  type ReassignFieldErrors,
  type ReassignFormValues,
  type ReassignMode,
} from "./reassignValidation";

export interface ReassignPlan {
  mode: ReassignMode;
  targetSquadId: string;
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
}

export interface ReassignPersonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: OverviewPerson;
  /** Ya ordenadas por necesidad (sin equipo, al tope, resto). */
  squads: OverviewSquad[];
  saving: boolean;
  serverError: string | null;
  onSubmit: (plan: ReassignPlan) => void;
  /**
   * Modo y destino con los que arranca (opt-in: el detalle de persona abre el
   * drawer ya en "subir" o "mover", o en "asignar" con una célula elegida).
   * Sin ellos, el comportamiento es el de siempre: mover si tiene célula,
   * asignar si no. `raise` sin célula cae en `assign`.
   */
  initialMode?: ReassignMode;
  initialTargetSquadId?: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function initialValues(
  person: OverviewPerson,
  initialMode?: ReassignMode,
  initialTargetSquadId?: string
): ReassignFormValues {
  const a = person.allocation;
  const mode: ReassignMode = a
    ? initialMode === "raise"
      ? "raise"
      : "move"
    : "assign";
  return {
    mode,
    targetSquadId: mode === "raise" ? a!.squadId : (initialTargetSquadId ?? ""),
    dedicationPercentage: a ? String(a.dedicationPercentage) : "100",
    bauPercentage: a ? String(a.bauPercentage) : "",
    transformationPercentage: a ? String(a.transformationPercentage) : "",
  };
}

/**
 * Asignar (sin célula) o reasignar (mover a otra célula / subir la dedicación
 * donde está) a una persona, con el "Así queda" calculado en el cliente desde
 * el resumen de capacidad. Mismo esqueleto que los demás drawers de captura.
 */
export const ReassignPersonDrawer: React.FC<ReassignPersonDrawerProps> = ({
  open,
  onOpenChange,
  person,
  squads,
  saving,
  serverError,
  onSubmit,
  initialMode,
  initialTargetSquadId,
}) => {
  const current = person.allocation;
  const [values, setValues] = useState<ReassignFormValues>(() =>
    initialValues(person, initialMode, initialTargetSquadId)
  );
  const [errors, setErrors] = useState<ReassignFieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (patch: Partial<ReassignFormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  const setMode = (mode: ReassignMode) => {
    if (mode === "raise" && current) {
      set({ mode, targetSquadId: current.squadId });
    } else {
      set({ mode, targetSquadId: "" });
    }
  };

  const missingRequiredCount = submitted
    ? countMissingRequiredFields(values)
    : 0;

  const modeOptions = current
    ? [
        { value: "move", label: "Mover a otra célula" },
        {
          value: "raise",
          label: `Subir la dedicación en ${current.squadName}`,
        },
      ]
    : [{ value: "assign", label: "Asignar a una célula" }];

  const targetOptions = squads
    .filter((s) => !current || s.id !== current.squadId)
    .map((s) => ({
      value: s.id,
      label: `${s.name} · ${
        s.withoutTeam
          ? "sin equipo"
          : s.atCapacity
            ? "al tope"
            : `${s.freeFte.toFixed(1)} libre`
      }`,
    }));

  // "Así queda": sólo cuando el plan es válido, desde los datos del resumen.
  const preview = useMemo(() => {
    const fieldErrors = validateReassign(
      values,
      current?.dedicationPercentage ?? null
    );
    if (Object.keys(fieldErrors).length > 0) return null;
    const dedication = Number(values.dedicationPercentage);
    const bau = Number(values.bauPercentage);
    const transformation = Number(values.transformationPercentage);
    const fteOf = (pct: number) => (person.availableFte * pct) / 100;
    const origin = current
      ? squads.find((s) => s.id === current.squadId)
      : undefined;
    const target = squads.find((s) => s.id === values.targetSquadId);
    const originAfter =
      origin && current && values.mode === "move"
        ? {
            ...origin,
            allocatedFte: round1(
              origin.allocatedFte - fteOf(current.dedicationPercentage)
            ),
            bauFte: round1(origin.bauFte - fteOf(current.bauPercentage)),
            transformationFte: round1(
              origin.transformationFte - fteOf(current.transformationPercentage)
            ),
            teamAvailableFte: round1(
              origin.teamAvailableFte - person.availableFte
            ),
            memberCount: origin.memberCount - 1,
          }
        : null;
    let targetAfter: OverviewSquad | null = null;
    if (values.mode === "raise" && origin && current) {
      targetAfter = {
        ...origin,
        allocatedFte: round1(
          origin.allocatedFte -
            fteOf(current.dedicationPercentage) +
            fteOf(dedication)
        ),
        bauFte: round1(
          origin.bauFte - fteOf(current.bauPercentage) + fteOf(bau)
        ),
        transformationFte: round1(
          origin.transformationFte -
            fteOf(current.transformationPercentage) +
            fteOf(transformation)
        ),
      };
    } else if (target) {
      targetAfter = {
        ...target,
        allocatedFte: round1(target.allocatedFte + fteOf(dedication)),
        bauFte: round1(target.bauFte + fteOf(bau)),
        transformationFte: round1(
          target.transformationFte + fteOf(transformation)
        ),
        teamAvailableFte: round1(target.teamAvailableFte + person.availableFte),
        memberCount: target.memberCount + 1,
      };
    }
    return {
      dedication,
      bau,
      transformation,
      originAfter,
      targetAfter,
      origin,
      target,
    };
  }, [values, current, person, squads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const fieldErrors = validateReassign(
      values,
      current?.dedicationPercentage ?? null
    );
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    onSubmit({
      mode: values.mode,
      targetSquadId: values.targetSquadId,
      dedicationPercentage: Number(values.dedicationPercentage),
      bauPercentage: Number(values.bauPercentage),
      transformationPercentage: Number(values.transformationPercentage),
    });
  };

  const title = current
    ? `Reasignar a ${person.name}`
    : `Asignar a ${person.name}`;
  const subtitle = current
    ? `Hoy está en ${current.squadName} al ${current.dedicationPercentage}%: le quedan ${person.marginFte.toFixed(1)} FTE sin usar.`
    : `No tiene célula: ${person.availableFte.toFixed(1)} FTE disponibles.`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} size="lg">
      <form className="flex h-full flex-col" onSubmit={handleSubmit}>
        <DrawerHeader title={title}>
          <p className="mt-1 text-body-sm text-neutral-subtle">{subtitle}</p>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <FormSection icon="user" title="Situación actual" first>
            {current ? (
              <div className="flex flex-col gap-1.5">
                <DedicationCell
                  className="w-full"
                  squadName={current.squadName}
                  dedicationPercentage={current.dedicationPercentage}
                  bauPercentage={current.bauPercentage}
                  transformationPercentage={current.transformationPercentage}
                />
                <span className="text-label tracking-normal tabular-nums font-semibold text-success-default">
                  {person.marginPercentage}% libre
                </span>
              </div>
            ) : (
              <p className="text-body-sm text-neutral-subtle">
                Sin célula. Disponible desde el alta,{" "}
                {person.availableFte.toFixed(1)} FTE.
              </p>
            )}
          </FormSection>

          <FormSection
            icon="sync"
            title={current ? "Qué hacer con el margen" : "Dónde asignar"}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Acción"
                required
                options={modeOptions}
                value={values.mode}
                onValueChange={(value) => setMode(value as ReassignMode)}
              />
              {values.mode === "raise" && current ? (
                <Input label="Célula" value={current.squadName} readOnly />
              ) : (
                <Select
                  label="Célula destino"
                  required
                  placeholder="Seleccionar célula…"
                  options={targetOptions}
                  value={values.targetSquadId || undefined}
                  error={errors.targetSquadId}
                  hint="Las que más gente necesitan primero."
                  onValueChange={(value) => set({ targetSquadId: value })}
                />
              )}
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  label={
                    values.mode === "raise"
                      ? "Nueva dedicación"
                      : "Dedicación en la célula"
                  }
                  required
                  suffix="%"
                  hint={
                    values.mode === "move"
                      ? "Al mover, la asignación actual se quita: una persona está en una sola célula."
                      : "BAU + Transformación debe ser igual a la dedicación."
                  }
                  value={values.dedicationPercentage}
                  error={errors.dedicationPercentage}
                  onChange={(e) =>
                    set({ dedicationPercentage: e.target.value })
                  }
                />
              </div>
              <Input
                type="number"
                label="BAU"
                suffix="%"
                value={values.bauPercentage}
                error={errors.bauPercentage}
                onChange={(e) => set({ bauPercentage: e.target.value })}
              />
              <Input
                type="number"
                label="Transformación"
                suffix="%"
                value={values.transformationPercentage}
                error={errors.transformationPercentage}
                onChange={(e) =>
                  set({ transformationPercentage: e.target.value })
                }
              />
            </div>
          </FormSection>

          {preview && preview.targetAfter && (
            <FormSection icon="check" title="Así queda">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 rounded-surface border border-neutral-default bg-neutral-subtlest p-3">
                  <div className="flex items-baseline justify-between text-body-sm">
                    <span className="font-semibold text-neutral-default">
                      {person.name}
                    </span>
                    <span className="tabular-nums text-neutral-subtle">
                      {current
                        ? `${current.squadName} · ${current.dedicationPercentage}%`
                        : "Sin célula"}{" "}
                      →{" "}
                      <span className="font-semibold text-neutral-default">
                        {preview.targetAfter.name} · {preview.dedication}%
                      </span>
                    </span>
                  </div>
                  <DedicationCell
                    className="w-full"
                    bauPercentage={preview.bau}
                    transformationPercentage={preview.transformation}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {preview.originAfter && (
                    <div className="flex flex-col gap-1.5 rounded-surface border border-neutral-default p-3">
                      <span className="text-label font-normal tracking-normal text-neutral-subtle">
                        {preview.originAfter.name}
                        {preview.originAfter.memberCount === 0 && (
                          <span className="text-danger-default">
                            {" "}
                            · pierde a su única persona
                          </span>
                        )}
                      </span>
                      <CapacityBar
                        separated
                        allocated={preview.originAfter.allocatedFte}
                        available={preview.originAfter.teamAvailableFte}
                        unit="FTE"
                        emptyLabel="Queda sin equipo"
                        parts={
                          preview.originAfter.memberCount === 0
                            ? []
                            : [
                                {
                                  label: "BAU",
                                  value: preview.originAfter.bauFte,
                                  color: MIX_COLORS.bau,
                                },
                                {
                                  label: "Transf.",
                                  value: preview.originAfter.transformationFte,
                                  color: MIX_COLORS.transformation,
                                },
                              ]
                        }
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 rounded-surface border border-brand-default bg-brand-subtle p-3">
                    <span className="text-label font-normal tracking-normal text-neutral-subtle">
                      {preview.targetAfter.name}
                    </span>
                    <CapacityBar
                      separated
                      allocated={preview.targetAfter.allocatedFte}
                      available={preview.targetAfter.teamAvailableFte}
                      unit="FTE"
                      parts={[
                        {
                          label: "BAU",
                          value: preview.targetAfter.bauFte,
                          color: MIX_COLORS.bau,
                        },
                        {
                          label: "Transf.",
                          value: preview.targetAfter.transformationFte,
                          color: MIX_COLORS.transformation,
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          )}
          {serverError && (
            <p className="px-6 pb-5 text-body-sm text-danger-default">
              {serverError}
            </p>
          )}
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
              iconBefore={<Icon name="sync" size={20} />}
            >
              {saving ? "Aplicando…" : current ? "Reasignar" : "Asignar"}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
};
