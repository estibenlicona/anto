import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, EmptyState, Icon, useToast } from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { modulePath } from "@shared/services/modulePath";
import { usePersonDetail } from "./hooks/usePersonDetail";
import { usePersonPlan } from "./hooks/usePersonPlan";
import { usePersonDetailMutations } from "./hooks/usePersonDetailMutations";
import { usePersonMutations } from "./hooks/usePersonMutations";
import { useCatalogs } from "./hooks/useCatalogs";
import { personAdapter, type PersonFormValues } from "./adapters/PersonAdapter";
import { PersonFormDrawer } from "./components/PersonFormDrawer";
import { PersonDetailHeader } from "./components/detail/PersonDetailHeader";
import { PersonPointerCards } from "./components/detail/PersonPointerCards";
import { PersonSkillProfilePanel } from "./components/detail/PersonSkillProfilePanel";
import { PersonPlanPanel } from "./components/detail/PersonPlanPanel";
import { PersonStacksPanel } from "./components/detail/PersonStacksPanel";
import { EditStacksDrawer } from "./components/detail/EditStacksDrawer";
import { useStackCatalog } from "./hooks/useStackCatalog";
import { usePersonStacksMutation } from "./hooks/usePersonStacksMutation";
import { PersonProfilePanel } from "./components/detail/PersonProfilePanel";
import { LinkDevOpsIdentityDrawer } from "./components/detail/LinkDevOpsIdentityDrawer";

export interface PersonDetailContainerProps {
  personId: string | undefined;
}

/**
 * El perfil profesional de la persona. La página no muestra ni gestiona nada
 * de su asignación —eso vive en la Torre de control y en Células— y del
 * sprint sólo lleva el puntero con el resumen que sirve Capacidad. Sus
 * escrituras propias son tres: editar a la persona, editar sus stacks y
 * vincular su identidad DevOps.
 */
export const PersonDetailContainer: React.FC<PersonDetailContainerProps> = ({
  personId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { detail, loading, error, notFound, refetch } =
    usePersonDetail(personId);
  // El plan viaja aparte y degrada por partes: si falla, los paneles de
  // competencias muestran su estado vacío sin tumbar la ficha (design D3).
  const { plan } = usePersonPlan(personId);
  const { linkIdentity, linking } = usePersonDetailMutations();
  const { update: updatePerson, updating } = usePersonMutations();
  const {
    levels,
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
            onClick={() => navigate(modulePath("personas"))}
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
  const planHref = modulePath(`competencias/${detail.person.id}`);

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
      refetch();
    } else if (result.error) {
      setFormError(result.error);
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

  const handleLinkConfirm = async (devOpsUserId: string) => {
    setLinkError(null);
    const result = await linkIdentity(detail.person.id, devOpsUserId);
    if (result.success) {
      setLinkOpen(false);
      toast({
        message: "Identidad vinculada",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else if (result.error) {
      // Se queda abierto con el resultado a la vista: el 409 dice quién tiene
      // esa identidad, y cerrar sería esconderlo.
      setLinkError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <PersonDetailHeader
        detail={detail}
        onEdit={openEdit}
        onCareerPlan={() => navigate(planHref)}
      />

      {/* La ficha y los stacks protagonizan (2/3); los punteros y las
          lecturas de competencias van al costado (1/3). */}
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <PersonProfilePanel detail={detail} onEdit={openEdit} />
          <PersonStacksPanel detail={detail} onEdit={openStacks} />
        </div>
        <div className="flex flex-col gap-3">
          <PersonPointerCards
            detail={detail}
            plan={plan}
            planHref={planHref}
            onLinkIdentity={openLink}
          />
          <PersonSkillProfilePanel plan={plan} planHref={planHref} />
          <PersonPlanPanel plan={plan} planHref={planHref} />
        </div>
      </div>

      <PersonFormDrawer
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        person={person}
        levels={levels}
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
        <LinkDevOpsIdentityDrawer
          key={linkKey}
          open={linkOpen}
          onOpenChange={setLinkOpen}
          personName={detail.person.name}
          personEmail={detail.person.userPrincipalName}
          linking={linking}
          serverError={linkError}
          onConfirm={handleLinkConfirm}
        />
      )}
    </div>
  );
};
