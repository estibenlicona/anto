import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { LevelMeter } from "./level-meter";
import { accentTones, type AccentTone } from "@/lib/accent-tone";

/**
 * La escala es cerrada de cuatro y se pide por nombre, no por número. El
 * número (1–4) es una convención del backend de cada aplicación; traducirlo es
 * trabajo del consumidor, y aceptarlo acá ataría el sistema de diseño a un
 * esquema de datos ajeno.
 *
 * El orden importa: la posición en esta lista es la que llena los segmentos y
 * la que elige el matiz.
 */
export const seniorityLevels = ["Principiante", "Competente", "Avanzado", "Experto"] as const;

export type SeniorityLevel = (typeof seniorityLevels)[number];

export type SeniorityCardDensity = "comfortable" | "compact";

const STEPS = seniorityLevels.length;

/** Etiqueta del estado vacío. No es un quinto nivel: es la ausencia de dato. */
const EMPTY_LABEL = "Sin nivel";

/**
 * El alto sale de la capa de token de componente. No hay padding horizontal:
 * sin caja que dibujar, el contenido ocupa el ancho fijo entero, y eso es lo
 * que deja los medidores de filas distintas alineados borde con borde. El
 * vertical tampoco hace falta — el alto es fijo y el contenido va centrado.
 */
const densityHeight: Record<SeniorityCardDensity, string> = {
  comfortable: "h-seniority-card",
  compact: "h-seniority-card-compact",
};

/** Resuelve el nivel recibido a su posición y su matiz, o al estado vacío. */
function resolveLevel(level: string | null | undefined) {
  const index = seniorityLevels.indexOf(level as SeniorityLevel);
  if (index === -1) {
    return { known: false as const, filled: 0, tone: undefined, label: EMPTY_LABEL };
  }
  return {
    known: true as const,
    filled: index + 1,
    tone: accentTones[index] as AccentTone,
    label: seniorityLevels[index],
  };
}

export interface SeniorityCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  /**
   * Nivel de la escala Tuya. Un valor fuera de la escala —incluido `null`, que
   * es como llega una persona sin nivel asignado— renderiza el estado vacío en
   * vez de inventar un tono o fallar en silencio.
   */
  level: SeniorityLevel | string | null;
  /** Alto de la pieza. `compact` es la que va dentro de una fila de tabla. */
  density?: SeniorityCardDensity;
  /**
   * Oculta la etiqueta y deja sólo el medidor, en un ancho reducido propio. El
   * nombre del nivel no se pierde: viaja en el nombre accesible y en el
   * tooltip, porque el color nunca es el único canal.
   */
  hideLabel?: boolean;
}

/**
 * El nivel de seniority de una persona, comparable entre filas.
 *
 * **No es una superficie**, pese al nombre. No dibuja fondo, ni borde, ni
 * sombra: se apoya en lo que la contenga. Por eso tampoco compone `Card`, que
 * existe justamente para aportar esos tres — usarla para después apagarlos
 * sería tomar una pieza por su caja y luego negarla. El nombre se conserva
 * porque así llama la definición a este patrón.
 *
 * Lo único que agrega sobre `LevelMeter` es la correspondencia entre los cuatro
 * niveles y los cuatro matices, que avanza de gris a morado para leerse como
 * avance de dominio y no como escala de riesgo.
 *
 * La etiqueta va en texto neutro en los cuatro niveles: el matiz vive
 * únicamente en el medidor. Además de ser lo que el diseño pide, eso saca el
 * contraste del texto de la ecuación — es el token de texto del sistema, ya
 * verificado, y no cuatro colores que haya que medir contra cada fondo.
 *
 * El ancho y el alto son fijos y no dependen del nivel ni de la longitud de la
 * etiqueta — ése es el punto. Un ancho que siguiera al texto haría que
 * "Experto" y "Principiante" ocuparan distinto, y la comparación entre filas,
 * que es para lo que existe la pieza, dejaría de ser una comparación.
 */
export function SeniorityCard({
  level,
  density = "comfortable",
  hideLabel = false,
  className,
  ...props
}: SeniorityCardProps) {
  const { known, filled, tone, label } = resolveLevel(level);

  return (
    <div
      // `title` da el tooltip nativo y `aria-label` el nombre accesible: los
      // dos hacen falta cuando la etiqueta no se ve, y no molestan cuando sí.
      title={label}
      aria-label={label}
      className={cn(
        // `box-border` explícito: el alto de la capa de token es la medida
        // final de la pieza, no la de su contenido.
        "box-border flex flex-col justify-center gap-hug",
        hideLabel ? "w-seniority-card-narrow" : "w-seniority-card",
        densityHeight[density],
        className,
      )}
      {...props}
    >
      {!hideLabel && (
        <span
          className={cn(
            // `text-label` es el paso más chico de la escala, pero viene armado
            // para rúbricas en mayúscula (semibold + tracking). Acá se toma
            // sólo su tamaño y se neutralizan las otras dos.
            "truncate text-label font-medium tracking-normal",
            known ? "text-neutral-default" : "text-neutral-subtle",
          )}
        >
          {label}
        </span>
      )}
      {known ? (
        <LevelMeter value={filled} steps={STEPS} tone={tone} />
      ) : (
        /**
         * El estado vacío conserva la dimensión y los cuatro segmentos en cero:
         * una fila sin dato no puede desalinear la columna, que es de lo que se
         * trata todo esto. No lleva `role="meter"` porque no hay posición que
         * anunciar — un medidor en cero afirmaría que la persona está en el
         * primer paso de la escala.
         */
        <div aria-hidden="true" className="flex w-full gap-hug">
          {Array.from({ length: STEPS }, (_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-pill border-default border-neutral-default bg-neutral-default"
            />
          ))}
        </div>
      )}
    </div>
  );
}
