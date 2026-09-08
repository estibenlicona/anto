import { describe, it, expect } from "vitest";
import { countMissingRequiredFields, validate } from "../teamFormValidation";
import type { TeamFormValues } from "../../adapters/TeamAdapter";

const validValues: TeamFormValues = {
  name: "Ecosistema Digital",
  description: "",
};

describe("teamFormValidation validate", () => {
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

  it("rejects a name longer than 100 characters", () => {
    const errors = validate({ ...validValues, name: "a".repeat(101) });
    expect(errors.name).toBe("El nombre no puede superar los 100 caracteres");
  });

  it("accepts a name at exactly the 100 character limit", () => {
    const errors = validate({ ...validValues, name: "a".repeat(100) });
    expect(errors.name).toBeUndefined();
  });

  it("rejects a description longer than 500 characters", () => {
    const errors = validate({ ...validValues, description: "a".repeat(501) });
    expect(errors.description).toBe(
      "La descripción no puede superar los 500 caracteres"
    );
  });

  it("accepts an empty description", () => {
    expect(
      validate({ ...validValues, description: "" }).description
    ).toBeUndefined();
  });
});

describe("teamFormValidation countMissingRequiredFields", () => {
  it("cuenta sólo el nombre; la descripción no es obligatoria", () => {
    expect(countMissingRequiredFields(validValues)).toBe(0);
    expect(countMissingRequiredFields({ ...validValues, name: "" })).toBe(1);
    expect(countMissingRequiredFields({ ...validValues, name: "   " })).toBe(1);
  });
});
