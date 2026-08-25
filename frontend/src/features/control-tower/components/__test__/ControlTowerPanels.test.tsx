import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ControlTowerStatsCards } from "../ControlTowerStatsCards";
import { PeopleWithMarginPanel } from "../PeopleWithMarginPanel";
import { SquadOccupancyPanel } from "../SquadOccupancyPanel";
import type {
  CapacityOverview,
  OverviewPerson,
  OverviewSquad,
} from "../../adapters/CapacityOverviewAdapter";

const unassigned: OverviewPerson = {
  id: "none",
  name: "Diego Salazar",
  position: "Backend Dev",
  seniorityLabel: "Principiante",
  availableFte: 1,
  allocation: null,
  marginPercentage: 100,
  marginFte: 1,
};
const partial: OverviewPerson = {
  id: "half",
  name: "Valentina Ospina",
  position: "UX Designer",
  seniorityLabel: "Avanzado",
  availableFte: 1,
  allocation: {
    id: "a1",
    squadId: "s1",
    squadName: "Fraude Tarjetas",
    dedicationPercentage: 60,
    bauPercentage: 20,
    transformationPercentage: 40,
  },
  marginPercentage: 40,
  marginFte: 0.4,
};
const squads: OverviewSquad[] = [
  {
    id: "s3",
    name: "Pagos Instantáneos",
    criticality: "Low",
    criticalityLabel: "Baja",
    memberCount: 0,
    allocatedFte: 0,
    teamAvailableFte: 0,
    bauFte: 0,
    transformationFte: 0,
    freeFte: 0,
    atCapacity: false,
    withoutTeam: true,
  },
  {
    id: "s1",
    name: "Fraude Tarjetas",
    criticality: "Critical",
    criticalityLabel: "Crítica",
    memberCount: 1,
    allocatedFte: 0.6,
    teamAvailableFte: 1,
    bauFte: 0.2,
    transformationFte: 0.4,
    freeFte: 0.4,
    atCapacity: false,
    withoutTeam: false,
  },
];
const overview: CapacityOverview = {
  chapterFte: 17.8,
  bauFte: 4,
  transformationFte: 2.9,
  freeFte: 10.9,
  peopleTotal: 18,
  peopleUnassigned: 6,
  peoplePartial: 3,
  squadsAtCapacity: 2,
  squadsWithoutTeam: 1,
  people: [unassigned, partial],
  squads,
};

describe("ControlTowerStatsCards", () => {
  it("no renderiza en carga y muestra los tres indicadores con datos", () => {
    const { container, rerender } = render(
      <ControlTowerStatsCards overview={null} loading />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<ControlTowerStatsCards overview={overview} loading={false} />);
    expect(screen.getByText("FTE DEL CHAPTER")).toBeInTheDocument();
    expect(
      screen.getByText("del FTE del chapter sin asignar", { exact: false })
        .textContent
    ).toBe("61% del FTE del chapter sin asignar");
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("sin célula", { exact: false }).textContent).toBe(
      "6 sin célula"
    );
    expect(screen.getByText("al tope · 1 sin equipo")).toBeInTheDocument();
  });
});

describe("PeopleWithMarginPanel", () => {
  function renderPanel(onAssign = vi.fn(), onReassign = vi.fn()) {
    render(
      <MemoryRouter>
        <PeopleWithMarginPanel
          people={[unassigned, partial]}
          atCapacityCount={9}
          onAssign={onAssign}
          onReassign={onReassign}
        />
      </MemoryRouter>
    );
    return { onAssign, onReassign };
  }

  it("muestra sin célula con Asignar y parciales con Reasignar, en ese orden", () => {
    const { onAssign, onReassign } = renderPanel();
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Sin célula")).toBeInTheDocument();
    expect(within(rows[0]).getByText("1.0 FTE libre")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Fraude Tarjetas")).toBeInTheDocument();
    expect(within(rows[1]).getByText("60%")).toBeInTheDocument();
    expect(within(rows[1]).getByText("40%")).toBeInTheDocument();
    expect(within(rows[1]).getByText("0.4 FTE libre")).toBeInTheDocument();
    fireEvent.click(within(rows[0]).getByRole("button", { name: "Asignar" }));
    expect(onAssign).toHaveBeenCalledWith(unassigned);
    fireEvent.click(within(rows[1]).getByRole("button", { name: "Reasignar" }));
    expect(onReassign).toHaveBeenCalledWith(partial);
    expect(screen.getByText(/9 personas están al 100 %/)).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando nadie tiene margen", () => {
    render(
      <MemoryRouter>
        <PeopleWithMarginPanel
          people={[]}
          atCapacityCount={18}
          onAssign={vi.fn()}
          onReassign={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Nadie tiene margen")).toBeInTheDocument();
  });
});

describe("SquadOccupancyPanel", () => {
  it("lista las células en el orden recibido, con 'Sin equipo' y su CapacityBar", () => {
    render(
      <MemoryRouter>
        <SquadOccupancyPanel squads={squads} />
      </MemoryRouter>
    );
    const items = screen.getAllByRole("listitem");
    expect(
      within(items[0]).getByText("Pagos Instantáneos")
    ).toBeInTheDocument();
    expect(within(items[0]).getByText("Sin equipo")).toBeInTheDocument();
    expect(
      within(items[0]).getByText("Necesita equipo primero")
    ).toBeInTheDocument();
    expect(within(items[1]).getByText("Crítica")).toBeInTheDocument();
    expect(within(items[1]).getByText("0.4 libre")).toBeInTheDocument();
    expect(
      within(items[1]).getByRole("link", { name: "Fraude Tarjetas" })
    ).toHaveAttribute("href", "/app/lead/celulas/s1");
  });
});
