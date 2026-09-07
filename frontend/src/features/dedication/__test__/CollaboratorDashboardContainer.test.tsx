import { describe, it, expect, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetDedicationMock } from "../../../mocks/handlers/dedication.handlers";
import { resetPersonDetailMock } from "../../../mocks/handlers/personDetail.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetAbsencesMock } from "../../../mocks/handlers/absences.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import {
  CAMILA,
  CARLOS,
  DANIELA,
  ISABELLA,
  MARIA,
  SEBASTIAN,
} from "../../../mocks/handlers/personDetail.seeds";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import type { ReassignPlan } from "@features/control-tower/components/ReassignPersonDrawer";
import { CollaboratorDashboardContainer } from "../CollaboratorDashboardContainer";

const BACKEND = "11111111-1111-1111-1111-111111111111";

// El drawer real usa Select (no operable en jsdom): se reemplaza por un stub
// que dispara un plan fijo; el flujo completo corre contra el mock real.
const plan: ReassignPlan = {
  mode: "raise",
  targetSquadId: BACKEND,
  dedicationPercentage: 40,
  bauPercentage: 20,
  transformationPercentage: 20,
};
vi.mock("@features/control-tower/components/ReassignPersonDrawer", async () => {
  const React = await import("react");
  return {
    ReassignPersonDrawer: (props: {
      person: { name: string };
      onSubmit: (p: ReassignPlan) => void;
    }) =>
      React.createElement(
        "div",
        { role: "dialog" },
        React.createElement("span", null, `Drawer: ${props.person.name}`),
        React.createElement(
          "button",
          { onClick: () => props.onSubmit(plan) },
          "Aplicar plan"
        )
      ),
  };
});

// Hace las veces de la franja del shell: ahí publica la ficha su navegador de
// sprint y sus acciones.
function BreadcrumbProbe() {
  const { trailing, actions } = useLeadBreadcrumb();
  return (
    <div data-testid="breadcrumb">
      <span data-testid="trailing">{trailing}</span>
      {actions}
    </div>
  );
}

function Page() {
  const { personId } = useParams<{ personId: string }>();
  return <CollaboratorDashboardContainer personId={personId} />;
}

