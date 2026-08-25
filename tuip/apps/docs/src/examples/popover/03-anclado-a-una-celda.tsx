import { useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@tuya-ui/components";

export const meta = {
  title: "Anclado a una celda",
  description:
    "Con muchas celdas no se monta un Popover por celda: se mantiene uno solo, controlado por la pantalla, y se mueve su ancla a la que el usuario acaba de activar. `PopoverAnchor` no agrega un nodo — se apoya sobre el elemento que ya está ahí.",
  caption: "Un único Popover para las nueve celdas de la cuadrícula",
};

const CELLS = ["Paula", "Bruno", "Camila"].flatMap((person) =>
  ["React", "Testing", "SQL"].map((skill) => ({ id: `${person}·${skill}`, person, skill })),
);

export default function Example() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = CELLS.find((cell) => cell.id === activeId) ?? null;

  return (
    <Popover open={active !== null} onOpenChange={(open) => !open && setActiveId(null)}>
      <div className="grid w-fit grid-cols-3 gap-hug">
        {CELLS.map((cell) => {
          const button = (
            <button
              key={cell.id}
              type="button"
              onClick={() => setActiveId(cell.id)}
              aria-label={`${cell.person}, ${cell.skill}`}
              className="size-7 rounded-control bg-accent-blue-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-bold"
            />
          );
          // Sólo la celda activa lleva el ancla: es la que el contenido debe seguir.
          return cell.id === activeId ? (
            <PopoverAnchor key={cell.id}>{button}</PopoverAnchor>
          ) : (
            button
          );
        })}
      </div>

      <PopoverContent aria-label="Detalle de la celda">
        {active ? (
          <div className="flex flex-col gap-1">
            <p className="text-body-strong text-neutral-default">{active.person}</p>
            <p className="text-label text-neutral-subtle">{active.skill}</p>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
