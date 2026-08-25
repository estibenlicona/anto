/**
 * Palabras que no aportan a una sigla. Van en minúscula y sin tilde porque la
 * comparación normaliza antes: son conectores, no nombres.
 *
 * La lista es corta a propósito. Cuanto más larga, más probable es que se coma
 * una palabra que sí distinguía dos habilidades.
 */
const CONECTORES = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "y",
  "e",
  "en",
  "para",
  "con",
  "a",
]);

/** Sin tildes y en minúscula, sólo para decidir si una palabra es conector. */
function normalizar(palabra: string): string {
  return palabra
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * La sigla de dos letras con la que una habilidad se identifica en una columna
 * angosta: las iniciales de sus dos primeras palabras significativas, o sus dos
 * primeras letras cuando es una sola palabra.
 *
 *   "React"              → "RE"
 *   "Node.js"            → "NO"   (la puntuación no parte la palabra)
 *   "Trabajo en equipo"  → "TE"   (el conector no cuenta)
 *   "SQL"                → "SQ"
 *
 * Es derivada y no un campo del catálogo: una abreviatura escrita a mano es un
 * dato más que nadie recuerda llenar al crear una habilidad, y termina con dos
 * criterios conviviendo. El costo es que dos nombres pueden colisionar
 * ("React" y "Redux" dan "RE"), y se asume porque **la sigla ubica la columna,
 * no la identifica**: el nombre completo va en el tooltip, en el nombre
 * accesible de la columna y en el detalle de la celda.
 */
export function skillInitials(name: string): string {
  // Sólo el espacio separa palabras. La puntuación se limpia dentro de cada
  // una: "Node.js" es un nombre, no dos, y partirlo daría "NJ".
  const palabras = name
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);

  if (palabras.length === 0) return "";

  const significativas = palabras.filter((p) => !CONECTORES.has(normalizar(p)));
  // Un nombre hecho sólo de conectores es raro, pero no un motivo para
  // devolver vacío.
  const base = significativas.length > 0 ? significativas : palabras;

  if (base.length >= 2) {
    return (base[0][0] + base[1][0]).toUpperCase();
  }
  // Una sola palabra: sus dos primeras letras. Con una sola letra, esa letra —
  // rellenar con algo inventado diría más de lo que el nombre dice.
  return base[0].slice(0, 2).toUpperCase();
}
