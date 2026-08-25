import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("es un <kbd> sin foco ni rol interactivo", () => {
    render(<Kbd>↵</Kbd>);
    const kbd = screen.getByText("↵");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd).not.toHaveAttribute("tabindex");
    expect(kbd).not.toHaveAttribute("role");
    expect(kbd.className).toContain("font-mono");
    expect(kbd.className).toContain("select-none");
  });

  it("cambia de tamaño con `size`", () => {
    const { rerender } = render(<Kbd size="sm">1</Kbd>);
    expect(screen.getByText("1").className).toContain("text-label");
    rerender(<Kbd size="md">1</Kbd>);
    expect(screen.getByText("1").className).toContain("text-body-sm");
  });
});
