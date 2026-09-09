import React from "react";
import { Card, CardBody, Stepper, StepperStep } from "@tuya-ui/components";
import type { Initiative } from "../../adapters/InitiativeAdapter";
import { fteText, pmExpectedText } from "../../adapters/InitiativeAdapter";

export interface InitiativePhaseStripProps {
  initiative: Initiative;
}

/**
 * Las tres fases de la estimación, con la que va alcanzada.
 *
 * Va como `Stepper` y no como tres tarjetas: la Fase 2 y la Fase 3 no existen
 * todavía en el dominio, y una tarjeta vacía anuncia una pantalla que no está,
 * mientras que un paso pendiente es lo que un stepper dice siempre — que
 * después vienen dos más. Cuando existan, cada paso gana su enlace sin que la
 * pieza cambie de forma.
 */
export const InitiativePhaseStrip: React.FC<InitiativePhaseStripProps> = ({
  initiative,
}) => {
  const ev = initiative.evaluation;
  return (
    <Card>
      <CardBody>
        <Stepper aria-label="Fases de la estimación">
          <StepperStep
            status={ev ? "completed" : "current"}
            step={1}
            label="Estimación temprana"
            description={
              ev
                ? `Talla ${ev.talla} · ${pmExpectedText(ev.pmMin, ev.pmMax)} PM · ${fteText(ev.fteExpected)} FTE`
                : "Sin responder"
            }
          />
          <StepperStep
            status="pending"
            step={2}
            label="Estimación refinada"
            description="Aún no disponible"
          />
          <StepperStep
            status="pending"
            step={3}
            label="Cierre y realidad"
            description="Aún no disponible"
          />
        </Stepper>
      </CardBody>
    </Card>
  );
};
