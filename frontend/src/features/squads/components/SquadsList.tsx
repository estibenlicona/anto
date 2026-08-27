import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  CapacityBar,
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
// El mapa de talla → color se importa, no se copia: dos mapas que empiezan
// iguales divergen en silencio la primera vez que se toca uno.
import {
  evaluationPath,
  tallaColor,
} from "@features/initiatives/adapters/InitiativeAdapter";
import {
  CRITICALITY_LABELS,
  CRITICALITY_ORDER,
  type Squad,
} from "../adapters/SquadAdapter";
import type { Criticality } from "../services/squadService";
import { MIX_COLORS } from "./mixColors";

// Roles semánticos porque la gravedad del nivel es lo que el color dice, y la
// card de distribución pinta cada nivel con la misma clase (ver
// SquadsStatsCards).
//
// Sin punto, en cambio: la criticidad de una célula es una clasificación fija
// —se decide una vez y ahí queda—, no una condición que esté pasando y pueda
// dejar de pasar. El punto marca lo segundo; sobre lo primero no dice nada y
// compite con la etiqueta, que ya nombra el nivel.
const criticalityVariant: Record<
  Criticality,
  "danger" | "warning" | "info" | "neutral"
> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

const CRITICALITY_OPTIONS = CRITICALITY_ORDER.map((value) => ({
  value,
  label: CRITICALITY_LABELS[value],
}));

// Mismo tratamiento secundario que el correo bajo el nombre en PeopleList:
// el tamaño de `text-label` sin su semibold ni su tracking de rúbrica.
const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

