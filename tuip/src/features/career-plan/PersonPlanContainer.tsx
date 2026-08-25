import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  EmptyState,
  Icon,
  Skeleton,
  useToast,
} from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { usePersonPlan } from "./hooks/usePersonPlan";
import { PersonPlanHeader } from "./components/PersonPlanHeader";
import { PlanSkillProfile } from "./components/PlanSkillProfile";
import { PlanActionsTable } from "./components/PlanActionsTable";
import { NewActionDrawer } from "./components/NewActionDrawer";
import type { CreatePlanActionRequest } from "./services/careerPlanService";

export const PersonPlanContainer: React.FC = () => {
  const { personId = "" } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan, loading, error, saving, createAction, completeAction } =
    usePersonPlan(personId);

  useLeadBreadcrumbTrailing(plan?.personName ?? null);

  // Varias habilidades abiertas a la vez: el uso real es comparar dos, y
  // cerrar una al abrir otra obligaría a ir y volver.
  const [expanded, setExpanded] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const toggle = (skillId: string, open: boolean) =>
    setExpanded((current) =>
      open ? [...current, skillId] : current.filter((id) => id !== skillId)
    );

  const openDrawer = () => {
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleCreate = async (request: CreatePlanActionRequest) => {
    const result = await createAction(request);
    if (result.success) {
      setDrawerOpen(false);
      setDrawerError(null);
      toast({
        message: "Acción registrada",
        icon: <Icon name="status-success" size={16} />,
      });
    } else {
      setDrawerError(result.error ?? null);
    }
  };

  const handleComplete = async (actionId: string) => {
    setActionError(null);
    const result = await completeAction(actionId);
    if (result.success) {
      toast({
        message: "Acción cumplida. La brecha se cierra reevaluando.",
        icon: <Icon name="status-success" size={16} />,
      });
    } else {
      setActionError(result.error ?? null);
    }
  };

  const goToAssessment = () =>
    navigate(`/app/lead/personas/${personId}/evaluacion`);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !plan) {
    return <Alert variant="danger">{error ?? "No se encontró el plan"}</Alert>;
  }

  return (
    <div className="space-y-8">
      <PersonPlanHeader
        plan={plan}
        onAssess={goToAssessment}
        onAddAction={openDrawer}
      />

      {actionError && <Alert variant="danger">{actionError}</Alert>}

      {!plan.assessed ? (
        <EmptyState
          icon={<Icon name="expertise" size={32} />}
          title="Todavía no tiene una evaluación cerrada"
          description="El plan se apoya en el criterio exacto que le falta, y eso sale de una evaluación. Sin ella no hay perfil que mostrar."
          action={
            <Button variant="primary" onClick={goToAssessment}>
              Evaluar a {plan.personName.split(" ")[0]}
            </Button>
          }
        />
      ) : (
        <>
          <PlanSkillProfile
            plan={plan}
            expanded={expanded}
            onExpandedChange={toggle}
          />
          <PlanActionsTable
            plan={plan}
            saving={saving}
            onComplete={handleComplete}
            onAddAction={openDrawer}
          />
        </>
      )}

      <NewActionDrawer
        plan={plan}
        open={drawerOpen}
        saving={saving}
        error={drawerError}
        onOpenChange={setDrawerOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
};
