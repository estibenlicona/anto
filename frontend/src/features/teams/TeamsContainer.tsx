import React, { useState } from "react";
import { Button, Icon, useToast } from "@tuya-ui/components";
import { useLeadBreadcrumbActions } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useTeams } from "./hooks/useTeams";
import { useTeamMutations } from "./hooks/useTeamMutations";
import { TeamsStatsCards } from "./components/TeamsStatsCards";
import { TeamsList } from "./components/TeamsList";
import { TeamFormDrawer } from "./components/TeamFormDrawer";
import { DeleteTeamConfirmDialog } from "./components/DeleteTeamConfirmDialog";
import type { Team, TeamFormValues } from "./adapters/TeamAdapter";

export const TeamsContainer: React.FC = () => {
  const {
    teams,
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
    totalTeamsCount,
    totalSquadCount,
    statsLoading,
  } = useTeams();
  const { create, update, remove, creating, updating, removing } =
    useTeamMutations();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingTeam(undefined);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  useLeadBreadcrumbActions(
    <Button
      variant="primary"
      size="small"
      onClick={openCreate}
      iconBefore={<Icon name="folder" size={16} />}
    >
      Nuevo equipo
    </Button>
  );

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: TeamFormValues) => {
    setFormError(null);
    const result = editingTeam
      ? await update(editingTeam, values)
      : await create(values);

    if (result.success) {
      setFormOpen(false);
      toast({
        message: editingTeam ? "Equipo actualizado" : "Equipo creado",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const openDelete = (team: Team) => {
    setDeleteTarget(team);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    const result = await remove(deleteTarget);
    if (result.success) {
      setDeleteTarget(null);
      toast({
        message: "Equipo eliminado",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setDeleteError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <TeamsStatsCards
        totalCount={totalTeamsCount}
        totalSquadCount={totalSquadCount}
        loading={statsLoading}
      />
      <TeamsList
        teams={teams}
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
      />
      <TeamFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        team={editingTeam}
        saving={editingTeam ? updating : creating}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />
      <DeleteTeamConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        team={deleteTarget}
        deleting={removing}
        serverError={deleteError}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
