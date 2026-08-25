/**
 * Las dos cuentas de FTE que comparten los mocks que agregan capacidad
 * —la Torre de control, el listado de Células y las Líneas de expertise—.
 *
 * Existen acá, y no copiadas en cada handler, porque las tres pantallas
 * responden la misma pregunta sobre la misma gente: si cada una tuviera su
 * propia fórmula, discreparían en cuanto una de las tres cambiara.
 */

/** Un decimal, que es la precisión con la que se muestra el FTE. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * FTE disponible de un conjunto de personas: la suma de lo que cada una
 * declara.
 */
export function availableFteOf(people: { availableFte: number }[]): number {
  return round1(people.reduce((acc, p) => acc + p.availableFte, 0));
}

/**
 * FTE asignado de un conjunto de asignaciones: Σ dedicación / 100.
 *
 * Ojo con esta cuenta: **no mira el `availableFte` de la persona**. Alguien de
 * 0.8 FTE asignado al 100 % aporta 1.0, no 0.8. Como el disponible sí suma
 * `availableFte`, el asignado puede terminar por encima del disponible (por eso
 * `freeFte` acota en cero, y por eso una célula de gente part-time lee "al
 * tope" fácilmente).
 *
 * Es el criterio que la Torre y el listado de Células ya venían usando, y se
 * mantiene tal cual a propósito: cambiarlo mueve los números de esas dos
 * pantallas, así que es un cambio propio, no un efecto colateral de otro. Que
 * la fórmula viva acá es lo que hace que ese día sea un solo lugar.
 */
export function allocatedFteOf(
  allocations: { dedicationPercentage: number }[]
): number {
  return fteOfPercentages(allocations.map((a) => a.dedicationPercentage));
}

/**
 * La cuenta de `allocatedFteOf` sobre una lista de porcentajes cualquiera, para
 * los desgloses que no son la dedicación total (BAU, Transformación).
 */
export function fteOfPercentages(percentages: number[]): number {
  return round1(percentages.reduce((acc, p) => acc + p / 100, 0));
}

/** Lo que queda libre, nunca en negativo. Ver la nota de `allocatedFteOf`. */
export function freeFteOf(available: number, allocated: number): number {
  return round1(Math.max(available - allocated, 0));
}
