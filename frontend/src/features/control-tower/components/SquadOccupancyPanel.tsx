import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, CapacityBar, Link } from "@tuya-ui/components";
import { MIX_COLORS } from "@features/squads/components/mixColors";
import type { Criticality } from "@features/squads/services/squadService";
import type { OverviewSquad } from "../adapters/CapacityOverviewAdapter";

const criticalityVariant: Record<
  Criticality,
  "danger" | "warning" | "info" | "neutral"
> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

export interface SquadOccupancyPanelProps {
  /** Ya ordenadas: sin equipo, al tope, luego por menor libre. */
  squads: OverviewSquad[];
}

export const SquadOccupancyPanel: React.FC<SquadOccupancyPanelProps> = ({
  squads,
}) => (
  <div className="overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
    <div className="flex items-center justify-between gap-4 border-b border-neutral-default px-4 py-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-body font-semibold text-neutral-default">
          Ocupación por célula
        </h2>
        <span className={SECONDARY_TEXT}>las que necesitan gente primero</span>
      </div>
      <Link asChild tone="neutral" className="text-body-sm">
        <RouterLink to="/app/lead/celulas">Ver células</RouterLink>
      </Link>
    </div>
    <ul className="flex flex-col">
      {squads.map((squad, index) => (
        <li
          key={squad.id}
          className={`grid grid-cols-[minmax(0,1fr)_14rem] items-center gap-4 px-4 py-3 ${
            index > 0 ? "border-t border-neutral-default" : ""
          }`}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <Link asChild tone="neutral" className="font-medium leading-5">
              <RouterLink to={`/app/lead/celulas/${squad.id}`}>
                {squad.name}
              </RouterLink>
            </Link>
            <span className={`flex items-center gap-2 ${SECONDARY_TEXT}`}>
              <Badge
                dot={false}
                variant={criticalityVariant[squad.criticality]}
              >
                {squad.criticalityLabel}
              </Badge>
              {squad.withoutTeam
                ? "Sin equipo"
                : `${squad.memberCount} ${squad.memberCount === 1 ? "persona" : "personas"}`}
            </span>
          </div>
          {squad.withoutTeam ? (
            <CapacityBar
              separated
              allocated={0}
              available={0}
              parts={[]}
              unit="FTE"
              emptyLabel="Necesita equipo primero"
            />
          ) : (
            <CapacityBar
              separated
              allocated={squad.allocatedFte}
              available={squad.teamAvailableFte}
              unit="FTE"
              parts={[
                { label: "BAU", value: squad.bauFte, color: MIX_COLORS.bau },
                {
                  label: "Transf.",
                  value: squad.transformationFte,
                  color: MIX_COLORS.transformation,
                },
              ]}
            />
          )}
        </li>
      ))}
    </ul>
  </div>
);
