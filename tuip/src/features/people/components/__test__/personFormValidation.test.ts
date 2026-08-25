import { describe, it, expect } from "vitest";
import { countMissingRequiredFields, validate } from "../personFormValidation";
import type { PersonFormValues } from "../../adapters/PersonAdapter";

const validValues: PersonFormValues = {
  name: "María González",
  documentId: "1036884001",
  userPrincipalName: "maria.gonzalez@tuya.com",
  position: "Backend Dev",
  role: "Contributor" as const,
  technicalLeadId: "",
  seniority: "3",
  modality: "Hybrid",
  availableFte: "1",
  monthlyCost: "7900000",
  startDate: "2023-03-01",
  isExternal: false,
  providerId: "",
};

describe("personFormValidation", () => {
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

  it("requires a document id within 50 characters", () => {
    expect(validate({ ...validValues, documentId: "" }).documentId).toBe(
      "El documento es obligatorio"
    );
    expect(
      validate({ ...validValues, documentId: "a".repeat(51) }).documentId
    ).toBe("El documento no puede superar los 50 caracteres");
  });

  it("requires a user principal name within 250 characters", () => {
    expect(
      validate({ ...validValues, userPrincipalName: "" }).userPrincipalName
    ).toBe("El usuario principal es obligatorio");
    expect(
      validate({ ...validValues, userPrincipalName: "a".repeat(251) })
        .userPrincipalName
    ).toBe("El usuario principal no puede superar los 250 caracteres");
  });

  it("requires a position within 100 characters", () => {
    expect(validate({ ...validValues, position: "" }).position).toBe(
      "El cargo es obligatorio"
    );
    expect(
      validate({ ...validValues, position: "a".repeat(101) }).position
    ).toBe("El cargo no puede superar los 100 caracteres");
  });

  it("requires a role from the catalog", () => {
    // Sin largo máximo: el rol dejó de escribirse a mano, así que lo único que
    // puede faltar es la elección.
    expect(validate({ ...validValues, role: "" }).role).toBe(
      "Selecciona un rol"
    );
    expect(
      validate({ ...validValues, role: "TechnicalLead" }).role
    ).toBeUndefined();
  });

  it("requires a seniority", () => {
    expect(validate({ ...validValues, seniority: "" }).seniority).toBe(
      "Selecciona una seniority"
    );
  });

  it("requires a modality", () => {
    expect(validate({ ...validValues, modality: "" }).modality).toBe(
      "Selecciona una modalidad"
    );
  });

  it("requires a start date", () => {
    expect(validate({ ...validValues, startDate: "" }).startDate).toBe(
      "La fecha de inicio es obligatoria"
    );
  });

  it("requires an available FTE between 0.0 and 1.0", () => {
    expect(validate({ ...validValues, availableFte: "" }).availableFte).toBe(
      "El FTE disponible es obligatorio"
    );
    expect(validate({ ...validValues, availableFte: "1.5" }).availableFte).toBe(
      "El FTE disponible debe estar entre 0.0 y 1.0"
    );
    expect(
      validate({ ...validValues, availableFte: "-0.1" }).availableFte
    ).toBe("El FTE disponible debe estar entre 0.0 y 1.0");
  });

  it("requires a non-negative monthly cost", () => {
    expect(validate({ ...validValues, monthlyCost: "" }).monthlyCost).toBe(
      "El costo mensual es obligatorio"
    );
    expect(validate({ ...validValues, monthlyCost: "-1" }).monthlyCost).toBe(
      "El costo mensual no puede ser negativo"
    );
  });

  it("validates the cost as a number, not as the text with separators", () => {
    // El campo muestra "7.900.000" y guarda "7900000": si la validación
    // mirara el texto, `Number("7.900.000")` sería NaN y una cifra válida
    // quedaría rechazada como obligatoria.
    expect(
      validate({ ...validValues, monthlyCost: "7900000" }).monthlyCost
    ).toBeUndefined();
    expect(
      validate({ ...validValues, monthlyCost: "7.900.000" }).monthlyCost
    ).toBe("El costo mensual es obligatorio");
  });

  it("requires a provider when marked as external", () => {
    expect(
      validate({ ...validValues, isExternal: true, providerId: "" }).providerId
    ).toBe("Selecciona un proveedor");
  });

  it("does not require a provider when internal", () => {
    expect(
      validate({ ...validValues, isExternal: false, providerId: "" }).providerId
    ).toBeUndefined();
  });

  it("accepts a provider when marked as external", () => {
    expect(
      validate({ ...validValues, isExternal: true, providerId: "c1" })
        .providerId
    ).toBeUndefined();
  });
});

describe("countMissingRequiredFields", () => {
  it("returns 0 for a fully valid form", () => {
    expect(countMissingRequiredFields(validValues)).toBe(0);
  });

  it("counts each empty required field", () => {
    expect(
      countMissingRequiredFields({ ...validValues, name: "", role: "" })
    ).toBe(2);
  });

  it("counts a whitespace-only value as missing", () => {
    expect(
      countMissingRequiredFields({ ...validValues, documentId: "   " })
    ).toBe(1);
  });

  it("does not count a filled-but-invalid field as missing", () => {
    expect(
      countMissingRequiredFields({ ...validValues, name: "a".repeat(201) })
    ).toBe(0);
  });

  it("does not count FTE, cost or provider — they have their own rules", () => {
    expect(
      countMissingRequiredFields({
        ...validValues,
        availableFte: "",
        monthlyCost: "",
        isExternal: true,
        providerId: "",
      })
    ).toBe(0);
  });
});
