import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Icon,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import { DedicationCell } from "@shared/components/DedicationCell";
import type { OverviewPerson } from "../adapters/CapacityOverviewAdapter";

export interface PeopleWithMarginPanelProps {
  /** Ya ordenadas: sin célula primero, luego por margen. */
  people: OverviewPerson[];
  /** Cuántas quedan fuera por estar al 100 %. */
  atCapacityCount: number;
  onAssign: (person: OverviewPerson) => void;
  onReassign: (person: OverviewPerson) => void;
}

const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

export const PeopleWithMarginPanel: React.FC<PeopleWithMarginPanelProps> = ({
  people,
  atCapacityCount,
  onAssign,
  onReassign,
}) => (
  <div className="overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
    <div className="flex items-center justify-between gap-4 border-b border-neutral-default px-4 py-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-body font-semibold text-neutral-default">
          Personas con margen
        </h2>
        <span className={SECONDARY_TEXT}>
          sin célula primero, luego por margen
        </span>
      </div>
      <Link asChild tone="neutral" className="text-body-sm">
        <RouterLink to="/app/lead/personas">Ver todas las personas</RouterLink>
      </Link>
    </div>
    {people.length === 0 ? (
      <EmptyState
        icon={<Icon name="status-success" size={32} />}
        title="Nadie tiene margen"
        description="Todas las personas están al 100 % en su célula."
      />
    ) : (
      <Table flush>
        <TableHeader>
          <TableRow>
            <TableHead>Persona</TableHead>
            <TableHead>Célula y dedicación</TableHead>
            <TableHead>Margen</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => {
            const unassigned = person.allocation === null;
            return (
              <TableRow key={person.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="large"
                      label={person.name}
                      colorId={person.id}
                    >
                      {getPersonInitials(person.name)}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium leading-5 text-neutral-default">
                        {person.name}
                      </span>
                      <span className={SECONDARY_TEXT}>
                        {person.position}
                        {person.seniorityLabel && ` · ${person.seniorityLabel}`}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {person.allocation ? (
                    <DedicationCell
                      className="max-w-80"
                      squadName={person.allocation.squadName}
                      dedicationPercentage={
                        person.allocation.dedicationPercentage
                      }
                      bauPercentage={person.allocation.bauPercentage}
                      transformationPercentage={
                        person.allocation.transformationPercentage
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">Sin célula</Badge>
                      <span className={SECONDARY_TEXT}>
                        disponible desde el alta
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span
                      className={`font-semibold tabular-nums leading-5 ${
                        unassigned
                          ? "text-danger-default"
                          : "text-success-default"
                      }`}
                    >
                      {person.marginPercentage}%
                    </span>
                    <span className={`tabular-nums ${SECONDARY_TEXT}`}>
                      {person.marginFte.toFixed(1)} FTE libre
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    {/* Acción secundaria en todas las filas: el énfasis de "sin célula" ya
                        lo da el badge; un primario por fila hace ruido. */}
                    <Button
                      variant="secondary"
                      size="small"
                      iconBefore={
                        <Icon name={unassigned ? "plus" : "sync"} size={16} />
                      }
                      onClick={() =>
                        unassigned ? onAssign(person) : onReassign(person)
                      }
                    >
                      {unassigned ? "Asignar" : "Reasignar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
    <div
      className={`border-t border-neutral-default bg-neutral-subtlest px-4 py-2.5 ${SECONDARY_TEXT}`}
    >
      {atCapacityCount === 1
        ? "1 persona está al 100 % en su célula."
        : `${atCapacityCount} personas están al 100 % en su célula.`}{" "}
      Cada persona pertenece a una sola célula: el margen es lo que no le
      dedica.
    </div>
  </div>
);
