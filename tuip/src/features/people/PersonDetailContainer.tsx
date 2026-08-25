import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import {
  asAllocation,
  useReassignPerson,
} from "@features/control-tower/hooks/useReassignPerson";
import { ReassignPersonDrawer } from "@features/control-tower/components/ReassignPersonDrawer";
import { useAllocationMutations } from "@features/allocations/hooks/useAllocationMutations";
import { RemoveAllocationConfirmDialog } from "@features/allocations/components/RemoveAllocationConfirmDialog";
import { usePersonDetail } from "./hooks/usePersonDetail";
import { usePersonDetailMutations } from "./hooks/usePersonDetailMutations";
import { usePersonMutations } from "./hooks/usePersonMutations";
import { useCatalogs } from "./hooks/useCatalogs";
import { personAdapter, type PersonFormValues } from "./adapters/PersonAdapter";
import { personDetailAdapter } from "./adapters/PersonDetailAdapter";
import { PersonFormDrawer } from "./components/PersonFormDrawer";
import { DeletePersonConfirmDialog } from "./components/DeletePersonConfirmDialog";
import { PersonDetailHeader } from "./components/detail/PersonDetailHeader";
import { PersonDetailStatsCards } from "./components/detail/PersonDetailStatsCards";
import { PersonAssignmentPanel } from "./components/detail/PersonAssignmentPanel";
import { PersonUnassignedPanel } from "./components/detail/PersonUnassignedPanel";
import { HoursBySprintPanel } from "./components/detail/HoursBySprintPanel";
import { PersonStacksPanel } from "./components/detail/PersonStacksPanel";
import { EditStacksDrawer } from "./components/detail/EditStacksDrawer";
import { useStackCatalog } from "./hooks/useStackCatalog";
import { usePersonStacksMutation } from "./hooks/usePersonStacksMutation";
import { PersonProfilePanel } from "./components/detail/PersonProfilePanel";
import { LinkDevOpsIdentityModal } from "./components/detail/LinkDevOpsIdentityModal";

export interface PersonDetailContainerProps {
  personId: string | undefined;
}

