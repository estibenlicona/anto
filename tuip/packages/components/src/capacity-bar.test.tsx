import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CapacityBar, type CapacityPart } from "./capacity-bar";

const parts = [
  { label: "BAU", value: 1.1, tone: "sky" as const },
  { label: "Transf.", value: 0.7, tone: "blue" as const },
];

function segments(container: HTMLElement): HTMLElement[] {
  const bar = container.querySelector(".h-1\\.5.w-full") as HTMLElement;
  return Array.from(bar.children) as HTMLElement[];
}

describe("CapacityBar", () => {
  it("ocupación con margen: cifras, % en advertencia, tramos sobre el total, leyenda y libre", () => {
    const { container } = render(
      <CapacityBar allocated={1.8} available={2} parts={parts} unit="FTE" />,
    );
    expect(screen.getByText("1.8")).toBeInTheDocument();
    expect(screen.getByText("/ 2.0 FTE", { exact: false })).toBeInTheDocument();
    const pct = screen.getByLabelText("90% de ocupación");
    expect(pct).toHaveTextContent("90%");
    expect(pct.className).toContain("text-warning-default");
    const drawn = segments(container);
    expect(drawn[0].style.width).toBe("55.00000000000001%");
    expect(drawn[0].className).toContain("bg-accent-sky-fill");
    expect(drawn[1].className).toContain("bg-accent-blue-fill");
    const legend = screen.getByText("0.2 libre").parentElement as HTMLElement;
    expect(legend.textContent).toContain("BAU 1.1");
    expect(legend.textContent).toContain("Transf. 0.7");
    expect(screen.getByText("0.2 libre")).toBeInTheDocument();
  });

  it("al tope: % en peligro y texto de tope en vez de libre", () => {
    render(
      <CapacityBar
        allocated={2}
        available={2}
        parts={[
          { label: "BAU", value: 1.2, tone: "sky" },
          { label: "Transf.", value: 0.8, tone: "blue" },
        ]}
      />,
    );
    const pct = screen.getByLabelText("100% de ocupación");
    expect(pct.className).toContain("text-danger-default");
    expect(screen.getByText("Al tope").className).toContain("text-danger-default");
    expect(screen.queryByText(/libre/)).not.toBeInTheDocument();
  });

  it("con espacio: % en éxito y libre con un decimal", () => {
    render(
      <CapacityBar allocated={1} available={2} parts={[{ label: "BAU", value: 1, tone: "sky" }]} />,
    );
    expect(screen.getByLabelText("50% de ocupación").className).toContain("text-success-default");
    expect(screen.getByText("1.0 libre")).toBeInTheDocument();
  });

  it("vacía: 0.0 atenuado, barra vacía y texto de vacío, sin porcentaje", () => {
    const { container } = render(<CapacityBar allocated={0} available={0} parts={[]} unit="FTE" />);
    expect(screen.getByText("0.0", { exact: false }).className).toContain("text-neutral-subtle");
    expect(screen.getByText("Sin capacidad asignada")).toBeInTheDocument();
    expect(screen.queryByLabelText(/de ocupación/)).not.toBeInTheDocument();
    expect(segments(container)).toHaveLength(0);
  });

  it("disponible en cero con partes: 0 % sin división por cero, partes sobre su suma", () => {
    const { container } = render(
      <CapacityBar allocated={1} available={0} parts={[{ label: "BAU", value: 1, tone: "sky" }]} />,
    );
    expect(screen.getByLabelText("0% de ocupación")).toBeInTheDocument();
    expect(segments(container)[0].style.width).toBe("100%");
  });

  it("los textos y el umbral son configurables", () => {
    render(
      <CapacityBar
        allocated={1.8}
        available={2}
        parts={parts}
        warningFrom={95}
        freeLabel="free"
        decimals={2}
      />,
    );
    expect(screen.getByLabelText("90% de ocupación").className).toContain("text-success-default");
    expect(screen.getByText("0.20 free")).toBeInTheDocument();
  });
  describe("el vocabulario de color de las partes", () => {
    /** El punto de leyenda de una parte, por su etiqueta. */
    function legendDot(label: string): HTMLElement {
      return screen
        .getByText(label)
        .closest("span")!
        .querySelector("[aria-hidden=true]") as HTMLElement;
    }

    it("con acento se dibuja como antes de existir la opción", () => {
      const { container } = render(
        <CapacityBar allocated={1.8} available={2} parts={parts} />,
      );

      expect(segments(container)[0].className).toContain("bg-accent-sky-fill");
      expect(legendDot("BAU").className).toContain("bg-accent-sky-fill");
    });

    it("con vocabulario categórico el tramo y su punto toman ese color", () => {
      // Dos categorías que no se ordenan entre sí: el acento las haría tomar
      // prestados los tonos de una escala ordinal del sistema.
      const categoricas = [
        { label: "BAU", value: 1.1, color: "green" as const },
        { label: "Transf.", value: 0.7, color: "purple" as const },
      ];
      const { container } = render(
        <CapacityBar allocated={1.8} available={2} parts={categoricas} />,
      );
      const drawn = segments(container);

      // El vocabulario categórico se nombra por matiz y resuelve a la familia
      // de la paleta que le corresponde: `green` → success, `purple` →
      // discovery. Está documentado en el token, y es lo que permite pedir
      // "el verde" sin afirmar que algo salió bien.
      expect(drawn[0].className).toContain("bg-success-bold");
      expect(drawn[1].className).toContain("bg-discovery-bold");
      // El punto sale de la misma fuente que el tramo, así que no pueden
      // quedar de colores distintos.
      expect(legendDot("BAU").className).toContain("bg-success-bold");
      expect(legendDot("Transf.").className).toContain("bg-discovery-bold");
    });

    it("una parte no puede declarar los dos vocabularios", () => {
      // Si los tipos dejaran de excluirse, este `@ts-expect-error` quedaría
      // sin usar y el typecheck fallaría — que es lo que hace de esto una
      // prueba y no un comentario.
      // @ts-expect-error: `tone` y `color` se excluyen entre sí
      const ambigua: CapacityPart = { label: "X", value: 1, tone: "sky", color: "green" };
      expect(ambigua.label).toBe("X");
    });

    it("ningún tramo categórico usa un tono de la escala de acento", () => {
      const { container } = render(
        <CapacityBar
          allocated={1.8}
          available={2}
          parts={[
            { label: "BAU", value: 1.1, color: "green" as const },
            { label: "Transf.", value: 0.7, color: "purple" as const },
          ]}
        />,
      );

      for (const seg of segments(container)) {
        expect(seg.className).not.toContain("accent");
      }
      expect(legendDot("BAU").className).not.toContain("accent");
    });
  });

  it("separated: las piezas van con separación y lo libre sigue como pista", () => {
    const { container } = render(
      <CapacityBar
        allocated={1.8}
        available={2}
        separated
        parts={[
          { label: "BAU", value: 1.1, tone: "sky" },
          { label: "Transformación", value: 0.7, tone: "violet" },
        ]}
      />,
    );
    const track = container.querySelector(".gap-hug") as HTMLElement;
    expect(track).not.toBeNull();
    expect(track.className).toContain("bg-neutral-subtle");
  });
});
