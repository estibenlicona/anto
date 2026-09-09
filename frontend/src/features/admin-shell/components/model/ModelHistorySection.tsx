import React from "react";
import {
  Alert,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import type { ModelChangeEntry } from "../../services/estimationModelService";

export interface ModelHistorySectionProps {
  entries: ModelChangeEntry[];
}

const formatMoment = (value: string) =>
  new Date(value).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * El historial de una versión. El aviso sobre el autor no es una nota al pie:
 * mientras la interfaz de programación no valide el token de quien llama, lo
 * que se guarda es quién dijo ser, y quien lo lea tiene que saberlo antes de
 * usarlo para nada.
 */
export const ModelHistorySection: React.FC<ModelHistorySectionProps> = ({ entries }) => (
  <Card>
    <CardBody className="flex flex-col gap-3">
      <Alert variant="info">
        El autor lo informa el cliente desde su sesión. Todavía no hay
        autenticación en la interfaz de programación, así que es una firma
        declarativa: dice quién dijo ser, no quién fue.
      </Alert>

      {entries.length === 0 ? (
        <p className="text-body-sm text-neutral-subtle">
          Esta versión no tiene cambios registrados.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cuándo</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Qué cambió</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={`${entry.occurredAtUtc}-${entry.summary}`}>
                <TableCell>
                  <span className="font-mono text-label tabular-nums text-neutral-subtle">
                    {formatMoment(entry.occurredAtUtc)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-body-sm">{entry.author}</span>
                </TableCell>
                <TableCell>
                  <Tag>{entry.section}</Tag>
                </TableCell>
                <TableCell>
                  <span className="text-body-sm">{entry.summary}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardBody>
  </Card>
);
