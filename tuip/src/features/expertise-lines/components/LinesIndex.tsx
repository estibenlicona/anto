import React from "react";
import { Card, Icon, SearchField } from "@tuya-ui/components";
import type {
  LineListItemView,
  LinesIndexView,
} from "../adapters/ExpertiseLinesAdapter";

interface LinesIndexProps {
  index: LinesIndexView;
  search: string;
  selectedId: string | null;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
}

const LineRow: React.FC<{
  line: LineListItemView;
  selected: boolean;
  onSelect: () => void;
}> = ({ line, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-current={selected ? "true" : undefined}
    className={[
      "flex w-full flex-col items-start gap-0.5 border-l-2 px-4 py-2.5 text-left",
      "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
      selected
        ? "border-neutral-bold bg-neutral-subtlest"
        : "border-transparent hover:bg-neutral-subtlest",
    ].join(" ")}
  >
    <span className="flex w-full items-center gap-2">
      <span className="text-body-sm font-medium text-neutral-default">
        {line.name}
      </span>
      <span className="text-label uppercase text-neutral-subtlest">
        {line.code}
      </span>
    </span>
    {/*
      Un solo renglón de estado, como el índice de Habilidades: o lo que falta,
      o lo que la línea tiene. Lo que falta gana, porque es lo accionable.
    */}
    {line.incomplete ? (
      <span className="flex items-center gap-1 text-body-sm text-warning-default">
        <Icon name="status-warning" size={16} />
        Sin lead
      </span>
    ) : (
      <span className="text-body-sm text-neutral-subtle">
        {line.peopleCount} {line.peopleCount === 1 ? "persona" : "personas"} ·{" "}
        {line.availableFteLabel} FTE
      </span>
    )}
  </button>
);

export const LinesIndex: React.FC<LinesIndexProps> = ({
  index,
  search,
  selectedId,
  onSearch,
  onSelect,
}) => {
  const nothingMatches =
    index.active.length === 0 && index.archived.length === 0;

  return (
    <Card className="overflow-hidden">
      <div className="border-b-default border-neutral-default px-4 py-3">
        <SearchField
          value={search}
          placeholder="Buscar por nombre o código"
          aria-label="Buscar líneas"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {nothingMatches && (
        <p className="px-4 py-6 text-body-sm text-neutral-subtle">
          Ninguna línea coincide con “{search}”.
        </p>
      )}

      {index.active.length > 0 && (
        <div>
          <p className="bg-neutral-subtlest px-4 py-1.5 text-label uppercase text-neutral-subtle">
            Activas · {index.active.length}
          </p>
          {index.active.map((line) => (
            <LineRow
              key={line.id}
              line={line}
              selected={line.id === selectedId}
              onSelect={() => onSelect(line.id)}
            />
          ))}
        </div>
      )}

      {/*
        Las archivadas se siguen viendo, separadas: son la respuesta a "de dónde
        venía esta persona", y esconderlas la borra.
      */}
      {index.archived.length > 0 && (
        <div>
          <p className="bg-neutral-subtlest px-4 py-1.5 text-label uppercase text-neutral-subtle">
            Archivadas · {index.archived.length}
          </p>
          {index.archived.map((line) => (
            <LineRow
              key={line.id}
              line={line}
              selected={line.id === selectedId}
              onSelect={() => onSelect(line.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
