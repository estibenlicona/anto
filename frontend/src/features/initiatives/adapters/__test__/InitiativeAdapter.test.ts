import { describe, it, expect } from "vitest";
import { STATUS_LABELS, STATUS_VARIANTS } from "../InitiativeAdapter";

describe("los estados de una iniciativa", () => {
  it("le da a cada estado un color propio", () => {
    const variantes = Object.values(STATUS_VARIANTS);
    // "En evaluación" y "Cerrada" compartían el neutro, y son los dos extremos
    // del ciclo: una espera evaluación y la otra ya terminó. Con el mismo
    // color, distinguirlas dependía de leer la etiqueta.
    expect(new Set(variantes).size).toBe(variantes.length);
  });

  it("marca lo que está en curso con el mismo rol que la evaluación de una persona", () => {
    // "En curso" en la evaluación de una persona usa `info`: algo en proceso
    // se dice igual en las dos pantallas.
    expect(STATUS_VARIANTS.Evaluating).toBe("info");
    // Y el estado terminal se queda en neutro, que es lo que le corresponde a
    // algo que no pide nada.
    expect(STATUS_VARIANTS.Closed).toBe("neutral");
  });

  it("tiene un color por cada estado que sabe nombrar", () => {
    // La comprobación va sobre el mapa y no sobre una fila del listado: así
    // vale para el listado y para la cabecera de la evaluación a la vez.
    expect(Object.keys(STATUS_VARIANTS).sort()).toEqual(
      Object.keys(STATUS_LABELS).sort()
    );
  });
});
