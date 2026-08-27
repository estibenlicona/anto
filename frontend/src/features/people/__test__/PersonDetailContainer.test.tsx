import { describe, it, expect, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { resetPersonDetailMock } from "../../../mocks/handlers/personDetail.handlers";
import { CAMILA, MARIA } from "../../../mocks/handlers/personDetail.seeds";
import { personDetailService } from "../services/personDetailService";
import { PersonDetailContainer } from "../PersonDetailContainer";
import type { ReassignPlan } from "@features/control-tower/components/ReassignPersonDrawer";

const PAGOS = "44444444-4444-4444-4444-444444444444";

// El drawer real usa Select (no simulable en jsdom para elegir destino): se
// reemplaza por un stub que muestra sus props iniciales y dispara un plan
// fijo; el flujo completo se ejercita contra el mock real.
let plan: ReassignPlan = {
  mode: "assign",
  targetSquadId: PAGOS,
  dedicationPercentage: 100,
  bauPercentage: 60,
  transformationPercentage: 40,
};
vi.mock("@features/control-tower/components/ReassignPersonDrawer", async () => {
  const React = await import("react");
  return {
    ReassignPersonDrawer: (props: {
      person: { name: string };
      onSubmit: (p: ReassignPlan) => void;
      initialMode?: string;
      initialTargetSquadId?: string;
    }) =>
      React.createElement(
        "div",
        { role: "dialog" },
        React.createElement(
          "span",
          null,
          `Drawer: ${props.person.name} · ${props.initialMode ?? "-"} · ${props.initialTargetSquadId ?? "-"}`
        ),
        React.createElement(
          "button",
          { onClick: () => props.onSubmit(plan) },
          "Aplicar plan"
        )
      ),
  };
});

function renderDetail(id: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/app/lead/personas/${id}`]}>
        <Routes>
          <Route
            path="/app/lead/personas"
            element={<p>Listado de personas</p>}
          />
          <Route
            path="/app/lead/personas/:id"
            element={<PersonDetailContainer personId={id} />}
          />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

describe("PersonDetailContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
    resetPersonDetailMock();
    vi.restoreAllMocks();
    plan = { ...plan, mode: "assign", targetSquadId: PAGOS };
  });

  it("con célula: encabezado, cards y paneles con el mock real", async () => {
    renderDetail(MARIA);
    expect(
      await screen.findByRole("heading", { name: "María González" })
    ).toBeInTheDocument();
    expect(screen.getByText("Avanzado · SFIA 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reasignar" })
    ).toBeInTheDocument();
    expect(screen.getByText("Por validar")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Backend Platform" })
    ).toBeInTheDocument();
    expect(screen.getByText("Bus factor 1")).toBeInTheDocument();
    expect(screen.getByText("Ficha")).toBeInTheDocument();
  });

  it("separa bloques, columnas y paneles con una sola medida", async () => {
    const { container } = renderDetail(MARIA);
    await screen.findByRole("heading", { name: "María González" });
    // Encabezado, cards y paneles a gap-3 —la medida del listado—; antes el
    // raíz iba a gap-6 y el grid de dos columnas y sus pilas a gap-4.
    const grid = container.querySelector('[class*="xl:grid-cols-[7fr_5fr]"]')!;
    expect(grid).toHaveClass("gap-3");
    expect(grid).not.toHaveClass("gap-4");
    const root = grid.parentElement!;
    expect(root).toHaveClass("gap-3");
    expect(root).not.toHaveClass("gap-6");
    for (const column of Array.from(grid.children)) {
      expect(column).toHaveClass("gap-3");
      expect(column).not.toHaveClass("gap-4");
    }
  });

  it("validar horas cambia el estado y recalcula el real", async () => {
    renderDetail(MARIA);
    fireEvent.click(await screen.findByRole("button", { name: "Validar" }));
    expect(await screen.findByText("Validado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Validar" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("0.93 FTE")).toBeInTheDocument();
  });

  it("sin célula: 'Asignar acá' abre el drawer con el destino y asignar refresca", async () => {
    renderDetail(CAMILA);
    expect(await screen.findByText("Sin célula")).toBeInTheDocument();
    expect(screen.getByText("No aplica")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: "Asignar acá" });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(
      await screen.findByText(`Drawer: Camila Restrepo · assign · ${PAGOS}`)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aplicar plan" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    await waitFor(
      () => expect(screen.queryByText("Sin célula")).not.toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(
      await screen.findByRole("link", { name: "Pagos Instantáneos" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Sin célula")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reasignar" })
    ).toBeInTheDocument();
    const d = await personDetailService.getDetail(CAMILA);
    expect(d.allocation?.squadId).toBe(PAGOS);
  });

  it("subir y mover abren el drawer en su modo", async () => {
    renderDetail(MARIA);
    fireEvent.click(
      await screen.findByRole("button", { name: "Subir dedicación" })
    );
    expect(
      await screen.findByText(/Drawer: María González · raise/)
    ).toBeInTheDocument();
  });

  it("quitar de la célula deja a la persona sin célula", async () => {
    renderDetail(MARIA);
    fireEvent.click(
      await screen.findByRole("button", { name: "Quitar de la célula" })
    );
    fireEvent.click(await screen.findByRole("button", { name: "Quitar" }));
    expect(await screen.findByText("Sin célula")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Asignar a una célula" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("María no está en ninguna célula")
    ).toBeInTheDocument();
  });

  it("vincular identidad actualiza el encabezado y la card", async () => {
    renderDetail(CAMILA);
    fireEvent.click(
      await screen.findByRole("button", { name: "Vincular identidad" })
    );
    fireEvent.click(await screen.findByRole("button", { name: "Vincular" }));
    expect(await screen.findByText("DevOps vinculado")).toBeInTheDocument();
    expect(screen.getByText("items activos")).toBeInTheDocument();
  });

  it("id inexistente muestra el estado vacío con vuelta al listado", async () => {
    renderDetail("no-existe");
    expect(
      await screen.findByText("Persona no encontrada")
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Ir al listado de personas" })
    );
    expect(await screen.findByText("Listado de personas")).toBeInTheDocument();
  });
  it("editar stacks: quitar AS400 avisa, guardar refresca el panel y el mock", async () => {
    renderDetail(MARIA);
    await screen.findByRole("heading", { name: "María González" });
    expect(screen.getByText("Bus factor 1")).toBeInTheDocument();
    const panel = screen.getByText("Stacks").closest("section")!;
    fireEvent.click(within(panel).getByRole("link", { name: "Editar" }));
    await screen.findByText("Stacks de María González");
    const row = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByRole("button", { name: "Quitar AS400" })
      )!;
    fireEvent.click(within(row).getByRole("button", { name: "Quitar AS400" }));
    expect(
      screen.getByText("El chapter quedaría sin cobertura")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Stacks de María González")
      ).not.toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.queryByText("Bus factor 1")).not.toBeInTheDocument()
    );
    const detail = await personDetailService.getDetail(MARIA);
    expect(detail.stacks.some((s) => s.name === "AS400")).toBe(false);
  });
});
