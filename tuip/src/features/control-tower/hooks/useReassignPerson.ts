import React, { useState } from "react";
import { Icon, useToast } from "@tuya-ui/components";
import { useAllocationMutations } from "@features/allocations/hooks/useAllocationMutations";
import type { Allocation } from "@features/allocations/adapters/AllocationAdapter";
import type { OverviewPerson } from "../adapters/CapacityOverviewAdapter";
import type { ReassignPlan } from "../components/ReassignPersonDrawer";
import type { ReassignMode } from "../components/reassignValidation";

/** Lo mínimo que las mutaciones de asignación necesitan de una asignación existente. */
export function asAllocation(person: OverviewPerson): Allocation {
  const a = person.allocation!;
  return {
    id: a.id,
    personId: person.id,
    personName: person.name,
    squadId: a.squadId,
    squadName: a.squadName,
    dedicationPercentage: a.dedicationPercentage,
    bauPercentage: a.bauPercentage,
    transformationPercentage: a.transformationPercentage,
    personPosition: person.position,
    personModality: "Hybrid",
    personSeniority: 0,
    personSeniorityLabel: person.seniorityLabel,
    personAvailablePercentage: person.marginPercentage,
    createdAtUtc: "",
    updatedAtUtc: null,
  };
}

export interface OpenReassignOptions {
  initialMode?: ReassignMode;
  initialTargetSquadId?: string;
}

/**
 * Estado del drawer de reasignación y la regla de aplicar un plan: subir =
 * editar, asignar = crear, mover = quitar + crear. Vive acá para que la Torre
 * de control y el detalle de persona compartan una sola fuente de verdad.
 */
export const useReassignPerson = (onApplied: () => void) => {
  const { create, update, remove } = useAllocationMutations();
  const { toast } = useToast();

  const [target, setTarget] = useState<OverviewPerson | null>(null);
  const [options, setOptions] = useState<OpenReassignOptions>({});
  const [drawerKey, setDrawerKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const openFor = (person: OverviewPerson, opts: OpenReassignOptions = {}) => {
    setTarget(person);
    setOptions(opts);
    setServerError(null);
    setDrawerKey((k) => k + 1);
  };

  const close = () => setTarget(null);

  const handleSubmit = async (plan: ReassignPlan) => {
    if (!target) return;
    setSaving(true);
    setServerError(null);
    const values = {
      personId: target.id,
      dedicationPercentage: String(plan.dedicationPercentage),
      bauPercentage: String(plan.bauPercentage),
      transformationPercentage: String(plan.transformationPercentage),
    };
    let outcome: { success: boolean; error?: string };
    if (plan.mode === "raise") {
      outcome = await update(asAllocation(target), values);
    } else if (plan.mode === "assign") {
      outcome = await create(plan.targetSquadId, values);
    } else {
      // Mover = quitar + crear. No hay transacción: si la creación falla después
      // de quitar, se dice explícitamente; la persona queda "Sin célula", así
      // que el estado sigue visible y corregible.
      const removed = await remove(asAllocation(target));
      if (!removed.success) {
        outcome = removed;
      } else {
        const created = await create(plan.targetSquadId, values);
        outcome = created.success
          ? created
          : {
              success: false,
              error: `${created.error ?? "No se pudo crear la asignación"}. La asignación anterior ya fue quitada: vuelve a asignar a la persona.`,
            };
        if (!created.success) onApplied();
      }
    }
    setSaving(false);
    if (outcome.success) {
      toast({
        message:
          plan.mode === "assign"
            ? "Persona asignada"
            : plan.mode === "raise"
              ? "Dedicación actualizada"
              : "Persona reasignada",
        icon: React.createElement(Icon, { name: "status-success", size: 16 }),
      });
      setTarget(null);
      onApplied();
    } else {
      setServerError(outcome.error ?? "No se pudo aplicar el cambio");
    }
  };

  return {
    target,
    options,
    drawerKey,
    saving,
    serverError,
    openFor,
    close,
    handleSubmit,
  };
};
