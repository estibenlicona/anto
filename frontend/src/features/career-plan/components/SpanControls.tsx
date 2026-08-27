import React from "react";
import { SegmentedControl } from "@tuya-ui/components";
import type { SkillGroup } from "@features/skills/services/skillsService";

interface SpanControlsProps {
  groups: SkillGroup[];
  onGroupsChange: (groups: SkillGroup[]) => void;
}

/** El valor "todas" no es un grupo: es la ausencia de acotado. */
const ALL = "all";

/**
 * Sólo el recorte de habilidades. El orden ya no se elige: la matriz se
 * ordena siempre por brechas, que es lo que se viene a mirar, y un control
 * para ponerla por nombre era una decisión más sin una tarea detrás.
 *
 * Va pegado al mapa, dentro de su columna, porque es lo que recorta las
 * columnas que se ven justo debajo.
 */
export const SpanControls: React.FC<SpanControlsProps> = ({
  groups,
  onGroupsChange,
}) => (
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
  </div>
);
