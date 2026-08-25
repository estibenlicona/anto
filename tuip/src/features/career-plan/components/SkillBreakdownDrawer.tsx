import React from "react";
import {
  Avatar,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  LevelMeter,
  Tag,
} from "@tuya-ui/components";
import type { SkillBreakdown } from "../adapters/SkillBreakdownAdapter";

interface SkillBreakdownDrawerProps {
  breakdown: SkillBreakdown | null;
  onOpenChange: (open: boolean) => void;
}

const TONES = ["sky", "blue", "violet", "magenta"] as const;

export const SkillBreakdownDrawer: React.FC<SkillBreakdownDrawerProps> = ({
  breakdown,
  onOpenChange,
}) => (
  <Drawer open={breakdown !== null} onOpenChange={onOpenChange} size="sm">
    {breakdown && (
      <>
        <DrawerHeader
          title={breakdown.skillName}
          eyebrow={breakdown.groupLabel}
        >
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={breakdown.gapCount > 0 ? "warning" : "success"}>
              {breakdown.gapCount === 0
                ? "Nadie con brecha"
                : `${breakdown.gapCount} ${breakdown.gapCount === 1 ? "persona" : "personas"} con brecha`}
            </Badge>
            <span className="text-body-sm text-neutral-subtle">
              {breakdown.evaluatedCount} evaluadas
              {breakdown.pendingCount > 0 &&
                ` · ${breakdown.pendingCount} sin evaluar`}
            </span>
          </div>
        </DrawerHeader>

        <DrawerBody>
          {/*
            De menor a mayor: lo que se viene a buscar acá son los que están
            cortos, y quedan arriba sin tener que recorrer la lista entera.
          */}
          <div className="space-y-5">
            {breakdown.levels.map((level) => (
              <section key={level.level}>
                <header className="flex items-center gap-3">
                  <span className="w-14 shrink-0">
                    <LevelMeter
                      value={level.level}
                      tone={TONES[level.level - 1]}
                      label={`Nivel ${level.level}`}
                    />
                  </span>
                  <h3 className="text-body-sm font-semibold text-neutral-default">
                    {level.level} · {level.label}
                  </h3>
                  <span className="ml-auto text-body-sm text-neutral-subtle">
                    {level.people.length}
                  </span>
                </header>

                {level.empty ? (
                  // Se muestra igual: un nivel ausente de la lista haría leer
                  // el reparto como si ese peldaño no existiera.
                  <p className="mt-2 text-body-sm text-neutral-subtlest">
                    Nadie en este nivel
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {level.people.map((person) => (
                      <li
                        key={person.personId}
                        className="flex items-center gap-2"
                      >
                        <Avatar
                          size="small"
                          label={person.personName}
                          colorId={person.personId}
                        >
                          {person.initials}
                        </Avatar>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-body-sm text-neutral-default">
                            {person.personName}
                          </span>
                          <span className="truncate text-body-sm text-neutral-subtle">
                            {person.position}
                          </span>
                        </span>
                        {person.atLevel ? (
                          <Tag color="green">Al nivel</Tag>
                        ) : (
                          <Tag color="red">
                            −{person.gap} · pide {person.expectedLabel}
                          </Tag>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </DrawerBody>
      </>
    )}
  </Drawer>
);
