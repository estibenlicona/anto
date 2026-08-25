import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Link } from "./link";

function link(name: string): HTMLElement {
  return screen.getByRole("link", { name });
}

describe("Link", () => {
  it("usa el tono de marca cuando no se le pide ninguno", () => {
    render(<Link href="/personas">Personas</Link>);

    expect(link("Personas").className).toContain("text-brand-default");
    expect(link("Personas").className).toContain("focus-visible:ring-brand-focus-ring");
  });

  it("no deja ninguna clase del rol brand en el tono neutro", () => {
    render(
      <Link href="/personas" tone="neutral">
        Personas
      </Link>,
    );

    // Ni el color de texto ni el anillo de foco: un anillo rojo alrededor de un
    // enlace deliberadamente neutro reintroduce el color que se pidió quitar.
    expect(link("Personas").className).not.toMatch(/brand/);
    expect(link("Personas").className).toContain("text-neutral-default");
    expect(link("Personas").className).toContain("focus-visible:ring-neutral-focus-ring");
  });

  it("condiciona el subrayado a hover y a foco, en los dos tonos", () => {
    const { rerender } = render(<Link href="/a">Marca</Link>);

    for (const className of [link("Marca").className]) {
      expect(className).toContain("hover:underline");
      expect(className).toContain("focus-visible:underline");
      // En reposo no hay subrayado: `underline` a secas no aparece nunca sin
      // un prefijo de estado delante.
      expect(className).not.toMatch(/(^|\s)underline(\s|$)/);
    }

    rerender(
      <Link href="/a" tone="neutral">
        Neutro
      </Link>,
    );

    expect(link("Neutro").className).toContain("hover:underline");
    expect(link("Neutro").className).toContain("focus-visible:underline");
    expect(link("Neutro").className).not.toMatch(/(^|\s)underline(\s|$)/);
  });

  it("renderiza un ancla cuyo nombre accesible es su texto", () => {
    render(<Link href="/app/lead/personas/1">María González</Link>);

    const anchor = link("María González");
    expect(anchor.tagName).toBe("A");
    expect(anchor).toHaveAttribute("href", "/app/lead/personas/1");
  });

  it("cede la etiqueta al hijo con asChild, sin anidar anclas", () => {
    const { container } = render(
      <Link asChild tone="neutral">
        <a href="/app/lead/personas/1">María González</a>
      </Link>,
    );

    expect(container.querySelectorAll("a")).toHaveLength(1);

    const anchor = link("María González");
    expect(anchor).toHaveAttribute("href", "/app/lead/personas/1");
    expect(anchor.className).toContain("text-neutral-default");
    expect(anchor.className).not.toMatch(/brand/);
  });

  it("compone el className del consumidor con las clases del tono", () => {
    render(
      <Link href="/a" className="leading-5">
        Personas
      </Link>,
    );

    const anchor = link("Personas");
    expect(anchor.className).toContain("leading-5");
    expect(anchor.className).toContain("text-brand-default");
  });
});
