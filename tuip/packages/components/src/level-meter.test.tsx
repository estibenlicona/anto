import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LevelMeter } from "./level-meter";

function segments(): HTMLElement[] {
  return Array.from(screen.getByRole("meter").children) as HTMLElement[];
}

describe("LevelMeter", () => {
  it("dibuja cuatro segmentos por defecto", () => {
    render(<LevelMeter value={2} tone="blue" label="Nivel" />);

    expect(segments()).toHaveLength(4);
  });

  it("dibuja la cantidad de pasos que se le pida", () => {
    render(<LevelMeter value={2} steps={5} tone="violet" label="Nivel" />);

    expect(segments()).toHaveLength(5);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuemax", "5");
  });

  it("llena los segmentos hasta la posición alcanzada y deja vacíos los demás", () => {
    render(<LevelMeter value={2} tone="magenta" label="Nivel" />);
    const drawn = segments();

    expect(drawn[0].className).toContain("bg-accent-magenta-fill");
    expect(drawn[1].className).toContain("bg-accent-magenta-fill");
    expect(drawn[2].className).not.toContain("bg-accent-magenta-fill");
    expect(drawn[3].className).not.toContain("bg-accent-magenta-fill");
  });

  it("da a los segmentos vacíos el aro que los sostiene sobre un fondo teñido", () => {
    render(<LevelMeter value={1} tone="sky" label="Nivel" />);
    const empty = segments()[3];

    // El relleno del vacío contra la superficie teñida da ~1.1:1; el aro es lo
    // único que lo distingue, y su contraste se verifica en verify-tokens.ts.
    expect(empty.className).toContain("border-neutral-bold");
  });

  it("reparte el ancho por igual entre los segmentos", () => {
    render(<LevelMeter value={3} tone="blue" label="Nivel" />);

    for (const segment of segments()) {
      expect(segment.className).toContain("flex-1");
    }
  });

  it("recorta un valor fuera del rango en vez de dibujar de más", () => {
    render(<LevelMeter value={9} tone="violet" label="Nivel" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "4");

    render(<LevelMeter value={-3} tone="violet" label="Otro" />);
    expect(screen.getByRole("meter", { name: "Otro" })).toHaveAttribute("aria-valuenow", "0");
  });

  describe("marca de la posición esperada", () => {
    function mark(index: number): HTMLElement | null {
      return segments()[index].querySelector("span");
    }

    it("cuelga la marca del límite del paso esperado", () => {
      render(<LevelMeter value={1} expected={3} tone="blue" label="Nivel" />);

      // El límite del tercer paso es el borde derecho del tercer segmento.
      expect(mark(2)).not.toBeNull();
      expect(mark(0)).toBeNull();
      expect(mark(1)).toBeNull();
      expect(mark(3)).toBeNull();
    });

    it("centra la marca en la separación, salvo en el último paso", () => {
      render(<LevelMeter value={1} expected={2} tone="blue" label="Nivel" />);
      // Media separación más media marca: centrada en el hueco entre el paso
      // esperado y el siguiente, derivado de la medida que los separa.
      expect(mark(1)!.className).toContain(
        "-right-[calc(var(--space-hug)/2+2px)]"
      );

      // Después del último segmento no hay separación: correrla la sacaría del
      // ancho del medidor.
      render(<LevelMeter value={1} expected={4} tone="blue" label="Otro" />);
      const last = Array.from(
        screen.getByRole("meter", { name: "Otro" }).children,
      )[3] as HTMLElement;
      expect(last.querySelector("span")).not.toBeNull();
      expect(last.querySelector("span")!.className).not.toContain("-right-[");
      expect(last.querySelector("span")!.className).toContain("right-0");
    });

    it("no mueve ni reduce los segmentos", () => {
      render(<LevelMeter value={1} expected={3} tone="blue" label="Nivel" />);

      for (const segment of segments()) {
        expect(segment.className).toContain("flex-1");
        expect(segment.className).toContain("h-1.5");
      }
    });

    it("sin posición esperada no dibuja marca ni reserva lugar", () => {
      render(<LevelMeter value={2} tone="blue" label="Nivel" />);

      expect(segments()).toHaveLength(4);
      for (const segment of segments()) {
        expect(segment.children).toHaveLength(0);
        expect(segment.className).toContain("flex-1");
      }
      expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "2 de 4");
    });

    it("una posición esperada de cero no tiene límite que marcar", () => {
      render(<LevelMeter value={2} expected={0} tone="blue" label="Nivel" />);

      for (const segment of segments()) {
        expect(segment.children).toHaveLength(0);
      }
      expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "2 de 4");
    });

    it("anuncia la esperada junto a la alcanzada", () => {
      render(<LevelMeter value={2} expected={3} tone="blue" label="Nivel de dominio" />);

      expect(screen.getByRole("meter", { name: "Nivel de dominio" })).toHaveAttribute(
        "aria-valuetext",
        "2 de 4, se esperan 3",
      );
    });
  });

  it("anuncia la posición y el total, sin depender del color", () => {
    render(<LevelMeter value={3} tone="blue" label="Nivel de dominio" />);
    const meter = screen.getByRole("meter", { name: "Nivel de dominio" });

    expect(meter).toHaveAttribute("aria-valuenow", "3");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "4");
    expect(meter).toHaveAttribute("aria-valuetext", "3 de 4");
  });
});
