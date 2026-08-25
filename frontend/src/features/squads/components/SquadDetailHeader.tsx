import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Button, Icon, Link, Menu, MenuItem } from "@tuya-ui/components";
import type { Squad } from "../adapters/SquadAdapter";
import type { Criticality } from "../services/squadService";

// Mismo mapa que SquadsList: la gravedad del nivel viste roles semánticos, y
// el badge va sin punto porque la criticidad clasifica, no dice un estado.
const criticalityVariant: Record<
  Criticality,
  "danger" | "warning" | "info" | "neutral"
> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

export interface SquadDetailHeaderProps {
  squad: Squad;
  onEdit: () => void;
  onAssign: () => void;
  onDelete: () => void;
}

export const SquadDetailHeader: React.FC<SquadDetailHeaderProps> = ({
  squad,
  onEdit,
  onAssign,
  onDelete,
}) => (
  <div className="flex items-start justify-between gap-6">
    <div className="flex min-w-0 flex-col gap-2">
      {/* Tono neutro: es un enlace de vuelta, no una acción a destacar. */}
      <Link asChild tone="neutral" className="w-fit text-body-sm">
        <RouterLink
          to="/app/lead/celulas"
          className="inline-flex items-center gap-1.5 text-neutral-subtle"
        >
          <Icon name="arrow-left" size={16} />
          Células
        </RouterLink>
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-heading-lg font-semibold text-neutral-default">
          {squad.name}
        </h1>
        <Badge dot={false} variant={criticalityVariant[squad.criticality]}>
          {squad.criticalityLabel}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-body-sm text-neutral-subtle">
          <Icon name="team" size={16} />
          {squad.team}
        </span>
      </div>
      {squad.description && (
        <p className="max-w-2xl text-body-sm text-neutral-subtle">
          {squad.description}
        </p>
      )}
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="secondary"
        onClick={onEdit}
        iconBefore={<Icon name="edit" size={16} />}
      >
        Editar célula
      </Button>
      <Button
        variant="primary"
        onClick={onAssign}
        iconBefore={<Icon name="user" size={16} />}
      >
        Asignar persona
      </Button>
      <Menu
        trigger={
          <Button variant="subtle" aria-label="Más acciones">
            <Icon name="more" size={16} />
          </Button>
        }
      >
        <MenuItem
          destructive
          icon={<Icon name="delete" size={16} />}
          onSelect={onDelete}
        >
          Eliminar célula
        </MenuItem>
      </Menu>
    </div>
  </div>
);
