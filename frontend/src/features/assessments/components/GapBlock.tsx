import React from "react";
import { Badge, Textarea } from "@tuya-ui/components";
import type { AssessmentSkillView } from "../adapters/AssessmentAdapter";

interface GapBlockProps {
  skill: AssessmentSkillView;
  note: string;
  readOnly: boolean;
  error: string | null;
  onNoteChange: (note: string) => void;
}

const BADGE_VARIANT = {
  gap: "warning",
  met: "success",
  undefined: "neutral",
  unevaluated: "neutral",
} as const;

export const GapBlock: React.FC<GapBlockProps> = ({
  skill,
  note,
  readOnly,
  error,
  onNoteChange,
}) => {
  const hasGap = skill.gapState === "gap";

  return (
    <section className="rounded-surface border-default border-neutral-default bg-neutral-subtlest p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="text-body font-semibold text-neutral-default">Brecha</h3>
        <Badge variant={BADGE_VARIANT[skill.gapState]}>
          {hasGap
            ? `−${skill.gap} ${skill.gap === 1 ? "nivel" : "niveles"} · su cargo pide ${skill.expectedLabel}`
            : skill.gapLabel}
        </Badge>
      </header>

      {hasGap && (
        <div className="mt-3">
          <p className="text-label uppercase text-neutral-subtle">
            Le falta para {skill.expectedLabel}
          </p>
          <ul className="mt-2 space-y-1">
            {skill.missingCriteria.map((criterion) => (
              <li key={criterion} className="text-body-sm text-neutral-default">
                {criterion}
              </li>
            ))}
          </ul>
          {/*
            Se dice explícitamente porque es el punto del diseño: registrar la
            brecha dejó de ser un segundo trabajo.
          */}
          <p className="mt-2 text-body-sm text-neutral-subtle">
            Sale solo de los criterios sin marcar: no hay que escribir la brecha
            de cero.
          </p>
        </div>
      )}

      <div className="mt-4">
        <Textarea
          label="Nota de la evaluación"
          required={hasGap}
          rows={3}
          value={note}
          error={error ?? undefined}
          disabled={readOnly}
          hint={
            hasGap
              ? "Obligatoria con brecha: es lo que después le da sentido a la acción del plan."
              : "Opcional."
          }
          onChange={(e) => onNoteChange(e.target.value)}
        />
      </div>
    </section>
  );
};
