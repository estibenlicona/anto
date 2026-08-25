import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { AccentTone } from "@/lib/accent-tone";

/**
 * Igual que en `card.tsx`: escrito completo porque Tailwind genera la clase
 * sólo si encuentra el nombre entero en el código.
 */
const filledClasses: Record<AccentTone, string> = {
  sky: "bg-accent-sky-fill",
  blue: "bg-accent-blue-fill",
  violet: "bg-accent-violet-fill",
  magenta: "bg-accent-magenta-fill",
};

export interface LevelMeterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Posición alcanzada dentro de la escala. Se recorta al rango `0..steps`. */
  value: number;
  /**
   * Cantidad de pasos de la escala. Cuatro por defecto, que es la escala más
   * común del sistema; una de cinco pasos se pide acá y no bifurcando el
   * componente.
   */
  steps?: number;
  /**
   * Matiz de los segmentos llenos. Los vacíos no lo usan: son la superficie
   * neutra con su aro, para que se lean igual sobre cualquier fondo del sistema.
   */
  tone: AccentTone;
  /**
   * Posición esperada dentro de la misma escala: hasta dónde debería llegar.
   * Cuando se pasa, el medidor dibuja una marca en el **límite** de ese paso —
   * "hasta acá", no "en este escalón"— y la anuncia junto a la alcanzada. Sin
   * ella el medidor se dibuja como si esta opción no existiera.
   *
   * Se recorta al rango `1..steps`: un cero no tiene límite que marcar, y es
   * la forma de decir "no se espera nada" sin condicionar la llamada.
   */
  expected?: number;
  /**
   * Nombre accesible del medidor. Sin él, el valor se anuncia sin decir de qué
   * escala es — pásalo salvo que el contenedor ya lo nombre.
   */
  label?: string;
}

/**
 * El medidor de una escala ordinal cerrada: tantos segmentos como pasos tenga
 * la escala, todos del mismo ancho, llenos hasta la posición alcanzada.
 *
 * Es la pieza opuesta a `SegmentedBar`, y conviene no confundirlas. Allá los
 * segmentos son desiguales porque su ancho *es* el dato: reparten un total
 * entre categorías. Acá son iguales a propósito, porque el dato no es el ancho
 * sino cuántos están llenos — y un segmento más ancho que otro sugeriría que
 * un paso de la escala vale más que el siguiente, que es justo lo que una
 * escala ordinal no dice.
 *
 * Los vacíos llevan aro y no relleno, y es lo único que los hace visibles: su
 * relleno es la misma superficie neutra que tienen debajo, así que sin trazo no
 * habría nada que ver. El aro es el borde neutro fuerte, que ya cambia solo
 * entre temas y llega a 4:1 o más contra las cuatro superficies donde el
 * medidor puede caer.
 */
export function LevelMeter({
  value,
  steps = 4,
  tone,
  expected,
  label,
  className,
  ...props
}: LevelMeterProps) {
  const total = Math.max(1, Math.trunc(steps));
  const filled = Math.min(Math.max(Math.trunc(value), 0), total);
  const target =
    expected === undefined ? undefined : Math.min(Math.max(Math.trunc(expected), 0), total);
  // El límite del paso esperado es el borde derecho de ese segmento, así que la
  // marca cuelga del segmento `target - 1`. Con `target` en cero no hay
  // límite que marcar y el medidor queda exactamente como antes.
  const markedIndex = target === undefined || target < 1 ? -1 : target - 1;

  return (
    <div
      // `meter` y no `progressbar`: esto no avanza hacia una meta, es una
      // posición dentro de un rango conocido. `aria-valuetext` va igual, para
      // que la lectura sea "3 de 4" y no un número suelto donde el rol no
      // termine de mapearse.
      role="meter"
      aria-label={label}
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext={
        markedIndex < 0
          ? `${filled} de ${total}`
          : `${filled} de ${total}, se esperan ${target}`
      }
      className={cn("flex w-full gap-hug", className)}
      {...props}
    >
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={cn(
            "relative h-1.5 flex-1 rounded-pill",
            // El aro va en los dos: visible en el vacío, transparente en el
            // lleno. No es decoración de más — una posición absoluta se mide
            // desde la caja de relleno, así que sin el aro en ambos la marca
            // del umbral caería 1px distinto según el segmento estuviera lleno
            // o vacío, y se correría sola al cruzar el valor esperado.
            "border-default",
            index < filled
              ? `border-transparent ${filledClasses[tone]}`
              : "border-neutral-bold bg-neutral-default",
          )}
        >
          {index === markedIndex ? (
            <span
              aria-hidden="true"
              className={cn(
                // Absoluta y colgada del borde derecho: no ocupa lugar en el
                // reparto, así que los segmentos miden lo mismo con marca y sin
                // ella. Un trazo recto y angosto contra segmentos con forma de
                // píldora — la diferencia es de forma, no sólo de color.
                "absolute -inset-y-0.5 w-0.5 bg-neutral-bold",
                // Media separación, más media marca, más el aro que todos los
                // segmentos llevan: así queda centrada en el hueco entre un
                // paso y el siguiente, a 1px de cada uno y sin taparlos. La
                // separación entra como el token que la define, no como un
                // número suelto que se desalinearía si esa medida cambiara.
                index < total - 1 && "-right-[calc(var(--space-hug)/2+2px)]",
                // En el último paso no hay separación después: ahí la marca se
                // apoya adentro, porque salirse del ancho del medidor la
                // recortaría.
                index === total - 1 && "right-0",
              )}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
