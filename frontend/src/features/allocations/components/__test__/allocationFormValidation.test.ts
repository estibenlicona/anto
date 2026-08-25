import { describe, it, expect } from "vitest";
import {
  countMissingRequiredFields,
  validate,
} from "../allocationFormValidation";
import type { AllocationFormValues } from "../../adapters/AllocationAdapter";

const validValues: AllocationFormValues = {
  personId: "p1",
  dedicationPercentage: "80",
  bauPercentage: "50",
  transformationPercentage: "30",
};

describe("allocationFormValidation", () => {
  it("returns no errors for valid values", () => {
    expect(validate(validValues)).toEqual({});
  });

  it("requires a person", () => {
    expect(validate({ ...validValues, personId: "" }).personId).toBe(
      "Selecciona una persona"
    );
  });

  it("requires a dedication percentage between 1 and 100", () => {
    expect(
      validate({ ...validValues, dedicationPercentage: "" })
        .dedicationPercentage
    ).toBe("El % de dedicación debe estar entre 1 y 100");
    expect(
      validate({ ...validValues, dedicationPercentage: "0" })
        .dedicationPercentage
    ).toBe("El % de dedicación debe estar entre 1 y 100");
    expect(
      validate({ ...validValues, dedicationPercentage: "101" })
        .dedicationPercentage
    ).toBe("El % de dedicación debe estar entre 1 y 100");
  });

  it("requires a BAU percentage between 0 and 100", () => {
    expect(
      validate({ ...validValues, bauPercentage: "-1" }).bauPercentage
    ).toBe("El % BAU debe estar entre 0 y 100");
    expect(
      validate({ ...validValues, bauPercentage: "101" }).bauPercentage
    ).toBe("El % BAU debe estar entre 0 y 100");
  });

  it("requires a transformation percentage between 0 and 100", () => {
    expect(
      validate({ ...validValues, transformationPercentage: "-1" })
        .transformationPercentage
    ).toBe("El % de transformación debe estar entre 0 y 100");
  });

  it("requires BAU + transformation to equal dedication", () => {
    const errors = validate({
      ...validValues,
      dedicationPercentage: "80",
      bauPercentage: "50",
      transformationPercentage: "20",
    });
    expect(errors.bauPercentage).toBe(
      "BAU + Transformación debe sumar el % de dedicación"
    );
  });

  it("accepts a dedication split across BAU and transformation that sums correctly", () => {
    expect(
      validate({
        personId: "p1",
        dedicationPercentage: "100",
        bauPercentage: "100",
        transformationPercentage: "0",
      })
    ).toEqual({});
  });
});

describe("countMissingRequiredFields", () => {
  it("en alta cuenta persona y dedicación; en edición sólo dedicación", () => {
    expect(countMissingRequiredFields(validValues)).toBe(0);
    expect(
      countMissingRequiredFields({
        ...validValues,
        personId: "",
        dedicationPercentage: "",
      })
    ).toBe(2);
    expect(
      countMissingRequiredFields(
        { ...validValues, personId: "", dedicationPercentage: "" },
        { editing: true }
      )
    ).toBe(1);
    expect(
      countMissingRequiredFields({ ...validValues, bauPercentage: "" })
    ).toBe(0);
  });
});
