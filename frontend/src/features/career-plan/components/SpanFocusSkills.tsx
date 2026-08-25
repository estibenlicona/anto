import React from "react";
import { Progress } from "@tuya-ui/components";
import { levelLabel } from "@features/skills/adapters/SkillsAdapter";
import type { SpanFocusSkillDto } from "../services/careerPlanService";

export interface SpanFocusSkillsProps {
  skills: SpanFocusSkillDto[];
}

/**
 * Dónde se concentra la brecha del chapter. Es una lectura **del span**, no de
 * una persona: la misma habilidad puede estar corta en cinco filas distintas y
 * eso no se ve recorriendo el mapa fila por fila.
 *
 * El peso ordena, y suma niveles en vez de personas: tres personas a un nivel
 * y tres a tres niveles no son el mismo problema, y contarlas las empataría.
 */
export const SpanFocusSkills: React.FC<SpanFocusSkillsProps> = ({ skills }) => {
  // Sin brechas no hay foco que mostrar: un bloque vacío ocuparía el lugar de
  // algo que sí tiene qué decir.
  if (skills.length === 0) return null;

  const mayor = Math.max(...skills.map((s) => s.weight));

  return (
    <section className="flex flex-col gap-3 rounded-surface border-default border-neutral-default bg-neutral-default p-4">
      <div className="flex flex-col">
        <h2 className="text-label font-semibold text-neutral-default">
          Dónde se concentra la brecha
        </h2>
        {/* Dicho, y no deducido de la ubicación: la columna también muestra el
            detalle de una persona, y las dos lecturas se parecen. */}
        <p className="text-body-sm text-neutral-subtlest">
          Agregado del chapter, no de una persona
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {skills.map((skill) => (
          <li key={skill.skillId} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-body-sm text-neutral-default">
                {skill.skillName}
              </span>
              <span className="shrink-0 text-body-sm text-neutral-subtle">
                {skill.peopleWithGap}{" "}
                {skill.peopleWithGap === 1 ? "persona" : "personas"}
                {skill.expectedLevel !== null
                  ? ` · pide ${levelLabel(skill.expectedLevel)}`
                  : ""}
              </span>
            </div>
            {/* En tono de acento y no en la escala de atención: acá la barra
                dice cuánto pesa, no qué tan grave es una celda. */}
            <Progress
              value={mayor === 0 ? 0 : Math.round((skill.weight / mayor) * 100)}
              tone="violet"
              label={`Peso de la brecha en ${skill.skillName}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
