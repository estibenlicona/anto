import React from "react";
import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from "@tuya-ui/components";
import { skillInitials } from "@shared/services/initials";
import type {
  SpanCellView,
  SpanMatrixView,
} from "../adapters/SpanMatrixAdapter";
import { CELL_SIZE, SpanCell } from "./SpanCell";

interface SpanMatrixTableProps {
  span: SpanMatrixView;
  /** `personId:skillId` de la celda con el detalle abierto. */
  activeCellKey: string | null;
  onActivateCell: (
    personId: string,
    cell: SpanCellView,
    element: HTMLButtonElement
  ) => void;
  onOpenPerson: (personId: string) => void;
}

export function cellKey(personId: string, skillId: string): string {
  return `${personId}:${skillId}`;
}

/**
 * Los grupos de las columnas visibles, en tramos contiguos y en el orden en que
 * están: técnicas y humanas llegan agrupadas del adaptador, y lo que se rotula
 * es lo que se ve, no el catálogo.
 */
function skillGroups(span: SpanMatrixView): { label: string; count: number }[] {
  const tramos: { label: string; count: number }[] = [];
  for (const skill of span.skills) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo?.label === skill.groupLabel) ultimo.count++;
    else tramos.push({ label: skill.groupLabel, count: 1 });
  }
  return tramos;
}

/**
 * La columna de habilidad ya no la fija su nombre: mide lo que mide el cuadro.
 * Es el cambio que hace que la matriz entre — con el nombre completo arriba,
 * nueve habilidades pedían 1260 px.
 */
const SKILL_COLUMN = { width: `${CELL_SIZE}px` };
const PERSON_COLUMN = { minWidth: "220px" };
const COUNT_COLUMN = { minWidth: "88px" };

export const SpanMatrixTable: React.FC<SpanMatrixTableProps> = ({
  span,
  activeCellKey,
  onActivateCell,
  onOpenPerson,
}) => (
  <Table
    density="matrix"
    stickyFirstColumn
    aria-label="Capacidades por habilidad"
  >
    <TableHeader>
      {/*
        Los grupos, sobre las columnas que les corresponden. Sin este renglón,
        la frontera entre técnicas y humanas sólo existe en el orden de las
        columnas, y con las siglas de dos letras no hay forma de deducirla.
        Se calcula sobre lo que está a la vista: al acotar a un grupo queda su
        único rótulo, no dos con uno vacío.
      */}
      <TableRow>
        <TableHead style={PERSON_COLUMN} aria-hidden="true" />
        {skillGroups(span).map((group) => (
          <TableHead
            key={group.label}
            colSpan={group.count}
            className="text-center"
          >
            <span className="text-label text-neutral-subtle">
              {group.label.toUpperCase()}
            </span>
          </TableHead>
        ))}
        <TableHead style={COUNT_COLUMN} aria-hidden="true" />
      </TableRow>

      <TableRow>
        <TableHead style={PERSON_COLUMN}>Persona</TableHead>
        {span.skills.map((skill) => (
          <TableHead key={skill.skillId} style={SKILL_COLUMN}>
            {/*
              Dos letras y no el nombre completo: la sigla ubica la columna sin
              imponerle ancho —con el nombre entero, nueve habilidades pedían
              1260 px— y ahorra tener que abrir una celda para saber de qué
              habilidad se trata. El nombre completo sigue estando en el
              tooltip y, oculto, como nombre accesible de la columna: una
              columna que sólo dice "AR" no se puede recorrer con un lector de
              pantalla.
            */}
            <Tooltip content={skill.skillName}>
              <span
                aria-hidden="true"
                className="flex justify-center text-label font-semibold text-neutral-subtle"
              >
                {skillInitials(skill.skillName)}
              </span>
            </Tooltip>
            <span className="sr-only">{skill.skillName}</span>
          </TableHead>
        ))}
        <TableHead align="right" style={COUNT_COLUMN}>
          Brechas
        </TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {span.people.map((person) => (
        <TableRow key={person.personId}>
          <TableCell style={PERSON_COLUMN}>
            <span className="flex items-center gap-2">
              {/* `colorId` con el id: el color de avatar de una persona es el
                  mismo en toda la app, no uno por pantalla. */}
              <Avatar
                size="small"
                label={person.personName}
                colorId={person.personId}
              >
                {person.initials}
              </Avatar>
              <span className="flex flex-col">
                {/* El nombre abre su plan: leer la fila y querer el detalle de
                    esa persona es el mismo movimiento. Tono neutro, no de
                    marca: con un enlace por fila el rojo tiñe la columna. */}
                <button
                  type="button"
                  onClick={() => onOpenPerson(person.personId)}
                  className="text-left text-body-sm text-neutral-default underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-border-neutral-focus)]"
                >
                  {person.personName}
                </button>
                <span className="text-body-sm text-neutral-subtle">
                  {person.position}
                </span>
              </span>
            </span>
          </TableCell>

          {person.cells.map((cell) => (
            <TableCell key={cell.skillId} style={SKILL_COLUMN}>
              <SpanCell
                cell={cell}
                active={
                  activeCellKey === cellKey(person.personId, cell.skillId)
                }
                onActivate={(element) =>
                  onActivateCell(person.personId, cell, element)
                }
              />
            </TableCell>
          ))}

          <TableCell align="right" style={COUNT_COLUMN}>
            {person.evaluated ? (
              <span className="text-body-sm font-semibold text-neutral-default">
                {person.gapCount}
              </span>
            ) : (
              // No es cero: es que todavía no se sabe.
              <span className="text-body-sm text-neutral-subtle">
                Sin evaluar
              </span>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>

    <TableFooter>
      <TableRow>
        <TableCell style={PERSON_COLUMN}>
          <span className="text-body-sm font-semibold text-neutral-default">
            Con brecha
          </span>
        </TableCell>
        {span.skills.map((skill) => (
          <TableCell key={skill.skillId} style={SKILL_COLUMN}>
            <span className="flex justify-center text-body-sm font-semibold tabular-nums text-neutral-default">
              {skill.gapCount}
            </span>
          </TableCell>
        ))}
        <TableCell align="right" style={COUNT_COLUMN}>
          <span className="text-body-sm font-semibold tabular-nums text-neutral-default">
            {span.totalGaps}
          </span>
        </TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);
