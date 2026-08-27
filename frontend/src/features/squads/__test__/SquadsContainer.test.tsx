import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { SquadsContainer } from "../SquadsContainer";

// Hace las veces de la franja del breadcrumb del shell: pinta lo que el
// contenedor publica ahí (el botón "Nueva célula").
function BreadcrumbActionsProbe() {
  const { actions } = useLeadBreadcrumb();
  return <div data-testid="breadcrumb-actions">{actions}</div>;
}

/**
 * Cubre la acción publicada en la franja del breadcrumb, el resumen y el
 * listado (carga real vía el servidor de mocks),
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
      <LeadBreadcrumbProvider>
        <MemoryRouter initialEntries={["/app/lead/celulas"]}>
          <BreadcrumbActionsProbe />
          <Routes>
            <Route path="/app/lead/celulas" element={<SquadsContainer />} />
            <Route path="/app/lead/celulas/:id" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
}

describe("SquadsContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("publishes the create action to the breadcrumb strip instead of a module header", async () => {
    renderContainer();
    await screen.findByText("Backend Platform");
    // Sin título ni descripción visibles: el nombre lo pone el breadcrumb.
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Las células del chapter, con su criticidad y la capacidad asignada"
      )
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("breadcrumb-actions")).getByRole("button", {
        name: "Nueva célula",
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the create action published while the list is still loading", () => {
    renderContainer();
    expect(
      within(screen.getByTestId("breadcrumb-actions")).getByRole("button", {
        name: "Nueva célula",
      })
    ).toBeInTheDocument();
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

  it("separates the summary from the list with the same 12px used in absences", async () => {
    renderContainer();
    await screen.findByText("CÉLULAS");
    // El raíz de la vista es el padre del grid de cards: resumen y listado
    // se apilan con gap-3, la única medida de separación de la pantalla
    // (misma que ausencias); antes era gap-2 y las cards iban a gap-4.
    const root = screen.getByText("CÉLULAS").closest(".grid")!.parentElement!;
    expect(root).toHaveClass("gap-3");
    expect(root).not.toHaveClass("gap-2");
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
