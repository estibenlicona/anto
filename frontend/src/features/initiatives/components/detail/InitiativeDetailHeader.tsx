import React from "react";
import { Badge, Button, Icon } from "@tuya-ui/components";
import type { Initiative } from "../../adapters/InitiativeAdapter";
import { monthsText } from "../../adapters/InitiativeAdapter";

export interface InitiativeDetailHeaderProps {
  initiative: Initiative;
  onEdit: () => void;
  onActivate: () => void;
  onClose: () => void;
}

/**
 * Nombre, estado y ficha técnica de la iniciativa, con el siguiente paso como
 * acción principal — el mismo que el listado ofrece en su columna, para que la
 * fila y la ficha no propongan cosas distintas sobre la misma iniciativa.
 */
export const InitiativeDetailHeader: React.FC<InitiativeDetailHeaderProps> = ({
  initiative,
  onEdit,
  onActivate,
  onClose,
}) => {
  const step = initiative.nextStep;
  // "Evaluar" no sube al encabezado: cuando ése es el paso, la ficha no tiene
  // lectura que mostrar y el estado vacío que ocupa su lugar ya lleva esa
  // llamada. Dos botones idénticos en la misma pantalla no dan una salida
  // más, sólo obligan a elegir entre dos cosas que hacen lo mismo.
  const primary =
    step.kind === "activate"
      ? { label: step.label, icon: "check" as const, onClick: onActivate }
      : step.kind === "close"
        ? { label: step.label, icon: "close" as const, onClick: onClose }
        : null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-heading-lg font-semibold text-neutral-default">
            {initiative.name}
          </h1>
          <Badge variant={initiative.statusVariant}>
            {initiative.statusLabel}
          </Badge>
        </div>
        <p className="text-body-sm text-neutral-subtle">
          Célula {initiative.squadName} · Product Owner:{" "}
          {initiative.productOwner} · plazo objetivo{" "}
          {monthsText(initiative.targetMonths)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onEdit}>
          Editar iniciativa
        </Button>
        {primary && (
          <Button
            variant="primary"
            onClick={primary.onClick}
            iconBefore={<Icon name={primary.icon} size={16} />}
          >
            {primary.label}
          </Button>
        )}
      </div>
    </div>
  );
};
