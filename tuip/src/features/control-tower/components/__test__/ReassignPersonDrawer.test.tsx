import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReassignPersonDrawer } from "../ReassignPersonDrawer";
import type {
  OverviewPerson,
  OverviewSquad,
} from "../../adapters/CapacityOverviewAdapter";

const squads: OverviewSquad[] = [
  {
    id: "pagos",
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
    id: "fraude",
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
const valentina: OverviewPerson = {
  id: "v",
  name: "Valentina Ospina",
  position: "UX Designer",
  seniorityLabel: "Avanzado",
  availableFte: 1,
  allocation: {
    id: "a1",
    squadId: "fraude",
    squadName: "Fraude Tarjetas",
    dedicationPercentage: 60,
    bauPercentage: 20,
    transformationPercentage: 40,
  },
  marginPercentage: 40,
  marginFte: 0.4,
};
const diego: OverviewPerson = {
  id: "d",
  name: "Diego Salazar",
  position: "Backend Dev",
  seniorityLabel: "Principiante",
  availableFte: 1,
  allocation: null,
  marginPercentage: 100,
  marginFte: 1,
};

function renderDrawer(
  person: OverviewPerson,
  onSubmit = vi.fn(),
  extra: {
    initialMode?: "assign" | "move" | "raise";
    initialTargetSquadId?: string;
  } = {}
) {
  render(
    <ReassignPersonDrawer
      open
      onOpenChange={() => {}}
      person={person}
      squads={squads}
      saving={false}
      serverError={null}
      onSubmit={onSubmit}
      {...extra}
    />
  );
  return onSubmit;
}

describe("ReassignPersonDrawer", () => {
  it("para una persona con célula arranca en 'mover' con su situación actual", () => {
    renderDrawer(valentina);
    expect(
      screen.getByRole("heading", { name: "Reasignar a Valentina Ospina" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hoy está en Fraude Tarjetas al 60%/)
    ).toBeInTheDocument();
    expect(screen.getByText("40% libre")).toBeInTheDocument();
    expect(screen.getAllByText("Mover a otra célula").length).toBeGreaterThan(
      0
    );
    expect(screen.getByText("Seleccionar célula…")).toBeInTheDocument();
  });

  it("para una persona sin célula ofrece sólo 'asignar' y arranca en 100 %", () => {
    renderDrawer(diego);
    expect(
      screen.getByRole("heading", { name: "Asignar a Diego Salazar" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Asignar a una célula").length).toBeGreaterThan(
      0
    );
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Asignar" })).toBeInTheDocument();
  });

  it("al enviar sin destino señala el campo y cuenta los obligatorios; sin 'Así queda'", () => {
    const onSubmit = renderDrawer(valentina);
    fireEvent.click(screen.getByRole("button", { name: "Reasignar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Selecciona la célula destino")).toBeInTheDocument();
    expect(
      screen.getByText("1 campo obligatorio sin llenar")
    ).toBeInTheDocument();
    expect(screen.queryByText("Así queda")).not.toBeInTheDocument();
  });

  it("valida el desglose contra la dedicación", () => {
    const onSubmit = renderDrawer(diego);
    fireEvent.change(screen.getByLabelText(/BAU/), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/Transformación/), {
      target: { value: "30" },
    });
    // sin destino todavía: elegir una célula no se puede simular por Select; se valida el desglose.
    fireEvent.click(screen.getByRole("button", { name: "Asignar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("BAU + Transformación debe ser igual a la dedicación")
    ).toBeInTheDocument();
  });

  it("initialMode raise arranca en subir con la célula actual como destino fijo", () => {
    renderDrawer(valentina, vi.fn(), { initialMode: "raise" });
    expect(
      screen.getAllByText("Subir la dedicación en Fraude Tarjetas").length
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Seleccionar célula…")).not.toBeInTheDocument();
  });

  it("initialTargetSquadId preselecciona el destino al asignar", () => {
    renderDrawer(diego, vi.fn(), { initialTargetSquadId: "pagos" });
    expect(screen.queryByText("Seleccionar célula…")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Pagos Instantáneos/).length).toBeGreaterThan(0);
  });
});
