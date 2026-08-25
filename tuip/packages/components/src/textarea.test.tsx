import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "./textarea";
import { Input } from "./input";

describe("Textarea", () => {
  it("asocia la etiqueta y la ayuda al campo", () => {
    render(<Textarea label="Detalle" hint="Opcional" required />);
    const field = screen.getByLabelText(/Detalle/);
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("aria-required", "true");
    expect(field).not.toHaveAttribute("required");
    expect(field).toHaveAccessibleDescription("Opcional");
    expect(field).toHaveAttribute("rows", "3");
  });

  it("el error reemplaza a la ayuda y marca el campo como inválido", () => {
    render(<Textarea label="Detalle" hint="Opcional" error="Contá qué pasó" />);
    const field = screen.getByLabelText("Detalle");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Contá qué pasó");
    expect(screen.queryByText("Opcional")).not.toBeInTheDocument();
    expect(field.className).toContain("border-danger-default");
  });

  it("pinta el borde y el foco igual que Input", () => {
    render(
      <>
        <Textarea label="T" error="e" />
        <Input label="I" error="e" />
      </>
    );
    const t = screen.getByLabelText("T").className;
    const i = screen.getByLabelText("I").className;
    for (const c of ["border-danger-default", "focus-visible:ring-danger-focus-ring", "rounded-control", "text-body-sm"]) {
      expect(t).toContain(c);
      expect(i).toContain(c);
    }
  });

  it("sólo crece en vertical, o no crece", () => {
    const { rerender } = render(<Textarea label="T" rows={5} />);
    let field = screen.getByLabelText("T");
    expect(field).toHaveAttribute("rows", "5");
    expect(field.className).toContain("resize-y");
    rerender(<Textarea label="T" resize="none" />);
    field = screen.getByLabelText("T");
    expect(field.className).toContain("resize-none");
    expect(field.className).not.toContain("resize-y");
  });
});
