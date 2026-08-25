import React from "react";
import { LevelMeter } from "@tuya-ui/components";
import type { PlanSkillView } from "../adapters/PersonPlanAdapter";

interface PlanSkillMeterProps {
  skill: PlanSkillView;
}

const TONES = ["sky", "blue", "violet", "magenta"] as const;

/**
 * El medidor con la marca de lo que el cargo pide encima.
 *
 * Acá la marca sí dice la verdad, al revés que en la matriz del span: dentro
 * de una persona el cargo es uno solo, así que una línea por habilidad compara
 * contra algo real. En el span, con cargos mezclados, sería falsa.
 *
 * La marca la dibuja el propio medidor (`expected`). Antes se dibujaba acá
 * con un porcentaje sobre el ancho, y esa cuenta estaba mal: no descontaba
 * las separaciones entre segmentos, así que la línea caía corrida y el error
 * crecía hacia la derecha.
 */
export const PlanSkillMeter: React.FC<PlanSkillMeterProps> = ({ skill }) => (
  <span className="block" style={{ width: "96px" }}>
    <LevelMeter
      value={skill.level}
      tone={TONES[skill.level - 1]}
      expected={skill.expectedLevel ?? undefined}
      // El nombre accesible dice los dos niveles con su nombre. El medidor
      // agrega la forma numérica ("2 de 4, se esperan 3"); acá interesa la
      // legible, que es como la pantalla nombra los niveles en todos lados.
      label={`${skill.levelLabel}${
        skill.expectedLabel ? `, su cargo pide ${skill.expectedLabel}` : ""
      }`}
    />
  </span>
);
