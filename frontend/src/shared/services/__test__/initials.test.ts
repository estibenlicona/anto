import { describe, it, expect } from "vitest";
import { skillInitials } from "../initials";

describe("skillInitials", () => {
  it("de una sola palabra toma sus dos primeras letras", () => {
    expect(skillInitials("React")).toBe("RE");
    expect(skillInitials("SQL")).toBe("SQ");
  });

  it("de una frase toma las iniciales de sus dos primeras palabras", () => {
    expect(skillInitials("Arquitectura de software")).toBe("AS");
    expect(skillInitials("Pensamiento crítico aplicado")).toBe("PC");
  });

  it("ignora los conectores al elegir las dos palabras", () => {
    // Sin esto daría "TE" en un caso y "TD" en otro según dónde caiga el
    // conector, y dos nombres parecidos se abreviarían con criterios distintos.
    // "Trabajo en equipo" da TE con o sin la regla, así que no sirve de
    // testigo: el caso que la distingue es el conector en medio de las dos
    // palabras que sí importan.
    expect(skillInitials("Ciclo de vida del software")).toBe("CV");
    expect(skillInitials("Trabajo en equipo")).toBe("TE");
    expect(skillInitials("Diseño de sistemas distribuidos")).toBe("DS");
  });

  it("no parte un nombre por su puntuación", () => {
    // "Node.js" es un nombre, no dos palabras: partirlo daría "NJ".
    expect(skillInitials("Node.js")).toBe("NO");
    expect(skillInitials("C++")).toBe("C");
  });

  it("con una sola letra devuelve esa letra, sin inventar la segunda", () => {
    expect(skillInitials("R")).toBe("R");
  });

  it("tolera espacios de más y un nombre vacío", () => {
    expect(skillInitials("  Cloud   computing ")).toBe("CC");
    expect(skillInitials("   ")).toBe("");
  });

  it("siempre devuelve mayúsculas, venga como venga el nombre", () => {
    expect(skillInitials("testing automatizado")).toBe("TA");
  });
});
