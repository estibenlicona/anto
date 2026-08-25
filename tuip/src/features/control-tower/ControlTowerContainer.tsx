import React from "react";
import { Alert, Button } from "@tuya-ui/components";
import { useCapacityOverview } from "./hooks/useCapacityOverview";
import { useReassignPerson } from "./hooks/useReassignPerson";
import { ControlTowerStatsCards } from "./components/ControlTowerStatsCards";
import { PeopleWithMarginPanel } from "./components/PeopleWithMarginPanel";
import { SquadOccupancyPanel } from "./components/SquadOccupancyPanel";
import { ReassignPersonDrawer } from "./components/ReassignPersonDrawer";

export const ControlTowerContainer: React.FC = () => {
  const { overview, loading, error, refetch, peopleWithMargin, squadsByNeed } =
    useCapacityOverview();
  const reassign = useReassignPerson(refetch);

  const atCapacityCount = overview
    ? overview.people.length - peopleWithMargin.length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-heading-lg font-semibold text-neutral-default">
          Torre de control
        </h1>
        <p className="text-body-sm text-neutral-subtle">
          Capacidad del chapter de un vistazo: quién tiene margen, dónde falta
          gente y a quién mover
        </p>
      </div>

      {loading && (
        <p className="text-body-sm text-neutral-subtle">
          Cargando la Torre de control…
        </p>
      )}
      {error && !loading && (
        <Alert
          variant="danger"
          title="No se pudo cargar la Torre de control"
          action={
            <Button variant="secondary" size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <ControlTowerStatsCards overview={overview} loading={loading} />

      {overview && !loading && (
        <div className="grid items-start gap-4 xl:grid-cols-[7fr_5fr]">
          <PeopleWithMarginPanel
            people={peopleWithMargin}
            atCapacityCount={atCapacityCount}
            onAssign={(p) => reassign.openFor(p)}
            onReassign={(p) => reassign.openFor(p)}
          />
          <SquadOccupancyPanel squads={squadsByNeed} />
        </div>
      )}

      {reassign.target && overview && (
        <ReassignPersonDrawer
          key={reassign.drawerKey}
          open={reassign.target !== null}
          onOpenChange={(open) => {
            if (!open) reassign.close();
          }}
          person={reassign.target}
          squads={squadsByNeed}
          saving={reassign.saving}
          serverError={reassign.serverError}
          onSubmit={reassign.handleSubmit}
        />
      )}
    </div>
  );
};
