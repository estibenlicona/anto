import React, { useEffect, useState } from "react";
import { Button, Icon, useToast } from "@tuya-ui/components";
import { squadService } from "@features/squads/services/squadService";
import { useInitiatives } from "./hooks/useInitiatives";
import { useInitiativesStats } from "./hooks/useInitiativesStats";
import { useInitiativeMutations } from "./hooks/useInitiativeMutations";
import { InitiativesStatsCards } from "./components/InitiativesStatsCards";
import { InitiativesList } from "./components/InitiativesList";
import { InitiativeFormDrawer } from "./components/InitiativeFormDrawer";
import { StatusConfirmDialog } from "./components/StatusConfirmDialog";
import {
  toInitiativeInput,
  type InitiativeFormValues,
} from "./components/initiativeValidation";
import type { Initiative } from "./adapters/InitiativeAdapter";
import type { InitiativeStatus } from "./services/initiativeService";
import { initiativeService } from "./services/initiativeService";

type SquadOption = { value: string; label: string };

export const InitiativesContainer: React.FC = () => {
  const list = useInitiatives();
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useInitiativesStats();
  const { create, update, setStatus, saving, changingStatus } =
    useInitiativeMutations();
  const { toast } = useToast();

  // Catálogos del filtro y del drawer: células del mock y tallas del modelo.
  const [squadOptions, setSquadOptions] = useState<SquadOption[]>([]);
  const [tallaOptions, setTallaOptions] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    squadService.list(1, 100).then(
      (r) => {
        if (!cancelled)
          setSquadOptions(r.items.map((s) => ({ value: s.id, label: s.name })));
      },
      () => undefined
    );
    initiativeService.getEvaluationModel().then(
      (m) => {
        if (!cancelled) setTallaOptions(m.bands.map((b) => b.talla));
      },
      () => undefined
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [statusTarget, setStatusTarget] = useState<{
    initiative: Initiative;
    status: InitiativeStatus;
  } | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormError(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = (initiative: Initiative) => {
    setEditing(initiative);
    setFormError(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: InitiativeFormValues) => {
    setFormError(null);
    const input = toInitiativeInput(values);
    const result = editing
      ? await update(editing.id, input)
      : await create(input);
    if (result.success) {
      setFormOpen(false);
      toast({
        message: editing ? "Iniciativa actualizada" : "Iniciativa creada",
        icon: <Icon name="status-success" size={16} />,
      });
      list.refetch();
      refetchStats();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const openStatus = (initiative: Initiative, status: InitiativeStatus) => {
    setStatusTarget({ initiative, status });
    setStatusError(null);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    setStatusError(null);
    const result = await setStatus(
      statusTarget.initiative.id,
      statusTarget.status
    );
    if (result.success) {
      const activated = statusTarget.status === "Active";
      setStatusTarget(null);
      toast({
        message: activated ? "Iniciativa activada" : "Iniciativa cerrada",
        icon: <Icon name="status-success" size={16} />,
      });
      list.refetch();
      refetchStats();
    } else if (result.error) {
      setStatusError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-neutral-default">
            Iniciativas
          </h1>
          <p className="text-body-sm text-neutral-subtle">
            Las solicitudes del negocio y la capacidad que requieren. Sólo las
            activas cuentan como demanda.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreate}
          iconBefore={<Icon name="plus" size={20} />}
        >
          Nueva iniciativa
        </Button>
      </div>
      <InitiativesStatsCards stats={stats} loading={statsLoading} />
      <InitiativesList
        initiatives={list.initiatives}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        onCreate={openCreate}
        onEdit={openEdit}
        onActivate={(i) => openStatus(i, "Active")}
        onClose={(i) => openStatus(i, "Closed")}
        page={list.page}
        pageSize={list.pageSize}
        total={list.total}
        totalPages={list.totalPages}
        onPageChange={list.onPageChange}
        onPageSizeChange={list.onPageSizeChange}
        search={list.search}
        onSearchChange={list.onSearchChange}
        statuses={list.statuses}
        onStatusesChange={list.onStatusesChange}
        squadOptions={squadOptions}
        squadIds={list.squadIds}
        onSquadIdsChange={list.onSquadIdsChange}
        tallaOptions={tallaOptions}
        tallas={list.tallas}
        onTallasChange={list.onTallasChange}
      />
      <InitiativeFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initiative={editing}
        squadOptions={squadOptions}
        saving={saving}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />
      <StatusConfirmDialog
        open={statusTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
        initiative={statusTarget?.initiative ?? null}
        target={statusTarget?.status ?? null}
        changing={changingStatus}
        serverError={statusError}
        onConfirm={handleStatusConfirm}
      />
    </div>
  );
};
