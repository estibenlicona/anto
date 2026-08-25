import React from "react";
import { SegmentedControl } from "@tuya-ui/components";
import type { SkillGroup } from "@features/skills/services/skillsService";
import type { SpanMatrixView, SpanSort } from "../adapters/SpanMatrixAdapter";

interface SpanControlsProps {
  span: SpanMatrixView;
  groups: SkillGroup[];
  sort: SpanSort;
  onGroupsChange: (groups: SkillGroup[]) => void;
  onSortChange: (sort: SpanSort) => void;
}

/** El valor "todas" no es un grupo: es la ausencia de acotado. */
const ALL = "all";

export const SpanControls: React.FC<SpanControlsProps> = ({
  span,
  groups,
  sort,
  onGroupsChange,
  onSortChange,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <SegmentedControl
        label="Habilidades visibles"
        value={groups.length === 0 ? ALL : groups[0]}
        options={[
          { value: ALL, label: "Todas" },
          { value: "technical", label: "Técnicas" },
          { value: "human", label: "Humanas" },
        ]}
        onValueChange={(value) =>
          onGroupsChange(value === ALL ? [] : [value as SkillGroup])
        }
      />
      <SegmentedControl
        label="Orden"
        value={sort}
        options={[
          { value: "gaps", label: "Por brechas" },
          { value: "name", label: "Por nombre" },
        ]}
        onValueChange={(value) => onSortChange(value as SpanSort)}
      />
    </div>

    {/*
      Dicho junto al control que lo provoca: un total parcial leído como el
      total del span es exactamente el error que acotar habilita.
    */}
    {span.narrowed && (
      <p className="text-body-sm text-neutral-subtle">
        Los totales cuentan sólo las {span.skills.length} habilidades a la
        vista, de {span.totalSkills}.
      </p>
    )}
  </div>
);