export interface SquadsListProps {
  squads: Squad[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (squad: Squad) => void;
  onDelete: (squad: Squad) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCriticalities: Criticality[];
  onCriticalitiesChange: (values: Criticality[]) => void;
}

export const SquadsList: React.FC<SquadsListProps> = ({
  squads,
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
  selectedCriticalities,
  onCriticalitiesChange,
}) => {
  const hasActiveFilter =
    search.trim().length > 0 || selectedCriticalities.length > 0;

  // Sin ninguna célula y sin filtro puesto, el estado vacío se queda con la
  // pantalla: una barra de búsqueda y un filtro sobre la nada no ofrecen nada
  // que hacer. En cualquier otro caso los controles se quedan montados — ver
  // la nota sobre la carga, más abajo.
  if (!loading && !error && squads.length === 0 && !hasActiveFilter) {
    return (
      <EmptyState
        icon={<Icon name="cell" size={32} />}
        title="Todavía no hay células"
        description="Crea la primera célula para empezar a asignarle iniciativas y capacidades."
        action={
          <Button variant="primary" onClick={onCreate}>
            Nueva célula
          </Button>
        }
      />
    );
  }

  // La barra y la paginación son slots de Table: una sola card envuelve barra,
  // cabeceras, filas y pie. La carga, el error y el "sin resultados" van como
  // fila de ancho completo bajo las cabeceras, así la barra no se mueve.
  // Antes eran returns tempranos y se llevaban puesta la barra de arriba:
  // cada vez que cambiaba un filtro, el panel del filtro desaparecía con su
  // botón —había que reabrirlo por cada criterio— y la búsqueda perdía el
  // foco a media palabra. Los controles no son resultados: no se van
  // mientras los resultados llegan. La paginación sí: sin filas no hay nada
  // que paginar.
  const hasRows = !loading && !error && squads.length > 0;

  return (
    <Table
      toolbar={
        <>
          <SearchField
            placeholder="Buscar por nombre o equipo"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
          <FilterButton
            label="Criticidad"
            options={CRITICALITY_OPTIONS}
            selected={selectedCriticalities}
            onChange={(values) =>
              onCriticalitiesChange(values as Criticality[])
            }
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
          <TableHead>Célula</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead>Criticidad</TableHead>
          <TableHead>Personas</TableHead>
          {/* Singular: la columna muestra una iniciativa o ninguna, y
                    el rótulo es lo que fija la expectativa antes de leer la
                    celda. */}
          <TableHead>Iniciativa</TableHead>
          <TableHead>Capacidad</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableStatusRow colSpan={7}>
            <p className="text-body-sm text-neutral-subtle">
              Cargando células…
            </p>
          </TableStatusRow>
        ) : error ? (
          <TableStatusRow colSpan={7}>
            <Alert
              variant="danger"
              title="No se pudieron cargar las células"
              action={
                <Button variant="secondary" size="small" onClick={onRetry}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          </TableStatusRow>
        ) : squads.length === 0 ? (
          <TableStatusRow colSpan={7}>
            <EmptyState
              icon={<Icon name="search" size={32} />}
              title="Sin resultados"
              description="No encontramos células con esa búsqueda o esos filtros. Prueba ajustarlos."
            />
          </TableStatusRow>
        ) : (
          squads.map((squad) => {
            // `members` trae como mucho 3; el excedente sale de memberCount,
            // no de cuántos avatares hay, así que el "+N" se arma acá y el
            // grupo se deja sin colapsar (max por encima de sus hijos).
            const extra = squad.memberCount - squad.members.length;
            return (
              <TableRow key={squad.id}>
                <TableCell>
                  <div className="flex max-w-xs flex-col">
                    {/* Enlace neutro, como el nombre en PeopleList: con un
                            enlace por fila, el rojo de marca teñiría la columna
                            entera. `asChild` cede la etiqueta al Link del router. */}
                    <Link
                      asChild
                      tone="neutral"
                      className="font-medium leading-5"
                    >
                      <RouterLink to={`/app/lead/celulas/${squad.id}`}>
                        {squad.name}
                      </RouterLink>
                    </Link>
                    {squad.description && (
                      <span
                        className={`truncate ${SECONDARY_TEXT}`}
                        title={squad.description}
                      >
                        {squad.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{squad.team}</TableCell>
                <TableCell>
                  <Badge
                    dot={false}
                    variant={criticalityVariant[squad.criticality]}
                  >
                    {squad.criticalityLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  {squad.memberCount === 0 ? (
                    <span className="text-body-sm text-neutral-subtle">
                      Sin personas
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AvatarGroup max={squad.members.length + 1}>
                        {squad.members.map((member) => (
                          <Avatar
                            key={member.id}
                            size="small"
                            label={member.name}
                            colorId={member.id}
                          >
                            {getPersonInitials(member.name)}
                          </Avatar>
                        ))}
                        {extra > 0 && (
                          <Avatar size="small" label={`${extra} más`}>
                            +{extra}
                          </Avatar>
                        )}
                      </AvatarGroup>
                      <span className="text-body-sm tabular-nums text-neutral-subtle">
                        {squad.memberCount}{" "}
                        {squad.memberCount === 1 ? "persona" : "personas"}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {/* Una célula sostiene un solo trabajo a la vez: la
                          columna muestra su iniciativa activa, no las que
                          todavía se están dimensionando. Sin activa da igual
                          que tenga tres en evaluación: acá no está ejecutando
                          nada. */}
                  {/* Talla y nombre en una línea: la talla es una etiqueta
                          corta y de ancho parejo, así que hace de columna
                          propia y los nombres quedan alineados entre filas.
                          Apilarlos daba dos alturas por celda sin ganar nada. */}
                  <div className="flex max-w-64 items-center gap-2">
                    {squad.activeInitiative === null ? (
                      <>
                        {/* El guion ocupa el lugar de la talla para que el
                                texto siga alineado con los nombres de arriba;
                                lo que se lee es "Sin iniciativa". */}
                        <Tag aria-hidden="true">—</Tag>
                        <span className={`italic ${SECONDARY_TEXT}`}>
                          Sin iniciativa
                        </span>
                      </>
                    ) : (
                      <>
                        <Tag color={tallaColor(squad.activeInitiative.talla)}>
                          {squad.activeInitiative.talla}
                        </Tag>
                        {/* Enlace neutro, como el nombre de la célula: con
                                uno por fila, el rojo teñiría la columna entera. */}
                        <Link asChild tone="neutral" className="truncate">
                          <RouterLink
                            to={evaluationPath(squad.activeInitiative.id)}
                            title={squad.activeInitiative.name}
                            className="truncate"
                          >
                            {squad.activeInitiative.name}
                          </RouterLink>
                        </Link>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {/* Sin personas, sin partes: CapacityBar muestra su variante
                          vacía. Los textos y el umbral son los del sistema.
                          Tramos separados: la card de capacidad del resumen
                          los dibuja así y la columna debe leerse igual. */}
                  <CapacityBar
                    className="max-w-64"
                    separated
                    allocated={squad.allocatedFte}
                    available={squad.peopleAvailableFte}
                    unit="FTE"
                    parts={
                      squad.memberCount === 0
                        ? []
                        : [
                            {
                              label: "BAU",
                              value: squad.bauFte,
                              color: MIX_COLORS.bau,
                            },
                            {
                              label: "Transf.",
                              value: squad.transformationFte,
                              color: MIX_COLORS.transformation,
                            },
                          ]
                    }
                  />
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
                        onSelect={() => onEdit(squad)}
                      >
                        Editar
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        destructive
                        icon={<Icon name="delete" size={16} />}
                        onSelect={() => onDelete(squad)}
                      >
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
