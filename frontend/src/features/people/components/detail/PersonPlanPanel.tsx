import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Link } from "@tuya-ui/components";
import type { PersonPlanView } from "@features/career-plan/adapters/PersonPlanAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";

export interface PersonPlanPanelProps {
  plan: PersonPlanView | null;
  /** Ruta del plan de la persona en Competencias. */
  planHref: string;
}

/**
 * Las acciones acordadas, de sólo lectura: agregar y marcar cumplidas se hace
 * en Competencias — por eso "Agregar acción" navega en vez de abrir un drawer.
 */
export const PersonPlanPanel: React.FC<PersonPlanPanelProps> = ({
  plan,
  planHref,
}) => (
  <DetailPanel
    title="Plan de desarrollo"
    subtitle={plan?.assessed ? "cada acción nace de una brecha" : undefined}
    right={
      <Link asChild tone="neutral" className="text-body-sm">
        <RouterLink to={planHref}>Agregar acción</RouterLink>
      </Link>
    }
    className="flex flex-col px-4 pb-2 pt-1"
  >
    {!plan || plan.actions.length === 0 ? (
      <div className="flex flex-col items-start gap-1 py-4">
        <span className="text-body-sm font-medium text-neutral-default">
          Todavía no hay acciones acordadas
        </span>
        <span className={SECONDARY_TEXT}>
          Una acción nace de una brecha y se acuerda en Competencias.
        </span>
      </div>
    ) : (
      <>
        <ul className="flex flex-col">
          {plan.actions.map((action, index) => (
            <li
              key={action.id}
              className={`flex flex-col gap-1 py-2.5 ${
                index === plan.actions.length - 1
                  ? ""
                  : "border-b border-neutral-default"
              }`}
            >
              <span className="text-body-sm font-medium text-neutral-default">
                {action.title}
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className={SECONDARY_TEXT}>
                  {action.skillName} · {action.objectiveLabel} ·{" "}
                  {action.dueLabel}
                </span>
                <Badge variant={action.done ? "success" : "info"}>
                  {action.statusLabel}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
        {/* La regla del módulo, donde alguien podría creer que marcar
            cumplida cierra la brecha. */}
        <p className={`border-t border-neutral-default py-2 ${SECONDARY_TEXT}`}>
          Cerrar una brecha no es marcar la acción: es reevaluar la habilidad y
          que el nivel nuevo alcance lo que pide su cargo.
        </p>
      </>
    )}
  </DetailPanel>
);
