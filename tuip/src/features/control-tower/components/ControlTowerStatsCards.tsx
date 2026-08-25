import React from "react";
import { Card, CardBody, DistributionCard, Icon } from "@tuya-ui/components";
import { MIX_COLORS } from "@features/squads/components/mixColors";
import type { CapacityOverview } from "../adapters/CapacityOverviewAdapter";

export interface ControlTowerStatsCardsProps {
  overview: CapacityOverview | null;
  loading: boolean;
}

export const ControlTowerStatsCards: React.FC<ControlTowerStatsCardsProps> = ({
  overview,
  loading,
}) => {
  if (loading || !overview) return null;

  const freePct =
    overview.chapterFte > 0
      ? Math.round((overview.freeFte / overview.chapterFte) * 100)
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* "Libre" no es una parte del esfuerzo ni un estado: gris categórico,
          con el punto de leyenda visible porque DistributionCard lo dibuja
          sobre blanco. */}
      <DistributionCard
        title="FTE DEL CHAPTER"
        total={overview.chapterFte}
        totalNoun="FTE"
        items={[
          { label: "BAU", value: overview.bauFte, color: MIX_COLORS.bau },
          {
            label: "Transformación",
            value: overview.transformationFte,
            color: MIX_COLORS.transformation,
          },
          { label: "Libre", value: overview.freeFte, color: "gray" },
        ]}
        footer={
          <>
            <span className="font-bold tabular-nums text-neutral-default">
              {freePct}%
            </span>{" "}
            del FTE del chapter sin asignar
          </>
        }
      />

      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label text-neutral-subtle">
              PERSONAS CON MARGEN
            </span>
            <Icon name="user" size={16} className="text-neutral-subtle" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">
              {overview.peopleUnassigned + overview.peoplePartial}
            </span>
            <span className="text-heading-md tabular-nums text-neutral-subtle">
              de {overview.peopleTotal} personas
            </span>
          </div>
          <div className="mt-auto flex items-center gap-3 text-body-sm text-neutral-subtle">
            <span>
              <span className="font-bold tabular-nums text-danger-default">
                {overview.peopleUnassigned}
              </span>{" "}
              sin célula
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-bold tabular-nums text-neutral-default">
                {overview.peoplePartial}
              </span>{" "}
              con dedicación parcial
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label text-neutral-subtle">
              CÉLULAS QUE NECESITAN GENTE
            </span>
            <Icon name="cell" size={16} className="text-neutral-subtle" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">
              {overview.squadsAtCapacity}
            </span>
            <span className="text-heading-md tabular-nums text-neutral-subtle">
              al tope · {overview.squadsWithoutTeam} sin equipo
            </span>
          </div>
          <p className="mt-auto text-body-sm text-neutral-subtle">
            Al tope: su FTE asignado ya iguala el disponible del equipo. Es
            adonde conviene mover el margen.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};
