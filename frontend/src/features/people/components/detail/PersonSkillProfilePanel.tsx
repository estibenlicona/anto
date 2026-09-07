import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Button, Link } from "@tuya-ui/components";
import type { PersonPlanView } from "@features/career-plan/adapters/PersonPlanAdapter";
import { PlanSkillMeter } from "@features/career-plan/components/PlanSkillMeter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";
import { SHOWN_ROWS } from "./PersonStacksPanel";

export interface PersonSkillProfilePanelProps {
  plan: PersonPlanView | null;
  /** Ruta del plan de la persona en Competencias. */
  planHref: string;
}

/**
 * El perfil evaluado, de sólo lectura: la evaluación se hace y se corrige en
 * Competencias; acá se lee el resultado. La marca del medidor señala lo que
 * pide el cargo.
 */
export const PersonSkillProfilePanel: React.FC<
  PersonSkillProfilePanelProps
> = ({ plan, planHref }) => {
  const [expanded, setExpanded] = React.useState(false);
  const skills = plan?.skills ?? [];
  // Las mismas cinco filas que Stacks: los dos paneles truncan igual.
  const shown = expanded ? skills : skills.slice(0, SHOWN_ROWS);
  const hidden = skills.length - SHOWN_ROWS;
  return (
    <DetailPanel
      title="Perfil evaluado"
      subtitle={plan?.assessed ? "la marca, lo que pide su cargo" : undefined}
      right={
        <Link asChild tone="neutral" className="text-body-sm">
          <RouterLink to={planHref}>Ver evaluación</RouterLink>
        </Link>
      }
      className="flex flex-col px-4 pb-2 pt-1"
    >
      {!plan || !plan.assessed ? (
        <div className="flex flex-col items-start gap-1 py-4">
          <span className="text-body-sm font-medium text-neutral-default">
            Sin evaluación
          </span>
          <span className={SECONDARY_TEXT}>
            El perfil aparece al cerrar una evaluación en Competencias.
          </span>
        </div>
      ) : (
        <>
          <ul className="flex flex-col">
            {shown.map((skill, index) => (
              <li
                key={skill.skillId}
                className={`flex flex-col gap-1 py-2.5 ${
                  index === shown.length - 1 && hidden <= 0
                    ? ""
                    : "border-b border-neutral-default"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body-sm font-medium text-neutral-default">
                    {skill.skillName}
                  </span>
                  {skill.state === "gap" ? (
                    <Badge variant="warning" dot={false}>
                      Brecha
                    </Badge>
                  ) : skill.state === "met" ? (
                    <Badge variant="success" dot={false}>
                      Cumple
                    </Badge>
                  ) : (
                    <Badge variant="neutral" dot={false}>
                      Sin requisito
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={SECONDARY_TEXT}>
                    {skill.levelLabel}
                    {skill.expectedLabel
                      ? ` · su cargo pide ${skill.expectedLabel}`
                      : ""}
                  </span>
                  <PlanSkillMeter skill={skill} />
                </div>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <Button
              variant="subtle"
              size="small"
              className="my-1 self-start"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Ver menos" : `Ver ${hidden} más`}
            </Button>
          )}
        </>
      )}
    </DetailPanel>
  );
};
