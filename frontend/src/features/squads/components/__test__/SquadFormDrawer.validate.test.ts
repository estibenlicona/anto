import { describe, it, expect } from "vitest";
import { countMissingRequiredFields, validate } from "../squadFormValidation";
import type { SquadFormValues } from "../../adapters/SquadAdapter";

/**
 * Prueba la validación de `SquadFormDrawer` como función pura, en vez de
 * montar el `Modal` en jsdom: `Modal` cuelga de `@radix-ui/react-dialog`,
 * que a su vez requiere `react-remove-scroll` — un paquete CJS sin mapa de
 * "exports" que, dentro del monorepo (tuip vinculado por `link:`), termina
 * resuelto por Node puro y no por el resolver de Vite, cargando una copia de
 * React distinta a la del test y rompiendo los hooks ("Invalid hook call").
 * No se encontró una combinación de config de Vitest que lo evite: los
 * flujos que dependen de montar el Modal (alta/edición/borrado completos)
 * se verifican manualmente en el navegador (ver tasks.md, 7.2).
 */
const validValues: SquadFormValues = {
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High",
  description: "",
};

describe("SquadFormDrawer validate", () => {
  it("returns no errors for valid values", () => {
    expect(validate(validValues)).toEqual({});
  });

  it("requires a name", () => {
    expect(validate({ ...validValues, name: "" }).name).toBe(
      "El nombre es obligatorio"
    );
    expect(validate({ ...validValues, name: "   " }).name).toBe(
      "El nombre es obligatorio"
    );
  });

  it("rejects a name longer than 200 characters", () => {
    const errors = validate({ ...validValues, name: "a".repeat(201) });
    expect(errors.name).toBe("El nombre no puede superar los 200 caracteres");
  });

  it("accepts a name at exactly the 200 character limit", () => {
    const errors = validate({ ...validValues, name: "a".repeat(200) });
    expect(errors.name).toBeUndefined();
  });

  it("requires a team", () => {
    expect(validate({ ...validValues, team: "" }).team).toBe(
      "El equipo es obligatorio"
    );
  });

  it("rejects a team longer than 100 characters", () => {
    const errors = validate({ ...validValues, team: "a".repeat(101) });
    expect(errors.team).toBe("El equipo no puede superar los 100 caracteres");
  });

  it("requires a criticality", () => {
    expect(validate({ ...validValues, criticality: "" }).criticality).toBe(
      "Selecciona una criticidad"
    );
  });

  it("rejects a description longer than 500 characters", () => {
    const errors = validate({
      ...validValues,
      description: "a".repeat(501),
    });
    expect(errors.description).toBe(
      "La descripción no puede superar los 500 caracteres"
    );
  });

  it("accepts an empty description", () => {
    const errors = validate({ ...validValues, description: "" });
    expect(errors.description).toBeUndefined();
  });
});

describe("SquadFormDrawer countMissingRequiredFields", () => {
  const base: SquadFormValues = {
    name: "Backend",
    team: "Digital",
    criticality: "High",
    description: "",
  };

  it("cuenta nombre, equipo y criticidad; la descripción no es obligatoria", () => {
    expect(countMissingRequiredFields(base)).toBe(0);
    expect(countMissingRequiredFields({ ...base, team: "  " })).toBe(1);
    expect(
      countMissingRequiredFields({
        ...base,
        name: "",
        team: "",
        criticality: "",
      })
    ).toBe(3);
  });
});
