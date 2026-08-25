import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SquadTeamStatsCards } from "../SquadTeamStatsCards";
import type { SquadTeamStats } from "../../services/squadService";

// Escenario del spec: 4 personas, 2 expertos, 1 principiante, 2.7 FTE
// (1.7 BAU / 1.0 Transformación) sobre 3.8 FTE disponibles del equipo.
const stats: SquadTeamStats = {
  memberCount: 4,
  members: [
    { id: "p1", name: "Andrés Martínez" },
    { id: "p2", name: "Carlos López" },
    { id: "p3", name: "María González" },
    { id: "p4", name: "Paula Ramírez" },
  ],
  expertCount: 2,
  beginnerCount: 1,
  allocatedFte: 2.7,
  bauFte: 1.7,
  transformationFte: 1,
  peopleAvailableFte: 3.8,
};

describe("SquadTeamStatsCards", () => {
  it("no renderiza nada mientras carga o sin datos", () => {
    const { container, rerender } = render(
      <SquadTeamStatsCards stats={null} loading />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<SquadTeamStatsCards stats={null} loading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra las personas con avatares y la lectura de expertos / acompañamiento", () => {
    render(<SquadTeamStatsCards stats={stats} loading={false} />);
    expect(screen.getByText("PERSONAS")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(screen.getByText("PR")).toBeInTheDocument();
    expect(screen.getByText("expertos", { exact: false }).textContent).toBe(
      "2 expertos · 1 requiere acompañamiento"
    );
  });

  it("la card única de Capacidad muestra asignado, ocupación, mix, libre y su lectura", () => {
    render(<SquadTeamStatsCards stats={stats} loading={false} />);
    // La cifra fusionada: 2.7 sobre 3.8, una sola vez en el resumen.
    expect(screen.getByText("2.7")).toBeInTheDocument();
    expect(screen.getByText("/ 3.8 FTE", { exact: false })).toBeInTheDocument();
    // Ocupación por severidad, no barra decorativa: CapacityBar la anuncia.
    expect(screen.getByLabelText("71% de ocupación")).toBeInTheDocument();
    // El reparto como leyenda de la misma barra — no una segunda card.
    // SegmentedBar suma un texto oculto por segmento ("BAU: 1.7"), así que
    // "BAU" aparece dos veces: la leyenda y el sr-only. Alcanza con que
    // alguna lleve el valor al lado.
    const bauHits = screen.getAllByText("BAU", { exact: false });
    expect(
      bauHits.some((el) => el.closest("span")?.textContent?.includes("1.7"))
    ).toBe(true);
    const transfHits = screen.getAllByText("Transf.", { exact: false });
    expect(
      transfHits.some((el) => el.closest("span")?.textContent?.includes("1.0"))
    ).toBe(true);
    expect(screen.getByText("1.1 libre", { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText("del esfuerzo va a operación", { exact: false })
        .textContent
    ).toBe("63% del esfuerzo va a operación");
    // La card del mix aparte ya no existe.
    expect(
      screen.queryByText("MIX BAU / TRANSFORMACIÓN")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("del FTE disponible del equipo", { exact: false })
    ).not.toBeInTheDocument();
  });

  it("no divide por cero en una célula sin equipo", () => {
    render(
      <SquadTeamStatsCards
        stats={{
          memberCount: 0,
          members: [],
          expertCount: 0,
          beginnerCount: 0,
          allocatedFte: 0,
          bauFte: 0,
          transformationFte: 0,
          peopleAvailableFte: 0,
        }}
        loading={false}
      />
    );
    // Estado vacío de CapacityBar: la cifra en cero y la invitación, sin NaN.
    expect(
      screen.getAllByText("0.0", { exact: false }).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sin asignaciones todavía")).toBeInTheDocument();
    expect(
      screen.getByText("del esfuerzo va a operación", { exact: false })
        .textContent
    ).toBe("0% del esfuerzo va a operación");
  });
});
