import { describe, it, expect, afterEach } from "vitest";
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
import { resetPersonDetailMock } from "../../../mocks/handlers/personDetail.handlers";
import { resetBacklogMock } from "../../../mocks/handlers/backlog.handlers";
import { MARIA } from "../../../mocks/handlers/personDetail.seeds";
import { backlogService } from "../services/backlogService";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { BacklogContainer } from "../BacklogContainer";

// Hace las veces de la franja del breadcrumb del shell: pinta lo que el
// contenedor publica ahí (el resumen del día, que casi todos los tests usan
// como centinela de carga).
function BreadcrumbActionsProbe() {
  const { actions } = useLeadBreadcrumb();
  return <div data-testid="breadcrumb-actions">{actions}</div>;
}

function renderBacklog(path = "/app/lead/backlog") {
  return render(
    <ToastProvider>
      <LeadBreadcrumbProvider>
        <MemoryRouter initialEntries={[path]}>
          <BreadcrumbActionsProbe />
          <BacklogContainer />
        </MemoryRouter>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
}

const queue = () => screen.getAllByRole("listitem");
const currentTitle = () =>
  screen
    .getAllByRole("heading", { level: 2 })
    .find((h) => h.className.includes("text-heading-md"))!;

describe("BacklogContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
    resetPersonDetailMock();
    resetBacklogMock();
  });

  it("carga la cola con el mock real: progreso, chips, primera en curso con cambio de asignado", async () => {
    renderBacklog();
    expect(await screen.findByText(/clasificadas hoy/)).toHaveTextContent(
      "1 clasificadas hoy · quedan 9 de 10"
    );
    expect(
      screen.getByRole("button", { name: "Todas, 9" })
    ).toBeInTheDocument();
    expect(currentTitle()).toHaveTextContent("Ajuste reporte contable");
    expect(
      screen.getByText(/Cambió de asignado: antes jpena@tuya/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3 historias de personas sin identidad/)
    ).toBeInTheDocument();
  });

  it("publica el resumen del día en la franja del breadcrumb, sin encabezado de módulo", async () => {
    renderBacklog();
    const strip = within(screen.getByTestId("breadcrumb-actions"));
    expect(await strip.findByText(/clasificadas hoy/)).toHaveTextContent(
      "1 clasificadas hoy · quedan 9 de 10"
    );
    expect(
      strip.getByRole("progressbar", { name: "Progreso del día" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Backlog" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Una historia a la vez/)).not.toBeInTheDocument();
  });

  it("guardar con Descartar avanza y suma al progreso; atajos 3 + Enter", async () => {
    renderBacklog();
    await screen.findByText(/clasificadas hoy/);
    const first = currentTitle().textContent;
    fireEvent.keyDown(window, { key: "3" });
    fireEvent.keyDown(window, { key: "Enter" });
    await waitFor(() => expect(currentTitle().textContent).not.toBe(first));
    expect(screen.getByText(/clasificadas hoy/)).toHaveTextContent(
      "2 clasificadas hoy · quedan 8 de 10"
    );
  });

  it("guardar incompleto señala lo que falta y no avanza", async () => {
    renderBacklog();
    await screen.findByText(/clasificadas hoy/);
    const first = currentTitle().textContent;
    fireEvent.click(screen.getByRole("radio", { name: "BAU" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar y siguiente" })
    );
    expect(
      await screen.findByText("Selecciona la categoría")
    ).toBeInTheDocument();
    expect(currentTitle().textContent).toBe(first);
  });

  it("saltar con S manda la historia al final", async () => {
    renderBacklog();
    await screen.findByText(/clasificadas hoy/);
    const first = currentTitle().textContent!;
    fireEvent.keyDown(window, { key: "s" });
    await waitFor(() => expect(currentTitle().textContent).not.toBe(first));
    const rows = queue();
    expect(within(rows[rows.length - 1]).getByText(first)).toBeInTheDocument();
  });

  it("los atajos no disparan con el foco en un campo", async () => {
    renderBacklog();
    await screen.findByText(/clasificadas hoy/);
    const first = currentTitle().textContent;
    // Un campo de texto (como el del drawer): sus teclas no son atajos.
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    fireEvent.keyDown(input, { key: "3" });
    fireEvent.keyDown(input, { key: "Enter" });
    await new Promise((r) => setTimeout(r, 50));
    expect(currentTitle().textContent).toBe(first);
    input.remove();
  });

  it("filtra por persona desde la URL y permite quitar el filtro", async () => {
    renderBacklog(`/app/lead/backlog?persona=${MARIA}`);
    await screen.findByText(/clasificadas hoy/);
    expect(screen.getByText(/Persona: María González/)).toBeInTheDocument();
    expect(queue().every((r) => within(r).getByText(/María González/))).toBe(
      true
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Quitar el filtro por persona" })
    );
    await screen.findByRole("button", { name: /Todas, \d+/ });
  });

  it("rechazar con reasignación crea la pendiente a nombre de la otra persona", async () => {
    renderBacklog();
    await screen.findByText(/clasificadas hoy/);
    fireEvent.click(screen.getByRole("button", { name: /No es de/ }));
    expect(
      await screen.findByRole("heading", { name: /Rechazar: no es de/ })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Es de otra persona" }));
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const rejected = await backlogService.getQueue({ status: "Rejected" });
    expect(
      rejected.items.some(
        (s) => s.number === 12318 && s.rejectReason === "OtherPerson"
      )
    ).toBe(true);
  });

  it("Clasificadas muestra el resultado y deshacer devuelve a la cola", async () => {
    renderBacklog();
    await screen.findByText(/clasificadas hoy/);
    fireEvent.click(screen.getByRole("radio", { name: "Clasificadas" }));
    const undo = (await screen.findAllByRole("link", { name: "Deshacer" }))[0];
    const row = undo.closest("li")!;
    const title = within(row).getByText(/./, {
      selector: "span.font-medium",
    }).textContent!;
    fireEvent.click(undo);
    await waitFor(() =>
      expect(screen.queryByText(title)).not.toBeInTheDocument()
    );
    const pending = await backlogService.getQueue();
    expect(pending.items.some((s) => s.title === title)).toBe(true);
  });

  it("cola vacía en un filtro: estado vacío con acción", async () => {
    const all = await backlogService.getQueue({ personId: MARIA });
    for (const s of all.items)
      await backlogService.classify(s.id, { kind: "Discard" });
    renderBacklog(`/app/lead/backlog?persona=${MARIA}`);
    expect(
      await screen.findByText("Nada por clasificar acá")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Quitar el filtro" })
    ).toBeInTheDocument();
  });
});
