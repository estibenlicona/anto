import React from "react";
import {
  Button,
  Card,
  EmptyState,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import type { LinePersonView } from "../adapters/ExpertiseLinesAdapter";

interface LinePeopleTableProps {
  people: LinePersonView[];
  /** Una línea archivada no recibe gente, así que no ofrece asignar. */
  archived: boolean;
  onAssign: () => void;
  onRemove: (person: LinePersonView) => void;
}

export const LinePeopleTable: React.FC<LinePeopleTableProps> = ({
  people,
  archived,
  onAssign,
  onRemove,
}) => (
  <Card className="overflow-hidden">
    <div className="flex items-center justify-between border-b-default border-neutral-default px-4 py-3">
      <h3 className="text-body font-semibold text-neutral-default">
        Personas de la línea
      </h3>
      {!archived && (
        // Secundaria: la acción de marca de la pantalla es crear una línea.
        <Button
          variant="secondary"
          onClick={onAssign}
          iconBefore={<Icon name="plus" size={16} />}
        >
          Asignar personas
        </Button>
      )}
    </div>

    {people.length === 0 ? (
      <EmptyState
        className="py-8"
        icon={<Icon name="team" size={32} />}
        title="Todavía no hay nadie en esta línea"
        description="Una línea sin gente no tiene capacidad que reportar ni a quién desarrollar."
        action={
          archived ? undefined : (
            <Button variant="secondary" onClick={onAssign}>
              Asignar la primera
            </Button>
          )
        }
      />
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Persona</TableHead>
            <TableHead>Seniority</TableHead>
            <TableHead align="right">FTE</TableHead>
            <TableHead>Célula</TableHead>
            <TableHead align="right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-neutral-default">
                    {person.name}
                  </span>
                  {person.isLead && <Tag>Lead</Tag>}
                </span>
                <span className="text-body-sm text-neutral-subtle">
                  {person.position}
                </span>
              </TableCell>
              <TableCell>{person.seniorityLabel}</TableCell>
              <TableCell align="right">{person.availableFteLabel}</TableCell>
              <TableCell>
                {person.squadName ? (
                  person.allocationLabel
                ) : (
                  <span className="text-neutral-subtle">Sin célula</span>
                )}
              </TableCell>
              <TableCell align="right">
                {/*
                  Subtle, no de peligro: quitar de la línea no borra a nadie ni
                  la saca de su célula. Y quien lidera no puede salir, así que
                  la acción se deshabilita en vez de fallar al pulsarla.
                */}
                <Button
                  variant="subtle"
                  disabled={person.isLead || archived}
                  onClick={() => onRemove(person)}
                >
                  Quitar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </Card>
);