export const PersonDetailContainer: React.FC<PersonDetailContainerProps> = ({
  personId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { detail, loading, error, notFound, refetch } =
    usePersonDetail(personId);
  // Las células que el drawer ofrece (todas, ordenadas por necesidad): la
  // misma lista que la Torre. El overview se refresca junto con el detalle.
  const overview = useCapacityOverview();
  const refreshAll = () => {
    refetch();
    overview.refetch();
  };
  const reassign = useReassignPerson(refreshAll);
  const { validateHours, linkIdentity, validating, linking } =
    usePersonDetailMutations();
  const { remove: removeAllocation, removing } = useAllocationMutations();
  const {
    update: updatePerson,
    remove: removePerson,
    updating,
    removing: deleting,
  } = usePersonMutations();
  const {
    seniorities,
    modalities,
    companies,
    roles,
    technicalLeads,
    loading: catalogsLoading,
  } = useCatalogs();

  useLeadBreadcrumbTrailing(detail?.person.name ?? null);

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkKey, setLinkKey] = useState(0);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [stacksOpen, setStacksOpen] = useState(false);
  const [stacksKey, setStacksKey] = useState(0);
  const [stacksError, setStacksError] = useState<string | null>(null);
  const { catalog } = useStackCatalog();
  const { replaceStacks, saving: savingStacks } = usePersonStacksMutation();

  if (loading && !detail) {
    return (
      <p className="text-body-sm text-neutral-subtle">Cargando persona…</p>
    );
  }

  if (notFound || !detail) {
    return (
      <EmptyState
        icon={<Icon name="user" size={32} />}
        title="Persona no encontrada"
        description="La persona que buscas no existe o fue eliminada."
        action={
          <Button
            variant="primary"
            onClick={() => navigate("/app/lead/personas")}
          >
            Ir al listado de personas
          </Button>
        }
      />
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudo cargar la persona"
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

  const person = personAdapter.toEntity(detail.person);
  // La etiqueta sale del catálogo, que esta pantalla ya carga para el
  // formulario. Sin él —mientras carga— se muestra el valor del contrato, que
  // es feo pero no miente.
  const roleLabel =
    roles.find((r) => r.value === person.role)?.label ?? person.role;
  const overviewPerson = personDetailAdapter.toOverviewPerson(detail);

  const openEdit = () => {
    setFormError(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: PersonFormValues) => {
    setFormError(null);
    const result = await updatePerson(person, values);
    if (result.success) {
      setFormOpen(false);
      toast({
        message: "Persona actualizada",
        icon: <Icon name="status-success" size={16} />,
      });
      refreshAll();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteError(null);
    const result = await removePerson(person);
    if (result.success) {
      setDeleteOpen(false);
      toast({
        message: "Persona eliminada",
        icon: <Icon name="status-success" size={16} />,
      });
      navigate("/app/lead/personas");
    } else if (result.error) {
      setDeleteError(result.error);
    }
  };

  const handleRemoveConfirm = async () => {
    setRemoveError(null);
    const result = await removeAllocation(asAllocation(overviewPerson));
    if (result.success) {
      setRemoveOpen(false);
      toast({
        message: "Asignación quitada",
        icon: <Icon name="status-success" size={16} />,
      });
      refreshAll();
    } else if (result.error) {
      setRemoveError(result.error);
    }
  };

  const handleValidate = async () => {
    if (!detail.currentReport) return;
    const result = await validateHours(
      detail.person.id,
      detail.currentReport.sprint
    );
    if (result.success) {
      toast({
        message: `Reporte del ${detail.currentReport.sprint} validado`,
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else {
      toast({ message: result.error ?? "No se pudo validar el reporte" });
    }
  };

  const openStacks = () => {
    setStacksError(null);
    setStacksKey((k) => k + 1);
    setStacksOpen(true);
  };

  const handleStacksSubmit = async (
    stacks: Parameters<typeof replaceStacks>[1]
  ) => {
    setStacksError(null);
    const result = await replaceStacks(detail.person.id, stacks);
    if (result.success) {
      setStacksOpen(false);
      toast({
        message: "Stacks actualizados",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setStacksError(result.error);
    }
  };

  const openLink = () => {
    setLinkError(null);
    setLinkKey((k) => k + 1);
    setLinkOpen(true);
  };

  const handleLinkConfirm = async (identityId: string) => {
    setLinkError(null);
    const result = await linkIdentity(detail.person.id, identityId);
    if (result.success) {
      setLinkOpen(false);
      toast({
        message: "Identidad DevOps vinculada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setLinkError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PersonDetailHeader
        detail={detail}
        roleLabel={roleLabel}
        onEdit={openEdit}
        onReassign={() => reassign.openFor(overviewPerson)}
        onDelete={() => {
          setDeleteError(null);
          setDeleteOpen(true);
        }}
        onAssess={() =>
          navigate(`/app/lead/personas/${detail.person.id}/evaluacion`)
        }
        onCareerPlan={() =>
          navigate(`/app/lead/competencias/${detail.person.id}`)
        }
      />

      <PersonDetailStatsCards
        detail={detail}
        onValidateHours={handleValidate}
        onLinkIdentity={openLink}
        validating={validating}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[7fr_5fr]">
        <div className="flex flex-col gap-4">
          {detail.allocation ? (
            <PersonAssignmentPanel
              detail={detail}
              onRaise={() =>
                reassign.openFor(overviewPerson, { initialMode: "raise" })
              }
              onMove={() =>
                reassign.openFor(overviewPerson, { initialMode: "move" })
              }
              onRemove={() => {
                setRemoveError(null);
                setRemoveOpen(true);
              }}
            />
          ) : (
            <PersonUnassignedPanel
              detail={detail}
              onAssignTo={(squadId) =>
                reassign.openFor(overviewPerson, {
                  initialMode: "assign",
                  initialTargetSquadId: squadId,
                })
              }
            />
          )}
          <HoursBySprintPanel detail={detail} />
        </div>
        <div className="flex flex-col gap-4">
          <PersonStacksPanel detail={detail} onEdit={openStacks} />
          <PersonProfilePanel detail={detail} onEdit={openEdit} />
        </div>
      </div>

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

      <PersonFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        person={person}
        seniorities={seniorities}
        modalities={modalities}
        roles={roles}
        technicalLeads={technicalLeads}
        // La ficha ya la tiene resuelta: no hace falta volver a pedirla.
        expertiseLineName={detail.expertiseLineName}
        companies={companies}
        catalogsLoading={catalogsLoading}
        saving={updating}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />

      <DeletePersonConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        person={person}
        deleting={deleting}
        serverError={deleteError}
        onConfirm={handleDeleteConfirm}
      />

      {detail.allocation && (
        <RemoveAllocationConfirmDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          allocation={asAllocation(overviewPerson)}
          removing={removing}
          serverError={removeError}
          onConfirm={handleRemoveConfirm}
        />
      )}

      {stacksOpen && (
        <EditStacksDrawer
          key={stacksKey}
          open={stacksOpen}
          onOpenChange={setStacksOpen}
          personName={detail.person.name}
          current={detail.stacks}
          catalog={catalog}
          saving={savingStacks}
          serverError={stacksError}
          onSubmit={handleStacksSubmit}
        />
      )}

      {linkOpen && (
        <LinkDevOpsIdentityModal
          key={linkKey}
          open={linkOpen}
          onOpenChange={setLinkOpen}
          personName={detail.person.name}
          candidates={detail.devOpsCandidates}
          linking={linking}
          serverError={linkError}
          onConfirm={handleLinkConfirm}
        />
      )}
    </div>
  );
};
