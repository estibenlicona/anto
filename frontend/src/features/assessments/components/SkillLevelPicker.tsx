import React from "react";
import { Checkbox, OptionCard, OptionCardGroup } from "@tuya-ui/components";
import type { AssessmentSkillView } from "../adapters/AssessmentAdapter";
import type { SkillLevel } from "@features/skills/services/skillsService";

interface SkillLevelPickerProps {
  skill: AssessmentSkillView;
  readOnly: boolean;
  onLevelChange: (level: SkillLevel) => void;
  onCriterionToggle: (
    level: SkillLevel,
    criterion: string,
    met: boolean
  ) => void;
}

export const SkillLevelPicker: React.FC<SkillLevelPickerProps> = ({
  skill,
  readOnly,
  onLevelChange,
  onCriterionToggle,
}) => (
  <div>
    <div className="mb-3 flex flex-wrap items-baseline gap-2">
      <h3 className="text-body font-semibold text-neutral-default">
        ¿En qué nivel está hoy?
      </h3>
      {/*
        Dicho donde se decide: el contador de cada nivel es evidencia, no una
        regla que elija por el líder. Mientras no exista un acuerdo de cuándo
        se alcanza un nivel, proponerlo sería imponer una definición.
      */}
      <span className="text-body-sm text-neutral-subtle">
        marca lo que cumple; el nivel lo decides tú
      </span>
    </div>

    <OptionCardGroup
      label={`Nivel de ${skill.skillName}`}
      value={skill.level === null ? undefined : String(skill.level)}
      disabled={readOnly}
      onValueChange={(value) => onLevelChange(Number(value) as SkillLevel)}
    >
      {skill.levels.map((level) => (
        <OptionCard
          key={level.level}
          value={String(level.level)}
          title={`${level.level} · ${level.label}`}
          description={
            <span
              className={
                level.total === 0
                  ? "text-warning-default"
                  : "text-neutral-subtle"
              }
            >
              {level.counterLabel}
            </span>
          }
        >
          {level.criteria.length > 0 && (
            <ul className="space-y-1.5">
              {level.criteria.map((criterion) => (
                <li key={criterion.text}>
                  <Checkbox
                    label={criterion.text}
                    checked={criterion.met}
                    disabled={readOnly}
                    onChange={(e) =>
                      onCriterionToggle(
                        level.level,
                        criterion.text,
                        e.target.checked
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </OptionCard>
      ))}
    </OptionCardGroup>
  </div>
);
