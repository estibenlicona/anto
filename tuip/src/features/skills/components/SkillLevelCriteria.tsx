import React, { useState } from "react";
import { Button, Icon, Input, LevelMeter } from "@tuya-ui/components";
import type { SkillLevelView } from "../adapters/SkillsAdapter";
import type { SkillLevel } from "../services/skillsService";

interface SkillLevelCriteriaProps {
  level: SkillLevelView;
  disabled: boolean;
  /** Recibe la lista completa del nivel: los criterios se editan en bloque. */
  onChange: (level: SkillLevel, criteria: string[]) => void;
}

/**
 * Los cuatro niveles se pintan con el mismo medidor que el resto de la app usa
 * para seniority y stacks, para que "Avanzado" se vea igual en todas partes.
 */
const TONES = ["sky", "blue", "violet", "magenta"] as const;

export const SkillLevelCriteria: React.FC<SkillLevelCriteriaProps> = ({
  level,
  disabled,
  onChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");

  const replace = (criteria: string[]) => onChange(level.level, criteria);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraft(level.criteria[index]);
  };

  const commitEdit = () => {
    if (editingIndex === null || draft.trim().length === 0) return;
    const next = [...level.criteria];
    next[editingIndex] = draft.trim();
    setEditingIndex(null);
    replace(next);
  };

  const commitNew = () => {
    if (newText.trim().length === 0) return;
    setAdding(false);
    setNewText("");
    replace([...level.criteria, newText.trim()]);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= level.criteria.length) return;
    const next = [...level.criteria];
    [next[index], next[target]] = [next[target], next[index]];
    replace(next);
  };

  const remove = (index: number) =>
    replace(level.criteria.filter((_, i) => i !== index));

  return (
    <section className="border-t-default border-neutral-default py-4 first:border-t-0 first:pt-0">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/*
            El ancho va en un envoltorio y no en el medidor: `LevelMeter` trae
            `w-full` propio y `cn` no deduplica utilidades, así que una clase de
            ancho pasada por `className` pierde contra la suya y el medidor se
            estira hasta comerse el título.
          */}
          <span className="w-14 shrink-0">
            <LevelMeter
              value={level.level}
              tone={TONES[level.level - 1]}
              label={`Nivel ${level.level}`}
            />
          </span>
          <h4 className="whitespace-nowrap text-body-sm font-semibold text-neutral-default">
            {level.level} · {level.label}
          </h4>
        </div>
        {/*
          Cada nivel informa su propia cantidad. No hay un total esperado contra
          el que compararla: cinco es lo habitual, no la regla.
        */}
        <span
          className={
            level.empty
              ? "text-body-sm text-warning-default"
              : "text-body-sm text-neutral-subtle"
          }
        >
          {level.empty
            ? "Sin criterios"
            : `${level.count} ${level.count === 1 ? "criterio" : "criterios"}`}
        </span>
      </header>

      <ol className="mt-3 space-y-1">
        {level.criteria.map((criterion, index) => (
          <li
            key={`${index}-${criterion}`}
            className="group flex items-start gap-2"
          >
            {editingIndex === index ? (
              <div className="flex w-full items-start gap-2">
                <Input
                  aria-label={`Editar criterio ${index + 1} de ${level.label}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="small"
                  onClick={commitEdit}
                  disabled={disabled || draft.trim().length === 0}
                >
                  Guardar
                </Button>
                <Button
                  variant="subtle"
                  size="small"
                  onClick={() => setEditingIndex(null)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <>
                <span className="mt-0.5 w-5 shrink-0 text-body-sm tabular-nums text-neutral-subtlest">
                  {index + 1}.
                </span>
                <span className="flex-1 text-body-sm text-neutral-default">
                  {criterion}
                </span>
                {/*
                  Las acciones aparecen al pasar por encima o al enfocar con
                  teclado. Un nivel con veinte criterios son ochenta botones
                  diminutos siempre a la vista, y esta superficie sobre todo se
                  lee: `focus-within` es lo que evita que ocultarlas las saque
                  del alcance de quien navega sin mouse.
                */}
                <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    variant="subtle"
                    size="small"
                    aria-label={`Subir criterio ${index + 1} de ${level.label}`}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                    iconBefore={
                      <Icon
                        name="chevron-down"
                        size={16}
                        className="rotate-180"
                      />
                    }
                  />
                  <Button
                    variant="subtle"
                    size="small"
                    aria-label={`Bajar criterio ${index + 1} de ${level.label}`}
                    disabled={disabled || index === level.criteria.length - 1}
                    onClick={() => move(index, 1)}
                    iconBefore={<Icon name="chevron-down" size={16} />}
                  />
                  <Button
                    variant="subtle"
                    size="small"
                    aria-label={`Editar criterio ${index + 1} de ${level.label}`}
                    disabled={disabled}
                    onClick={() => startEdit(index)}
                    iconBefore={<Icon name="edit" size={16} />}
                  />
                  <Button
                    variant="subtle"
                    size="small"
                    aria-label={`Quitar criterio ${index + 1} de ${level.label}`}
                    disabled={disabled}
                    onClick={() => remove(index)}
                    iconBefore={<Icon name="delete" size={16} />}
                  />
                </span>
              </>
            )}
          </li>
        ))}
      </ol>

      {adding ? (
        <div className="mt-2 flex items-start gap-2">
          <Input
            autoFocus
            aria-label={`Nuevo criterio de ${level.label}`}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Qué tiene que demostrar en este nivel"
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="small"
            onClick={commitNew}
            disabled={disabled || newText.trim().length === 0}
          >
            Agregar
          </Button>
          <Button
            variant="subtle"
            size="small"
            onClick={() => setAdding(false)}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          variant="subtle"
          size="small"
          className="mt-2"
          disabled={disabled}
          onClick={() => setAdding(true)}
          iconBefore={<Icon name="plus" size={16} />}
        >
          Agregar criterio
        </Button>
      )}
    </section>
  );
};
