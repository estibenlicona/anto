import React from "react";
import { Avatar, Badge, Tag } from "@tuya-ui/components";
import type {
  CollaboratorDetail,
  InitiativeRow,
} from "../adapters/DedicationAdapter";
import { SHOWN_INITIATIVES } from "../adapters/DedicationAdapter";

export interface CollaboratorHeaderProps {
  detail: CollaboratorDetail;
  /** Las iniciativas que sus historias tocaron en el sprint elegido. */
  initiatives: InitiativeRow[];
}

const Dot: React.FC = () => (
  <span aria-hidden="true" className="text-neutral-subtlest">
    ·
  </span>
);

/**
 * Quién es, en una línea.
 *
 * El FTE que aparece acá es **el que la célula declara**, y se rotula como
 * tal: es un reporte, no una medición, y no participa en el balance —la
 * capacidad medida está en la tarjeta de al lado—. Las iniciativas son las que
 * sus historias tocaron en el sprint, no la activa de su célula: dicen en qué
 * anduvo. La identidad completa (correo, seniority, modalidad) vive en la
 * ficha, a un clic.
 *
 * Las acciones y el navegador de sprint no están acá: viven en la franja del
 * breadcrumb, que es donde el listado ya los puso.
 */
export const CollaboratorHeader: React.FC<CollaboratorHeaderProps> = ({
  detail,
  initiatives,
}) => {
  const { person, allocation } = detail;
  const shown = initiatives.slice(0, SHOWN_INITIATIVES);
  const extra = initiatives.length - shown.length;
  return (
    <div className="flex items-center gap-4">
      <Avatar size="large" label={person.name} colorId={person.id}>
        {person.initials}
      </Avatar>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Display, no heading: el nombre es el título de la pantalla, y
              el sistema tiene un solo estilo para eso —uno por vista. */}
          <h1 className="text-display text-neutral-default">{person.name}</h1>
          {!allocation && <Badge variant="danger">Sin célula</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-neutral-subtle">
          <span>{person.position}</span>
          {allocation && (
            <>
              <Dot />
              <span>{allocation.squadName}</span>
            </>
          )}
          {detail.declaredLabel && (
            <>
              <Dot />
              <span className="tabular-nums">{detail.declaredLabel}</span>
            </>
          )}
          {initiatives.length > 0 && (
            <>
              <Dot />
              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                Iniciativas
                {shown.map((initiative) => (
                  <Tag key={initiative.id} color="blue">
                    <span className="max-w-44 truncate" title={initiative.name}>
                      {initiative.name}
                    </span>
                  </Tag>
                ))}
                {extra > 0 && (
                  <Tag
                    color="gray"
                    title={initiatives
                      .slice(SHOWN_INITIATIVES)
                      .map((i) => i.name)
                      .join(" · ")}
                  >
                    +{extra}
                  </Tag>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
