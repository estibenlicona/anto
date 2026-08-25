import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SegmentedBar } from "./progress";

function segments(container: HTMLElement): HTMLElement[] {
  return Array.from(container.firstElementChild!.children) as HTMLElement[];
}

describe("SegmentedBar — vocabulario de tonos de acento", () => {
  it("un segmento con tone recibe la clase de relleno de acento, no una semántica", () => {
    const { container } = render(
      <SegmentedBar
        segments={[
          { value: 2, tone: "sky", label: "Principiante" },
          { value: 5, tone: "blue", label: "Competente" },
          { value: 7, tone: "violet", label: "Avanzado" },
          { value: 4, tone: "magenta", label: "Experto" },
        ]}
      />,
    );

    const drawn = segments(container);
    expect(drawn[0].className).toContain("bg-accent-sky-fill");
    expect(drawn[1].className).toContain("bg-accent-blue-fill");
    // La misma clase que usa LevelMeter — no sólo el mismo matiz — es lo que
    // mantiene barra y medidor del mismo color por construcción.
    expect(drawn[2].className).toContain("bg-accent-violet-fill");
    expect(drawn[3].className).toContain("bg-accent-magenta-fill");
    for (const el of drawn) {
      expect(el.className).not.toMatch(/-bold/);
    }
  });

  it("los segmentos con role y con color siguen exactamente como antes", () => {
    const { container } = render(
      <SegmentedBar
        segments={[
          { value: 1, role: "warning", label: "En riesgo" },
          { value: 1, color: "amber", label: "Equipo B" },
        ]}
      />,
    );

    const drawn = segments(container);
    expect(drawn[0].className).toContain("bg-warning-bold");
    expect(drawn[1].className).toContain("bg-warning-bold");
    for (const el of drawn) {
      expect(el.className).not.toMatch(/bg-accent-/);
    }
  });
});

describe("SegmentedBar — escala de intensidad (heat)", () => {
  it("cada grado recibe su relleno: peligro, marca, marca atenuada, neutro", () => {
    const { container } = render(
      <SegmentedBar
        segments={[
          { value: 2, heat: "max", label: "Crítica" },
          { value: 1, heat: "high", label: "Alta" },
          { value: 1, heat: "mid", label: "Media" },
          { value: 1, heat: "low", label: "Baja" },
        ]}
      />,
    );
    const drawn = segments(container);
    expect(drawn[0].className).toContain("bg-danger-bold");
    expect(drawn[1].className).toContain("bg-brand-bold");
    expect(drawn[2].className).toContain("bg-brand-strong");
    expect(drawn[2].className).not.toMatch(/opacity/);
    expect(drawn[3].className).toContain("bg-neutral-subtle-pressed");
  });
});

describe("SegmentedBar — total y tamaño", () => {
  it("con total mayor que la suma, los anchos van sobre el total y el contenedor pinta track", () => {
    const { container } = render(
      <SegmentedBar
        total={4}
        segments={[
          { value: 1, tone: "sky" },
          { value: 1, tone: "blue" },
        ]}
      />,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain("bg-neutral-subtle");
    const drawn = segments(container);
    expect(drawn[0].style.width).toBe("25%");
    expect(drawn[1].style.width).toBe("25%");
  });

  it("con total menor que la suma, dimensiona sobre la suma sin desbordar", () => {
    const { container } = render(
      <SegmentedBar
        total={1}
        segments={[
          { value: 3, tone: "sky" },
          { value: 1, tone: "blue" },
        ]}
      />,
    );
    const drawn = segments(container);
    expect(drawn[0].style.width).toBe("75%");
    expect(drawn[1].style.width).toBe("25%");
  });

  it("sin total no pinta track y reparte el 100 % como siempre", () => {
    const { container } = render(
      <SegmentedBar segments={[{ value: 1, role: "info" }, { value: 3, role: "success" }]} />,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).not.toContain("bg-neutral-subtle");
    expect(bar.className).toContain("h-2");
    expect(segments(container)[0].style.width).toBe("25%");
  });

  it("size sm usa la altura de Progress", () => {
    const { container } = render(
      <SegmentedBar size="sm" segments={[{ value: 1, role: "info" }]} />,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain("h-1.5");
    expect(bar.className).not.toContain("h-2");
  });
});
