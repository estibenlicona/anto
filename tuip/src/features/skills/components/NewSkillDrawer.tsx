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
  Textarea,
} from "@tuya-ui/components";
import type { SkillGroup, UpsertSkillRequest } from "../services/skillsService";

interface NewSkillDrawerProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: UpsertSkillRequest) => void;
}

const groupOptions = [
  { value: "technical", label: "Técnica" },
  { value: "human", label: "Humana" },
];

export const NewSkillDrawer: React.FC<NewSkillDrawerProps> = ({
  open,
  saving,
  error,
  onOpenChange,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<SkillGroup>("technical");
  const [description, setDescription] = useState("");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader title="Nueva habilidad" />
      <DrawerBody>
        <div className="space-y-4">
          <Input
            label="Nombre"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Conocimiento del negocio"
          />
          <Select
            label="Grupo"
            options={groupOptions}
            value={group}
            onValueChange={(value) => setGroup(value as SkillGroup)}
          />
          <Textarea
            label="Descripción"
            rows={2}
            hint="Una línea: qué mide esta habilidad."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {/*
            Se dice acá y no después: quien crea una habilidad tiene que saber
            que todavía no sirve para evaluar, y por qué aparece marcada.
          */}
          <Alert variant="info">
            Nace con los cuatro niveles vacíos. Hasta cargarle criterios queda
            marcada como incompleta y no se puede evaluar con ella.
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
          disabled={name.trim().length === 0}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              group,
              description: description.trim(),
            })
          }
        >
          Crear habilidad
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
