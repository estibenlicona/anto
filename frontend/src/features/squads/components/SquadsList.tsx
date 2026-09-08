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
  Tooltip,
  type IconName,
} from "@tuya-ui/components";
import { TableStatusRow } from "@shared/components/TableStatusRow";
import { modulePath } from "@shared/services/modulePath";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import { useTeams } from "@features/teams/hooks/useTeams";
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
  type SquadAssignmentStatus,
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

// Todos los equipos del catálogo, no sólo los que tienen células — para
// poder elegir uno vacío y ver "Sin resultados" (spec de squads).
const ALL_TEAMS_PAGE_SIZE = 100;

// Mismo tratamiento secundario que el correo bajo el nombre en PeopleList:
// el tamaño de `text-label` sin su semibold ni su tracking de rúbrica.
const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

// La misma señal, con el mismo tratamiento, que el balance de carga de
// Dedicación (BalanceSignalIcon): **sólo el icono** — forma distinta además
// de rol de color, nunca sólo el color — y el veredicto completo en el
// tooltip y en el nombre accesible. La demanda por encima de lo asignado es
// sobrecarga (tendencia arriba, peligro); lo asignado por encima de la
// demanda es holgura que conviene mirar (tendencia abajo, advertencia —
// decisión de carga, no contexto); en rango es la meta (check, éxito); sin
// demanda no hay nada que evaluar (vacío, neutro).
const ASSIGNMENT_PRESENTATION: Record<
  SquadAssignmentStatus["kind"],
  { tone: string; icon: IconName }
> = {
  sub: { tone: "text-danger-default", icon: "trend-up" },
  "en-rango": { tone: "text-success-default", icon: "check" },
  sobre: { tone: "text-warning-default", icon: "trend-down" },
  "sin-demanda": { tone: "text-neutral-subtlest", icon: "status-empty" },
};

const fte1 = (value: number) => value.toFixed(1);

/** El veredicto entero en una frase: es lo que dicen el tooltip y el lector. */
function assignmentTooltip(
  status: SquadAssignmentStatus,
  allocatedFte: number
): string {
  if (status.kind === "sin-demanda") {
    return "Sin demanda: la célula no tiene iniciativas activas.";
  }
  const detalle = `Demanda ${fte1(status.demandMin)}–${fte1(status.demandMax)} FTE · Asignado ${fte1(allocatedFte)} FTE`;
  if (status.kind === "sub")
    return `Sub-asignada: faltan ${fte1(status.deltaFte)} FTE. ${detalle}`;
  if (status.kind === "sobre")
    return `Sobre-asignada: sobran ${fte1(status.deltaFte)} FTE. ${detalle}`;
  return `En rango. ${detalle}`;
}

/**
 * El estado de asignación reducido a un icono, como la señal del balance de
 * carga en el listado de colaboradores: la columna es de un vistazo, y la
 * explicación —estado, desvío y demanda contra lo asignado— vive en el
 * tooltip y en el nombre accesible. Una señal sin acceso a su explicación
 * sería una sentencia; por eso el span recibe foco y el tooltip también se
 * abre con teclado.
 */
const AssignmentStatusCell: React.FC<{
  status: SquadAssignmentStatus;
  allocatedFte: number;
}> = ({ status, allocatedFte }) => {
  const { tone, icon } = ASSIGNMENT_PRESENTATION[status.kind];
  const text = assignmentTooltip(status, allocatedFte);
  return (
    <Tooltip content={text}>
      <span
        role="img"
        aria-label={text}
        tabIndex={0}
        className={`inline-flex size-5 items-center justify-center rounded-control outline-none focus-visible:ring-focus focus-visible:ring-neutral-focus-ring ${tone}`}
      >
        <Icon name={icon} size={20} />
      </span>
    </Tooltip>
  );
};

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
  selectedTeamIds: string[];
  onTeamIdsChange: (values: string[]) => void;
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
  selectedTeamIds,
  onTeamIdsChange,
}) => {
  const { teams } = useTeams(ALL_TEAMS_PAGE_SIZE);
  const teamOptions = teams.map((t) => ({ value: t.id, label: t.name }));
  const hasActiveFilter =
    search.trim().length > 0 ||
    selectedCriticalities.length > 0 ||
    selectedTeamIds.length > 0;

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
            className="w-96"
          />
          <FilterButton
            label="Criticidad"
            options={CRITICALITY_OPTIONS}
            selected={selectedCriticalities}
            onChange={(values) =>
              onCriticalitiesChange(values as Criticality[])
            }
          />
          <FilterButton
            label="Equipo"
            options={teamOptions}
            selected={selectedTeamIds}
            onChange={(values) => onTeamIdsChange(values as string[])}
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
          {/* Plural: la columna muestra todas las activas de la célula. */}
          <TableHead>Iniciativas</TableHead>
          <TableHead>Capacidad</TableHead>
          {/* Contigua a Capacidad porque se lee contra ella: la demanda de
                    las activas frente al FTE asignado. */}
          <TableHead>
            <div className="flex justify-center">Asignación</div>
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableStatusRow colSpan={8}>
            <p className="text-body-sm text-neutral-subtle">
              Cargando células…
            </p>
          </TableStatusRow>
        ) : error ? (
          <TableStatusRow colSpan={8}>
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
          <TableStatusRow colSpan={8}>
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
                      <RouterLink to={modulePath(`celulas/${squad.id}`)}>
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
                <TableCell>{squad.teamName}</TableCell>
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
                  {/* La columna muestra las iniciativas activas —todas: una
                          célula sostiene varias a la vez—, no las que todavía
                          se están dimensionando. Una línea por activa, talla
                          primero: la etiqueta es corta y de ancho parejo, así
                          que hace de columna propia y los nombres quedan
                          alineados entre filas y entre líneas. */}
                  {squad.activeInitiatives.length === 0 ? (
                    <div className="flex max-w-64 items-center gap-2">
                      {/* El guion ocupa el lugar de la talla para que el
                              texto siga alineado con los nombres de arriba;
                              lo que se lee es "Sin iniciativa". */}
                      <Tag aria-hidden="true">—</Tag>
                      <span className={`italic ${SECONDARY_TEXT}`}>
                        Sin iniciativa
                      </span>
                    </div>
                  ) : (
                    <div className="flex max-w-64 flex-col gap-1">
                      {squad.activeInitiatives.map((initiative) => (
                        <div
                          key={initiative.id}
                          className="flex items-center gap-2"
                        >
                          <Tag color={tallaColor(initiative.talla)}>
                            {initiative.talla}
                          </Tag>
                          {/* Enlace neutro, como el nombre de la célula: con
                                  varios por fila, el rojo teñiría la columna
                                  entera. */}
                          <Link asChild tone="neutral" className="truncate">
                            <RouterLink
                              to={evaluationPath(initiative.id)}
                              title={initiative.name}
                              className="truncate"
                            >
                              {initiative.name}
                            </RouterLink>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {/* Centrado con flex y no con `text-center`: `cn` concatena
                      sin resolver conflictos, así que competiría con el
                      `text-left` que trae `align` por defecto. */}
                  <div className="flex justify-center">
                    <AssignmentStatusCell
                      status={squad.assignmentStatus}
                      allocatedFte={squad.allocatedFte}
                    />
                  </div>
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
