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
import type { LeadCandidateView } from "../adapters/ExpertiseLinesAdapter";

interface LeadDrawerProps {
  open: boolean;
  saving: boolean;
  error: string | null;
  lineName: string;
  currentLeadId: string | null;
  candidates: LeadCandidateView[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (personId: string | null) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  open,
  saving,
  error,
  lineName,
  currentLeadId,
  candidates,
  onOpenChange,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<string | null>(currentLeadId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader title={`Lead de ${lineName}`} />
      <DrawerBody>
        <div className="space-y-4">
          {/*
            Se dice antes de elegir, no después: designar mueve a la persona a
            esta línea, y quien lo hace tiene que saberlo antes de confirmar.
          */}
          <Alert variant="info">
            Quien lidera pertenece a la línea que lidera. Si la persona está en
            otra línea, designarla la trae a esta.
          </Alert>

          <RadioGroup
            value={selected ?? ""}
            onValueChange={(value) => setSelected(value || null)}
            options={candidates.map((c) => ({
              value: c.id,
              // Quien ya lidera otra aparece, bloqueado y diciendo cuál:
              // ocultarlo dejaría al usuario buscando a alguien que sí existe.
              // El motivo va en el rótulo porque `RadioOption` no lleva
              // descripción, y agregarsela sería un cambio de tuip.
              label: `${c.name} · ${c.note ?? c.position}`,
              disabled: c.disabled,
            }))}
          />
        </div>
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
        {currentLeadId && (
          <Button
            variant="subtle"
            isLoading={saving}
            onClick={() => onSubmit(null)}
          >
            Quitar lead
          </Button>
        )}
        <Button
          variant="primary"
          isLoading={saving}
          disabled={!selected || selected === currentLeadId}
          onClick={() => onSubmit(selected)}
        >
          Designar
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};
