import { useState } from "react";
import { Chip } from "@tuya-ui/components";

export const meta = {
  title: "Filtro a la vista, con contador",
  description:
    "El modo seleccionable: cada Chip es un interruptor con `aria-pressed` y un contador. Encendido va en neutro intenso, nunca en marca: un filtro activo no es la acción principal. Para muchas opciones, FilterButton.",
  caption: "Chip selectable con count; \"Todas\" apaga al resto",
};

const CELLS = [
  { id: "all", label: "Todas", count: 11 },
  { id: "backend", label: "Backend Platform", count: 5 },
  { id: "fraude", label: "Fraude Tarjetas", count: 4 },
  { id: "canales", label: "Canales Digitales", count: 2 },
];

export default function Example() {
  const [selected, setSelected] = useState<string[]>(["all"]);
  const toggle = (id: string, on: boolean) => {
    if (id === "all") return setSelected(["all"]);
    const next = on ? [...selected.filter((s) => s !== "all"), id] : selected.filter((s) => s !== id);
    setSelected(next.length ? next : ["all"]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {CELLS.map((c) => (
        <Chip key={c.id} selectable selected={selected.includes(c.id)} onSelectedChange={(on) => toggle(c.id, on)} count={c.count}>
          {c.label}
        </Chip>
      ))}
    </div>
  );
}
