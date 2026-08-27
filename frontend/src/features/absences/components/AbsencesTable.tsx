import React from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  EmptyState,
  FilterButton,
  Icon,
  PaginationBar,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  type Absence,
} from "../adapters/AbsenceAdapter";
import { formatBusinessDays } from "../services/businessDays";
import type { AbsenceStatus, AbsenceType } from "../services/absenceService";

export interface AbsencesTableProps {
  items: Absence[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  saving: boolean;
  onApprove: (absence: Absence) => void;
  onReject: (absence: Absence) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedTypes: AbsenceType[];
  onTypesChange: (values: AbsenceType[]) => void;
  selectedStatuses: AbsenceStatus[];
  onStatusesChange: (values: AbsenceStatus[]) => void;
}

/** Las opciones son fijas: los tres tipos y los tres estados existen siempre.
 *  Derivarlas de las filas del mes haría desaparecer opciones según el mes. */
const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const COLUMN_COUNT = 8;

/**
 * Una fila por ausencia del mes visible. El impacto es el del mes (no el del
 * rango completo); una rechazada no cuenta en nada y su celda lo muestra vacía.
 *
 * La barra y la paginación son slots de Table: una sola card. La carga, el
 * error y el "sin resultados" van como fila bajo las cabeceras para que la
 * barra se quede montada — si fueran returns tempranos, el filtro abierto se
 * cerraría y la búsqueda perdería el foco en cada recarga (mismo motivo que en
 * PeopleList). Sin filas no hay paginación.
 */
export const AbsencesTable: React.FC<AbsencesTableProps> = ({
  items,
  loading,
  error,
  onRetry,
  saving,
  onApprove,
  onReject,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  selectedTypes,
  onTypesChange,
  selectedStatuses,
  onStatusesChange,
}) => (
  <Table
    toolbar={
      <>
        <SearchField
          placeholder="Buscar por persona"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <FilterButton
          label="Tipo"
          options={TYPE_OPTIONS}
          selected={selectedTypes}
          onChange={(values) => onTypesChange(values as AbsenceType[])}
        />
        <FilterButton
          label="Estado"
          options={STATUS_OPTIONS}
          selected={selectedStatuses}
          onChange={(values) => onStatusesChange(values as AbsenceStatus[])}
        />
      </>
    }
    footer={
      !loading && !error && items.length > 0 ? (
        <PaginationBar
          page={page}
          pageCount={totalPages}
          onPageChange={onPageChange}
          total={total}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={onPageSizeChange}
        />
      ) : undefined
    }
  >
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
      {loading ? (
        <TableStatusRow colSpan={COLUMN_COUNT}>
          <p className="text-body-sm text-neutral-subtle">
            Cargando ausencias…
          </p>
        </TableStatusRow>
      ) : error ? (
        <TableStatusRow colSpan={COLUMN_COUNT}>
          <Alert
            variant="danger"
            title="No se pudieron cargar las ausencias"
            action={
              <Button variant="secondary" size="small" onClick={onRetry}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        </TableStatusRow>
      ) : items.length === 0 ? (
        <TableStatusRow colSpan={COLUMN_COUNT}>
          <EmptyState
            icon={<Icon name="search" size={32} />}
            title="Sin resultados"
            description="No encontramos ausencias con esa búsqueda o esos filtros. Prueba ajustarlos."
          />
        </TableStatusRow>
      ) : (
        items.map((absence) => (
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
              <span className="tabular-nums">
                {formatBusinessDays(absence.businessDays)}
              </span>
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
              <Badge variant={absence.statusVariant}>
                {absence.statusLabel}
              </Badge>
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
        ))
      )}
    </TableBody>
  </Table>
);
