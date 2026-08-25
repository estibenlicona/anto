import React from "react";
import {
  Avatar,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import type { Absence } from "../adapters/AbsenceAdapter";

export interface AbsencesTableProps {
  items: Absence[];
  saving: boolean;
  onApprove: (absence: Absence) => void;
  onReject: (absence: Absence) => void;
}

/**
 * Una fila por ausencia del mes visible. El impacto es el del mes (no el del
 * rango completo); una rechazada no cuenta en nada y su celda lo muestra vacía.
 */
export const AbsencesTable: React.FC<AbsencesTableProps> = ({
  items,
  saving,
  onApprove,
  onReject,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Persona</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Fechas</TableHead>
        <TableHead align="right">Días</TableHead>
        <TableHead>Célula</TableHead>
        <TableHead align="right">Impacto del mes</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead aria-label="Acciones" />
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((absence) => (
        <TableRow key={absence.id}>
          <TableCell>
            <div className="flex items-center gap-2.5">
              <Avatar
                size="small"
                label={absence.personName}
                colorId={absence.personId}
              >
                {absence.initials}
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="font-semibold text-neutral-default">
                  {absence.personName}
                </span>
                <span className="text-label font-normal tracking-normal text-neutral-subtle">
                  {absence.originLabel}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Tag>{absence.typeLabel}</Tag>
          </TableCell>
          <TableCell>
            <span className="tabular-nums">{absence.rangeLabel}</span>
          </TableCell>
          <TableCell align="right">
            <span className="tabular-nums">{absence.businessDays}</span>
          </TableCell>
          <TableCell>
            {absence.mainSquadName ?? (
              <span className="text-neutral-subtle">Sin célula</span>
            )}
          </TableCell>
          <TableCell align="right">
            {absence.status === "Rejected" || absence.monthFteImpact === 0 ? (
              <span className="text-neutral-subtle">—</span>
            ) : (
              <span className="tabular-nums text-warning-default">
                −{absence.monthFteImpact.toFixed(2)} FTE
              </span>
            )}
          </TableCell>
          <TableCell>
            <Badge variant={absence.statusVariant}>{absence.statusLabel}</Badge>
          </TableCell>
          <TableCell align="right">
            {/*
              Cada estado ofrece lo que admite. Una Aprobada conserva
              Rechazar: es cómo se revierte una aprobación equivocada, y sin
              eso la corrección que el requisito promete no existe. Una
              Rechazada es terminal — corregirla es registrar de nuevo.

              Sin color de marca dentro del listado: el rojo es de la acción
              primaria de la pantalla (Registrar ausencia). La jerarquía
              entre las dos acciones la da subtle vs secondary.
            */}
            {absence.status !== "Rejected" && (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="subtle"
                  size="small"
                  disabled={saving}
                  onClick={() => onReject(absence)}
                >
                  Rechazar
                </Button>
                {absence.status === "Requested" && (
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={saving}
                    onClick={() => onApprove(absence)}
                  >
                    Aprobar
                  </Button>
                )}
              </div>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
