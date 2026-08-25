import { identityColorNames, type IdentityColorName } from "@tuya-ui/tokens";

/**
 * El vocabulario de color de identidad: sirve para distinguir a una persona de
 * otra y no significa nada más.
 *
 * Es un tipo aparte de `CategoricalColor` a propósito, aunque los dos sean
 * "una lista de colores sin semántica de estado". Responden preguntas
 * distintas: `CategoricalColor` distingue *categorías* dentro de un conjunto
 * conocido — las series de un gráfico, los tipos de una etiqueta — y sus seis
 * tonos mapean uno a uno contra familias semánticas de la paleta. Éste
 * distingue *individuos* de un conjunto abierto, y sus colores no mapean
 * contra nada.
 *
 * Fusionarlos dejaría que `Tag` pidiera "cranberry" y que `Avatar` pidiera
 * "danger": la primera combinación no tiene sentido y la segunda afirmaría que
 * una persona es un estado de error.
 */
export type { IdentityColorName };
export { identityColorNames };

/**
 * Reparte un identificador entre los colores disponibles, siempre igual.
 *
 * Es un hash FNV-1a de 32 bits: se elige por ser estable entre ejecuciones y
 * entre plataformas, que es lo que hace cierta la promesa de "el mismo color
 * para siempre". Algo como `String.prototype.hashCode` o el orden de llegada
 * no lo serían.
 *
 * La entrada debe ser un identificador **inmutable** de la persona. Pasarle el
 * nombre o el correo hace que el color cambie cuando esos datos se corrigen,
 * que es justo lo que este reparto existe para evitar.
 */
export function identityColorFor(id: string): IdentityColorName {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    // El desplazamiento equivale a multiplicar por el primo 16777619 sin
    // desbordar a punto flotante; `>>> 0` lo devuelve a entero sin signo.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return identityColorNames[hash % identityColorNames.length];
}
