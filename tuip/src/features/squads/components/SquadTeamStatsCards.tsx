import React from "react";
import {
  Avatar,
  AvatarGroup,
  Card,
  CardBody,
  CapacityBar,
  Icon,
} from "@tuya-ui/components";
import { MIX_COLORS } from "./mixColors";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type { SquadTeamStats } from "../services/squadService";

export interface SquadTeamStatsCardsProps {
  stats: SquadTeamStats | null;
  loading: boolean;
}

export const SquadTeamStatsCards: React.FC<SquadTeamStatsCardsProps> = ({
  stats,
  loading,
}) => {
  if (loading || !stats) {
    return null;
  }

  const bauPct =
    stats.allocatedFte > 0
      ? Math.round((stats.bauFte / stats.allocatedFte) * 100)
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label text-neutral-subtle">PERSONAS</span>
            <Icon name="team" size={16} className="text-neutral-subtle" />
          </div>
          <span className="text-metric tabular-nums text-neutral-default">
            {stats.memberCount}
          </span>
          <div className="mt-auto flex items-center gap-3">
            {stats.members.length > 0 && (
              <AvatarGroup max={4}>
                {stats.members.map((member) => (
                  <Avatar
                    key={member.id}
                    size="small"
                    label={member.name}
                    colorId={member.id}
                  >
                    {getPersonInitials(member.name)}
                  </Avatar>
                ))}
              </AvatarGroup>
            )}
            <span className="text-body-sm text-neutral-subtle">
              <span className="font-bold tabular-nums text-neutral-default">
                {stats.expertCount}
              </span>{" "}
              {stats.expertCount === 1 ? "experto" : "expertos"}
              <span aria-hidden="true"> · </span>
              <span className="font-bold tabular-nums text-neutral-default">
                {stats.beginnerCount}
              </span>{" "}
              {stats.beginnerCount === 1
                ? "requiere acompañamiento"
                : "requieren acompañamiento"}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Capacidad y mix fusionados: el total del mix ES la capacidad
          asignada, así que una sola card dice ambas cosas — asignado sobre
          disponible con el porcentaje por severidad, la barra apilada cuyas
          partes son el reparto BAU/Transformación y cuyo track vacío es lo
          libre. Misma pieza y misma lectura que la fila de esta célula en
          "Ocupación por célula" de la Torre de control. */}
      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label text-neutral-subtle">CAPACIDAD</span>
            <Icon name="fte" size={16} className="text-neutral-subtle" />
          </div>
          <CapacityBar
            separated
            allocated={stats.allocatedFte}
            available={stats.peopleAvailableFte}
            unit="FTE"
            // Sin partes cuando no hay nada asignado: es lo que activa el
            // estado vacío de CapacityBar (mismo patrón que el panel de
            // Ocupación de la Torre de control).
            parts={
              stats.allocatedFte === 0
                ? []
                : [
                    {
                      label: "BAU",
                      value: stats.bauFte,
                      color: MIX_COLORS.bau,
                    },
                    {
                      label: "Transf.",
                      value: stats.transformationFte,
                      color: MIX_COLORS.transformation,
                    },
                  ]
            }
            freeLabel="libre"
            emptyLabel="Sin asignaciones todavía"
          />
          <div className="mt-auto text-body-sm text-neutral-subtle">
            <span className="font-bold tabular-nums text-neutral-default">
              {bauPct}%
            </span>{" "}
            del esfuerzo va a operación
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
