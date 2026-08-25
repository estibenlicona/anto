import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { SquadsContainer } from "../SquadsContainer";

/**
 * Cubre encabezado, resumen y listado (carga real vía el servidor de mocks),
 * más la navegación de "Ver equipo". Los flujos de alta/edición/borrado
 * requieren abrir `SquadFormDrawer`/`DeleteSquadConfirmDialog` (`Modal` de
 * @tuya-ui/components, sobre `@radix-ui/react-dialog`) — ver la nota en
 * `components/__test__/SquadFormDrawer.validate.test.ts` sobre por qué eso
 * no se puede montar en jsdom en este repo. Esos flujos (y el refetch del
 * resumen tras una mutación) se verifican manualmente en el navegador
 * (tasks.md, 7.2); acá solo se prueba la lógica de validación
 * (`SquadFormDrawer.validate.test.ts`) y los hooks/servicio que los alimentan.
 */
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{location.pathname + location.search}</div>
  );
}

function renderContainer() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={["/app/lead/celulas"]}>
        <Routes>
          <Route path="/app/lead/celulas" element={<SquadsContainer />} />
          <Route path="/app/lead/celulas/:id" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

describe("SquadsContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("shows the module header with the create action and no open modal", async () => {
    renderContainer();
    await screen.findByText("Backend Platform");
    expect(
      screen.getByRole("heading", { level: 1, name: "Células" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nueva célula" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the three summary cards computed over every squad", async () => {
    renderContainer();
    await screen.findByText("Backend Platform");
    expect(await screen.findByText("CÉLULAS")).toBeInTheDocument();
    expect(screen.getByText("CAPACIDAD ASIGNADA")).toBeInTheDocument();
    expect(screen.getByText("DISTRIBUCIÓN POR CRITICIDAD")).toBeInTheDocument();
    // Las semillas tienen una célula sin personas y cubren los 4 niveles.
    const cellsCard = screen
      .getByText("CÉLULAS")
      .closest("div")!.parentElement!;
    expect(cellsCard).toHaveTextContent(/1 sin personas/);
    const distributionCard = screen
      .getByText("DISTRIBUCIÓN POR CRITICIDAD")
      .closest("div")!.parentElement!;
    expect(within(distributionCard).getAllByRole("listitem")).toHaveLength(4);
  });

  it("lists the squads with team and capacity derived from allocations", async () => {
    renderContainer();
    expect(await screen.findByText("Backend Platform")).toBeInTheDocument();
    expect(screen.getByText("Canales Digitales")).toBeInTheDocument();
    expect(screen.getByText("Sin personas")).toBeInTheDocument();
    expect(screen.getByText("4 personas")).toBeInTheDocument();
  });

  it("the squad name links to its detail page", async () => {
    renderContainer();
    const link = await screen.findByRole("link", { name: "Backend Platform" });
    expect(link).toHaveAttribute(
      "href",
      "/app/lead/celulas/11111111-1111-1111-1111-111111111111"
    );
    fireEvent.click(link);
    expect(await screen.findByTestId("location")).toHaveTextContent(
      "/app/lead/celulas/11111111-1111-1111-1111-111111111111"
    );
  });
});
