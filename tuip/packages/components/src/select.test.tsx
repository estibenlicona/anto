import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select } from "./select";

const OPTIONS = [
  { value: "a", label: "Ana" },
  { value: "b", label: "Bruno" },
];

describe("Select", () => {
  it("con rótulo, el disparador se nombra por él", () => {
    render(<Select label="Persona" options={OPTIONS} />);
    expect(screen.getByRole("combobox", { name: "Persona" })).toBeTruthy();
  });

  it("sin rótulo visible, `aria-label` le da nombre al disparador", () => {
    // Un campo cuya sección ya lo titula no repite el título como rótulo,
    // pero quien navega con lector de pantalla tiene que oír cómo se llama.
    render(<Select aria-label="Persona" options={OPTIONS} />);
    expect(screen.getByRole("combobox", { name: "Persona" })).toBeTruthy();
    expect(screen.queryByText("Persona")).toBeNull();
  });
});
