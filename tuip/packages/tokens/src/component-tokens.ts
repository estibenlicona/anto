/**
 * La tercera capa: tokens propios de un componente, para la excepción que la
 * capa semántica no cubre. Son deliberadamente pocos, y que se vuelvan muchos
 * es la señal de que a la capa semántica le falta algo — no una invitación a
 * seguir agregando acá.
 *
 * Todo lo que vive en este archivo tiene que justificar por qué no sale de una
 * escala existente.
 */

/**
 * La card de seniority se mide, no se acomoda: su ancho es el mismo para los
 * cuatro niveles y no depende de la longitud de la etiqueta. Ése es el punto
 * del componente —que el nivel de una fila se compare con el de otra— y un
 * ancho que siguiera al texto lo convertiría en una comparación falsa.
 *
 * Ninguna de las cuatro medidas sale de una escala del sistema, y por eso están
 * acá en vez de en `layout.ts`:
 *
 * - `width` (116px) es la medida validada por diseño; entra «Principiante» sin
 *   recorte y las etiquetas cortas dejan aire.
 * - `height` (44px) coincide exactamente con `touchTarget`, que no es
 *   casualidad útil sino la razón por la que la densidad amplia es la que va en
 *   un formulario: ahí la card es el control.
 * - `heightCompact` (36px) es el único valor que no coincide con nada del
 *   sistema — cae entre `controlHeight.sm` (32px) y `controlHeight.md` (40px).
 *   Si aparece un segundo componente que necesite este alto, lo correcto es
 *   extender `controlHeight`, no copiar el valor.
 * - `widthNarrow` (72px) es la variante que omite la etiqueta y deja sólo el
 *   medidor; el nombre del nivel viaja entonces por el nombre accesible.
 */
export const seniorityCard = {
  width: "116px",
  widthNarrow: "72px",
  height: "44px",
  heightCompact: "36px",
} as const;

/** Todos los tokens de componente, agrupados por el componente que los define. */
export const componentSize = {
  seniorityCard,
} as const;
