import { describe, it, expect, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { allocationService } from "@features/allocations/services/allocationService";
import { capacityOverviewService } from "../services/capacityOverviewService";
import { ControlTowerContainer } from "../ControlTowerContainer";
import type { ReassignPlan } from "../components/ReassignPersonDrawer";

// El drawer real usa Select (no simulable en jsdom para elegir destino): se
// reemplaza por un stub que expone `onSubmit` con un plan fijo, y el flujo
// completo (quitar + crear, refetch) se ejercita contra el mock real.
let plan: ReassignPlan = {
  mode: "assign",
  targetSquadId: "44444444-4444-4444-4444-444444444444",
  dedicationPercentage: 100,
  bauPercentage: 60,
  transformationPercentage: 40,
};
vi.mock("../components/ReassignPersonDrawer", async () => {
  const React = await import("react");
  return {
    ReassignPersonDrawer: ({
      person,
      onSubmit,
      serverError,
    }: {
      person: { name: string };
      onSubmit: (p: ReassignPlan) => void;
      serverError: string | null;
    }) =>
      React.createElement(
        "div",
        { role: "dialog" },
        React.createElement("span", null, `Drawer: ${person.name}`),
        serverError ? React.createElement("p", null, serverError) : null,
        React.createElement(
          "button",
          { onClick: () => onSubmit(plan) },
          "Aplicar plan"
        )
      ),
  };
});

function renderTower() {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <ControlTowerContainer />
      </MemoryRouter>
    </ToastProvider>
  );
}

describe("ControlTowerContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
    vi.restoreAllMocks();
  });

  it("muestra el encabezado, las cards y los dos paneles con el mock real", async () => {
    renderTower();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Torre de control" })
    ).toBeInTheDocument();
    expect(await screen.findByText("FTE DEL CHAPTER")).toBeInTheDocument();
    expect(screen.getByText("PERSONAS CON MARGEN")).toBeInTheDocument();
    expect(screen.getByText("Personas con margen")).toBeInTheDocument();
    expect(screen.getByText("Ocupación por célula")).toBeInTheDocument();
    // Sin célula primero.
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Sin célula")).toBeInTheDocument();
  });

  it("asignar a una persona sin célula la saca del panel y refresca la Torre", async () => {
    renderTower();
    await screen.findByText("Personas con margen");
    const before = await capacityOverviewService.getOverview();
    const firstRow = screen.getAllByRole("row")[1];
    const name = firstRow.querySelector("span.font-medium")!.textContent!;
    fireEvent.click(within(firstRow).getByRole("button", { name: "Asignar" }));
    expect(await screen.findByText(`Drawer: ${name}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aplicar plan" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const after = await capacityOverviewService.getOverview();
    expect(after.peopleUnassigned).toBe(before.peopleUnassigned - 1);
  });

  it("mover: quita y crea; si la creación falla, lo dice explícitamente", async () => {
    plan = { ...plan, mode: "move" };
    vi.spyOn(allocationService, "create").mockRejectedValue(
      new Error("Destino inválido")
    );
    renderTower();
    await screen.findByText("Personas con margen");
    const reassign = (
      await screen.findAllByRole("button", { name: "Reasignar" })
    )[0];
    const row = reassign.closest("tr")!;
    const name = row.querySelector("span.font-medium")!.textContent!;
    fireEvent.click(reassign);
    expect(await screen.findByText(`Drawer: ${name}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aplicar plan" }));
    expect(
      await screen.findByText(/La asignación anterior ya fue quitada/)
    ).toBeInTheDocument();
    const overview = await capacityOverviewService.getOverview();
    expect(overview.people.find((p) => p.name === name)!.allocation).toBeNull();
    plan = { ...plan, mode: "assign" };
  });
});
