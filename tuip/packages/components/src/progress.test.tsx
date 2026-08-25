import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Progress } from "./progress";

function fill(container: HTMLElement): HTMLElement {
  return container.firstElementChild!.firstElementChild as HTMLElement;
}

describe("Progress — umbral de advertencia", () => {
  it("sin umbral: éxito hasta 100 inclusive, peligro por encima", () => {
    expect(fill(render(<Progress value={99} />).container).className).toContain("bg-success-bold");
    expect(fill(render(<Progress value={100} />).container).className).toContain("bg-success-bold");
    expect(fill(render(<Progress value={101} />).container).className).toContain("bg-danger-bold");
  });

  it("warningFrom 100: advierte exactamente al tope y sigue saturando a peligro", () => {
    expect(fill(render(<Progress value={99} warningFrom={100} />).container).className).toContain(
      "bg-success-bold",
    );
    expect(fill(render(<Progress value={100} warningFrom={100} />).container).className).toContain(
      "bg-warning-bold",
    );
    const over = render(<Progress value={101} warningFrom={100} />).container;
    expect(fill(over).className).toContain("bg-danger-bold");
    expect(fill(over).style.width).toBe("100%");
  });

  it("warningFrom 85: banda de advertencia entre 85 y 100", () => {
    expect(fill(render(<Progress value={84} warningFrom={85} />).container).className).toContain(
      "bg-success-bold",
    );
    expect(fill(render(<Progress value={85} warningFrom={85} />).container).className).toContain(
      "bg-warning-bold",
    );
    expect(fill(render(<Progress value={99} warningFrom={85} />).container).className).toContain(
      "bg-warning-bold",
    );
    expect(fill(render(<Progress value={100} warningFrom={85} />).container).className).toContain(
      "bg-warning-bold",
    );
  });

  it("brandFill ignora el umbral", () => {
    const el = fill(render(<Progress value={90} warningFrom={85} brandFill />).container);
    expect(el.className).toContain("bg-gradient-brand");
    expect(el.className).not.toContain("bg-warning-bold");
  });
  it("tone rellena con el acento y no cambia por umbral ni por exceso", () => {
    const el = fill(render(<Progress value={100} warningFrom={85} tone="blue" />).container);
    expect(el.className).toContain("bg-accent-blue-fill");
    expect(el.className).not.toContain("bg-warning-bold");
    const over = fill(render(<Progress value={120} tone="blue" />).container);
    expect(over.className).toContain("bg-accent-blue-fill");
    expect(over.style.width).toBe("100%");
  });
});
