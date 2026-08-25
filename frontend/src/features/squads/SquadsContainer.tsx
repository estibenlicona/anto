import React, { useState } from "react";
import { Icon, useToast } from "@tuya-ui/components";
import { useSquads } from "./hooks/useSquads";
import { useSquadMutations } from "./hooks/useSquadMutations";
import { useCriticalities } from "./hooks/useCriticalities";
import { useSquadsStats } from "./hooks/useSquadsStats";
import { SquadsHeader } from "./components/SquadsHeader";
import { SquadsStatsCards } from "./components/SquadsStatsCards";
import { SquadsList } from "./components/SquadsList";
import { SquadFormDrawer } from "./components/SquadFormDrawer";
import { DeleteSquadConfirmDialog } from "./components/DeleteSquadConfirmDialog";
import type { Squad, SquadFormValues } from "./adapters/SquadAdapter";

export const SquadsContainer: React.FC = () => {
  const {
    squads,
    loading,
    error,
    refetch,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
    onPageSizeChange,
    search,
    onSearchChange,
    criticalities: selectedCriticalities,
    onCriticalitiesChange,
  } = useSquads();
  const { criticalities, loading: criticalitiesLoading } = useCriticalities();
  const { create, update, remove, creating, updating, removing } =
    useSquadMutations();
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useSquadsStats();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Squad | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingSquad(undefined);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (squad: Squad) => {
    setEditingSquad(squad);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: SquadFormValues) => {
    setFormError(null);
    const result = editingSquad
      ? await update(editingSquad, values)
      : await create(values);

    if (result.success) {
      setFormOpen(false);
      toast({
        message: editingSquad ? "Célula actualizada" : "Célula creada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      refetchStats();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const openDelete = (squad: Squad) => {
    setDeleteTarget(squad);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    const result = await remove(deleteTarget);
    if (result.success) {
      setDeleteTarget(null);
      toast({
        message: "Célula eliminada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      refetchStats();
    } else if (result.error) {
      setDeleteError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SquadsHeader onCreate={openCreate} />
      <SquadsStatsCards stats={stats} loading={statsLoading} />
      <SquadsList
        squads={squads}
        loading={loading}
        error={error}
        onRetry={refetch}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        search={search}
        onSearchChange={onSearchChange}
        selectedCriticalities={selectedCriticalities}
        onCriticalitiesChange={onCriticalitiesChange}
      />
      <SquadFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        squad={editingSquad}
        criticalities={criticalities}
        criticalitiesLoading={criticalitiesLoading}
        saving={editingSquad ? updating : creating}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />
      <DeleteSquadConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        squad={deleteTarget}
        deleting={removing}
        serverError={deleteError}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
