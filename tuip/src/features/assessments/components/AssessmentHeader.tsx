import React from "react";
import { Badge, Button } from "@tuya-ui/components";
import { cycleLabel } from "../services/assessmentService";
import type { AssessmentView } from "../adapters/AssessmentAdapter";

interface AssessmentHeaderProps {
  assessment: AssessmentView;
  saving: boolean;
  onClose: () => void;
  onLeave: () => void;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  assessment,
  saving,
  onClose,
  onLeave,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-heading-lg font-semibold text-neutral-default">
          Evaluación de {assessment.personName}
        </h1>
        <Badge variant={assessment.readOnly ? "neutral" : "info"}>
          {assessment.statusLabel}
        </Badge>
      </div>
      <p className="text-body-sm text-neutral-subtle">
        {assessment.position} · {cycleLabel(assessment.cycle)}
      </p>
      <p className="mt-2 text-body font-medium text-neutral-default">
        {assessment.progressLabel}
      </p>
    </div>

    {!assessment.readOnly && (
      <div className="flex shrink-0 items-center gap-2">
        {/*
          `secondary` y no `subtle`: es una acción, y sin borde se leía como
          texto. El borde es lo único que dibuja dónde termina el área en la
          que se puede hacer clic.
        */}
        <Button variant="secondary" onClick={onLeave}>
          Guardar y seguir después
        </Button>
        {/*
          Lo que implica cerrar ya no se dice acá. Una advertencia que está
          siempre deja de leerse, y el momento en que importa es aquel en que
          se está por apretar: vive en la confirmación.
        */}
        <Button variant="primary" isLoading={saving} onClick={onClose}>
          Cerrar evaluación
        </Button>
      </div>
    )}
  </div>
);
