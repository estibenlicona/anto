import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Tag,
  Textarea,
} from "@tuya-ui/components";
import { incompleteLabel, type SkillView } from "../adapters/SkillsAdapter";
import type {
  SkillGroup,
  SkillLevel,
  UpsertSkillRequest,
} from "../services/skillsService";
import { SkillLevelCriteria } from "./SkillLevelCriteria";
import { PositionExpectationsTable } from "./PositionExpectationsTable";

interface SkillDetailProps {
  skill: SkillView;
  saving: boolean;
  error: string | null;
  /** Cuando el intento de borrar terminó en "está en uso". */
  canDeactivate: boolean;
  /** Resuelve en `true` cuando el guardado salió bien, y ahí se cierra la edición. */
  onSave: (request: UpsertSkillRequest) => Promise<boolean>;
  onCriteriaChange: (level: SkillLevel, criteria: string[]) => void;
  onExpectationChange: (position: string, level: SkillLevel | null) => void;
  onDelete: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

const groupOptions = [
  { value: "technical", label: "Técnica" },
  { value: "human", label: "Humana" },
];

export const SkillDetail: React.FC<SkillDetailProps> = ({
  skill,
  saving,
  error,
  canDeactivate,
  onSave,
  onCriteriaChange,
  onExpectationChange,
  onDelete,
  onDeactivate,
  onActivate,
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpsertSkillRequest>({
    name: skill.name,
    group: skill.group,
    description: skill.description,
  });

  // Cambiar de habilidad en el índice descarta la edición abierta —seguir
  // editando con los datos de otra sería guardar lo que no se está viendo—,
  // y eso lo resuelve el `key` con el que el contenedor la monta.
  const save = async () => {
    if (await onSave(form)) setEditing(false);
  };

  const missing = incompleteLabel(skill);

  return (
    <Card className="p-6">
      {editing ? (
        <div className="space-y-4">
          <Input
            label="Nombre"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Grupo"
            options={groupOptions}
            value={form.group}
            onValueChange={(value) =>
              setForm({ ...form, group: value as SkillGroup })
            }
          />
          <Textarea
            label="Descripción"
            rows={2}
            hint="Una línea: qué mide esta habilidad."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={save}
              isLoading={saving}
              disabled={form.name.trim().length === 0}
            >
              Guardar
            </Button>
            <Button variant="subtle" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-heading-md text-neutral-default">
                {skill.name}
              </h2>
              <Tag>{skill.groupLabel}</Tag>
              {!skill.active && <Tag color="gray">Inactiva</Tag>}
            </div>
            <p className="mt-1 max-w-prose text-body-sm text-neutral-subtle">
              {skill.description}
            </p>
          </div>
          {/*
            Tres pesos para tres cosas distintas. Editar corrige y se puede
            volver a hacer; desactivar cambia el estado y se deshace con
            Activar; eliminar borra el trabajo de definir los criterios y no
            se deshace. Con las tres iguales, la diferencia entre corregir y
            destruir dependía de leer bien la palabra.
          */}
          <div className="flex shrink-0 gap-2">
            <Button
              variant="subtle"
              size="small"
              onClick={() => setEditing(true)}
            >
              Editar
            </Button>
            {skill.active ? (
              <Button variant="secondary" size="small" onClick={onDeactivate}>
                Desactivar
              </Button>
            ) : (
              <Button variant="secondary" size="small" onClick={onActivate}>
                Activar
              </Button>
            )}
            <Button variant="danger" size="small" onClick={onDelete}>
              Eliminar
            </Button>
          </div>
        </header>
      )}

      {!editing && error && (
        <Alert
          variant={canDeactivate ? "warning" : "danger"}
          className="mt-4"
          action={
            canDeactivate ? (
              <Button variant="secondary" size="small" onClick={onDeactivate}>
                Desactivar
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}

      {missing && !editing && (
        <Alert variant="warning" className="mt-4">
          {missing}: mientras falte, no se puede evaluar a nadie en este nivel.
        </Alert>
      )}

      {/*
        La advertencia de versionado va junto a los criterios y no en el
        encabezado de la pantalla: es acá donde alguien está por cambiar algo
        y podría creer que reescribe el pasado.
      */}
      <Alert variant="info" className="mt-4">
        Cambiar un criterio no recalcula las evaluaciones ya cerradas: cada una
        guarda la versión del catálogo con la que se hizo. Las nuevas usan la
        vigente.
      </Alert>

      <div className="mt-6">
        {skill.levels.map((level) => (
          <SkillLevelCriteria
            key={level.level}
            level={level}
            disabled={saving}
            onChange={onCriteriaChange}
          />
        ))}
      </div>

      <div className="mt-8 border-t-default border-neutral-default pt-6">
        <PositionExpectationsTable
          expectations={skill.expectations}
          disabled={saving}
          onChange={onExpectationChange}
        />
      </div>
    </Card>
  );
};
