import React, { useEffect, useRef, useState } from "react";
import { Icon, useToast } from "@tuya-ui/components";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import { useCatalogs } from "@features/people/hooks/useCatalogs";
import { useAllocations } from "./hooks/useAllocations";
import { useAllocationMutations } from "./hooks/useAllocationMutations";
import { AllocationsList } from "./components/AllocationsList";
import { AllocationFormDrawer } from "./components/AllocationFormDrawer";
import { RemoveAllocationConfirmDialog } from "./components/RemoveAllocationConfirmDialog";
import type {
  Allocation,
  AllocationFormValues,
} from "./adapters/AllocationAdapter";

// El selector del alta sólo ofrece personas sin célula (una persona, una célula):
// la lista sale del overview del chapter y se refresca tras cada cambio.

export interface AllocationsContainerProps {
  /** La célula cuyas personas se administran: la de la página de detalle. */
  squadId: string;
  /** Nombre de la célula, para el encabezado del formulario de alta. */
  squadName?: string;
  /** Se llama tras crear, editar o quitar con éxito (el detalle refetchea su resumen). */
  onChanged?: () => void;
  /**
   * Cada incremento abre el formulario de alta: así el "Asignar persona" del
   * encabezado del detalle llega hasta acá sin un ref imperativo.
   */
  createRequestKey?: number;
}

export const AllocationsContainer: React.FC<AllocationsContainerProps> = ({
  squadId,
  squadName = "",
  onChanged,
  createRequestKey = 0,
}) => {
  const {
    unassignedPeople,
    loading: peopleLoading,
    refetch: refetchOverview,
  } = useCapacityOverview();
  const { seniorities: seniorityOptions } = useCatalogs();
  const {
    allocations,
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
    seniorities,
    onSenioritiesChange,
  } = useAllocations(squadId);
  const { create, update, remove, creating, updating, removing } =
    useAllocationMutations();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<
    Allocation | undefined
  >();
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [removeTarget, setRemoveTarget] = useState<Allocation | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingAllocation(undefined);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  // El valor inicial no abre nada: sólo los incrementos posteriores.
  const lastCreateRequest = useRef(createRequestKey);
  useEffect(() => {
    if (createRequestKey !== lastCreateRequest.current) {
      lastCreateRequest.current = createRequestKey;
      openCreate();
    }
    // openCreate es estable en lo que importa (sólo setters).
  }, [createRequestKey]);

  const openEdit = (allocation: Allocation) => {
    setEditingAllocation(allocation);
    setFormError(null);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: AllocationFormValues) => {
    setFormError(null);
    const result = editingAllocation
      ? await update(editingAllocation, values)
      : await create(squadId, values);

    if (result.success) {
      setFormOpen(false);
      toast({
        message: editingAllocation
          ? "Asignación actualizada"
          : "Persona asignada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      refetchOverview();
      onChanged?.();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const openRemove = (allocation: Allocation) => {
    setRemoveTarget(allocation);
    setRemoveError(null);
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setRemoveError(null);
    const result = await remove(removeTarget);
    if (result.success) {
      setRemoveTarget(null);
      toast({
        message: "Asignación quitada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      refetchOverview();
      onChanged?.();
    } else if (result.error) {
      setRemoveError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AllocationsList
        allocations={allocations}
        loading={loading}
        error={error}
        onRetry={refetch}
        onCreate={openCreate}
        onEdit={openEdit}
        onRemove={openRemove}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        search={search}
        onSearchChange={onSearchChange}
        seniorityOptions={seniorityOptions}
        selectedSeniorities={seniorities}
        onSenioritiesChange={onSenioritiesChange}
      />
      <AllocationFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        allocation={editingAllocation}
        squadName={squadName}
        people={unassignedPeople}
        peopleLoading={peopleLoading}
        saving={editingAllocation ? updating : creating}
        serverError={formError}
        onSubmit={handleFormSubmit}
      />
      <RemoveAllocationConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        allocation={removeTarget}
        removing={removing}
        serverError={removeError}
        onConfirm={handleRemoveConfirm}
      />
    </div>
  );
};
