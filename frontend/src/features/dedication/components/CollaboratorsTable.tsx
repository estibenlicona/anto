import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  EmptyState,
  FilterButton,
  Icon,
  Link,
  PaginationBar,
  SearchField,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import { SECONDARY_TEXT } from "@features/people/components/detail/DetailPanel";
import {
  SHOWN_INITIATIVES,
  type CollaboratorRow,
  type MultitaskingCell,
} from "../adapters/DedicationAdapter";
import { CapacityFteBar } from "./CapacityFteBar";
import { DemandBar } from "./DemandBar";
import { BalanceSignalIcon } from "./BalanceSignalIcon";

export interface CollaboratorsTableProps {
  rows: CollaboratorRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  page: number;
  pageSize: number;
  /** Filas tras el filtro. */
  total: number;
  /** Toda la gente a cargo, para leer el conteo como estado del filtro. */
  chapterTotal: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  squadOptions: Array<{ value: string; label: string }>;
  selectedSquadIds: string[];
  onSquadIdsChange: (values: string[]) => void;
}

const COLUMNS = 6;
const SKELETON_ROWS = 5;

const Dash: React.FC = () => (
  <span aria-hidden="true" className="text-neutral-subtlest">
    —
  </span>
);

/**
 * Las iniciativas que sus historias tocaron en el sprint, no la activa de su
 * célula: dice en qué anduvo la persona. Se nombra la primera y el resto se
 * cuenta en un "+N" que lleva los nombres en su `title`; el ancho que eso
 * libera se lo llevan las barras de capacidad y demanda.
 */
const SprintInitiatives: React.FC<{ row: CollaboratorRow }> = ({ row }) => {
  if (row.initiatives.length === 0) {
    return (
      <span className={`italic ${SECONDARY_TEXT}`}>
        Sin iniciativas en el sprint
      </span>
    );
  }
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      {row.shownInitiatives.map((initiative) => (
        <Tag key={initiative.id} color="blue">
          <span className="max-w-40 truncate" title={initiative.name}>
            {initiative.name}
          </span>
        </Tag>
      ))}
      {row.extraInitiatives > 0 && (
        <Tag
          color="gray"
          title={row.initiatives
            .slice(SHOWN_INITIATIVES)
            .map((i) => i.name)
            .join(" · ")}
        >
          +{row.extraInitiatives}
        </Tag>
      )}
    </span>
  );
};

/**
 * El tono de cada tramo del medidor de foco, encendido. Escalan de a poco —de
 * informativo a advertencia a peligro— para que el escalón se lea por el color
 * y no sólo por cuántos tramos hay pintados. El primero es el mismo azul con
 * menos peso: es un escalón, no otra cosa.
 */
const FOCUS_TONES = [
  "bg-info-bold opacity-40",
  "bg-info-bold",
  "bg-warning-bold",
  "bg-danger-bold",
];

/**
 * **Foco**: cuánta atención tiene repartida la persona, en un medidor de cuatro
 * tramos, y debajo las dos cifras que lo sostienen.
 *
 * El medidor es para barrer la columna —una fila dispersa salta sin leer nada—
 * y las cifras para la fila en la que uno se detiene. Sin WIP reconstruido no
 * hay medidor: un medidor vacío se leería como foco pleno, que es lo contrario
 * de "no se sabe".
 */
