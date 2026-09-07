import React from "react";
import { Badge, Button, Icon } from "@tuya-ui/components";
import type { ListSprintDto } from "../services/dedicationService";
import { sprintRangeLabel } from "../adapters/DedicationAdapter";

export interface SprintNavigatorProps {
  /** `null` mientras carga o cuando el chapter no tiene sprints. */
  sprint: ListSprintDto | null;
  onSelect: (name: "previous" | "next") => void;
  className?: string;
}

/**
 * El sprint del que habla **todo** el listado, en la franja del breadcrumb.
 *
 * Va acá y no en la toolbar porque no es un filtro: la toolbar acota el
 * conjunto de filas, y esto cambia de qué se está hablando. No se avanza más
 * allá del sprint en curso —mirar hacia adelante no dice nada todavía— y el
 * en curso se marca —y el cerrado también— para que no se confundan.
 */
export const SprintNavigator: React.FC<SprintNavigatorProps> = ({
  sprint,
  onSelect,
  className = "",
}) => {
  if (!sprint) return null;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="subtle"
        size="small"
        aria-label="Sprint anterior"
        disabled={sprint.previousName === null}
        onClick={() => onSelect("previous")}
        iconBefore={
          <Icon name="chevron-right" size={16} className="rotate-180" />
        }
      />
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-body-sm font-semibold text-neutral-default">
          {sprint.name}
        </span>
        <span className="text-body-sm tabular-nums text-neutral-subtle">
          {sprintRangeLabel(sprint.startDate, sprint.endDate)}
        </span>
      </span>
      <Button
        variant="subtle"
        size="small"
        aria-label="Sprint siguiente"
        disabled={sprint.nextName === null}
        onClick={() => onSelect("next")}
        iconBefore={<Icon name="chevron-right" size={16} />}
      />
      <Badge variant={sprint.isCurrent ? "info" : "neutral"}>
        {sprint.isCurrent ? "En curso" : "Finalizado"}
      </Badge>
    </div>
  );
};
