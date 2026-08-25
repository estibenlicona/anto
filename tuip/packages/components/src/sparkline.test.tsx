import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sparkline } from "./sparkline";

const SERIE = [
  { label: "2024-S1", value: 12 },
  { label: "2024-S2", value: 9 },
  { label: "2025-S1", value: 10 },
  { label: "2025-S2", value: 6 },
];

function barras(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll('[aria-hidden="true"]')] as HTMLElement[];
}

describe("Sparkline", () => {
  it("dibuja una barra por punto, en el orden recibido", () => {
    const { container } = render(<Sparkline points={SERIE} label="Brechas por ciclo" />);
    const dibujadas = barras(container);

    expect(dibujadas).toHaveLength(4);
    expect(dibujadas.map((b) => b.title)).toEqual([
      "2024-S1: 12",
      "2024-S2: 9",
      "2025-S1: 10",
      "2025-S2: 6",
    ]);
  });

  it("escala contra el mayor de su propia serie", () => {
    const { container } = render(<Sparkline points={SERIE} label="Brechas por ciclo" />);
    const alturas = barras(container).map((b) => b.style.height);

    // 12 es el mayor y llega arriba; el resto es su proporción.
    expect(alturas[0]).toContain("100%");
    expect(alturas[1]).toContain("75%");
    expect(alturas[3]).toContain("50%");
  });

  it("el último punto es el presente y se distingue, en el tono elegido", () => {
    const { container } = render(
      <Sparkline points={SERIE} label="Brechas por ciclo" tone="violet" />
    );
    const dibujadas = barras(container);
    const ultima = dibujadas[dibujadas.length - 1];

    expect(ultima.className).toContain("bg-accent-violet-fill");
    // Y los anteriores no compiten con él.
    for (const previa of dibujadas.slice(0, -1)) {
      expect(previa.className).not.toContain("bg-accent-violet-fill");
      expect(previa.className).toContain("bg-neutral-subtle-pressed");
    }
  });

  it("un cero se sigue viendo: no desaparece", () => {
    const { container } = render(
      <Sparkline points={[{ label: "S1", value: 0 }, { label: "S2", value: 4 }]} label="Serie" />
    );
    const [cero] = barras(container);

    // Su altura tiene un piso: un dato medido en cero no es un dato faltante.
    expect(cero.style.height).toContain("2px");
  });

  it("con todos los valores en cero ninguna barra desaparece", () => {
    const { container } = render(
      <Sparkline points={[{ label: "S1", value: 0 }, { label: "S2", value: 0 }]} label="Serie" />
    );

    // Sin máximo con el que escalar, la proporción no existe: todas al piso.
    for (const barra of barras(container)) {
      expect(barra.style.height).toBe("2px");
    }
  });

  it("se anuncia como una sola imagen con su nombre", () => {
    render(<Sparkline points={SERIE} label="Brechas por ciclo" />);

    // Una imagen, no cuatro elementos sueltos sin texto.
    const serie = screen.getByRole("img", { name: "Brechas por ciclo" });
    expect(serie).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("con un solo punto se dibuja igual, y vacía no dibuja nada", () => {
    const { container: uno } = render(
      <Sparkline points={[{ label: "2025-S2", value: 6 }]} label="Serie" />
    );
    expect(barras(uno)).toHaveLength(1);

    const { container: vacia } = render(<Sparkline points={[]} label="Serie" />);
    expect(vacia.firstChild).toBeNull();
  });
});
