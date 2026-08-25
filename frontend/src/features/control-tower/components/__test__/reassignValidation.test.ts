import { describe, expect, it } from "vitest";
import {
  countMissingRequiredFields,
  validateReassign,
  type ReassignFormValues,
} from "../reassignValidation";

const base: ReassignFormValues = {
  mode: "move",
  targetSquadId: "s2",
  dedicationPercentage: "100",
  bauPercentage: "60",
  transformationPercentage: "40",
};

describe("validateReassign", () => {
  it("acepta un plan válido", () => {
    expect(validateReassign(base, 60)).toEqual({});
  });

  it("exige destino salvo al subir la dedicación", () => {
    expect(
      validateReassign({ ...base, targetSquadId: "" }, 60).targetSquadId
    ).toBeDefined();
    expect(
      validateReassign({ ...base, mode: "raise", targetSquadId: "" }, 60)
    ).toEqual({});
  });

  it("valida el rango y el desglose", () => {
    expect(
      validateReassign({ ...base, dedicationPercentage: "0" }, 60)
        .dedicationPercentage
    ).toBeDefined();
    expect(
      validateReassign({ ...base, dedicationPercentage: "101" }, 60)
        .dedicationPercentage
    ).toBeDefined();
    expect(
      validateReassign({ ...base, bauPercentage: "50" }, 60).bauPercentage
    ).toMatch(/igual/);
    expect(
      validateReassign({ ...base, transformationPercentage: "" }, 60)
        .transformationPercentage
    ).toBeDefined();
  });

  it("al subir, la nueva dedicación debe superar la actual", () => {
    expect(
      validateReassign(
        {
          ...base,
          mode: "raise",
          dedicationPercentage: "60",
          bauPercentage: "20",
          transformationPercentage: "40",
        },
        60
      ).dedicationPercentage
    ).toMatch(/mayor/);
    expect(
      validateReassign(
        {
          ...base,
          mode: "raise",
          dedicationPercentage: "80",
          bauPercentage: "40",
          transformationPercentage: "40",
        },
        60
      )
    ).toEqual({});
  });
});

describe("countMissingRequiredFields", () => {
  it("cuenta destino y dedicación; al subir sólo la dedicación", () => {
    expect(
      countMissingRequiredFields({
        ...base,
        targetSquadId: "",
        dedicationPercentage: "",
      })
    ).toBe(2);
    expect(
      countMissingRequiredFields({
        ...base,
        mode: "raise",
        targetSquadId: "",
        dedicationPercentage: "",
      })
    ).toBe(1);
    expect(countMissingRequiredFields(base)).toBe(0);
  });
});
