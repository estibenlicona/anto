import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SquadsStatsCards } from "../SquadsStatsCards";
import { segmentFillClass } from "@tuya-ui/components";
import { MIX_COLORS } from "../mixColors";
import type { SquadsStats } from "../../services/squadService";

const stats: SquadsStats = {
  totalCount: 5,
  withoutPeopleCount: 1,
  atCapacityCount: 0,
  teamCount: 4,
  allocatedFte: 6.3,
  bauFte: 3.4,
  transformationFte: 2.9,
  chapterFte: 18,
  byCriticality: [
    { criticality: "Critical", count: 2 },
    { criticality: "High", count: 1 },
    { criticality: "Medium", count: 1 },
    { criticality: "Low", count: 1 },
  ],
};

// Escala de intensidad sobre la marca, propia de la card (los badges de la
// fila conservan sus roles semánticos). Segmento y punto de leyenda de un
// mismo nivel comparten exactamente la misma clase.
const EXPECTED_HEAT_CLASS: Record<string, string> = {
  Crítica: "bg-danger-bold",
  Alta: "bg-brand-bold",
  Media: "bg-brand-strong",
  Baja: "bg-neutral-subtle-pressed",
};

function legendItemFor(label: string): HTMLElement {
  const item = screen.getByText(label).closest("li");
  expect(item).not.toBeNull();
  return item!;
}

describe("SquadsStatsCards", () => {
  it("no renderiza nada mientras carga o sin datos", () => {
    const { container, rerender } = render(
      <SquadsStatsCards stats={null} loading />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<SquadsStatsCards stats={null} loading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el total de células con los equipos, y sin personas y al tope en la leyenda", () => {
    render(
      <SquadsStatsCards
        stats={{ ...stats, atCapacityCount: 2 }}
        loading={false}
      />
    );
    expect(screen.getByText("CÉLULAS")).toBeInTheDocument();
    expect(screen.getByText("en 4 equipos")).toBeInTheDocument();
    expect(screen.getByText("sin personas", { exact: false }).textContent).toBe(
      "1 sin personas"
    );
    expect(screen.getByText("al tope", { exact: false }).textContent).toBe(
      "2 al tope"
    );
  });

  it("abre con el FTE asignado, de cuánto y qué %, y la barra lleva BAU, Transformación y libre", () => {
    render(<SquadsStatsCards stats={stats} loading={false} />);
    expect(screen.getByText("6.3")).toBeInTheDocument();
    expect(
      screen.getByText("de 18.0 FTE · 35% del chapter")
    ).toBeInTheDocument();
    expect(legendItemFor("BAU")).toHaveTextContent("3.4");
    expect(legendItemFor("Transformación")).toHaveTextContent("2.9");
    expect(legendItemFor("Libre")).toHaveTextContent("11.7");
    // Los mismos tonos que la columna Capacidad de cada fila; libre en gris.
    expect(legendItemFor("BAU").querySelector("span")?.className).toContain(
      segmentFillClass({ color: MIX_COLORS.bau })
    );
    expect(legendItemFor("Libre").querySelector("span")?.className).toContain(
      segmentFillClass({ heat: "low" })
    );
  });

  it("no divide por cero cuando el chapter no tiene FTE", () => {
    render(
      <SquadsStatsCards
        stats={{ ...stats, chapterFte: 0, allocatedFte: 0 }}
        loading={false}
      />
    );
    expect(screen.getByText("de 0.0 FTE · 0% del chapter")).toBeInTheDocument();
    expect(legendItemFor("Libre")).toHaveTextContent("0");
  });

  it("la leyenda muestra los 4 niveles en español, con su punto de la escala y su conteo, incluso en cero", () => {
    render(
      <SquadsStatsCards
        stats={{
          ...stats,
          byCriticality: stats.byCriticality.map((e) =>
            e.criticality === "Low" ? { ...e, count: 0 } : e
          ),
        }}
        loading={false}
      />
    );
    for (const [label, cls] of Object.entries(EXPECTED_HEAT_CLASS)) {
      const item = legendItemFor(label);
      expect(item.querySelector("span")?.className).toContain(cls);
    }
    // El punto de "Baja" lleva borde para no desaparecer sobre la card.
    expect(legendItemFor("Baja").querySelector("span")?.className).toContain(
      "border-neutral-bold"
    );
    expect(legendItemFor("Baja").textContent).toContain("0");
    expect(legendItemFor("Crítica").textContent).toContain("2");
    // Un nivel en cero no pinta segmento, pero sí está en la leyenda.
    const legendCard = screen
      .getByText("DISTRIBUCIÓN POR CRITICIDAD")
      .closest("div")!.parentElement as HTMLElement;
    expect(legendCard.querySelectorAll(".gap-hug > div")).toHaveLength(3);
  });

  it("los segmentos de la barra usan la escala de intensidad, no los roles del badge", () => {
    const { container } = render(
      <SquadsStatsCards stats={stats} loading={false} />
    );
    // Dos barras separadas en la fila: la de capacidad (3 tramos) y la de
    // criticidad (4). Se toma la segunda.
    const bars = Array.from(container.querySelectorAll(".gap-hug"));
    const segments = Array.from(
      bars[bars.length - 1].querySelectorAll(":scope > div")
    ) as HTMLElement[];
    expect(segments).toHaveLength(4);
    expect(segments[0].className).toContain("bg-danger-bold");
    expect(segments[1].className).toContain("bg-brand-bold");
    // "Media" ya es un token: el paso intermedio de la marca, sin opacidad.
    expect(segments[2].className).toContain("bg-brand-strong");
    expect(segments[2].className).not.toMatch(/opacity/);
    expect(segments[3].className).toContain("bg-neutral-subtle-pressed");
    expect(segments[0].style.width).toBe("40%");
    expect(container.querySelector(".bg-warning-bold")).toBeNull();
    expect(container.querySelector(".bg-info-bold")).toBeNull();
  });

  it("separa las tres cards con los mismos 12px que separan el resumen del listado", () => {
    const { container } = render(
      <SquadsStatsCards stats={stats} loading={false} />
    );
    // Una sola medida de separación en la vista (gap-3, como en ausencias):
    // el grid dejó el gap-4 que lo hacía verse más suelto que el resto.
    const grid = container.firstElementChild!;
    expect(grid).toHaveClass("grid", "gap-3");
    expect(grid).not.toHaveClass("gap-4");
  });

  it("lee cuántas células están en criticidad alta o crítica", () => {
    render(<SquadsStatsCards stats={stats} loading={false} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(
      screen.getByText("de 5 en criticidad alta o crítica")
    ).toBeInTheDocument();
  });
});
