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
  Menu,
  Meter,
  MenuItem,
  MenuSeparator,
  PaginationBar,
  SearchField,
  SeniorityCard,
  Table,
  Tag,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import { getPersonInitials, type Person } from "../adapters/PersonAdapter";
import type { Seniority, SeniorityOption } from "../services/personService";

export interface PeopleListProps {
  people: Person[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
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
  stackOptions: string[];
  selectedStacks: string[];
  onStacksChange: (values: string[]) => void;
}

/** Cuántos stacks se muestran por fila antes de resumir el resto en "+N". */
const VISIBLE_STACKS = 3;

export const PeopleList: React.FC<PeopleListProps> = ({
  people,
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
  seniorityOptions,
  selectedSeniorities,
  onSenioritiesChange,
  stackOptions,
  selectedStacks,
  onStacksChange,
}) => {
  if (loading) {
    return (
      <p className="text-body-sm text-neutral-subtle">Cargando personas…</p>
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudieron cargar las personas"
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
    search.trim().length > 0 ||
    selectedSeniorities.length > 0 ||
    selectedStacks.length > 0;

  if (people.length === 0 && !hasActiveFilter) {
    return (
      <EmptyState
        icon={<Icon name="user" size={32} />}
        title="Todavía no hay personas"
        description="Registra la primera persona para empezar a construir la capacidad del chapter."
        action={
          <Button variant="primary" onClick={onCreate}>
            Nueva persona
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
        <FilterButton
          label="Stack"
          options={stackOptions.map((name) => ({ value: name, label: name }))}
          selected={selectedStacks}
          onChange={onStacksChange}
        />
      </div>
      {people.length === 0 ? (
        <EmptyState
          icon={<Icon name="search" size={32} />}
          title="Sin resultados"
          description="No encontramos personas con esa búsqueda o esos filtros. Prueba ajustarlos."
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-neutral-default">
          <Table flush>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Stacks</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>FTE</TableHead>
                <TableHead>Utilización</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* El avatar queda decorativo: ya lleva el nombre en su
                          `label`, y volverlo un segundo enlace al mismo destino
                          duplicaría la parada de teclado por fila. */}
                      <Avatar
                        size="large"
                        label={person.name}
                        colorId={person.id}
                      >
                        {getPersonInitials(person.name)}
                      </Avatar>
                      <div className="flex flex-col">
                        {/* El tono neutro, y no el de marca: con un enlace por
                            fila, el rojo deja de señalar y tiñe la columna
                            entera. La contrapartida es que en reposo el nombre
                            no se distingue del texto plano — se revela en hover
                            y en foco. Ver el change adopt-neutral-name-link-in-people.

                            `asChild` cede la etiqueta al Link del router: sale
                            un solo <a>, con el estilo del sistema y la
                            navegación del router, sin recargar la aplicación.

                            leading-5 en vez del 22px que trae text-body-sm:
                            acerca el correo al nombre para que se lean como
                            un bloque y no como dos líneas sueltas. */}
                        <Link asChild tone="neutral" className="leading-5">
                          <RouterLink to={`/app/lead/personas/${person.id}`}>
                            {person.name}
                          </RouterLink>
                        </Link>
                        {/* `text-label` es el único paso por debajo de
                            `body-sm` en la escala, pero viene armado para
                            rúbricas en mayúscula (semibold + tracking 0.09em).
                            Acá se toma sólo su tamaño y se neutralizan las
                            otras dos: un correo con letter-spacing se lee
                            peor, y en minúscula el semibold competiría con
                            el nombre. */}
                        <span className="text-label font-normal tracking-normal text-neutral-subtle">
                          {person.userPrincipalName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{person.position}</TableCell>
                  <TableCell>
                    {/* Tag y no Badge: el stack es una categoría, no un
                        estado. Todos en gris: colorearlos por tecnología
                        llenaría la tabla de ruido sin decir nada que el
                        nombre no diga. El principal va primero (lo ordena el
                        adapter); el resto se resume en "+N". */}
                    {person.stacks.length === 0 ? (
                      <span className="text-neutral-subtle">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1">
                        {person.stacks.slice(0, VISIBLE_STACKS).map((s) => (
                          <Tag key={s.name}>{s.name}</Tag>
                        ))}
                        {person.stacks.length > VISIBLE_STACKS && (
                          <span
                            className="text-body-sm text-neutral-subtle"
                            title={person.stacks
                              .slice(VISIBLE_STACKS)
                              .map((s) => s.name)
                              .join(", ")}
                          >
                            +{person.stacks.length - VISIBLE_STACKS}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Densidad compacta: es la que corresponde a una fila.
                        El nivel llega por nombre y la card resuelve el resto —
                        un valor inesperado cae en su estado vacío, que ocupa
                        lo mismo y no descuadra la columna. */}
                    <SeniorityCard
                      level={person.seniorityLabel}
                      density="compact"
                    />
                  </TableCell>
                  <TableCell>{person.modality}</TableCell>
                  <TableCell>
                    {/* Lectura, no edición: el FTE se cambia en el drawer.
                        Por eso un número plano y no una caja que prometa un
                        input, como la de la referencia de diseño (que allá
                        sí edita). */}
                    <span className="tabular-nums text-neutral-default">
                      {person.availableFte}
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Cantidad, no estado: azul de la escala de acento sobre
                        la pista gris, sin umbrales — la cifra es la señal. Es
                        el mismo azul que viste la escala ordinal de la fila. */}
                    <Meter
                      value={person.utilization}
                      tone="blue"
                      label="Utilización"
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
                          onSelect={() => onEdit(person)}
                        >
                          Editar
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem
                          destructive
                          icon={<Icon name="delete" size={16} />}
                          onSelect={() => onDelete(person)}
                        >
                          Eliminar
                        </MenuItem>
                      </Menu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
