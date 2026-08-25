import React from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import type {
  CriterionGroupView,
  PersonPlanView,
  PlanSkillView,
} from "../adapters/PersonPlanAdapter";
import { PlanSkillMeter } from "./PlanSkillMeter";

interface PlanSkillProfileProps {
  plan: PersonPlanView;
  /** Qué habilidades están abiertas: es estado de la pantalla, no de la fila. */
  expanded: string[];
  onExpandedChange: (skillId: string, open: boolean) => void;
}

const BADGE: Record<PlanSkillView["state"], "warning" | "success" | "neutral"> =
  {
    gap: "warning",
    met: "success",
    undefined: "neutral",
  };

const CriterionColumn: React.FC<{ group: CriterionGroupView }> = ({
  group,
}) => (
  <div>
    <p className="flex items-baseline justify-between gap-2 text-label uppercase text-neutral-subtle">
      <span>{group.title}</span>
      <span className="shrink-0 tabular-nums">{group.counterLabel}</span>
    </p>
    <ul className="mt-2 space-y-1">
      {group.criteria.map((criterion) => (
        <li key={criterion} className="text-body-sm text-neutral-default">
          {criterion}
        </li>
      ))}
    </ul>
  </div>
);

const SkillDetail: React.FC<{ skill: PlanSkillView }> = ({ skill }) => (
  <div>
    {skill.note && (
      <p className="mb-4 max-w-prose text-body-sm text-neutral-subtle">
        {skill.note}
      </p>
    )}
    {/*
      Dos bloques y no los cuatro niveles: lo que importa en la conversación es
      qué cumple hoy y qué le falta para lo que su cargo pide. Mostrar el catálogo
      completo sería repetirlo dentro del plan.
    */}
    <div className="grid gap-6 sm:grid-cols-2">
      <CriterionColumn group={skill.metGroup} />
      {skill.missingGroup && <CriterionColumn group={skill.missingGroup} />}
    </div>
  </div>
);

export const PlanSkillProfile: React.FC<PlanSkillProfileProps> = ({
  plan,
  expanded,
  onExpandedChange,
}) => (
  <section>
    <div className="mb-3 flex flex-wrap items-baseline gap-2">
      <h2 className="text-body font-semibold text-neutral-default">
        Perfil evaluado
      </h2>
      <span className="text-body-sm text-neutral-subtle">
        abrí una fila para ver criterio por criterio · la marca señala lo que
        pide su cargo
      </span>
    </div>

    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Habilidad</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plan.groups
          .filter((group) => group.skills.length > 0)
          .map((group) => (
            <React.Fragment key={group.group}>
              <TableRow>
                <TableCell colSpan={3} className="bg-neutral-subtlest">
                  <span className="text-label uppercase text-neutral-subtle">
                    {group.label}
                  </span>
                </TableCell>
              </TableRow>
              {group.skills.map((skill) => (
                <TableRow
                  key={skill.skillId}
                  detailLabel={`Ver criterios de ${skill.skillName}`}
                  expanded={expanded.includes(skill.skillId)}
                  onExpandedChange={(open) =>
                    onExpandedChange(skill.skillId, open)
                  }
                  detail={<SkillDetail skill={skill} />}
                >
                  <TableCell>{skill.skillName}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <PlanSkillMeter skill={skill} />
                      <span className="text-body-sm text-neutral-default">
                        {skill.levelLabel}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={BADGE[skill.state]}>
                      {skill.stateLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
      </TableBody>
    </Table>
  </section>
);
