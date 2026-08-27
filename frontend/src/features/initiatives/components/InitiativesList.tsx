import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  FilterButton,
  Icon,
  Link,
  Menu,
  MenuItem,
  MenuSeparator,
  PaginationBar,
  SearchField,
  Table,
  Tag,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import type { Initiative } from "../adapters/InitiativeAdapter";
import { STATUS_LABELS, evaluationPath } from "../adapters/InitiativeAdapter";
import type { InitiativeStatus } from "../services/initiativeService";

const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as InitiativeStatus[]).map(
  (value) => ({
    value,
    label: STATUS_LABELS[value],
  })
);

export interface InitiativesListProps {
  initiatives: Initiative[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (initiative: Initiative) => void;
  onActivate: (initiative: Initiative) => void;
  onClose: (initiative: Initiative) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statuses: InitiativeStatus[];
  onStatusesChange: (values: InitiativeStatus[]) => void;
  squadOptions: Array<{ value: string; label: string }>;
  squadIds: string[];
  onSquadIdsChange: (values: string[]) => void;
  tallaOptions: string[];
  tallas: string[];
  onTallasChange: (values: string[]) => void;
}

export const InitiativesList: React.FC<InitiativesListProps> = ({
  initiatives,
  loading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onActivate,
  onClose,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  statuses,
  onStatusesChange,
  squadOptions,
  squadIds,
  onSquadIdsChange,
  tallaOptions,
  tallas,
  onTallasChange,
}) => {
  const hasActiveFilter =
    search.trim().length > 0 ||
    statuses.length > 0 ||
    squadIds.length > 0 ||
    tallas.length > 0;

  if (!loading && !error && initiatives.length === 0 && !hasActiveFilter) {
    return (
      <EmptyState
        icon={<Icon name="expertise" size={32} />}
        title="Todavía no hay iniciativas"
        description="Registra la primera para evaluarla y conocer la capacidad que requiere."
        action={
          <Button variant="primary" onClick={onCreate}>
            Nueva iniciativa
          </Button>
        }
      />
    );
  }

  // Barra y paginación como slots de Table: una sola card. La carga, el error
  // y el "sin resultados" van como fila bajo las cabeceras para que la barra
  // se quede montada (antes eran returns tempranos y el filtro abierto se
  // cerraba y la búsqueda perdía el foco en cada recarga). Sin filas no hay
  // paginación.
  const hasRows = !loading && !error && initiatives.length > 0;

  return (
    <Table
      toolbar={
        <>
          <SearchField
            placeholder="Buscar iniciativa"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
          <FilterButton
            label="Estado"
            options={STATUS_OPTIONS}
            selected={statuses}
            onChange={(values) =>
              onStatusesChange(values as InitiativeStatus[])
            }
          />
          <FilterButton
            label="Célula"
            options={squadOptions}
            selected={squadIds}
            onChange={onSquadIdsChange}
          />
          <FilterButton
            label="Talla"
            options={tallaOptions.map((t) => ({ value: t, label: t }))}
            selected={tallas}
            onChange={onTallasChange}
          />
        </>
      }
      footer={
        hasRows ? (
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
          <TableHead>Iniciativa</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Talla</TableHead>
          <TableHead align="right">FTE esperado</TableHead>
          <TableHead align="right">Plazo</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableStatusRow colSpan={6}>
            <p className="text-body-sm text-neutral-subtle">
              Cargando iniciativas…
            </p>
          </TableStatusRow>
        ) : error ? (
          <TableStatusRow colSpan={6}>
            <Alert
              variant="danger"
              title="No se pudieron cargar las iniciativas"
              action={
                <Button variant="secondary" size="small" onClick={onRetry}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          </TableStatusRow>
        ) : initiatives.length === 0 ? (
          <TableStatusRow colSpan={6}>
            <EmptyState
              icon={<Icon name="search" size={32} />}
              title="Sin resultados"
              description="No encontramos iniciativas con esa búsqueda o esos filtros. Prueba ajustarlos."
            />
          </TableStatusRow>
        ) : (
          initiatives.map((initiative) => (
            <TableRow key={initiative.id}>
              <TableCell>
                <div className="flex flex-col">
                  {/* Enlace neutro: con uno por fila, el rojo teñiría la columna. */}
                  <Link
                    asChild
                    tone="neutral"
                    className="leading-5 font-medium"
                  >
                    <RouterLink to={evaluationPath(initiative.id)}>
                      {initiative.name}
                    </RouterLink>
                  </Link>
                  <span className="text-label font-normal tracking-normal text-neutral-subtle">
                    {initiative.squadName} · PO {initiative.productOwner}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={initiative.statusVariant}>
                  {initiative.statusLabel}
                </Badge>
              </TableCell>
              <TableCell>
                {initiative.talla ? (
                  <Tag color={initiative.tallaColor}>{initiative.talla}</Tag>
                ) : (
                  // Sin talla, la acción vive en la celda como enlace: el
                  // listado no repite botones por fila.
                  <Link
                    asChild
                    tone="neutral"
                    className="text-body-sm underline underline-offset-4"
                  >
                    <RouterLink to={evaluationPath(initiative.id)}>
                      Evaluar
                    </RouterLink>
                  </Link>
                )}
              </TableCell>
              <TableCell align="right">
                <span className="tabular-nums text-neutral-default">
                  {initiative.fteText}
                </span>
              </TableCell>
              <TableCell align="right">
                <span className="tabular-nums text-neutral-default">
                  {initiative.plazoText}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Menu
                    trigger={
                      <Button
                        variant="subtle"
                        size="small"
                        aria-label="Más acciones"
                      >
                        <Icon name="more" size={16} />
                      </Button>
                    }
                  >
                    <MenuItem
                      icon={<Icon name="edit" size={16} />}
                      onSelect={() => onEdit(initiative)}
                    >
                      Editar
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<Icon name="check" size={16} />}
                      disabled={!initiative.canActivate}
                      onSelect={() => onActivate(initiative)}
                    >
                      Activar
                    </MenuItem>
                    <MenuItem
                      icon={<Icon name="close" size={16} />}
                      disabled={!initiative.canClose}
                      onSelect={() => onClose(initiative)}
                    >
                      Cerrar
                    </MenuItem>
                  </Menu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
