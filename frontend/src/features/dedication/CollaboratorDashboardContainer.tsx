import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import {
  useLeadBreadcrumbActions,
  useLeadBreadcrumbTrailing,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import { useReassignPerson } from "@features/control-tower/hooks/useReassignPerson";
import { ReassignPersonDrawer } from "@features/control-tower/components/ReassignPersonDrawer";
import { modulePath } from "@shared/services/modulePath";
import { useCollaboratorDedicationDetail } from "./hooks/useCollaboratorDedicationDetail";
import { useDedicationSync } from "./hooks/useDedicationSync";
import { notifyDedicationChanged } from "./hooks/dedicationEvents";
import {
  dedicationAdapter,
  detailSprintNavigation,
  type DashboardTabId,
} from "./adapters/DedicationAdapter";
import { CollaboratorHeader } from "./components/CollaboratorHeader";
import { SprintNavigator } from "./components/SprintNavigator";
import { BalanceHeaderCards } from "./components/BalanceHeaderCards";
import { SprintMetricsRow } from "./components/SprintMetricsRow";
import { DashboardTabs } from "./components/DashboardTabs";
import { SignalsTab } from "./components/SignalsTab";
import { TrendPanel } from "./components/TrendPanel";
import { SprintStoriesPanel } from "./components/SprintStoriesPanel";
import { ActivityCalendarPanel } from "./components/ActivityCalendarPanel";

export interface CollaboratorDashboardContainerProps {
  personId: string | undefined;
}

/**
 * La ficha se lee de arriba abajo en tres alturas: **la respuesta** —la señal,
 * al frente y del doble de ancho que las cifras que la acompañan—, las
 * **cuatro métricas** de contexto, y **la evidencia detrás de cuatro
 * pestañas** que dicen qué hay dentro sin abrirlas.
 *
 * El sprint del que habla todo esto se elige en la franja del breadcrumb, con
 * el mismo navegador del listado, y vive en la URL.
 */
export const CollaboratorDashboardContainer: React.FC<
  CollaboratorDashboardContainerProps
> = ({ personId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // El sprint elegido vive en la URL: el enlace se comparte y atrás funciona.
  const [searchParams, setSearchParams] = useSearchParams();
  const sprintParam = searchParams.get("sprint");
  const { detail, loading, error, notFound, refetch } =
    useCollaboratorDedicationDetail(personId, sprintParam);
  const sync = useDedicationSync();
  // Las células que el drawer ofrece: la misma lista que la Torre.
  const overview = useCapacityOverview();
  const refreshAll = () => {
    refetch();
    overview.refetch();
    notifyDedicationChanged();
  };
  const reassign = useReassignPerson(refreshAll);

  useLeadBreadcrumbTrailing(detail?.person.name ?? null);

  const selectSprint = (name: string) => {
    setSearchParams(name ? { sprint: name } : {});
  };
  // La pestaña abierta no va a la URL: es una preferencia de lectura del
  // momento, no parte de lo que uno comparte cuando manda el enlace.
  const [tab, setTab] = React.useState<DashboardTabId>("signals");

  const handleSync = async () => {
    if (!detail) return;
    const result = await sync.syncCollaborator(detail.person.id);
    if (result.success) {
      toast({
        message: "Actualizado desde Azure DevOps",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    }
  };

  // El navegador de sprint y las acciones viven en la franja del breadcrumb,
  // como en el listado: son de la pantalla entera, no de un bloque de ella.
  const navigator = detail
    ? detailSprintNavigation(detail.sprints, detail.selected?.name ?? null)
    : null;
  useLeadBreadcrumbActions(
    detail ? (
      <>
        {navigator && (
          <SprintNavigator
            sprint={navigator}
            onSelect={(direction) => {
              const next =
                direction === "previous"
                  ? navigator.previousName
                  : navigator.nextName;
              if (next) selectSprint(next);
            }}
          />
        )}
        {/* Un filete entre el navegador y las acciones: el primero dice de qué
            sprint se habla, las segundas hacen algo; no son la misma fila. */}
        {navigator && (
          <span
            aria-hidden="true"
            className="mx-1 h-6 w-px bg-neutral-subtle-pressed"
          />
        )}
        {/* Sólo con identidad: sin ella no hay usuario de DevOps que consultar. */}
        {detail.hasIdentity && (
          <Button
            variant="secondary"
            size="small"
            isLoading={sync.syncing}
            onClick={handleSync}
            iconBefore={<Icon name="sync" size={16} />}
          >
            {sync.syncing ? "Actualizando…" : "Actualizar"}
          </Button>
        )}
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(modulePath(`personas/${detail.person.id}`))}
        >
          Ver ficha
        </Button>
        <Button
          variant="primary"
          size="small"
          onClick={() =>
            reassign.openFor(dedicationAdapter.toOverviewPerson(detail))
          }
        >
          {detail.allocation ? "Reasignar" : "Asignar a una célula"}
        </Button>
      </>
    ) : null
  );

  if (loading && !detail) {
    return (
      <p className="text-body-sm text-neutral-subtle">
        Cargando balance de carga…
      </p>
    );
  }

  if (notFound || !detail) {
    return (
      <EmptyState
        icon={<Icon name="user" size={32} />}
        title="Colaborador no encontrado"
        description="La persona que buscas no existe o no está a tu cargo."
        action={
          <Button
            variant="primary"
            onClick={() => navigate(modulePath("dedicacion"))}
          >
            Ir a Capacidad
          </Button>
        }
      />
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudo cargar el balance de carga"
        action={
          <Button variant="secondary" size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const profileHref = modulePath(`personas/${detail.person.id}`);
  const selected = detail.selected;

  return (
    // `group` entre bloques, topado al ancho de página y con el cierre del
    // scroll: la ficha no se pega al final ni se estira sin límite en 1920.
    <div className="mx-auto flex w-full max-w-page flex-col gap-group pb-page-bottom">
      <CollaboratorHeader
        detail={detail}
        initiatives={selected?.initiatives ?? []}
      />

      {sync.error && (
        <Alert
          variant="danger"
          title="No se pudo actualizar desde Azure DevOps"
          action={
            <Button
              variant="secondary"
              size="small"
              onClick={handleSync}
              isLoading={sync.syncing}
            >
              Reintentar
            </Button>
          }
        >
          {sync.error}
        </Alert>
      )}

      {!detail.hasIdentity ? (
        <EmptyState
          icon={<Icon name="devops-branch" size={32} />}
          title="Sin identidad DevOps"
          description="Vincula su identidad desde la ficha para leer su balance de carga."
          action={
            <Button
              variant="secondary"
              onClick={() => navigate(profileHref)}
              iconBefore={<Icon name="link" size={16} />}
            >
              Vincular desde la ficha
            </Button>
          }
        />
      ) : !detail.hasSprints || !selected ? (
        <EmptyState
          icon={<Icon name="sprint" size={32} />}
          title="Sin sprints en Azure DevOps"
          description="Azure DevOps no devuelve sprints para esta persona todavía."
          action={
            <Button
              variant="secondary"
              onClick={handleSync}
              isLoading={sync.syncing}
              iconBefore={<Icon name="sync" size={16} />}
            >
              Actualizar
            </Button>
          }
        />
      ) : (
        <>
          {/* La respuesta, y las dos cifras que más se consultan. */}
          <BalanceHeaderCards
            sprint={selected}
            personName={detail.person.name}
            minHistorySprints={detail.minHistorySprints}
          />

          {/* El contexto de la señal, en cuatro cifras. */}
          <SprintMetricsRow metrics={selected.metrics} />

          {/* La evidencia, detrás de sus pestañas. */}
          <DashboardTabs tabs={detail.tabs} value={tab} onValueChange={setTab}>
            {{
              signals: <SignalsTab sprint={selected} />,
              stories: (
                <SprintStoriesPanel
                  sprintName={selected.name}
                  workItems={selected.workItems}
                  points={selected.execution.committedPoints}
                  summary={selected.storiesSummary}
                />
              ),
              activity: (
                <ActivityCalendarPanel
                  calendar={selected.calendar}
                  rangeLabel={selected.rangeLabel}
                />
              ),
              trend: (
                <TrendPanel
                  sprints={detail.sprints}
                  selected={selected.name}
                  onSelect={selectSprint}
                />
              ),
            }}
          </DashboardTabs>
        </>
      )}

      {reassign.target && (
        <ReassignPersonDrawer
          key={reassign.drawerKey}
          open
          onOpenChange={(open) => {
            if (!open) reassign.close();
          }}
          person={reassign.target}
          squads={overview.squadsByNeed}
          saving={reassign.saving}
          serverError={reassign.serverError}
          onSubmit={reassign.handleSubmit}
          initialMode={reassign.options.initialMode}
          initialTargetSquadId={reassign.options.initialTargetSquadId}
        />
      )}
    </div>
  );
};
