import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  Icon,
  Link,
  Menu,
  MenuItem,
  SeniorityCard,
} from "@tuya-ui/components";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";

export interface PersonDetailHeaderProps {
  detail: PersonDetail;
  /**
   * El rol en español. Llega resuelto y no se traduce acá: el mapa entre el
   * valor del contrato y lo que se lee vive en el catálogo que sirve el
   * backend, y repetirlo en cada pantalla es tener dos.
   */
  roleLabel: string;
  onEdit: () => void;
  /** Reasignar (con célula) o Asignar a una célula (sin célula). */
  onReassign: () => void;
  onDelete: () => void;
  /** Abre la evaluación técnica de la persona contra el catálogo de habilidades. */
  onAssess: () => void;
  /** Abre su plan de carrera: el perfil evaluado y las acciones acordadas. */
  onCareerPlan: () => void;
}

/**
 * La identidad completa de la persona vive acá y en ningún otro lugar de la
 * página (cargo, rol, seniority + SFIA, modalidad, vinculación, correo, estado
 * DevOps): la ficha no repite nada de esto.
 */
export const PersonDetailHeader: React.FC<PersonDetailHeaderProps> = ({
  detail,
  roleLabel,
  onEdit,
  onReassign,
  onDelete,
  onAssess,
  onCareerPlan,
}) => {
  const { person } = detail;
  const hasSquad = detail.allocation !== null;
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <Link asChild tone="neutral" className="w-fit text-body-sm">
          <RouterLink
            to="/app/lead/personas"
            className="inline-flex items-center gap-1.5 text-neutral-subtle"
          >
            <Icon name="arrow-left" size={16} />
            Personas
          </RouterLink>
        </Link>
        <div className="flex items-center gap-4">
          <Avatar size="large" label={person.name} colorId={person.id}>
            {detail.initials}
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-heading-lg font-semibold text-neutral-default">
                {person.name}
              </h1>
              <span className="inline-flex items-center gap-2 rounded-pill bg-neutral-subtle px-2 py-0.5">
                <SeniorityCard
                  level={person.seniorityLabel}
                  density="compact"
                  hideLabel
                />
                <span className="text-label font-medium tracking-normal text-neutral-default">
                  {person.seniorityLabel} · SFIA {detail.sfiaLevel}
                </span>
              </span>
              <Badge variant="neutral">
                {detail.isExternal
                  ? `Externa · ${detail.providerName ?? "proveedor"}`
                  : "Interna"}
              </Badge>
              {!hasSquad && <Badge variant="danger">Sin célula</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-body-sm text-neutral-subtle">
              <span>
                {person.position}
                {/*
                  El cargo dice a qué se dedica y el rol cómo participa en la
                  aplicación. Cuando dicen lo mismo —un Product Owner cuyo rol
                  es Product Owner— se muestra una sola vez.
                */}
                {roleLabel && roleLabel !== person.position
                  ? ` · ${roleLabel}`
                  : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="team" size={16} />
                {detail.modalityLabel}
              </span>
              <span className="font-mono text-[13px]">
                {person.userPrincipalName}
              </span>
              {detail.devOpsIdentity ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-pill bg-success-bold" />
                  DevOps vinculado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-danger-default">
                  <span className="size-1.5 rounded-pill bg-danger-bold" />
                  Sin identidad DevOps
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/*
          Subtle y no dentro del menú de más acciones: evaluar es trabajo
          habitual del líder, no una excepción — pero tampoco compite con la
          acción primaria de la ficha, que es asignar capacidad.
        */}
        {/* Evaluar produce el dato; el plan lo consume. Van juntos y en ese
            orden, que es el de la conversación real. */}
        <Button
          variant="subtle"
          onClick={onAssess}
          iconBefore={<Icon name="expertise" size={16} />}
        >
          Evaluar habilidades
        </Button>
        <Button
          variant="subtle"
          onClick={onCareerPlan}
          iconBefore={<Icon name="target" size={16} />}
        >
          Competencias
        </Button>
        <Button
          variant="secondary"
          onClick={onEdit}
          iconBefore={<Icon name="edit" size={16} />}
        >
          Editar persona
        </Button>
        <Button
          variant="primary"
          onClick={onReassign}
          iconBefore={<Icon name={hasSquad ? "rebalance" : "plus"} size={16} />}
        >
          {hasSquad ? "Reasignar" : "Asignar a una célula"}
        </Button>
        <Menu
          trigger={
            <Button variant="subtle" aria-label="Más acciones">
              <Icon name="more" size={16} />
            </Button>
          }
        >
          <MenuItem
            destructive
            icon={<Icon name="delete" size={16} />}
            onSelect={onDelete}
          >
            Eliminar persona
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};
