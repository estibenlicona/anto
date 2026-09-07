import React from "react";
import { Avatar, Badge, Button, Icon } from "@tuya-ui/components";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";

export interface PersonDetailHeaderProps {
  detail: PersonDetail;
  onEdit: () => void;
  /** Abre el plan de la persona en el módulo Competencias. */
  onCareerPlan: () => void;
}

/**
 * Encabezado mínimo del perfil profesional: avatar, nombre, y una sola línea
 * con el cargo y el stack principal. Todo lo demás de la identidad (nivel,
 * modalidad, vinculación, correo, DevOps) vive en el panel Perfil y sólo ahí.
 * No hay enlace de vuelta (el breadcrumb navega) ni acciones de asignación:
 * la asignación se gestiona en la Torre de control y en Células.
 */
export const PersonDetailHeader: React.FC<PersonDetailHeaderProps> = ({
  detail,
  onEdit,
  onCareerPlan,
}) => {
  const { person } = detail;
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="large" label={person.name} colorId={person.id}>
          {detail.initials}
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-heading-lg font-semibold text-neutral-default">
            {person.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 text-body-sm text-neutral-subtle">
            <span>{person.position}</span>
            {detail.primaryStackName && (
              <Badge variant="neutral" dot={false}>
                {detail.primaryStackName}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="subtle"
          onClick={onCareerPlan}
          iconBefore={<Icon name="target" size={16} />}
        >
          Competencias
        </Button>
        {/* La primaria de la ficha es editar a la persona: es la única
            escritura que la página conserva como propia. */}
        <Button
          variant="primary"
          onClick={onEdit}
          iconBefore={<Icon name="edit" size={16} />}
        >
          Editar
        </Button>
      </div>
    </div>
  );
};
