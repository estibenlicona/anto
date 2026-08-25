import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Meter } from "./meter";

function fill(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="progressbar"]')!.firstElementChild as HTMLElement;
}

describe("Meter", () => {
  it("valor medio: barra en éxito y cifra exacta", () => {
    const { container } = render(<Meter value={80} warningFrom={100} label="Dedicación" />);
    expect(fill(container).className).toContain("bg-success-bold");
    expect(fill(container).style.width).toBe("80%");
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("exactamente al tope con umbral 100: advertencia", () => {
    const { container } = render(<Meter value={100} warningFrom={100} />);
    expect(fill(container).className).toContain("bg-warning-bold");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("sobreasignado: barra llena en peligro y la cifra real", () => {
    const { container } = render(<Meter value={120} />);
    expect(fill(container).className).toContain("bg-danger-bold");
    expect(fill(container).style.width).toBe("100%");
    expect(screen.getByText("120%")).toBeInTheDocument();
  });

  it("cero: barra vacía", () => {
    const { container } = render(<Meter value={0} />);
    expect(fill(container).style.width).toBe("0%");
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("aplica el ancho mínimo por defecto a la fila", () => {
    const { container } = render(<Meter value={10} />);
    expect((container.firstElementChild as HTMLElement).style.minWidth).toBe("7rem");
  });
  it("tone: la barra es una cantidad en acento y la cifra sigue exacta", () => {
    const { container } = render(<Meter value={100} tone="blue" label="Utilización" />);
    expect(fill(container).className).toContain("bg-accent-blue-fill");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
