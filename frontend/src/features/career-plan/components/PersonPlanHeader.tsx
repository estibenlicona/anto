import React from "react";
import { Avatar, Badge, Button, Icon } from "@tuya-ui/components";
import type { PersonPlanView } from "../adapters/PersonPlanAdapter";

interface PersonPlanHeaderProps {
  plan: PersonPlanView;
  onAssess: () => void;
  onAddAction: () => void;
}

export const PersonPlanHeader: React.FC<PersonPlanHeaderProps> = ({
  plan,
  onAssess,
  onAddAction,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-center gap-3">
      <Avatar size="large" label={plan.personName} colorId={plan.personId}>
        {plan.initials}
      </Avatar>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-heading-lg font-semibold text-neutral-default">
            {plan.personName}
          </h1>
          {plan.assessed && (
            <Badge variant={plan.openGapCount > 0 ? "warning" : "success"}>
              {plan.openGapCount === 0
                ? "Sin brechas abiertas"
                : `${plan.openGapCount} ${plan.openGapCount === 1 ? "brecha abierta" : "brechas abiertas"}`}
            </Badge>
          )}
        </div>
        <p className="text-body-sm text-neutral-subtle">
          {plan.position}
          {plan.assessedOnLabel && ` · evaluada el ${plan.assessedOnLabel}`}
        </p>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="subtle"
        onClick={onAssess}
        iconBefore={<Icon name="expertise" size={16} />}
      >
        {plan.assessed ? "Reevaluar" : "Evaluar"}
      </Button>
      {/*
        La acción de marca es agregar una acción del plan: es lo que esta
        pantalla existe para producir.
      */}
      <Button
        variant="primary"
        disabled={!plan.assessed || plan.openGapCount === 0}
        onClick={onAddAction}
        iconBefore={<Icon name="plus" size={16} />}
      >
        Agregar acción
      </Button>
    </div>
  </div>
);
