import React from "react";
import { Alert, Button, Card, Icon, Tag } from "@tuya-ui/components";
import type {
  LineDetailView,
  LinePersonView,
} from "../adapters/ExpertiseLinesAdapter";
import { LineCapacity } from "./LineCapacity";
import { LinePeopleTable } from "./LinePeopleTable";

interface LineDetailProps {
  line: LineDetailView;
  error: string | null;
  onEdit: () => void;
  onArchive: () => void;
  onReactivate: () => void;
  onChangeLead: () => void;
  onAssign: () => void;
  onRemovePerson: (person: LinePersonView) => void;
}

export const LineDetail: React.FC<LineDetailProps> = ({
  line,
  error,
  onEdit,
  onArchive,
  onReactivate,
  onChangeLead,
  onAssign,
  onRemovePerson,
}) => (
  <div className="space-y-4">
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-heading font-semibold text-neutral-default">
              {line.name}
            </h2>
            <Tag>{line.code}</Tag>
            {line.archived && <Tag>Archivada</Tag>}
          </div>
          {line.description && (
            <p className="text-body-sm text-neutral-subtle">
              {line.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {/*
            Acciones de pantalla, no de marca. Editar corrige y va subtle;
            archivar cambia el estado de la línea y saca a sus personas de la
            vista habitual, así que pesa más. Con las dos iguales, la
            diferencia dependía de leer bien la palabra — y se paga una sola
            vez. Reactivar acompaña a archivar: es su vuelta atrás.
          */}
          {!line.archived && (
            <Button variant="subtle" onClick={onEdit}>
              Editar
            </Button>
          )}
          {line.archived ? (
            <Button variant="secondary" onClick={onReactivate}>
              Reactivar
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled={!line.canArchive}
              onClick={onArchive}
            >
              Archivar
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 border-t-default border-neutral-default pt-3">
        {line.leadName ? (
          <p className="flex items-center gap-2 text-body-sm text-neutral-default">
            <span className="text-neutral-subtle">Lead</span>
            <span className="font-medium">{line.leadName}</span>
            {!line.archived && (
              <Button variant="subtle" onClick={onChangeLead}>
                Cambiar
              </Button>
            )}
          </p>
        ) : line.archived ? (
          <p className="text-body-sm text-neutral-subtle">Sin lead</p>
        ) : (
          /*
            Una línea vigente sin lead no tiene quién responda por ella: se
            señala y se ofrece resolverlo en el mismo lugar donde se ve.
          */
          <p className="flex items-center gap-2 text-body-sm text-warning-default">
            <Icon name="status-warning" size={16} />
            Esta línea no tiene lead.
            <Button variant="subtle" onClick={onChangeLead}>
              Designar lead
            </Button>
          </p>
        )}
      </div>
    </Card>

    {error && <Alert variant="danger">{error}</Alert>}

    {!line.archived && <LineCapacity capacity={line.capacity} />}

    <LinePeopleTable
      people={line.people}
      archived={line.archived}
      onAssign={onAssign}
      onRemove={onRemovePerson}
    />
  </div>
);
