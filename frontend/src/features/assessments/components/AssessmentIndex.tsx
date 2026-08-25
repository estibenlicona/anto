import React from "react";
import { Badge, Card, Icon } from "@tuya-ui/components";
import type { BadgeVariant } from "@tuya-ui/components";
import type {
  AssessmentSkillView,
  AssessmentView,
} from "../adapters/AssessmentAdapter";

interface AssessmentIndexProps {
  assessment: AssessmentView;
  currentSkillId: string | null;
  onSelect: (skillId: string) => void;
}

/**
 * Qué se dice de cada habilidad en el índice, en una sola palabra.
 *
 * `info` para la que se está evaluando —es dónde estás parado, no un
 * problema— y `neutral` para la pendiente. Ni `warning` ni `danger`: una
 * habilidad sin evaluar todavía no es un incumplimiento, y teñirla de ámbar
 * convertiría el arranque normal de toda evaluación en una pantalla de
 * alertas.
 */
function stateBadge(
  skill: AssessmentSkillView,
  current: boolean
): { label: string; variant: BadgeVariant } | null {
  if (current) return { label: "Evaluando", variant: "info" };
  return skill.progress === "pending"
    ? { label: "Pendiente", variant: "neutral" }
    : null;
}

const SkillRow: React.FC<{
  skill: AssessmentSkillView;
  current: boolean;
  onSelect: () => void;
}> = ({ skill, current, onSelect }) => {
  const badge = stateBadge(skill, current);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={current ? "true" : undefined}
      className={[
        "flex w-full items-center gap-2 border-l-2 px-4 py-2 text-left",
        "focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring",
        current
          ? "border-neutral-bold bg-neutral-subtlest"
          : "border-transparent hover:bg-neutral-subtlest",
      ].join(" ")}
    >
      {/*
        La marca de evaluada es un ícono y no una palabra: en una lista de
        nueve, lo que se busca es lo que falta, no lo que ya está.
      */}
      <span className="w-4 shrink-0">
        {skill.progress === "evaluated" && (
          <Icon name="check" size={16} className="text-success-default" />
        )}
      </span>
      <span className="flex-1 text-body-sm text-neutral-default">
        {skill.skillName}
      </span>
      {badge && (
        <span className="shrink-0">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </span>
      )}
    </button>
  );
};

export const AssessmentIndex: React.FC<AssessmentIndexProps> = ({
  assessment,
  currentSkillId,
  onSelect,
}) => (
  <Card className="overflow-hidden">
    {/* El avance no se repite acá: vive una sola vez, en el encabezado. */}
    <div className="border-b-default border-neutral-default px-4 py-3">
      <h2 className="text-body font-semibold text-neutral-default">
        Habilidades
      </h2>
    </div>

    {assessment.groups
      .filter((group) => group.skills.length > 0)
      .map((group) => (
        <div key={group.group}>
          <p className="bg-neutral-subtlest px-4 py-1.5 text-label uppercase text-neutral-subtle">
            {group.label}
          </p>
          {group.skills.map((skill) => (
            <SkillRow
              key={skill.skillId}
              skill={skill}
              current={skill.skillId === currentSkillId}
              onSelect={() => onSelect(skill.skillId)}
            />
          ))}
        </div>
      ))}
  </Card>
);
