import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchField } from "./search-field";

describe("SearchField", () => {
  it("el className dimensiona el control entero, y el input llena la caja", () => {
    render(<SearchField placeholder="Buscar por nombre o cargo" className="w-96" />);
    const input = screen.getByPlaceholderText("Buscar por nombre o cargo");
    // La raíz es quien recibe el ancho; el input sigue siendo `w-full` de ella.
    const root = input.parentElement!.parentElement!;
    expect(root.className).toContain("w-96");
    expect(input.className).toContain("w-full");
    expect(input.className).not.toContain("w-96");
  });

  it("conserva la etiqueta, el error y el estado inválido", () => {
    render(<SearchField label="Buscar" error="Sin resultados" />);
    const input = screen.getByLabelText("Buscar");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });
});
