import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
  useToast,
} from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { squadService } from "@features/squads/services/squadService";
import { modulePath } from "@shared/services/modulePath";
import { useInitiative } from "./hooks/useInitiative";
import { useInitiativeMutations } from "./hooks/useInitiativeMutations";
import { InitiativeDetailHeader } from "./components/detail/InitiativeDetailHeader";
import { InitiativePhaseStrip } from "./components/detail/InitiativePhaseStrip";
import { Phase1Reading } from "./components/evaluation/Phase1Reading";
import { InitiativeFormDrawer } from "./components/InitiativeFormDrawer";
import { StatusConfirmDialog } from "./components/StatusConfirmDialog";
import {
  toInitiativeInput,
  type InitiativeFormValues,
} from "./components/initiativeValidation";
import { evaluationPath } from "./adapters/InitiativeAdapter";
import { savedEvaluationResult } from "./adapters/SavedEvaluationAdapter";
import type { InitiativeStatus } from "./services/initiativeService";

export interface InitiativeDetailContainerProps {
  initiativeId: string | undefined;
}

/**
 * La ficha de una iniciativa: qué es, en qué fase va y qué dio su estimación.
 *
 * Es el destino del nombre en el listado y en el detalle de célula. Antes esos
 * enlaces iban directo al asistente de evaluación, así que una iniciativa ya
 * evaluada no tenía dónde leerse sin volver a abrir el cuestionario.
 */
export const InitiativeDetailContainer: React.FC<
  InitiativeDetailContainerProps
> = ({ initiativeId }) => {
  const { initiative, model, loading, error, notFound, refetch } =
    useInitiative(initiativeId);
  const { update, setStatus, saving, changingStatus } =
    useInitiativeMutations();
  const { toast } = useToast();
  const navigate = useNavigate();

  useLeadBreadcrumbTrailing(initiative?.name ?? null);

  const [squadOptions, setSquadOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  useEffect(() => {
    let cancelled = false;
    squadService.list(1, 100).then(
      (r) => {
        if (!cancelled)
          setSquadOptions(r.items.map((s) => ({ value: s.id, label: s.name })));
      },
      () => undefined
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [statusTarget, setStatusTarget] = useState<InitiativeStatus | null>(
    null
  );
  const [statusError, setStatusError] = useState<string | null>(null);

  if (loading) {
    return (
      <p className="text-body-sm text-neutral-subtle">Cargando iniciativa…</p>
    );
  }

  if (notFound || !initiative || !model) {
    return (
      <EmptyState
        icon={<Icon name="expertise" size={32} />}
        title="Iniciativa no encontrada"
        description="La iniciativa que buscas no existe o fue eliminada."
        action={
          <Button
            variant="primary"
            onClick={() => navigate(modulePath("iniciativas"))}
          >
            Ir al listado de iniciativas
          </Button>
        }
      />
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudo cargar la iniciativa"
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

  const handleFormSubmit = async (values: InitiativeFormValues) => {
    setFormError(null);
    const result = await update(initiative.id, toInitiativeInput(values));
    if (result.success) {
      setFormOpen(false);
      toast({
        message: "Iniciativa actualizada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setFormError(result.error);
    }
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    setStatusError(null);
    const result = await setStatus(initiative.id, statusTarget);
    if (result.success) {
      const activated = statusTarget === "Active";
      setStatusTarget(null);
      toast({
        message: activated ? "Iniciativa activada" : "Iniciativa cerrada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      setStatusError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <InitiativeDetailHeader
        initiative={initiative}
        onEdit={() => {
          setFormError(null);
          setFormKey((key) => key + 1);
          setFormOpen(true);
        }}
        onActivate={() => {
          setStatusError(null);
          setStatusTarget("Active");
        }}
        onClose={() => {
          setStatusError(null);
          setStatusTarget("Closed");
        }}
      />

      <InitiativePhaseStrip initiative={initiative} />

      {initiative.evaluation ? (
        <Card>
          <CardBody className="p-0">
            <Phase1Reading
              model={model}
              result={savedEvaluationResult(initiative.evaluation, model)}
            />
          </CardBody>
        </Card>
      ) : (
        <EmptyState
          icon={<Icon name="expertise" size={32} />}
          title="Todavía sin estimación temprana"
          description="Responde el tamizaje y las dimensiones para conocer su talla, su esfuerzo y la capacidad que pide."
          action={
            <Button
              variant="primary"
              onClick={() => navigate(evaluationPath(initiative.id))}
            >
              Evaluar
            </Button>
          }
        />
      )}

      <InitiativeFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        initiative={initiative}
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
        initiative={statusTarget !== null ? initiative : null}
        target={statusTarget}
        changing={changingStatus}
        serverError={statusError}
        onConfirm={handleStatusConfirm}
      />
    </div>
  );
};
