import React from "react";
import {
  Alert,
  Avatar,
  Button,
  EmptyState,
  FilterButton,
  Icon,
  Menu,
  MenuItem,
  Meter,
  MenuSeparator,
  PaginationBar,
  SearchField,
  SeniorityCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type {
  Seniority,
  SeniorityOption,
} from "@features/people/services/personService";
import type { Allocation } from "../adapters/AllocationAdapter";
import { DedicationCell } from "@shared/components/DedicationCell";

const MODALITY_LABELS: Record<string, string> = {
  Remote: "Remoto",
  Hybrid: "Híbrido",
  OnSite: "Presencial",
};

// Mismo tratamiento secundario que el correo bajo el nombre en PeopleList.
const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

/**
 * Lectura del margen de la persona: lo que no dedica a esta célula, que es la
 * única que tiene. Exportada para probarla como unidad.
 */
export function availabilityReading(allocation: Allocation): {
  text: string;
  className: string;
} {
  const free = allocation.personAvailablePercentage;
  if (free > 0) {
    return {
      text: `${free}% libre`,
      className: "font-semibold text-success-default",
    };
  }
  return { text: "0% libre", className: "text-neutral-subtle" };
}

export interface AllocationsListProps {
  allocations: Allocation[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (allocation: Allocation) => void;
  onRemove: (allocation: Allocation) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  seniorityOptions: SeniorityOption[];
  selectedSeniorities: Seniority[];
  onSenioritiesChange: (values: Seniority[]) => void;
}

export const AllocationsList: React.FC<AllocationsListProps> = ({
  allocations,
  loading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onRemove,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  seniorityOptions,
  selectedSeniorities,
  onSenioritiesChange,
}) => {
  if (loading) {
    return (
      <p className="text-body-sm text-neutral-subtle">Cargando asignaciones…</p>
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudieron cargar las asignaciones"
        action={
          <Button variant="secondary" size="small" onClick={onRetry}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const hasActiveFilter =
    search.trim().length > 0 || selectedSeniorities.length > 0;

  if (allocations.length === 0 && !hasActiveFilter) {
    return (
      <EmptyState
        icon={<Icon name="team" size={32} />}
        title="Todavía no hay personas asignadas"
        description="Asigna la primera persona a esta célula."
        action={
          <Button variant="primary" onClick={onCreate}>
            Asignar persona
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <SearchField
          placeholder="Buscar por nombre o cargo"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <FilterButton
          label="Seniority"
          options={seniorityOptions.map((s) => ({
            value: String(s.value),
            label: s.label,
          }))}
          selected={selectedSeniorities.map(String)}
          onChange={(values) => onSenioritiesChange(values.map(Number))}
        />
      </div>
      {allocations.length === 0 ? (
        <EmptyState
          icon={<Icon name="search" size={32} />}
          title="Sin resultados"
          description="No encontramos personas de la célula con esa búsqueda o esos filtros. Prueba ajustarlos."
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-neutral-default">
          <Table flush>
            <TableHeader>
              <TableRow>
                <TableHead>Persona</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Dedicación en esta célula</TableHead>
                <TableHead>BAU / Transformación</TableHead>
                <TableHead>Disponible de la persona</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => {
                const availability = availabilityReading(allocation);
                return (
                  <TableRow key={allocation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          size="large"
                          label={allocation.personName}
                          colorId={allocation.personId}
                        >
                          {getPersonInitials(allocation.personName)}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium leading-5 text-neutral-default">
                            {allocation.personName}
                          </span>
                          <span className={SECONDARY_TEXT}>
                            {allocation.personPosition}
                            {allocation.personPosition && " · "}
                            {MODALITY_LABELS[allocation.personModality] ??
                              allocation.personModality}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SeniorityCard
                        level={allocation.personSeniorityLabel}
                        density="compact"
                      />
                    </TableCell>
                    <TableCell>
                      <Meter
                        className="max-w-36"
                        value={allocation.dedicationPercentage}
                        warningFrom={100}
                        label="Dedicación en esta célula"
                      />
                    </TableCell>
                    <TableCell>
                      <DedicationCell
                        bauPercentage={allocation.bauPercentage}
                        transformationPercentage={
                          allocation.transformationPercentage
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-body-sm tabular-nums ${availability.className}`}
                      >
                        {availability.text}
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
                            onSelect={() => onEdit(allocation)}
                          >
                            Editar
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem
                            destructive
                            icon={<Icon name="delete" size={16} />}
                            onSelect={() => onRemove(allocation)}
                          >
                            Quitar
                          </MenuItem>
                        </Menu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationBar
            page={page}
            pageCount={totalPages}
            onPageChange={onPageChange}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageSizeChange={onPageSizeChange}
            className="border-t border-neutral-default bg-neutral-subtlest px-4 py-3"
          />
        </div>
      )}
    </div>
  );
};
