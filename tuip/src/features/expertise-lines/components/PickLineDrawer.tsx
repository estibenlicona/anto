import React, { useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  RadioGroup,
} from "@tuya-ui/components";
import type { LineListItemView } from "../adapters/ExpertiseLinesAdapter";

interface PickLineDrawerProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  personName: string;
  /** Sólo las activas: una línea archivada no recibe gente. */
  activeLines: LineListItemView[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (lineId: string) => void;
}

/** Elegir línea para una persona suelta, desde el bloque de quien no tiene. */
export const PickLineDrawer: React.FC<PickLineDrawerProps> = ({
  open,
  saving,
  error,
  personName,
  activeLines,
  onOpenChange,
  onSubmit,
}) => {
  const [lineId, setLineId] = useState<string | null>(null);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader title={`Línea de ${personName}`} />
      <DrawerBody>
        <RadioGroup
          label="Línea de expertise"
          value={lineId ?? ""}
          onValueChange={setLineId}
          options={activeLines.map((l) => ({
            value: l.id,
            label: `${l.name} · ${l.peopleCount} ${l.peopleCount === 1 ? "persona" : "personas"}`,
          }))}
        />
        {error && (
          <Alert variant="danger" className="mt-4">
            {error}
          </Alert>
        )}
      </DrawerBody>
      <DrawerFooter>
        <Button variant="subtle" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          isLoading={saving}
          disabled={!lineId}
          onClick={() => lineId && onSubmit(lineId)}
        >
          Asignar
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