function renderDetail(id: string, search = "") {
  return render(
    <ToastProvider>
      <LeadBreadcrumbProvider>
        <MemoryRouter initialEntries={[`/app/lead/dedicacion/${id}${search}`]}>
          <BreadcrumbProbe />
          <Routes>
            <Route
              path="/app/lead/dedicacion"
              element={<p>Listado de dedicación</p>}
            />
            <Route path="/app/lead/dedicacion/:personId" element={<Page />} />
            <Route
              path="/app/lead/personas/:id"
              element={<p>Ficha de la persona</p>}
            />
          </Routes>
        </MemoryRouter>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
}

const cardOf = (title: string) =>
  screen.getByText(title).closest('[class*="rounded-surface"]') as HTMLElement;
/** Las pestañas de tuip responden a mouseDown, no a click. */
const openTab = (name: RegExp) =>
  fireEvent.mouseDown(screen.getByRole("tab", { name }));

describe("CollaboratorDashboardContainer", () => {
  afterEach(() => {
    resetDedicationMock();
    resetPersonDetailMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetPeopleMock();
    resetSquadsMock();
    vi.restoreAllMocks();
  });

  it("abre con la señal al frente, las cuatro métricas y las pestañas en Señales", async () => {
    renderDetail(CARLOS);
    expect(
      await screen.findByRole("heading", { name: "Carlos López" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("trailing")).toHaveTextContent("Carlos López");

    // La identidad, en una línea: cargo, célula, lo que declara y en qué anduvo.
    expect(screen.getByText("Arquitecto")).toBeInTheDocument();
    expect(screen.getByText("Backend Platform")).toBeInTheDocument();
    expect(
      screen.getByText("100 % declarado por la célula")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Kafka Migration").length).toBeGreaterThan(0);

    // El navegador de sprint y las acciones viven en la franja del breadcrumb.
    const strip = screen.getByTestId("breadcrumb");
    expect(within(strip).getByText("S18")).toBeInTheDocument();
    expect(within(strip).getByText("En curso")).toBeInTheDocument();
    expect(
      within(strip).getByRole("button", { name: "Sprint anterior" })
    ).toBeInTheDocument();

    // La cabecera: el balance al frente, y las dos cifras que lo acompañan.
    const balance = cardOf("BALANCE DEL SPRINT");
    expect(
      within(balance).getByText("Posible sobreasignación")
    ).toBeInTheDocument();
    expect(within(balance).getByText("4 señales")).toBeInTheDocument();
    expect(within(balance).getByText(/sigue en curso/)).toBeInTheDocument();
    // La medida en metric y su tope un escalón abajo: dos nodos a propósito.
    expect(within(cardOf("CAPACIDAD")).getByText("0.72")).toBeInTheDocument();
    expect(
      within(cardOf("CAPACIDAD")).getByText("/ 0.80 FTE")
    ).toBeInTheDocument();
    expect(
      within(cardOf("CAPACIDAD")).getByText("58 h · −6 h por ausencias")
    ).toBeInTheDocument();
    const demand = cardOf("DEMANDA VS REFERENCIA");
    expect(within(demand).getByText("30")).toBeInTheDocument();
    expect(within(demand).getByText("+8 SP · +36 %")).toBeInTheDocument();
    expect(
      within(demand).getByText("Marca: histórico de 22 SP")
    ).toBeInTheDocument();
    // La referencia dejó de ser una tarjeta: vive en la pestaña de señales.
    expect(screen.queryByText("REFERENCIA")).not.toBeInTheDocument();

    // Las cuatro métricas, la cuarta rotulada Foco.
    expect(
      within(cardOf("CUMPLIMIENTO")).getByText("12 de 30 SP en Closed")
    ).toBeInTheDocument();
    expect(screen.getByText("+8 SP sobre 22")).toBeInTheDocument();
    expect(within(cardOf("CARRY-OVER")).getByText("0 SP")).toBeInTheDocument();
    expect(
      within(cardOf("FOCO")).getByText("iniciativas · 4 HUs abiertas a la vez")
    ).toBeInTheDocument();
    expect(screen.queryByText("MULTITAREA")).not.toBeInTheDocument();

    // Las cuatro pestañas dicen qué hay dentro sin abrirlas.
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByText("4 de 6 hacia sobrecarga")).toBeInTheDocument();
    expect(screen.getByText("6 historias · 30 SP")).toBeInTheDocument();

    // Y abre en Señales: la tabla de evidencias con su veredicto.
    expect(screen.getByText("TOLERANCIA")).toBeInTheDocument();
    expect(
      screen.getByText("Demanda frente a su histórico")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Fuera de tolerancia/)).toHaveLength(4);
    expect(
      screen.getAllByText("No se pudo evaluar: sprint en curso")
    ).toHaveLength(2);
    // A la derecha, la referencia comparada y el trabajo que entró después.
    expect(screen.getByText("Histórico colaborador")).toBeInTheDocument();
    expect(screen.getByText("Histórico célula")).toBeInTheDocument();
    expect(screen.getByText("Sprint actual")).toBeInTheDocument();
    expect(screen.getByText("Al inicio")).toBeInTheDocument();
    expect(screen.getByText("+8 SP")).toBeInTheDocument();
  });

  it("cada pestaña trae su evidencia, y la tendencia va del más reciente al más antiguo", async () => {
    renderDetail(CARLOS);
    await screen.findByRole("heading", { name: "Carlos López" });

    openTab(/Historias/);
    expect(
      await screen.findByText(/entraron después del inicio/)
    ).toBeInTheDocument();
    expect(screen.getAllByText("Entró después")).toHaveLength(2);
    // Cada historia con su iniciativa como marca y su estado como badge.
    expect(screen.getAllByText("Kafka Migration").length).toBeGreaterThan(0);
    expect(screen.getAllByText("BAU").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Closed").length).toBeGreaterThan(0);

    openTab(/Actividad/);
    expect(await screen.findByText("COMMITS")).toBeInTheDocument();

    openTab(/Tendencia/);
    const rows = (await screen.findAllByRole("row"))
      .slice(1)
      .map((r) => within(r).getAllByRole("cell")[0].textContent);
    expect(rows[0]).toContain("S18");
    expect(rows[6]).toContain("S12");
  });

  it("el navegador de sprint mueve la ficha entera", async () => {
    renderDetail(CARLOS);
    await screen.findByRole("heading", { name: "Carlos López" });

    fireEvent.click(screen.getByRole("button", { name: "Sprint anterior" }));
    const strip = screen.getByTestId("breadcrumb");
    await waitFor(() =>
      expect(within(strip).getByText("S17")).toBeInTheDocument()
    );
    expect(within(strip).getByText("Finalizado")).toBeInTheDocument();
    // Un sprint sellado ya trae su fecha de cierre en el pie del balance.
    await waitFor(() =>
      expect(
        within(cardOf("BALANCE DEL SPRINT")).getByText(/Sellado el 16 ago/)
      ).toBeInTheDocument()
    );
  });

  it("elegir una fila de la tendencia lleva la ficha a ese sprint", async () => {
    renderDetail(CARLOS);
    await screen.findByRole("heading", { name: "Carlos López" });
    openTab(/Tendencia/);
    fireEvent.click(await screen.findByText("S14"));
    openTab(/Historias/);
    expect(
      await screen.findByText(/Estrategia de particionamiento/)
    ).toBeInTheDocument();
  });

  it("abre en el sprint de la URL", async () => {
    renderDetail(CARLOS, "?sprint=S13");
    await screen.findByRole("heading", { name: "Carlos López" });
    openTab(/Historias/);
    expect(
      await screen.findByText(/Contrato de eventos con el core de tarjetas/)
    ).toBeInTheDocument();
  });

  it("un sprint cerrado sin snapshot no muestra cifras de cierre y lo explica", async () => {
    renderDetail(MARIA, "?sprint=S15");
    await screen.findByRole("heading", { name: "María González" });
    const balance = () => cardOf("BALANCE DEL SPRINT");
    await waitFor(() =>
      expect(within(balance()).getByText("No evaluable")).toBeInTheDocument()
    );
    expect(
      within(balance()).getByText("Sprint sin snapshot")
    ).toBeInTheDocument();
    // Las evidencias que dependen del cierre lo dicen con su motivo.
    expect(
      screen.getAllByText("No se pudo evaluar: sprint sin snapshot").length
    ).toBeGreaterThan(0);
    // Y en la tendencia queda marcado y sin cifras.
    openTab(/Tendencia/);
    const s15 = (await screen.findAllByText("S15"))
      .map((el) => el.closest("tr"))
      .find(Boolean) as HTMLElement;
    expect(within(s15).getByText("Sin snapshot")).toBeInTheDocument();
    expect(within(s15).getAllByText("–").length).toBeGreaterThan(0);
  });

  it("la ficha no repite la anotación de célula: la señal ya dice lo suyo", async () => {
    renderDetail(SEBASTIAN);
    await screen.findByRole("heading", { name: "Sebastián Cárdenas" });
    // Su célula se comporta igual, y aun así la señal no baja.
    expect(
      within(cardOf("BALANCE DEL SPRINT")).getByText("Posible subasignación")
    ).toBeInTheDocument();
    // El boceto no le reserva lugar a la anotación, y se implementó tal cual:
    // esa lectura se conserva en el tooltip de su fila del listado.
    expect(screen.queryByText(/Contexto de célula/)).toBeNull();
    expect(screen.queryByText(/La célula se comporta igual/)).toBeNull();
  });

  it("con histórico insuficiente muestra lo que sí se puede medir y dice cuántos faltan", async () => {
    renderDetail(ISABELLA);
    await screen.findByRole("heading", { name: "Isabella Moreno" });
    // A tiempo parcial: su capacidad se lee sobre su contrato, no sobre 1.0.
    expect(within(cardOf("CAPACIDAD")).getByText("0.45")).toBeInTheDocument();
    expect(
      within(cardOf("CAPACIDAD")).getByText("/ 0.50 FTE")
    ).toBeInTheDocument();
    expect(
      within(cardOf("DEMANDA VS REFERENCIA")).getByText("14")
    ).toBeInTheDocument();
    const balance = cardOf("BALANCE DEL SPRINT");
    expect(within(balance).getByText("No evaluable")).toBeInTheDocument();
    expect(
      within(balance).getByText("Histórico insuficiente")
    ).toBeInTheDocument();
    expect(within(balance).getByText(/Hacen falta 3/)).toBeInTheDocument();
  });

  it("reasignar refresca la identidad sin mover la señal", async () => {
    renderDetail(CARLOS);
    await screen.findByRole("heading", { name: "Carlos López" });
    expect(
      screen.getByText("100 % declarado por la célula")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reasignar/ }));
    fireEvent.click(await screen.findByText("Aplicar plan"));

    await waitFor(() =>
      expect(
        screen.getByText("40 % declarado por la célula")
      ).toBeInTheDocument()
    );
    // La señal no depende del FTE asignado: sigue igual.
    expect(
      within(cardOf("BALANCE DEL SPRINT")).getByText("Posible sobreasignación")
    ).toBeInTheDocument();
  });

  it("actualizar un colaborador desde DevOps confirma con un toast", async () => {
    renderDetail(CARLOS);
    await screen.findByRole("heading", { name: "Carlos López" });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(
      await screen.findByText("Actualizado desde Azure DevOps", undefined, {
        timeout: 3000,
      })
    ).toBeInTheDocument();
  });

  it("sin identidad: estado vacío con la acción de vincular desde la ficha", async () => {
    renderDetail(CAMILA);
    expect(await screen.findByText("Sin identidad DevOps")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByText("CAPACIDAD")).not.toBeInTheDocument();
    expect(screen.queryByText("BALANCE DEL SPRINT")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Vincular desde la ficha" })
    );
    expect(await screen.findByText("Ficha de la persona")).toBeInTheDocument();
  });

  it("sin sprints en DevOps: estado vacío con la acción de actualizar", async () => {
    renderDetail(DANIELA);
    expect(
      await screen.findByText("Sin sprints en Azure DevOps")
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("un colaborador inexistente muestra el estado vacío con vuelta al listado", async () => {
    renderDetail("no-existe");
    expect(
      await screen.findByText("Colaborador no encontrado")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ir a Capacidad" }));
    expect(
      await screen.findByText("Listado de dedicación")
    ).toBeInTheDocument();
  });
});
