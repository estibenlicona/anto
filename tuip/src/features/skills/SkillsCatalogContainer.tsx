import React, { useState } from "react";
import {
  Alert,
  Button,
  EmptyState,
  Icon,
  Skeleton,
  useToast,
} from "@tuya-ui/components";
import { SkillsCatalogHeader } from "./components/SkillsCatalogHeader";
import { useSkillsCatalog } from "./hooks/useSkillsCatalog";
import {
  useSkillMutations,
  type MutationResult,
} from "./hooks/useSkillMutations";
import { SkillsIndex } from "./components/SkillsIndex";
import { SkillDetail } from "./components/SkillDetail";
import { NewSkillDrawer } from "./components/NewSkillDrawer";
import type { SkillLevel, UpsertSkillRequest } from "./services/skillsService";

export const SkillsCatalogContainer: React.FC = () => {
  const { catalog, loading, error, refetch } = useSkillsCatalog();
  const mutations = useSkillMutations();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [canDeactivate, setCanDeactivate] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  // La selección se deriva de lo que llegó en vez de guardarse corregida: la
  // habilidad elegida pudo borrarse, y al abrir no hay ninguna elegida. Cayendo
  // a la primera, el estado nunca queda apuntando a algo que ya no existe.
  const selected =
    catalog?.skills.find((s) => s.id === selectedId) ??
    catalog?.skills[0] ??
    null;

  const select = (id: string) => {
    setDetailError(null);
    setCanDeactivate(false);
    setSelectedId(id);
  };

  /** Todo lo que cambia el catálogo termina igual: mensaje, refresco o error. */
  const settle = async (
    action: Promise<MutationResult>,
    successMessage: string
  ) => {
    const result = await action;
    if (result.success) {
      setDetailError(null);
      setCanDeactivate(false);
      toast({
        message: successMessage,
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      return true;
    }
    setDetailError(result.error ?? null);
    setCanDeactivate(result.canDeactivate === true);
    return false;
  };

  const handleCreate = async (request: UpsertSkillRequest) => {
    const result = await mutations.create(request);
    if (result.success) {
      setNewOpen(false);
      setNewError(null);
      toast({
        message: "Habilidad creada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else {
      setNewError(result.error ?? null);
    }
  };

  const openNew = () => {
    setNewError(null);
    setNewOpen(true);
  };

  return (
    <>
      <SkillsCatalogHeader onNew={openNew} />

      {loading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-6">
          {error}
        </Alert>
      )}

      {catalog && catalog.empty && (
        <EmptyState
          className="mt-6"
          icon={<Icon name="expertise" size={32} />}
          title="Todavía no hay habilidades"
          description="El catálogo es el instrumento con el que se evalúa. Carga la primera habilidad para empezar."
          action={
            <Button variant="primary" onClick={openNew}>
              Crear la primera
            </Button>
          }
        />
      )}

      {catalog && !catalog.empty && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <SkillsIndex
            catalog={catalog}
            selectedId={selected?.id ?? null}
            onSelect={select}
          />

          {selected && (
            <SkillDetail
              skill={selected}
              saving={mutations.saving}
              error={detailError}
              canDeactivate={canDeactivate}
              // Remonta al cambiar de habilidad: así el formulario del
              // encabezado arranca de cero sin sincronizar nada por efecto.
              key={selected.id}
              onSave={(request) =>
                settle(
                  mutations.update(selected.id, request),
                  "Habilidad guardada"
                )
              }
              onCriteriaChange={(level: SkillLevel, criteria: string[]) =>
                settle(
                  mutations.setCriteria(selected.id, level, criteria),
                  "Criterios guardados"
                )
              }
              onExpectationChange={(position, level) =>
                settle(
                  mutations.setExpectation(selected.id, position, level),
                  level === null
                    ? `${position} queda sin nivel definido`
                    : `Nivel esperado de ${position} guardado`
                )
              }
              onDelete={() =>
                settle(mutations.remove(selected.id), "Habilidad eliminada")
              }
              onDeactivate={() =>
                settle(
                  mutations.deactivate(selected.id),
                  "Habilidad desactivada"
                )
              }
              onActivate={() =>
                settle(mutations.activate(selected.id), "Habilidad activada")
              }
            />
          )}
        </div>
      )}

      <NewSkillDrawer
        open={newOpen}
        saving={mutations.saving}
        error={newError}
        onOpenChange={setNewOpen}
        onSubmit={handleCreate}
      />
    </>
  );
};
