import React from "react";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import type { PersonPlanView } from "../adapters/PersonPlanAdapter";

interface PlanActionsTableProps {
  plan: PersonPlanView;
  saving: boolean;
  onComplete: (actionId: string) => void;
  onAddAction: () => void;
}

export const PlanActionsTable: React.FC<PlanActionsTableProps> = ({
  plan,
  saving,
  onComplete,
  onAddAction,
}) => (
  <section>
    <div className="mb-3 flex flex-wrap items-baseline gap-2">
      {/* "Plan de desarrollo" y no "Plan de carrera": el módulo entero se
          llama Competencias, y acá lo que se lista son las acciones acordadas
          para cerrar brechas — el mismo término con el que el mapa cuenta los
          planes vencidos. */}
      <h2 className="text-body font-semibold text-neutral-default">
        Plan de desarrollo
      </h2>
      <span className="text-body-sm text-neutral-subtle">
        cada acción nace de una brecha
      </span>
    </div>

    {/*
      La información accionable primero: una brecha sin acción es lo que la
      pantalla existe para que no pase desapercibido.
    */}
    {plan.gapsWithoutAction.length > 0 && (
      <Alert variant="warning" className="mb-3">
        Sin ninguna acción:{" "}
        {plan.gapsWithoutAction.map((s) => s.skillName).join(", ")}.
      </Alert>
    )}

    {plan.actions.length === 0 ? (
      <EmptyState
        icon={<Icon name="target" size={32} />}
        title="Todavía no hay acciones acordadas"
        description="Una acción del plan nace de una brecha y dice a qué nivel apunta y para cuándo."
        action={
          <Button
            variant="primary"
            disabled={plan.openGapCount === 0}
            onClick={onAddAction}
          >
            Agregar la primera
          </Button>
        }
      />
    ) : (
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Acción</TableHead>
            <TableHead>Cierra la brecha de</TableHead>
            <TableHead>Objetivo</TableHead>
            <TableHead>Compromiso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plan.actions.map((action) => (
            <TableRow key={action.id}>
              <TableCell>{action.title}</TableCell>
              <TableCell>{action.skillName}</TableCell>
              <TableCell>{action.objectiveLabel}</TableCell>
              <TableCell>{action.dueLabel}</TableCell>
              <TableCell>
                <Badge variant={action.done ? "success" : "info"}>
                  {action.statusLabel}
                </Badge>
              </TableCell>
              <TableCell align="right">
                {/* Subtle en el listado: el rojo de marca es de la acción
                    primaria de la pantalla, no de una fila. */}
                {!action.done && (
                  <Button
                    variant="subtle"
                    size="small"
                    disabled={saving}
                    onClick={() => onComplete(action.id)}
                  >
                    Marcar cumplida
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}

    {/*
      La regla vive donde se administran las acciones, no en la ayuda: es
      exactamente acá donde alguien podría creer que marcar cumplida cierra la
      brecha.
    */}
    <p className="mt-3 max-w-prose text-body-sm text-neutral-subtle">
      Cerrar una brecha no es marcar la acción: es reevaluar la habilidad y que
      el nivel nuevo alcance lo que pide su cargo.
    </p>
  </section>
);
