import React, { useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Input,
  Select,
} from "@tuya-ui/components";
import { levelLabel } from "@features/skills/adapters/SkillsAdapter";
import type { SkillLevel } from "@features/skills/services/skillsService";
import type { PersonPlanView } from "../adapters/PersonPlanAdapter";
import type { CreatePlanActionRequest } from "../services/careerPlanService";

interface NewActionDrawerProps {
  plan: PersonPlanView;
  open: boolean;
  saving: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: CreatePlanActionRequest) => void;
}

/** El mes siguiente, como compromiso por defecto. */
function nextMonth(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const NewActionDrawer: React.FC<NewActionDrawerProps> = ({
  plan,
  open,
  saving,
  error,
  onOpenChange,
  onSubmit,
}) => {
  const [skillId, setSkillId] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [dueMonth, setDueMonth] = useState(nextMonth());
  const [title, setTitle] = useState("");

  const skill = plan.openGaps.find((s) => s.skillId === skillId) ?? null;

  // Sólo brechas abiertas: es la validación del handler, dicha antes de que
  // el formulario pueda incumplirla.
  const gapOptions = plan.openGaps.map((s) => ({
    value: s.skillId,
    label: `${s.skillName} — ${s.levelLabel}, su cargo pide ${s.expectedLabel}`,
  }));

  const levelOptions = skill
    ? ([skill.level + 1, skill.level + 2, skill.level + 3] as number[])
        .filter((l) => l <= 4)
        .map((l) => ({ value: String(l), label: levelLabel(l as SkillLevel) }))
    : [];

  const ready =
    skillId !== "" &&
    targetLevel !== "" &&
    title.trim() !== "" &&
    dueMonth !== "";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader title="Nueva acción del plan" eyebrow={plan.personName} />
      <DrawerBody>
        <div className="space-y-4">
          <Select
            label="Cierra la brecha de"
            required
            options={gapOptions}
            value={skillId}
            placeholder="Selecciona una brecha abierta"
            onValueChange={(value) => {
              setSkillId(value);
              setTargetLevel("");
            }}
          />
          <Select
            label="Nivel objetivo"
            required
            disabled={skill === null}
            options={levelOptions}
            value={targetLevel}
            placeholder={
              skill ? "Selecciona el nivel" : "Selecciona primero la brecha"
            }
            onValueChange={setTargetLevel}
          />
          <Input
            label="Compromiso"
            required
            type="month"
            value={dueMonth}
            onChange={(e) => setDueMonth(e.target.value)}
          />
          <Input
            label="Acción"
            required
            value={title}
            placeholder="Acompañar el rediseño del motor de cobranza"
            onChange={(e) => setTitle(e.target.value)}
          />
          <Alert variant="info">
            Marcarla cumplida no cierra la brecha: la brecha se cierra cuando
            una evaluación posterior alcanza el nivel que su cargo pide.
          </Alert>
          {error && <Alert variant="danger">{error}</Alert>}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="subtle" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          isLoading={saving}
          disabled={!ready}
          onClick={() =>
            onSubmit({
              skillId,
              targetLevel: Number(targetLevel) as SkillLevel,
              dueMonth,
              title: title.trim(),
            })
          }
        >
          Registrar acción
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
