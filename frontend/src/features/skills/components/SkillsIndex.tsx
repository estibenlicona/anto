import React from "react";
import { Card, Icon } from "@tuya-ui/components";
import {
  incompleteLabel,
  type SkillsCatalogView,
  type SkillView,
} from "../adapters/SkillsAdapter";

interface SkillsIndexProps {
  catalog: SkillsCatalogView;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SkillRow: React.FC<{
  skill: SkillView;
  selected: boolean;
  onSelect: () => void;
}> = ({ skill, selected, onSelect }) => {
  const missing = incompleteLabel(skill);

  return (
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
          {skill.name}
        </span>
        {!skill.active && (
          <span className="text-label uppercase text-neutral-subtlest">
            Inactiva
          </span>
        )}
      </span>
      {/*
        Un solo renglón de estado por habilidad: o cuántos criterios tiene, o
        qué le falta. Mostrar los dos obligaría a leer para saber cuál importa,
        y lo que importa es siempre lo que falta.
      */}
      {missing ? (
        <span className="flex items-center gap-1 text-body-sm text-warning-default">
          <Icon name="status-warning" size={16} />
          {missing}
        </span>
      ) : (
        <span className="text-body-sm text-neutral-subtle">
          {skill.totalCriteria} criterios
        </span>
      )}
    </button>
  );
};

export const SkillsIndex: React.FC<SkillsIndexProps> = ({
  catalog,
  selectedId,
  onSelect,
}) => (
  <Card className="overflow-hidden">
    <div className="flex items-baseline justify-between border-b-default border-neutral-default px-4 py-3">
      <h2 className="text-body font-semibold text-neutral-default">Catálogo</h2>
      <span className="text-body-sm text-neutral-subtle">
        {catalog.total} {catalog.total === 1 ? "habilidad" : "habilidades"}
      </span>
    </div>

    {catalog.groups
      .filter((group) => group.skills.length > 0)
      .map((group) => (
        <div key={group.group}>
          <p className="bg-neutral-subtlest px-4 py-1.5 text-label uppercase text-neutral-subtle">
            {group.label} · {group.skills.length}
          </p>
          {group.skills.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              selected={skill.id === selectedId}
              onSelect={() => onSelect(skill.id)}
            />
          ))}
        </div>
      ))}
  </Card>
);
