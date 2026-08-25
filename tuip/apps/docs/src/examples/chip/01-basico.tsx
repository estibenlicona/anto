import { useState } from "react";
import { Chip } from "@tuya-ui/components";

export const meta = {
  title: "Filtros activos",
  description: "Cada Chip notifica su remoción; el consumidor decide si deja de renderizarlo.",
  caption: "onRemove por chip, sin estado propio",
};

const INITIAL_FILTERS = ["Célula: Backend Platform", "Estado: 2"];

export default function Example() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  return (
    <div className="flex flex-wrap gap-2">
      {filters.length === 0 && <span className="text-body-sm text-neutral-subtle">Sin filtros activos</span>}
      {filters.map((filter) => (
        <Chip key={filter} onRemove={() => setFilters(filters.filter((f) => f !== filter))}>
          {filter}
        </Chip>
      ))}
    </div>
  );
}
