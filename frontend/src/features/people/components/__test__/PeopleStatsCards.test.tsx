import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { accentTones, segmentFillClass } from "@tuya-ui/components";
import { PeopleStatsCards } from "../PeopleStatsCards";
import type { PeopleStats } from "../../services/personService";

const stats: PeopleStats = {
  activeCount: 18,
  fteAvailable: 17.8,
  fteTarget: 12,
  bySeniority: [
    { seniority: 1, label: "Principiante", count: 2 },
    { seniority: 2, label: "Competente", count: 5 },
    { seniority: 3, label: "Avanzado", count: 7 },
    { seniority: 4, label: "Experto", count: 4 },
  ],
  sample: [{ id: "p-1", name: "María González" }],
  stackCoverage: { distinct: 0, atRisk: [] },
};

// La correspondencia card–listado se prueba por clase compartida, no por hex:
// el punto de leyenda, el segmento de la barra y el medidor del listado usan
// la misma clase `bg-accent-<matiz>-fill`, así que son el mismo color por
// construcción. Qué valor tiene cada matiz es asunto de tuip.
// Derivadas de tuip, no literales: la escala puede cambiar de matiz o de nombre
// y el test sigue verificando lo que importa — que la card usa la misma clase
// que el medidor para el mismo nivel.
const EXPECTED_DOT_CLASS: Record<string, string> = {
  Principiante: segmentFillClass({ tone: accentTones[0] }),
  Competente: segmentFillClass({ tone: accentTones[1] }),
  Avanzado: segmentFillClass({ tone: accentTones[2] }),
  Experto: segmentFillClass({ tone: accentTones[3] }),
};

function legendItemFor(label: string): HTMLElement {
  const item = screen.getByText(label).closest("li");
  expect(item).not.toBeNull();
  return item!;
}

describe("PeopleStatsCards — distribución por seniority", () => {
  it("la leyenda muestra cada nivel con su punto de acento y su conteo", () => {
    render(<PeopleStatsCards stats={stats} loading={false} />);

    for (const entry of stats.bySeniority) {
      const item = legendItemFor(entry.label);
      const dot = item.querySelector("span");
      expect(dot?.className).toContain(EXPECTED_DOT_CLASS[entry.label]);
      expect(item.textContent).toContain(String(entry.count));
    }
  });

  it("la barra usa tonos de acento y no clases semánticas", () => {
    const { container } = render(
      <PeopleStatsCards stats={stats} loading={false} />
    );

    const segments = container.querySelectorAll(
      '[class*="bg-accent-"][style*="width"]'
    );
    // Cuatro segmentos, uno por nivel, todos de acento.
    expect(segments).toHaveLength(4);
    const boldSegments = container.querySelectorAll(
      '[class*="-bold"][style*="width"]'
    );
    expect(boldSegments).toHaveLength(0);
  });

  it("abre con el % en avanzado o superior y la leyenda en línea lleva cada conteo", () => {
    render(<PeopleStatsCards stats={stats} loading={false} />);

    // (7 + 4) / 18 = 61.1 → 61%, con su lectura al lado.
    expect(screen.getByText("61%")).toBeInTheDocument();
    expect(
      screen.getByText("11 de 18 en avanzado o superior")
    ).toBeInTheDocument();
    expect(screen.getByText("Principiante").closest("li")).toHaveTextContent(
      "2"
    );
    expect(screen.getByText("Experto").closest("li")).toHaveTextContent("4");
  });

  it("con el resumen de asignación muestra cuántas están en células y el enlace", () => {
    render(
      <MemoryRouter>
        <PeopleStatsCards
          stats={stats}
          loading={false}
          assignment={{ assigned: 9, squadsWithPeople: 4 }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("9 en 4 células")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver células" })).toHaveAttribute(
      "href",
      "/app/lead/celulas"
    );
  });

  it("el pie no divide por cero y usa singular cuando corresponde", () => {
    const one: PeopleStats = {
      ...stats,
      activeCount: 0,
      bySeniority: [
        { seniority: 1, label: "Principiante", count: 1 },
        { seniority: 2, label: "Competente", count: 0 },
        { seniority: 3, label: "Avanzado", count: 0 },
        { seniority: 4, label: "Experto", count: 0 },
      ],
    };
    render(<PeopleStatsCards stats={one} loading={false} />);

    // Total 0 → 0% sin NaN.
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(
      screen.getByText("0 de 0 en avanzado o superior")
    ).toBeInTheDocument();
  });
  it("la cobertura por stack marca en riesgo los que dependen de una sola persona", () => {
    render(
      <PeopleStatsCards
        stats={{
          ...stats,
          stackCoverage: { distinct: 11, atRisk: ["AS400", "MuleSoft"] },
        }}
        loading={false}
      />
    );
    expect(screen.getByText("STACKS SIN RESPALDO")).toBeInTheDocument();
    expect(
      screen.getByText("de 11 registrados · 9 con respaldo")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Con 2 o más personas").closest("li")
    ).toHaveTextContent("9");
    expect(screen.getByText("Sin respaldo").closest("li")).toHaveTextContent(
      "2"
    );
    expect(screen.queryByText("FTE DISPONIBLE")).not.toBeInTheDocument();
  });

  it("sin stacks en riesgo la barra no tiene tramo de advertencia", () => {
    render(
      <PeopleStatsCards
        stats={{ ...stats, stackCoverage: { distinct: 1, atRisk: [] } }}
        loading={false}
      />
    );
    expect(
      screen.getByText("de 1 registrado · 1 con respaldo")
    ).toBeInTheDocument();
    expect(screen.getByText("Sin respaldo").closest("li")).toHaveTextContent(
      "0"
    );
  });
  it("la barra de stacks va en azul de acento y gris claro, sin roles de estado", () => {
    render(
      <PeopleStatsCards
        stats={{
          ...stats,
          stackCoverage: { distinct: 11, atRisk: ["AS400", "MuleSoft"] },
        }}
        loading={false}
      />
    );
    const backed = screen
      .getByText("Con 2 o más personas")
      .closest("li")!
      .querySelector("span")!;
    const risk = screen
      .getByText("Sin respaldo")
      .closest("li")!
      .querySelector("span")!;
    expect(backed.className).toContain(segmentFillClass({ tone: "blue" }));
    expect(risk.className).toContain(segmentFillClass({ heat: "low" }));
    expect(risk.className).not.toContain("bg-warning-bold");
  });
});
