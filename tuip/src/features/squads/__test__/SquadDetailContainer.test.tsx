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
import { SquadDetailContainer } from "../SquadDetailContainer";

const BACKEND = "11111111-1111-1111-1111-111111111111";
const PAGOS = "44444444-4444-4444-4444-444444444444";

function BreadcrumbProbe() {
  const { trailing } = useLeadBreadcrumb();
  return <div data-testid="trailing">{trailing ?? ""}</div>;
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function Detail() {
  const location = useLocation();
  const id = location.pathname.split("/").pop();
  return <SquadDetailContainer squadId={id} />;
}

/**
 * Carga real vía el servidor de mocks. Editar y eliminar abren `Modal`
 * (radix dialog); lo que sí se verifica acá es el encabezado, las cards, la
 * tabla del equipo, el not-found y el breadcrumb publicado. El refetch del
 * resumen tras una mutación se verifica en el navegador (tasks.md, 7.2).
 */
function renderDetail(squadId: string) {
  return render(
    <ToastProvider>
      <LeadBreadcrumbProvider>
        <MemoryRouter initialEntries={[`/app/lead/celulas/${squadId}`]}>
          <BreadcrumbProbe />
          <Routes>
            <Route path="/app/lead/celulas" element={<LocationProbe />} />
            <Route path="/app/lead/celulas/:id" element={<Detail />} />
          </Routes>
        </MemoryRouter>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
}

describe("SquadDetailContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("muestra el encabezado de la célula y publica su nombre en el breadcrumb", async () => {
    renderDetail(BACKEND);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Backend Platform" })
    ).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Ecosistema Digital")).toBeInTheDocument();
    expect(screen.getByTestId("trailing")).toHaveTextContent(
      "Backend Platform"
    );
  });

  it("muestra las dos cards de personas con datos de las semillas", async () => {
    renderDetail(BACKEND);
    expect(await screen.findByText("PERSONAS")).toBeInTheDocument();
    // Capacidad y mix fusionados en una sola card: el total del mix era la
    // capacidad asignada, así que la card del mix aparte ya no existe.
    expect(screen.getByText("CAPACIDAD")).toBeInTheDocument();
    expect(
      screen.queryByText("MIX BAU / TRANSFORMACIÓN")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("del esfuerzo va a operación", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText(/acompañamiento/).textContent).toMatch(
      /^\d+ expertos? · \d+ requieren? acompañamiento$/
    );
  });

  it("muestra la tab Personas con la tabla de asignaciones y la disponibilidad", async () => {
    renderDetail(BACKEND);
    const tab = await screen.findByRole("tab", { name: /Personas/ });
    expect(tab).toHaveTextContent("4");
    const table = await screen.findByRole("table");
    expect(within(table).getByText("María González")).toBeInTheDocument();
    expect(within(table).getByText("20% libre")).toBeInTheDocument();
    expect(within(table).getAllByText("0% libre").length).toBeGreaterThan(0);
  });

  it("una célula sin personas muestra el estado vacío de la sección Personas", async () => {
    renderDetail(PAGOS);
    expect(
      await screen.findByText("Todavía no hay personas asignadas")
    ).toBeInTheDocument();
  });

  it("una célula inexistente muestra not-found con vuelta al listado", async () => {
    renderDetail("no-existe");
    expect(await screen.findByText("Célula no encontrada")).toBeInTheDocument();
    expect(screen.getByTestId("trailing")).toHaveTextContent("");
    fireEvent.click(
      screen.getByRole("button", { name: "Ir al listado de células" })
    );
    expect(await screen.findByTestId("location")).toHaveTextContent(
      "/app/lead/celulas"
    );
  });
});
