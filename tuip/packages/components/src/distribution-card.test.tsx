import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DistributionCard } from "./distribution-card";

const items = [
  { label: "Crítica", value: 2, heat: "max" as const },
  { label: "Alta", value: 1, heat: "high" as const },
  { label: "Media", value: 1, heat: "mid" as const },
  { label: "Baja", value: 1, heat: "low" as const },
];

function legendItem(label: string): HTMLElement {
  return screen.getByText(label).closest("li") as HTMLElement;
}

describe("DistributionCard", () => {
  it("cabecera, barra, leyenda y pie", () => {
    const { container } = render(
      <DistributionCard
        title="DISTRIBUCIÓN POR CRITICIDAD"
        total={5}
        totalNoun="células"
        items={items}
        footer={<span>3 de 5 células en criticidad alta o crítica</span>}
      />,
    );
    expect(screen.getByText("DISTRIBUCIÓN POR CRITICIDAD")).toBeInTheDocument();
    expect(screen.getByText("5").parentElement?.textContent).toBe("5 células");
    const segments = container.querySelectorAll(".gap-hug > div");
    expect(segments).toHaveLength(4);
    expect(segments[0].getAttribute("style")).toContain("width: 40%");
    expect(screen.getByRole("list").children).toHaveLength(4);
    expect(screen.getByText("3 de 5 células en criticidad alta o crítica")).toBeInTheDocument();
  });

  it("un segmento en cero no se dibuja pero sí está en la leyenda", () => {
    const { container } = render(
      <DistributionCard
        title="X"
        total={4}
        totalNoun="células"
        items={items.map((i) => (i.label === "Baja" ? { ...i, value: 0 } : i))}
      />,
    );
    expect(container.querySelectorAll(".gap-hug > div")).toHaveLength(3);
    expect(legendItem("Baja").textContent).toContain("0");
  });

  it("segmento y punto de leyenda comparten la clase de relleno; low lleva borde", () => {
    const { container } = render(
      <DistributionCard title="X" total={5} totalNoun="células" items={items} />,
    );
    const segments = Array.from(container.querySelectorAll(".gap-hug > div")) as HTMLElement[];
    const dotOf = (label: string) => legendItem(label).querySelector("span") as HTMLElement;
    expect(segments[0].className).toContain("bg-danger-bold");
    expect(dotOf("Crítica").className).toContain("bg-danger-bold");
    expect(segments[2].className).toContain("bg-brand-strong");
    expect(dotOf("Media").className).toContain("bg-brand-strong");
    expect(dotOf("Baja").className).toContain("bg-neutral-subtle-pressed");
    expect(dotOf("Baja").className).toContain("border-neutral-bold");
    expect(dotOf("Alta").className).not.toContain("border-neutral-bold");
  });

  it("sin pie no reserva espacio ni borde", () => {
    const { container } = render(
      <DistributionCard title="X" total={5} totalNoun="células" items={items} />,
    );
    expect(container.querySelector(".border-t-default")).toBeNull();
  });

  it("acepta cualquier vocabulario de color", () => {
    const { container } = render(
      <DistributionCard
        title="X"
        total={2}
        totalNoun="personas"
        items={[
          { label: "A", value: 1, tone: "sky" },
          { label: "B", value: 1, role: "info" },
        ]}
      />,
    );
    const segments = Array.from(container.querySelectorAll(".gap-hug > div")) as HTMLElement[];
    expect(segments[0].className).toContain("bg-accent-sky-fill");
    expect(segments[1].className).toContain("bg-info-bold");
  });
  it("con headline y action: la cifra manda, la acción ocupa el lugar del total y la leyenda va en línea", () => {
    render(
      <DistributionCard
        title="DISTRIBUCIÓN"
        headline={{ value: "61%", note: "11 de 18 en avanzado o superior" }}
        action={<a href="#niveles">Ver niveles</a>}
        legend="inline"
        items={[
          { label: "Principiante", value: 2, tone: "sky" },
          { label: "Avanzado", value: 7, tone: "violet" },
        ]}
      />,
    );
    expect(screen.getByText("61%")).toBeInTheDocument();
    expect(screen.getByText("11 de 18 en avanzado o superior")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver niveles" })).toBeInTheDocument();
    expect(screen.queryByText("personas")).not.toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(list.className).toContain("flex-wrap");
    expect(screen.getByText("Principiante").closest("li")).toHaveTextContent("Principiante2");
  });
});
