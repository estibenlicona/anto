import React from "react";
import { Button, Card, Icon } from "@tuya-ui/components";
import type { UnassignedPeopleView } from "../adapters/ExpertiseLinesAdapter";

interface UnassignedPeopleProps {
  unassigned: UnassignedPeopleView;
  expanded: boolean;
  onToggle: () => void;
  onAssign: (personId: string) => void;
}

/**
 * Quién está sin línea no es un estado vacío: es trabajo pendiente, y va en la
 * propia pantalla porque el momento en que alguien se entera de que hay gente
 * sin repartir es el momento en que puede repartirla.
 */
export const UnassignedPeople: React.FC<UnassignedPeopleProps> = ({
  unassigned,
  expanded,
  onToggle,
  onAssign,
}) => {
  if (unassigned.allAssigned) {
    return (
      <Card className="flex items-center gap-2 p-4 text-body-sm text-neutral-subtle">
        <Icon name="status-success" size={16} />
        Todas las personas registradas pertenecen a una línea.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-subtlest focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring"
      >
        <span className="flex items-center gap-2 text-body-sm text-warning-default">
          <Icon name="status-warning" size={16} />
          <span className="font-medium">
            {unassigned.count} {unassigned.count === 1 ? "persona" : "personas"}{" "}
            sin línea
          </span>
        </span>
        <Icon name={expanded ? "chevron-down" : "chevron-right"} size={16} />
      </button>

      {expanded && (
        <div className="border-t-default border-neutral-default">
          {unassigned.people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between gap-4 px-4 py-2"
            >
              <span>
                <span className="block text-body-sm font-medium text-neutral-default">
                  {person.name}
                </span>
                <span className="block text-body-sm text-neutral-subtle">
                  {person.position} · {person.seniorityLabel} ·{" "}
                  {person.availableFteLabel} FTE
                </span>
              </span>
              {/*
                Se reparte de a uno desde acá, sin tener que abrir la línea
                destino: el reparto se hace mirando la lista de quien falta.
              */}
              <Button variant="subtle" onClick={() => onAssign(person.id)}>
                Asignar a una línea
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
