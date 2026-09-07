import React from "react";
import type { SelectedSprintView } from "../adapters/DedicationAdapter";
import { EvidenceList } from "./EvidenceList";
import { ReferencePanel } from "./ReferencePanel";
import { UnplannedWorkPanel } from "./UnplannedWorkPanel";

export interface SignalsTabProps {
  sprint: SelectedSprintView;
}

/**
 * *Por qué esta señal*, en dos columnas: a la izquierda las seis evidencias
 * contra su tolerancia, a la derecha las dos que necesitan una forma y no una
 * cifra —la referencia comparada a la misma escala y el trabajo que entró
 * después del inicio—.
 */
export const SignalsTab: React.FC<SignalsTabProps> = ({ sprint }) => (
  <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
    <div className="border-neutral-default lg:border-r">
      <EvidenceList evidences={sprint.evidences} />
    </div>
    {/* `block` entre los dos bloques y `stack` dentro de cada uno: el hueco
        entre grupos siempre mayor que el hueco dentro del grupo. */}
    <div className="flex flex-col gap-6 border-t border-neutral-default p-4 lg:border-t-0">
      <ReferencePanel sprint={sprint} />
      <UnplannedWorkPanel sprint={sprint} />
    </div>
  </div>
);
