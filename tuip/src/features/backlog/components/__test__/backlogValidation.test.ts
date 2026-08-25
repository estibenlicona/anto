import { describe, expect, it } from "vitest";
import { validateDecision, isDecisionValid } from "../backlogValidation";

describe("validateDecision", () => {
  it("exige elegir, y lo que cada tipo pide", () => {
    expect(
      validateDecision({ kind: "", initiativeId: "", bauCategory: "" }).kind
    ).toBeDefined();
    expect(
      validateDecision({
        kind: "Initiative",
        initiativeId: "",
        bauCategory: "",
      }).initiativeId
    ).toBeDefined();
    expect(
      validateDecision({ kind: "Bau", initiativeId: "", bauCategory: "" })
        .bauCategory
    ).toBeDefined();
    expect(
      validateDecision({ kind: "Discard", initiativeId: "", bauCategory: "" })
    ).toEqual({});
    expect(
      isDecisionValid({
        kind: "Initiative",
        initiativeId: "ini",
        bauCategory: "",
      })
    ).toBe(true);
    expect(
      isDecisionValid({ kind: "Bau", initiativeId: "", bauCategory: "x" })
    ).toBe(true);
  });
});
