import React, { useState } from "react";
import { Icon, useToast } from "@tuya-ui/components";
import { usePeople } from "./hooks/usePeople";
import { usePersonMutations } from "./hooks/usePersonMutations";
import { useCatalogs } from "./hooks/useCatalogs";
import { usePeopleStats } from "./hooks/usePeopleStats";
import { useStackCatalog } from "./hooks/useStackCatalog";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import { PeopleHeader } from "./components/PeopleHeader";
import { PeopleStatsCards } from "./components/PeopleStatsCards";
import { PeopleList } from "./components/PeopleList";
import { PersonFormDrawer } from "./components/PersonFormDrawer";
import { usePersonExpertiseLine } from "./hooks/usePersonExpertiseLine";
import { DeletePersonConfirmDialog } from "./components/DeletePersonConfirmDialog";
import type { Person, PersonFormValues } from "./adapters/PersonAdapter";

export const PeopleContainer: React.FC = () => {
  const {
    people,
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
    seniorities: selectedSeniorities,
    onSenioritiesChange,
    stacks: selectedStacks,
    onStacksChange,
  } = usePeople();
  const { catalog: stackCatalog } = useStackCatalog();
  const {
    seniorities,
    modalities,
    companies,
    roles,
    technicalLeads,
    loading: catalogsLoading,
  } = useCatalogs();
  const { create, update, remove, creating, updating, removing } =
    usePersonMutations();
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = usePeopleStats();
  const { toast } = useToast();
  // "N en M células" sale del overview de capacidad: el mock de personas no
  // conoce las asignaciones (la dependencia va en un solo sentido).
  const { overview } = useCapacityOverview();
  const assignment = overview
    ? {
        assigned: overview.peopleTotal - overview.peopleUnassigned,
        squadsWithPeople: overview.squads.filter((s) => !s.withoutTeam).length,
      }
    : null;

  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  // La línea se pide al maestro de líneas cuando se abre una edición: el
  // formulario la muestra sin editarla.
  const expertiseLine = usePersonExpertiseLine(editingPerson?.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingPerson(undefined);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (person: Person) => {
    setEditingPerson(person);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: PersonFormValues) => {
    setFormError(null);
    const result = editingPerson
      ? await update(editingPerson, values)
      : await create(values);

    if (result.success) {
      setFormOpen(false);
      toast({
        message: editingPerson ? "Persona actualizada" : "Persona creada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      refetchStats();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const openDelete = (person: Person) => {
    setDeleteTarget(person);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    const result = await remove(deleteTarget);
    if (result.success) {
      setDeleteTarget(null);
      toast({
        message: "Persona eliminada",
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
      <PeopleHeader onCreate={openCreate} />
      <PeopleStatsCards
        stats={stats}
        loading={statsLoading}
        assignment={assignment}
      />
      <PeopleList
        people={people}
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
        seniorityOptions={seniorities}
        selectedSeniorities={selectedSeniorities}
        onSenioritiesChange={onSenioritiesChange}
        stackOptions={stackCatalog}
        selectedStacks={selectedStacks}
        onStacksChange={onStacksChange}
      />
      <PersonFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        person={editingPerson}
        seniorities={seniorities}
        modalities={modalities}
        roles={roles}
        technicalLeads={technicalLeads}
        expertiseLineName={expertiseLine.name}
        companies={companies}
        catalogsLoading={catalogsLoading}
        saving={editingPerson ? updating : creating}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />
      <DeletePersonConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        person={deleteTarget}
        deleting={removing}
        serverError={deleteError}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
