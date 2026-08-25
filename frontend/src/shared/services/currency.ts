/**
 * Pesos colombianos en un campo de texto.
 *
 * El campo del costo era `type="number"`, que no admite separadores: quien
 * escribe siete cifras no puede contarlas sin salir del campo. Con texto sí se
 * puede, pero obliga a separar **lo que se ve** de **lo que se envía**: el
 * formulario guarda los dígitos y el backend los recibe como número, sin
 * puntos. Es la parte que se rompe callada — la pantalla se ve bien y el valor
 * guardado es otro.
 */

/** Los dígitos de lo que alguien escribió; descarta puntos, espacios y letras. */
export function onlyDigits(text: string): string {
  return text.replace(/\D/g, "");
}

/**
 * Agrupa de a tres con punto, que es como se escribe una cifra en Colombia:
 * `7900000` → `7.900.000`. Sin dígitos devuelve vacío, para que el campo
 * quede en blanco y no en un cero que nadie escribió.
 */
export function formatThousands(digits: string): string {
  const limpio = onlyDigits(digits);
  if (limpio === "") return "";
  return Number(limpio).toLocaleString("es-CO");
}
