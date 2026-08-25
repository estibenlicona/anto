import { describe, expect, it } from "vitest";
import { validateStacks, isStacksValid } from "../stacksValidation";

describe("validateStacks", () => {
  it("exige un único principal cuando hay stacks y rechaza repetidos", () => {
    expect(validateStacks([])).toEqual({});
    expect(
      validateStacks([{ name: "Azure", level: 2, isPrimary: false }]).primary
    ).toBeDefined();
    expect(
      validateStacks([
        { name: "Azure", level: 2, isPrimary: true },
        { name: "Kafka", level: 2, isPrimary: true },
      ]).primary
    ).toMatch(/Sólo un/);
    expect(
      validateStacks([
        { name: "Azure", level: 2, isPrimary: true },
        { name: "Azure", level: 3, isPrimary: false },
      ]).duplicates
    ).toBeDefined();
    expect(isStacksValid([{ name: "Azure", level: 2, isPrimary: true }])).toBe(
      true
    );
  });
});
