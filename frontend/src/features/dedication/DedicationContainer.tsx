import React, { useCallback, useMemo } from "react";
import { Alert, Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import { useSearchParams } from "react-router-dom";
import { useLeadBreadcrumbActions } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import { useCollaboratorDedication } from "./hooks/useCollaboratorDedication";
import { useDedicationSync } from "./hooks/useDedicationSync";
import { syncedAtLabel } from "./adapters/DedicationAdapter";
import { BalanceStatsCards } from "./components/BalanceStatsCards";
import { CollaboratorsTable } from "./components/CollaboratorsTable";
import { SprintNavigator } from "./components/SprintNavigator";

export const DedicationContainer: React.FC = () => {
  const { toast } = useToast();
  // El sprint elegido vive en la URL: el enlace se comparte y atrás funciona,
  // como en el dashboard del colaborador.
  const [searchParams, setSearchParams] = useSearchParams();
  const publishSprint = useCallback(
    (name: string | null) => setSearchParams(name ? { sprint: name } : {}),
    [setSearchParams]
  );
  const list = useCollaboratorDedication(
    searchParams.get("sprint"),
    publishSprint
  );
  const sync = useDedicationSync();
  // Las células, para el filtro: la misma lista que la Torre.
  const overview = useCapacityOverview();

  const squadOptions = useMemo(
    () =>
      (overview.overview?.squads ?? []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [overview.overview]
  );

  const handleSyncAll = async () => {
    const result = await sync.syncAll();
    if (result.success) {
      toast({
        message: "Actualizado desde Azure DevOps",
        icon: <Icon name="status-success" size={16} />,
      });
      list.refetch();
    }
  };

  // La acción y la hora de la última actualización suben a la franja del
  // breadcrumb: el listado arranca arriba y la pantalla no gasta una fila en
  // su propio encabezado. Sin datos todavía no se publica nada, para que la
  // franja no salte de altura cuando lleguen.
  useLeadBreadcrumbActions(
    list.loaded ? (
      <>
        {/* El sprint del que habla todo el listado: no es un filtro, así que
            vive acá y no en la toolbar. */}
        <SprintNavigator sprint={list.sprint} onSelect={list.onSprintStep} />
        <span className="text-body-sm text-neutral-subtle">
          {syncedAtLabel(list.lastSyncedAt)}
        </span>
        <Button
          variant="secondary"
          size="small"
          isLoading={sync.syncing}
          onClick={handleSyncAll}
          iconBefore={<Icon name="sync" size={16} />}
        >
          {sync.syncing ? "Actualizando…" : "Actualizar"}
        </Button>
      </>
    ) : null
  );

  const hasActiveFilter =
    list.search.trim().length > 0 || list.squadIds.length > 0;

  // Sin gente a cargo no hay tabla ni indicadores que leer.
  if (
    list.loaded &&
    !list.loading &&
    !list.error &&
    list.summary?.total === 0 &&
    !hasActiveFilter
  ) {
    return (
      <EmptyState
        icon={<Icon name="capacity" size={32} />}
        title="Sin colaboradores"
        description="Cuando haya personas registradas, acá se lee el balance entre la capacidad que tuvieron y el trabajo que recibieron."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sync.error && (
        <Alert
          variant="danger"
          title="No se pudo actualizar desde Azure DevOps"
          action={
            <Button
              variant="secondary"
              size="small"
              onClick={handleSyncAll}
              isLoading={sync.syncing}
            >
              Reintentar
            </Button>
          }
        >
          {sync.error}
        </Alert>
      )}

      <BalanceStatsCards summary={list.summary} />

      <CollaboratorsTable
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        page={list.page}
        pageSize={list.pageSize}
        total={list.total}
        chapterTotal={list.summary?.total ?? list.total}
        totalPages={list.totalPages}
        onPageChange={list.onPageChange}
        onPageSizeChange={list.onPageSizeChange}
        search={list.search}
        onSearchChange={list.onSearchChange}
        squadOptions={squadOptions}
        selectedSquadIds={list.squadIds}
        onSquadIdsChange={list.onSquadIdsChange}
      />
    </div>
  );
};
