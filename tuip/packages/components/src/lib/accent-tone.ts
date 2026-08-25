/**
 * El vocabulario de tonos de acento: nombres para los pasos de una escala
 * ordinal, sin significado de estado atado a ninguno.
 *
 * Es un vocabulario distinto del categórico de `categorical-color.ts`, y la
 * diferencia no es de tonos sino de pregunta. El categórico responde "¿es éste
 * el mismo que aquél?" y por eso sus nombres no tienen orden: `blue` no está ni
 * antes ni después de `green`. Éste responde "¿cuánto?" y sí lo tiene: el orden
 * en que están escritos abajo es el de la escala, de menor a mayor —celeste,
 * azul, violeta, magenta—, y quien lo reordene le cambia el tono a todos los
 * pasos. Los nombres dicen el matiz: un token que se llame distinto de como
 * pinta mentiría.
 *
 * Donde el color sí signifique estado —un error, una advertencia— lo que
 * corresponde son los roles semánticos, no esto. Y donde el color va sobre
 * texto, tampoco: la paleta de acento sólo tiñe elementos gráficos.
 */
export type AccentTone = "sky" | "blue" | "violet" | "magenta";

/**
 * El orden de la escala. Un medidor de cuatro pasos toma el matiz que le
 * corresponde a su posición de acá.
 */
export const accentTones: AccentTone[] = ["sky", "blue", "violet", "magenta"];
