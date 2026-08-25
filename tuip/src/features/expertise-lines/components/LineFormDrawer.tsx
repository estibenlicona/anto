import React, { useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  Input,
  Textarea,
} from "@tuya-ui/components";
import {
  EXPERTISE_LINE_LIMITS,
  type UpsertExpertiseLineRequest,
} from "../services/expertiseLinesService";
import type { LineListItemView } from "../adapters/ExpertiseLinesAdapter";

interface LineFormDrawerProps {
  open: boolean;
  saving: boolean;
  /** El error del servidor; no descarta lo escrito. */
  error: string | null;
  /** La línea que se edita, o `null` para un alta. */
  line: LineListItemView | null;
  /** Para avisar del choque antes de llamar al backend. */
  existing: LineListItemView[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: UpsertExpertiseLineRequest) => void;
}

export const LineFormDrawer: React.FC<LineFormDrawerProps> = ({
  open,
  saving,
  error,
  line,
  existing,
  onOpenChange,
  onSubmit,
}) => {
  const [name, setName] = useState(line?.name ?? "");
  const [code, setCode] = useState(line?.code ?? "");
  const [description, setDescription] = useState(line?.description ?? "");

  const trimmedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();
  const others = existing.filter((l) => l.id !== line?.id);

  // Las mismas dos reglas que aplica el backend: el nombre choca sólo contra
  // las vigentes, el código contra todas — una etiqueta corta no puede cambiar
  // de significado, ni siquiera cuando su línea se archivó.
  const nameClash = others.find(
    (l) => !l.archived && l.name.toLowerCase() === trimmedName.toLowerCase()
  );
  const codeClash = others.find((l) => l.code === normalizedCode);

  const nameError =
    trimmedName.length > EXPERTISE_LINE_LIMITS.name
      ? `El nombre no puede pasar de ${EXPERTISE_LINE_LIMITS.name} caracteres.`
      : nameClash
        ? `Ya existe una línea llamada “${nameClash.name}”.`
        : undefined;
  const codeError =
    normalizedCode.length > EXPERTISE_LINE_LIMITS.code
      ? `El código no puede pasar de ${EXPERTISE_LINE_LIMITS.code} caracteres.`
      : codeClash
        ? `El código “${normalizedCode}” ya lo usa “${codeClash.name}”.`
        : undefined;
  const descriptionError =
    description.trim().length > EXPERTISE_LINE_LIMITS.description
      ? `La descripción no puede pasar de ${EXPERTISE_LINE_LIMITS.description} caracteres.`
      : undefined;

  const canSubmit =
    trimmedName.length > 0 &&
    normalizedCode.length > 0 &&
    !nameError &&
    !codeError &&
    !descriptionError;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader
        title={line ? "Editar línea" : "Nueva línea de expertise"}
      />
      <DrawerBody>
        <div className="space-y-4">
          <Input
            label="Nombre"
            required
            value={name}
            error={nameError}
            onChange={(e) => setName(e.target.value)}
            placeholder="Backend"
          />
          <Input
            label="Código"
            required
            value={code}
            error={codeError}
            hint="La etiqueta corta con la que la línea aparece en los listados."
            onChange={(e) => setCode(e.target.value)}
            placeholder="BE"
          />
          <Textarea
            label="Descripción"
            rows={2}
            hint="Una línea: qué agrupa esta disciplina."
            value={description}
            error={descriptionError}
            onChange={(e) => setDescription(e.target.value)}
          />
          {!line && (
            <Alert variant="info">
              Nace activa y sin lead. Hasta designarle uno queda marcada como
              incompleta.
            </Alert>
          )}
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
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              name: trimmedName,
              code: normalizedCode,
              description: description.trim() || null,
            })
          }
        >
          {line ? "Guardar cambios" : "Crear línea"}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
