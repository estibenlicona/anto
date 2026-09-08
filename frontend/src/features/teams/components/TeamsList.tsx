import React from "react";
import {
  Alert,
  Button,
  EmptyState,
  Icon,
  Menu,
  MenuItem,
  MenuSeparator,
  PaginationBar,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import type { Team } from "../adapters/TeamAdapter";

// Mismo tratamiento secundario que la descripción de célula en SquadsList.
const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

export interface TeamsListProps {
  teams: Team[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export const TeamsList: React.FC<TeamsListProps> = ({
  teams,
  loading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
}) => {
  const hasActiveFilter = search.trim().length > 0;

  // Mismo criterio que SquadsList: sin ningún equipo y sin búsqueda activa,
  // el estado vacío se queda con la pantalla entera.
  if (!loading && !error && teams.length === 0 && !hasActiveFilter) {
    return (
      <EmptyState
        icon={<Icon name="folder" size={32} />}
        title="Todavía no hay equipos"
        description="Crea el primer equipo para empezar a agrupar células."
        action={
          <Button variant="primary" onClick={onCreate}>
            Nuevo equipo
          </Button>
        }
      />
    );
  }

  const hasRows = !loading && !error && teams.length > 0;

  return (
    <Table
      toolbar={
        <SearchField
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-96"
        />
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
          <TableHead>Equipo</TableHead>
          <TableHead>Células</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableStatusRow colSpan={3}>
            <p className="text-body-sm text-neutral-subtle">
              Cargando equipos…
            </p>
          </TableStatusRow>
        ) : error ? (
          <TableStatusRow colSpan={3}>
            <Alert
              variant="danger"
              title="No se pudieron cargar los equipos"
              action={
                <Button variant="secondary" size="small" onClick={onRetry}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          </TableStatusRow>
        ) : teams.length === 0 ? (
          <TableStatusRow colSpan={3}>
            <EmptyState
              icon={<Icon name="search" size={32} />}
              title="Sin resultados"
              description="No encontramos equipos con esa búsqueda. Prueba ajustarla."
            />
          </TableStatusRow>
        ) : (
          teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className="flex max-w-sm flex-col">
                  <span className="font-medium leading-5 text-neutral-default">
                    {team.name}
                  </span>
                  {team.description && (
                    <span
                      className={`truncate ${SECONDARY_TEXT}`}
                      title={team.description}
                    >
                      {team.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {team.squadCount === 0 ? (
                  <span className="text-body-sm text-neutral-subtle">
                    Sin células
                  </span>
                ) : (
                  <span className="text-body-sm tabular-nums text-neutral-default">
                    {team.squadCount}{" "}
                    {team.squadCount === 1 ? "célula" : "células"}
                  </span>
                )}
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
                      onSelect={() => onEdit(team)}
                    >
                      Editar
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      destructive
                      icon={<Icon name="delete" size={16} />}
                      onSelect={() => onDelete(team)}
                    >
                      Eliminar
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
