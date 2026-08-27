import React from "react";
import type { SpanMatrixView } from "../adapters/SpanMatrixAdapter";

interface SpanVisibleGapsProps {
  span: SpanMatrixView;
}

/**
 * Cuántas brechas hay a la vista. "A la vista" y no "del span": la cifra
 * sigue al recorte de habilidades, y la card de brechas críticas sí cuenta el
 * span entero; esta no debe leerse como esa.
 *
 * Con recorte, el aviso de que los totales son parciales va en la misma frase
 * —un total parcial leído como el total del span es exactamente el error que
 * acotar habilita— y dice "visibles" para no repetir "a la vista".
 */
export const SpanVisibleGaps: React.FC<SpanVisibleGapsProps> = ({ span }) => (
  // `ml-auto`: en la fila de notas va a la derecha, haya o no aviso de
  // pendientes a la izquierda.
  <p className="ml-auto text-body-sm text-neutral-subtle">
    {span.totalGaps}{" "}
    {span.totalGaps === 1 ? "brecha a la vista" : "brechas a la vista"}
    {span.narrowed &&
      `. Los totales cuentan sólo las ${span.skills.length} habilidades visibles, de ${span.totalSkills}.`}
  </p>
);
