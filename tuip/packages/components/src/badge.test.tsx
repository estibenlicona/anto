import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

/**
 * El badge por su texto: `role="status"` es una región viva y no toma su
 * nombre accesible del contenido, así que buscarlo por nombre no lo encuentra.
 */
function badge(texto: string): HTMLElement {
  return screen.getByText(texto).closest("[role=status]") as HTMLElement;
}

/** El punto es el único hijo del badge que no es texto. */
function dot(texto: string): HTMLElement | null {
  return badge(texto).querySelector("span");
}

describe("Badge", () => {
  it("dibuja el punto por defecto", () => {
    render(<Badge variant="info">En curso</Badge>);

    expect(dot("En curso")).not.toBeNull();
    expect(dot("En curso")!.className).toContain("bg-info-bold");
  });

  it("lo omite cuando se lo pide, sin cambiar nada más", () => {
    render(
      <Badge variant="danger" dot={false}>
        Crítica
      </Badge>,
    );
    const sinPunto = badge("Crítica");

    expect(sinPunto.querySelector("span")).toBeNull();
    // Misma forma, misma variante, mismo relleno: quitar el punto no convierte
    // al badge en otra pieza.
    expect(sinPunto.className).toContain("rounded-control");
    expect(sinPunto.className).toContain("bg-danger-subtle");
    expect(sinPunto.className).toContain("px-2.5");
    expect(sinPunto.className).toContain("py-1");
  });

  it("dice lo suyo por el texto, con punto y sin él", () => {
    render(<Badge variant="warning">Alta</Badge>);
    render(
      <Badge variant="warning" dot={false}>
        Media
      </Badge>,
    );

    // El punto nunca es el único canal: quien no distingue el color lee la
    // etiqueta, esté el punto o no.
    expect(badge("Alta")).toHaveTextContent("Alta");
    expect(badge("Media")).toHaveTextContent("Media");
  });

  it("ninguna variante usa el color de marca", () => {
    for (const variant of ["success", "info", "warning", "danger", "neutral", "discovery"] as const) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(badge(variant).className).not.toContain("brand");
      unmount();
    }
  });
});
