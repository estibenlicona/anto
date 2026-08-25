import { describe, it, expect } from "vitest";
import { formatThousands, onlyDigits } from "../currency";

/**
 * Lo que se ve lleva puntos; lo que se envía, no. Es la parte que se rompe
 * callada: la pantalla se ve bien y el valor guardado es otro.
 */
describe("el costo en pesos", () => {
  it("agrupa de a tres, que es como se escribe una cifra acá", () => {
    expect(formatThousands("7900000")).toBe("7.900.000");
    expect(formatThousands("500")).toBe("500");
    expect(formatThousands("1234")).toBe("1.234");
  });

  it("deja el campo en blanco sin dígitos, en vez de un cero que nadie escribió", () => {
    expect(formatThousands("")).toBe("");
    expect(formatThousands("abc")).toBe("");
  });

  it("devuelve los dígitos de lo que se escribió, con formato o sin él", () => {
    // Es lo que viaja al backend: el número, no el texto con puntos.
    expect(onlyDigits("7.900.000")).toBe("7900000");
    expect(onlyDigits("$ 7.900.000 COP")).toBe("7900000");
    expect(onlyDigits("")).toBe("");
  });

  it("sobrevive a escribir y volver a leer sin cambiar la cifra", () => {
    // Siete cifras: el caso que el campo numérico no podía mostrar y que un
    // formateo mal hecho trunca sin avisar.
    const escrito = "12000000";
    expect(onlyDigits(formatThousands(escrito))).toBe(escrito);
    expect(Number(onlyDigits(formatThousands(escrito)))).toBe(12000000);
  });
});
