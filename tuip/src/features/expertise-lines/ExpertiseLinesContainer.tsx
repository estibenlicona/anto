import React, { useState } from "react";
import {
  Alert,
  Button,
  EmptyState,
  Icon,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Skeleton,
  useToast,
} from "@tuya-ui/components";
import { useExpertiseLines } from "./hooks/useExpertiseLines";
import { useLineDetail } from "./hooks/useLineDetail";
import {
  useLineMutations,
  type MutationResult,
} from "./hooks/useLineMutations";
import {
  toAssignCandidates,
  toLeadCandidates,
  type LinePersonView,
} from "./adapters/ExpertiseLinesAdapter";
import { ExpertiseLinesHeader } from "./components/ExpertiseLinesHeader";
import { LinesIndex } from "./components/LinesIndex";
import { LineDetail } from "./components/LineDetail";
import { LineFormDrawer } from "./components/LineFormDrawer";
import { LeadDrawer } from "./components/LeadDrawer";
import { AssignPeopleDrawer } from "./components/AssignPeopleDrawer";
import { UnassignedPeople } from "./components/UnassignedPeople";
import { PickLineDrawer } from "./components/PickLineDrawer";
import type { UpsertExpertiseLineRequest } from "./services/expertiseLinesService";

export const ExpertiseLinesContainer: React.FC = () => {
  const [search, setSearch] = useState("");
  const { lines, roster, index, unassigned, loading, error, refetch } =
    useExpertiseLines(search);
  const mutations = useLineMutations();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  // La selección se deriva de lo que llegó en vez de guardarse corregida: la
  // línea elegida pudo archivarse, y al abrir no hay ninguna elegida.
  const fallbackId = index?.active[0]?.id ?? index?.archived[0]?.id ?? null;
  const openId =
    lines?.some((l) => l.id === selectedId) && selectedId
      ? selectedId
      : fallbackId;

  const { detail, refetch: refetchDetail } = useLineDetail(openId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [unassignedOpen, setUnassignedOpen] = useState(false);
  // La persona del bloque de "sin línea" a la que se le está eligiendo línea.
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  /** Todo lo que cambia una línea termina igual: mensaje, refresco o error. */
  const settle = async (
    action: Promise<MutationResult>,
    successMessage: string,
    onError: (message: string | null) => void
  ) => {
    const result = await action;
    if (result.success) {
      onError(null);
      toast({
        message: successMessage,
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
      refetchDetail();
      return true;
    }
    onError(result.error ?? null);
    return false;
  };

  const openNew = () => {
    setEditing(false);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = () => {
    setEditing(true);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmitForm = async (request: UpsertExpertiseLineRequest) => {
    const ok = await settle(
      editing && detail
        ? mutations.update(detail.id, request)
        : mutations.create(request),
      editing ? "Línea guardada" : "Línea creada",
      setFormError
    );
    if (ok) setFormOpen(false);
  };

  const handleSetLead = async (personId: string | null) => {
    const ok = await settle(
      mutations.setLead(detail!.id, personId),
      personId ? "Lead designado" : "Lead retirado",
      setLeadError
    );
    if (ok) setLeadOpen(false);
  };

  const handleAssign = async (personIds: string[]) => {
    const ok = await settle(
      mutations.addPeople(detail!.id, personIds),
      personIds.length === 1
        ? "Persona asignada a la línea"
        : `${personIds.length} personas asignadas a la línea`,
      setAssignError
    );
    if (ok) setAssignOpen(false);
  };

  const handleRemove = (person: LinePersonView) =>
    settle(
      mutations.removePerson(detail!.id, person.id),
      `${person.name} salió de la línea`,
      setDetailError
    );

  const handleArchive = async () => {
    const ok = await settle(
      mutations.archive(detail!.id),
      "Línea archivada",
      setDetailError
    );
    if (ok) setConfirmArchive(false);
  };

  const handleAssignFromUnassigned = async (lineId: string) => {
    const ok = await settle(
      mutations.addPeople(lineId, [assigningId!]),
      "Persona asignada a la línea",
      setPickError
    );
    if (ok) setAssigningId(null);
  };

  return (
    <>
      <ExpertiseLinesHeader onNew={openNew} />

      {loading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-6">
          <span className="flex items-center gap-3">
            {error}
            <Button variant="subtle" onClick={refetch}>
              Reintentar
            </Button>
          </span>
        </Alert>
      )}

      {index && index.empty && (
        <EmptyState
          className="mt-6"
          icon={<Icon name="team" size={32} />}
          title="Todavía no hay líneas de expertise"
          description="Una línea agrupa a las personas de una misma disciplina, transversalmente a las células: es quien responde por su capacidad y su desarrollo."
          action={
            <Button variant="primary" onClick={openNew}>
              Crear la primera
            </Button>
          }
        />
      )}

      {index && !index.empty && (
        <div className="mt-6 space-y-4">
          {unassigned && (
            <UnassignedPeople
              unassigned={unassigned}
              expanded={unassignedOpen}
              onToggle={() => setUnassignedOpen((v) => !v)}
              onAssign={(personId) => {
                setPickError(null);
                setAssigningId(personId);
              }}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <LinesIndex
              index={index}
              search={search}
              selectedId={openId}
              onSearch={setSearch}
              onSelect={(id) => {
                setDetailError(null);
                setSelectedId(id);
              }}
            />

            {detail && (
              <LineDetail
                line={detail}
                error={detailError}
                onEdit={openEdit}
                onArchive={() => setConfirmArchive(true)}
                onReactivate={() =>
                  settle(
                    mutations.reactivate(detail.id),
                    "Línea reactivada",
                    setDetailError
                  )
                }
                onChangeLead={() => {
                  setLeadError(null);
                  setLeadOpen(true);
                }}
                onAssign={() => {
                  setAssignError(null);
                  setAssignOpen(true);
                }}
                onRemovePerson={handleRemove}
              />
            )}
          </div>
        </div>
      )}

      {formOpen && (
        <LineFormDrawer
          // Remonta al cambiar de línea o de modo: el formulario arranca de
          // cero sin sincronizar nada por efecto.
          key={editing ? `edit-${detail?.id}` : "new"}
          open={formOpen}
          saving={mutations.saving}
          error={formError}
          line={editing ? (detail ?? null) : null}
          existing={[...(index?.active ?? []), ...(index?.archived ?? [])]}
          onOpenChange={setFormOpen}
          onSubmit={handleSubmitForm}
        />
      )}

      {leadOpen && detail && roster && lines && (
        <LeadDrawer
          key={`lead-${detail.id}`}
          open={leadOpen}
          saving={mutations.saving}
          error={leadError}
          lineName={detail.name}
          currentLeadId={detail.leadId}
          candidates={toLeadCandidates(roster, lines, detail.id)}
          onOpenChange={setLeadOpen}
          onSubmit={handleSetLead}
        />
      )}

      {assignOpen && detail && roster && (
        <AssignPeopleDrawer
          key={`assign-${detail.id}`}
          open={assignOpen}
          saving={mutations.saving}
          error={assignError}
          lineName={detail.name}
          candidates={toAssignCandidates(roster, detail.id)}
          onOpenChange={setAssignOpen}
          onSubmit={handleAssign}
        />
      )}

      {assigningId && index && unassigned && (
        <PickLineDrawer
          key={`pick-${assigningId}`}
          open
          saving={mutations.saving}
          error={pickError}
          personName={
            unassigned.people.find((p) => p.id === assigningId)?.name ?? ""
          }
          activeLines={index.active}
          onOpenChange={(open) => !open && setAssigningId(null)}
          onSubmit={handleAssignFromUnassigned}
        />
      )}

      {confirmArchive && detail && (
        <Modal open={confirmArchive} onOpenChange={setConfirmArchive}>
          <ModalHeader title={`Archivar ${detail.name}`} />
          <ModalBody>
            <p className="text-body-sm text-neutral-default">
              La línea deja de ofrecerse al asignar personas, pero se sigue
              viendo: es la respuesta a de dónde venía quien la tuvo.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="subtle" onClick={() => setConfirmArchive(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              isLoading={mutations.saving}
              onClick={handleArchive}
            >
              Archivar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};
