import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  EmptyState,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { AllocationsContainer } from "@features/allocations/AllocationsContainer";
import { useSquad } from "./hooks/useSquad";
import { useSquadTeamStats } from "./hooks/useSquadTeamStats";
import { useSquadMutations } from "./hooks/useSquadMutations";
import { useCriticalities } from "./hooks/useCriticalities";
import { SquadDetailHeader } from "./components/SquadDetailHeader";
import { SquadTeamStatsCards } from "./components/SquadTeamStatsCards";
import { SquadFormDrawer } from "./components/SquadFormDrawer";
import { DeleteSquadConfirmDialog } from "./components/DeleteSquadConfirmDialog";
import type { SquadFormValues } from "./adapters/SquadAdapter";

export interface SquadDetailContainerProps {
  squadId: string | undefined;
}

export const SquadDetailContainer: React.FC<SquadDetailContainerProps> = ({
  squadId,
}) => {
  const { squad, loading, error, notFound, refetch } = useSquad(squadId);
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useSquadTeamStats(squadId);
  const { criticalities, loading: criticalitiesLoading } = useCriticalities();
  const { update, remove, updating, removing } = useSquadMutations();
  const { toast } = useToast();
  const navigate = useNavigate();

  // El nombre de la célula cierra el breadcrumb del shell mientras estemos acá.
  useLeadBreadcrumbTrailing(squad?.name ?? null);

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // "Asignar persona" del encabezado abre el alta que vive en el contenedor
  // de las personas: cada incremento le pide abrirse (ver AllocationsContainer).
  const [createRequestKey, setCreateRequestKey] = useState(0);

  // Tras asignar/editar/quitar cambian los campos calculados de la célula y el
  // resumen de las personas; ambos se vuelven a pedir.
  const handleTeamChanged = useCallback(() => {
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);

  const openEdit = () => {
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: SquadFormValues) => {
    if (!squad) return;
    setFormError(null);
    const result = await update(squad, values);
    if (result.success) {
      setFormOpen(false);
      toast({
        message: "Célula actualizada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!squad) return;
    setDeleteError(null);
    const result = await remove(squad);
    if (result.success) {
      setDeleteOpen(false);
      toast({
        message: "Célula eliminada",
        icon: <Icon name="status-success" size={16} />,
      });
      navigate("/app/lead/celulas");
    } else if (result.error) {
      setDeleteError(result.error);
    }
  };

  if (loading) {
    return <p className="text-body-sm text-neutral-subtle">Cargando célula…</p>;
  }

  if (notFound || !squad) {
    return (
      <EmptyState
        icon={<Icon name="cell" size={32} />}
        title="Célula no encontrada"
        description="La célula que buscas no existe o fue eliminada."
        action={
          <Button
            variant="primary"
            onClick={() => navigate("/app/lead/celulas")}
          >
            Ir al listado de células
          </Button>
        }
      />
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudo cargar la célula"
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

  return (
    <div className="flex flex-col gap-6">
      <SquadDetailHeader
        squad={squad}
        onEdit={openEdit}
        onAssign={() => setCreateRequestKey((key) => key + 1)}
        onDelete={() => {
          setDeleteError(null);
          setDeleteOpen(true);
        }}
      />
      <SquadTeamStatsCards stats={stats} loading={statsLoading} />
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger
            value="team"
            count={stats?.memberCount ?? squad.memberCount}
          >
            Personas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="team">
          <AllocationsContainer
            squadId={squad.id}
            squadName={squad.name}
            onChanged={handleTeamChanged}
            createRequestKey={createRequestKey}
          />
        </TabsContent>
      </Tabs>
      <SquadFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        squad={squad}
        criticalities={criticalities}
        criticalitiesLoading={criticalitiesLoading}
        saving={updating}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />
      <DeleteSquadConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        squad={squad}
        deleting={removing}
        serverError={deleteError}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
