import React, { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  SearchField,
} from "@tuya-ui/components";
import type { RosterPersonView } from "../adapters/ExpertiseLinesAdapter";

interface AssignPeopleDrawerProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  lineName: string;
  /** Todo el padrón menos quien ya está en esta línea. */
  candidates: RosterPersonView[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (personIds: string[]) => void;
}

export const AssignPeopleDrawer: React.FC<AssignPeopleDrawerProps> = ({
  open,
  saving,
  error,
  lineName,
  candidates,
  onOpenChange,
  onSubmit,
}) => {
  /*
    La selección vive acá y no en la lista visible, y eso es lo que hace que
    filtrar no desmarque: es el defecto clásico de un selector múltiple con
    buscador —marcar a alguien, buscar a otra y encontrarse con que la primera
    se soltó— y el que nadie prueba. El filtro decide qué se dibuja; nada más.
  */
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );

  // Por nombre, con la misma mecánica que el índice de líneas de esta misma
  // pantalla: dos formas de buscar a diez centímetros es cómo se acumulan los
  // patrones.
  const term = search.trim().toLowerCase();
  const visible = term
    ? candidates.filter((c) => c.name.toLowerCase().includes(term))
    : candidates;

  const withoutLine = visible.filter((c) => c.lineName === null);
  const fromOtherLines = visible.filter((c) => c.lineName !== null);
  const nothingMatches = term !== "" && visible.length === 0;
  // De qué líneas saldría gente si se confirma: es lo que hay que avisar
  // antes, y se cuenta sobre todo el padrón y no sobre lo que se ve — quien
  // quedó elegido detrás de un filtro sale igual.
  const leaving = candidates.filter(
    (c) => c.lineName !== null && selected.includes(c.id)
  );

  const Row: React.FC<{ person: RosterPersonView }> = ({ person }) => (
    <label className="flex items-start gap-2 py-1.5">
      <Checkbox
        checked={selected.includes(person.id)}
        onChange={() => toggle(person.id)}
      />
      <span>
        <span className="block text-body-sm font-medium text-neutral-default">
          {person.name}
        </span>
        <span className="block text-body-sm text-neutral-subtle">
          {person.position} · {person.seniorityLabel}
          {person.lineName && ` · en ${person.lineName}`}
        </span>
      </span>
    </label>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader title={`Asignar personas a ${lineName}`} />
      <DrawerBody>
        <div className="space-y-4">
          {candidates.length === 0 && (
            <p className="text-body-sm text-neutral-subtle">
              No queda nadie por asignar: todas las personas registradas ya
              están en esta línea.
            </p>
          )}

          {candidates.length > 0 && (
            <SearchField
              value={search}
              placeholder="Buscar por nombre"
              aria-label="Buscar personas"
              onChange={(e) => setSearch(e.target.value)}
            />
          )}

          {nothingMatches && (
            <p className="text-body-sm text-neutral-subtle">
              Ninguna persona coincide con “{search}”.
            </p>
          )}

          {withoutLine.length > 0 && (
            <div>
              <p className="text-label uppercase text-neutral-subtle">
                Sin línea · {withoutLine.length}
              </p>
              {withoutLine.map((p) => (
                <Row key={p.id} person={p} />
              ))}
            </div>
          )}

          {/*
            Separadas de las de arriba: traer a alguien de otra línea la deja
            sin esa persona, y eso no es lo mismo que repartir a quien no tiene
            ninguna.
          */}
          {fromOtherLines.length > 0 && (
            <div>
              <p className="text-label uppercase text-neutral-subtle">
                En otra línea · {fromOtherLines.length}
              </p>
              {fromOtherLines.map((p) => (
                <Row key={p.id} person={p} />
              ))}
            </div>
          )}

          {leaving.length > 0 && (
            <Alert variant="warning">
              {leaving.length === 1
                ? `${leaving[0].name} saldrá de ${leaving[0].lineName}.`
                : `${leaving.length} personas saldrán de su línea actual.`}{" "}
              Su célula y su dedicación no cambian.
            </Alert>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="subtle" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          isLoading={saving}
          disabled={selected.length === 0}
          onClick={() => onSubmit(selected)}
        >
          Asignar {selected.length > 0 && `(${selected.length})`}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
