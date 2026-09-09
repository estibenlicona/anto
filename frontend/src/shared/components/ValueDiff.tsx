import React from "react";
import { Icon } from "@tuya-ui/components";

export type ValueDiffKind = "agregado" | "quitado" | "cambiado";

export interface ValueDiffProps {
  /** Cómo estaba. Nulo cuando el elemento se agregó. */
  before: string | null;
  /** Cómo queda. Nulo cuando el elemento se quitó. */
  after: string | null;
  kind: ValueDiffKind;
  /** Qué elemento es, para el nombre accesible. */
  label: string;
  className?: string;
}

const VERB: Record<ValueDiffKind, string> = {
  agregado: "se agregó",
  quitado: "se quitó",
  cambiado: "pasa de",
};

/**
 * Un cambio de valor: cómo estaba y cómo queda, con la flecha en el medio.
 *
 * **Propuesta de componente de tuip** (`value-diff.tsx`). Vive acá y no en el
 * catálogo porque tuip se consume como tarball local y promoverlo pide
 * republicar el paquete.
 *
 * No se compone con lo que hay. Dos `Tag` con una flecha entre medio es
 * justamente lo que hay que escribir a mano cada vez, y ninguno de los dos
 * lados debe leerse como una etiqueta de estado; el valor viejo, además, va
 * tachado, que es lo que hace innecesario leer la flecha para saber cuál es
 * cuál.
 *
 * La flecha es decorativa: el nombre accesible dice «pasa de X a Y», que es lo
 * que un lector de pantalla necesita oír.
 */
export const ValueDiff: React.FC<ValueDiffProps> = ({
  before,
  after,
  kind,
  label,
  className = "",
}) => {
  const spoken =
    kind === "cambiado"
      ? `${label}: pasa de ${before} a ${after}`
      : `${label}: ${VERB[kind]} ${after ?? before}`;

  return (
    <span
      className={`flex flex-wrap items-center gap-2 text-body-sm ${className}`}
      role="group"
      aria-label={spoken}
    >
      {before !== null && (
        <span
          aria-hidden="true"
          className="rounded-control bg-neutral-subtle px-2 py-0.5 font-mono tabular-nums text-neutral-subtle line-through"
        >
          {before}
        </span>
      )}
      {before !== null && after !== null && (
        <Icon
          name="chevron-right"
          size={16}
          aria-hidden="true"
          className="flex-none text-neutral-subtle"
        />
      )}
      {after !== null && (
        <span
          aria-hidden="true"
          className="rounded-control bg-neutral-subtle px-2 py-0.5 font-mono tabular-nums text-neutral-default"
        >
          {after}
        </span>
      )}
    </span>
  );
};