const MultitaskingCellView: React.FC<{ cell: MultitaskingCell }> = ({
  cell,
}) => {
  const level = cell.level;
  return (
    <div className="flex w-40 flex-col gap-1">
      {level !== null && (
        <span aria-hidden="true" className="flex items-center gap-0.5">
          {FOCUS_TONES.map((tone, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-xs ${
                i < level ? tone : "bg-neutral-subtle"
              }`}
            />
          ))}
        </span>
      )}
      <span className="whitespace-nowrap text-body-sm tabular-nums text-neutral-default">
        {cell.label}
      </span>
    </div>
  );
};

const SkeletonRow: React.FC = () => (
  <TableRow className="hover:bg-transparent">
    <TableCell>
      <div className="flex items-center gap-2">
        <Skeleton className="size-10 rounded-pill" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-40" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="mx-auto size-5" />
    </TableCell>
  </TableRow>
);

/**
 * Una fila por colaborador. **El FTE sólo aparece como capacidad y la demanda
 * sólo en SP**: no hay columnas de FTE comprometido, de FTE asignado, de
 * porcentajes de dedicación ni de actividad —la actividad se lee en el
 * dashboard del colaborador—. La señal cierra como un solo icono, sin texto ni
 * enlace, con su explicación en el tooltip.
 */
export const CollaboratorsTable: React.FC<CollaboratorsTableProps> = ({
  rows,
  loading,
  error,
  onRetry,
  page,
  pageSize,
  total,
  chapterTotal,
  totalPages,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  squadOptions,
  selectedSquadIds,
  onSquadIdsChange,
}) => {
  const hasRows = !loading && !error && rows.length > 0;

  return (
    // Compacta: cada celda ya lleva dos renglones (barra y horas, SP y
    // tolerancia, medidor y cifras), y con el relleno cómodo las filas
    // medían más que las de Personas. Con el compacto miden lo mismo.
    <Table
      density="compact"
      toolbar={
        <>
          <SearchField
            placeholder="Buscar por nombre o cargo"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-96"
          />
          {/* El mismo filtro desplegable que Personas, Células y Ausencias:
              una toolbar que se lee igual en todos los listados vale más que
              ahorrarse un clic. No hay filtro por señal: los cuatro
              indicadores de arriba ya separan por señal. */}
          <FilterButton
            label="Célula"
            options={squadOptions}
            selected={selectedSquadIds}
            onChange={onSquadIdsChange}
          />
          <span className="ml-auto whitespace-nowrap text-body-sm tabular-nums text-neutral-subtle">
            {total} de {chapterTotal} personas
          </span>
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
          <TableHead>Colaborador</TableHead>
          <TableHead>Célula e iniciativas</TableHead>
          <TableHead>Capacidad</TableHead>
          <TableHead>Demanda vs habitual</TableHead>
          <TableHead>Foco</TableHead>
          {/* Centrado con flex y no con `text-center`: la celda ya declara su
              alineación, y entre dos utilidades de texto gana la que quedó
              después en la hoja, no la que se escribió después. */}
          <TableHead className="w-[72px]">
            <span className="flex justify-center">Balance</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <SkeletonRow key={i} />
          ))
        ) : error ? (
          <TableStatusRow colSpan={COLUMNS}>
            <Alert
              variant="danger"
              title="No se pudo cargar el balance de carga"
              action={
                <Button variant="secondary" size="small" onClick={onRetry}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          </TableStatusRow>
        ) : rows.length === 0 ? (
          <TableStatusRow colSpan={COLUMNS}>
            <EmptyState
              icon={<Icon name="search" size={32} />}
              title="Sin resultados"
              description="No encontramos colaboradores con esa búsqueda o esos filtros."
            />
          </TableStatusRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar size="large" label={row.name} colorId={row.id}>
                    {row.initials}
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <Link asChild tone="neutral" className="leading-5">
                      <RouterLink to={`/app/lead/dedicacion/${row.id}`}>
                        {row.name}
                      </RouterLink>
                    </Link>
                    <span className={SECONDARY_TEXT}>{row.position}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {row.squadName ? (
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-body-sm text-neutral-default">
                      {row.squadName}
                    </span>
                    <SprintInitiatives row={row} />
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className={`italic ${SECONDARY_TEXT}`}>
                      Sin célula
                    </span>
                    <SprintInitiatives row={row} />
                  </div>
                )}
              </TableCell>
              <TableCell>
                {row.hasSprint ? (
                  <CapacityFteBar
                    className="w-44"
                    capacity={row.capacity}
                    label={`Capacidad de ${row.name}`}
                  />
                ) : (
                  <Dash />
                )}
              </TableCell>
              <TableCell>
                {row.hasSprint ? (
                  <DemandBar
                    className="w-56"
                    committedPoints={row.committedPoints}
                    ownMedian={row.reference.ownMedian}
                    squadMedian={row.reference.squadMedian}
                    deviationRate={row.reference.ownDeviationRate}
                    signal={row.balance.signal}
                    tolerance
                    label={`Demanda de ${row.name}`}
                  />
                ) : (
                  <Dash />
                )}
              </TableCell>
              <TableCell>
                {row.multitaskingCell ? (
                  <MultitaskingCellView cell={row.multitaskingCell} />
                ) : (
                  <Dash />
                )}
              </TableCell>
              <TableCell>
                <span className="flex justify-center">
                  <BalanceSignalIcon balance={row.balance} />
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
