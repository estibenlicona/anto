import React from "react";
import { Icon } from "@tuya-ui/components";
import type { SpanPendingDto } from "../services/careerPlanService";

export interface SpanPendingWorkProps {
  pending: SpanPendingDto;
  /** Adónde lleva cada pendiente. */
  onOpenAssessments: () => void;
  onOpenPeople: () => void;
  onOpenCatalog: () => void;
}

interface Fila {
  label: string;
  count: number;
  /** El rol de color del punto: qué tan urgente es lo que quedó sin hacer. */
  dot: string;
  onSelect: () => void;
}

/**
 * Lo que quedó por gestionar en el módulo. Las cuatro filas están siempre, con
 * su cifra: una fila que desaparece en cero no se distingue de una que nadie
 * miró, y la lista deja de leerse como un repaso completo.
 */
export const SpanPendingWork: React.FC<SpanPendingWorkProps> = ({
  pending,
  onOpenAssessments,
  onOpenPeople,
  onOpenCatalog,
}) => {
  const filas: Fila[] = [
    {
      // "Personas sin evaluar" y no "Evaluaciones sin cerrar": la cifra cuenta
      // gente sin ninguna evaluación cerrada, que no es lo mismo que
      // evaluaciones abiertas a medias.
      label: "Personas sin evaluar",
      count: pending.unassessed,
      dot: "bg-attention-high-fill",
      onSelect: onOpenAssessments,
    },
    {
      label: "Brechas sin plan",
      count: pending.gapsWithoutPlan,
      dot: "bg-attention-medium-fill",
      onSelect: onOpenPeople,
    },
    {
      label: "Planes vencidos",
      count: pending.overduePlans,
      dot: "bg-attention-low-fill",
      onSelect: onOpenPeople,
    },
    {
      label: "Cargos sin nivel declarado",
      count: pending.positionsWithoutLevel,
      dot: "bg-neutral-subtle-pressed",
      onSelect: onOpenCatalog,
    },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-surface border-default border-neutral-default bg-neutral-default p-4">
      <h2 className="text-label font-semibold text-neutral-default">
        Pendientes de gestión
      </h2>

      <ul className="flex flex-col">
        {filas.map((fila) => (
          <li key={fila.label}>
            <button
              type="button"
              onClick={fila.onSelect}
              className="flex w-full items-center gap-2 rounded-control py-2 text-left hover:bg-neutral-subtle"
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-pill ${fila.dot}`}
              />
              <span className="flex-1 truncate text-body-sm text-neutral-default">
                {fila.label}
              </span>
              <span className="text-body-sm font-semibold tabular-nums text-neutral-default">
                {fila.count}
              </span>
              <Icon name="chevron-right" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
