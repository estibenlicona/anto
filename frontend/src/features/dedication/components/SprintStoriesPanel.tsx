import React from "react";
import {
  Badge,
  type BadgeVariant,
  EmptyState,
  Icon,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  type TagColor,
} from "@tuya-ui/components";
import type {
  StoriesSummary,
  WorkItemRow,
} from "../adapters/DedicationAdapter";

export interface SprintStoriesPanelProps {
  sprintName: string;
  workItems: WorkItemRow[];
  points: number;
  /** El recuento del pie: SP cerrados, sin cerrar y cuántas entraron tarde. */
  summary: StoriesSummary;
}

/**
 * El estado de DevOps como marca de estado: es una condición que puede dejar
 * de pasar, así que lleva punto. Lo que no conocemos va en neutro, sin
 * inventarle un rol.
 */
const STATE_VARIANTS: Record<string, BadgeVariant> = {
  Closed: "success",
  Resolved: "info",
  Active: "info",
  New: "neutral",
  Removed: "danger",
};

/**
 * La iniciativa como marca de pertenencia —tag, no badge—: dice a qué conjunto
 * pertenece la historia, no en qué estado está. El BAU va en gris porque no
 * es una iniciativa, y lo sin etiqueta en ámbar porque hay que corregirlo en
 * DevOps: es el único caso en que la marca pide algo.
 */
function initiativeTag(item: WorkItemRow): { label: string; color: TagColor } {
  if (item.kind === "Bau") return { label: "BAU", color: "gray" };
  if (item.kind === "Untagged")
    return { label: "Sin etiqueta", color: "amber" };
  return { label: item.initiativeName ?? "Iniciativa", color: "blue" };
}

/**
 * El contenido: las historias comprometidas en el sprint, de mayor a menor
 * por puntos. Seis columnas fijas —número, historia con su épica y tablero,
 * iniciativa, estado, puntos y el enlace a DevOps— para que cada dato se
 * encuentre en el mismo sitio en toda fila.
 *
 * Las que entraron con el sprint ya arrancado llevan su marca junto al
 * estado: son las que explican un cumplimiento bajo que no es incumplimiento.
 */
export const SprintStoriesPanel: React.FC<SprintStoriesPanelProps> = ({
  sprintName,
  workItems,
  points,
  summary,
}) => (
  <div className="flex flex-col">
    {workItems.length === 0 ? (
      <EmptyState
        icon={<Icon name="work-item" size={32} />}
        title={`Sin historias en ${sprintName}`}
      />
    ) : (
      <Table flush>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>Historia</TableHead>
            <TableHead className="w-44">Iniciativa</TableHead>
            <TableHead className="w-56">Estado</TableHead>
            <TableHead align="right" className="w-20">
              Puntos
            </TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Abrir en DevOps</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workItems.map((item) => {
            const tag = initiativeTag(item);
            const area = [item.epicTitle, item.board]
              .filter(Boolean)
              .join(" · ");
            return (
              <TableRow key={item.id}>
                <TableCell>
                  {/* Mono porque es una cadena literal —el número de DevOps—,
                      no una cifra que se compare. */}
                  <span className="font-mono text-body-sm text-neutral-subtle">
                    #{item.number}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 flex-col">
                    <span
                      className="truncate text-body-sm font-medium text-neutral-default"
                      title={item.title}
                    >
                      {item.title}
                    </span>
                    <span
                      className="truncate text-body-sm text-neutral-subtle"
                      title={area}
                    >
                      {area}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Tag color={tag.color}>
                    <span className="max-w-36 truncate" title={tag.label}>
                      {tag.label}
                    </span>
                  </Tag>
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={STATE_VARIANTS[item.state] ?? "neutral"}>
                      {item.state}
                    </Badge>
                    {item.addedAfterSprintStart && (
                      <Badge variant="warning">Entró después</Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <span className="font-semibold text-neutral-default">
                    {item.points}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    tone="neutral"
                    aria-label={`Abrir #${item.number} en Azure DevOps`}
                    className="inline-flex size-8 items-center justify-center rounded-control text-neutral-subtle hover:bg-neutral-subtle-hover"
                  >
                    <Icon name="external-link" size={16} />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
    {workItems.length > 0 && (
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-neutral-default bg-neutral-subtlest px-4 py-3 text-body-sm tabular-nums text-neutral-subtle">
        <span>
          <b className="font-semibold text-neutral-default">
            {workItems.length}
          </b>{" "}
          historias ·{" "}
          <b className="font-semibold text-neutral-default">{points}</b> SP
        </span>
        <span>
          <b className="font-semibold text-success-default">
            {summary.closedPoints} SP
          </b>{" "}
          en Closed ({summary.closedCount})
        </span>
        <span>
          <b className="font-semibold text-neutral-default">
            {summary.openPoints} SP
          </b>{" "}
          sin cerrar
        </span>
        <span className="ml-auto">
          Cumplimiento = Closed / comprometidos ={" "}
          <b className="font-semibold text-neutral-default">
            {summary.completionLabel}
          </b>
        </span>
        <span>
          <b className="font-semibold text-neutral-default">
            {summary.lateCount}
          </b>{" "}
          entraron después del inicio
        </span>
      </div>
    )}
  </div>
);
