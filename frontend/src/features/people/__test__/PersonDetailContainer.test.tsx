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
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { resetPersonDetailMock } from "../../../mocks/handlers/personDetail.handlers";
import { CAMILA, MARIA } from "../../../mocks/handlers/personDetail.seeds";
import { personDetailService } from "../services/personDetailService";
import { PersonDetailContainer } from "../PersonDetailContainer";

function renderDetail(id: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/capacidad/personas/${id}`]}>
        <Routes>
          <Route
            path="/capacidad/personas"
            element={<p>Listado de personas</p>}
          />
          <Route
            path="/capacidad/competencias/:id"
            element={<p>Plan de la persona</p>}
          />
          <Route
            path="/capacidad/personas/:id"
            element={<PersonDetailContainer personId={id} />}
          />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

describe("PersonDetailContainer", () => {
  afterEach(() => {
    resetPeopleMock();
    resetPersonDetailMock();
    vi.restoreAllMocks();
  });

  it("con célula: perfil profesional sin nada de asignación, con el puntero del sprint", async () => {
    renderDetail(MARIA);
    expect(
      await screen.findByRole("heading", { name: "María González" })
    ).toBeInTheDocument();
    // El encabezado ya no lleva la identidad ni acciones de asignación.
    expect(screen.queryByText(/SFIA/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reasignar" })
    ).not.toBeInTheDocument();
    // Ni indicadores viejos ni panel de asignación: la página no habla de
    // célula, dedicación ni FTE declarado.
    expect(
      screen.queryByText("ASIGNADO POR LA CÉLULA")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("DEDICACIÓN REAL")).not.toBeInTheDocument();
    expect(screen.queryByText("Asignación")).not.toBeInTheDocument();
    expect(screen.queryByText(/BAU/)).not.toBeInTheDocument();
    expect(screen.queryByText(/FTE libre/)).not.toBeInTheDocument();
    // Los protagonistas y los punteros.
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Stacks")).toBeInTheDocument();
    // "Competencias" existe dos veces adrede: el botón del encabezado y el
    // rótulo del puntero.
    expect(screen.getAllByText("Competencias").length).toBe(2);
    expect(screen.getByText("Capacidad en el sprint")).toBeInTheDocument();
    expect(screen.getByText("Perfil evaluado")).toBeInTheDocument();
    expect(screen.getByText("Plan de desarrollo")).toBeInTheDocument();
    // María: carga habitual en S18; el puntero resume y enlaza, sin SP.
    expect(screen.getByText("Carga habitual")).toBeInTheDocument();
    expect(screen.getByText(/S18 · en curso/)).toBeInTheDocument();
    expect(screen.queryByText(/SP/)).not.toBeInTheDocument();
    const verLinks = screen.getAllByRole("link", { name: "Ver" });
    expect(
      verLinks.some(
        (l) => l.getAttribute("href") === `/capacidad/dedicacion/${MARIA}`
      )
    ).toBe(true);
  });

  it("separa bloques, columnas y paneles con una sola medida", async () => {
    const { container } = renderDetail(MARIA);
    await screen.findByRole("heading", { name: "María González" });
    const grid = container.querySelector(
      '[class*="xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"]'
    )!;
    expect(grid).toHaveClass("gap-3");
    const root = grid.parentElement!;
    expect(root).toHaveClass("gap-3");
    for (const column of Array.from(grid.children)) {
      expect(column).toHaveClass("gap-3");
    }
  });

  it("sin célula: el encabezado no lo dice y no hay flujo de asignación", async () => {
    renderDetail(CAMILA);
    expect(
      await screen.findByRole("heading", { name: "Camila Restrepo" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Sin célula")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Asignar/ })
    ).not.toBeInTheDocument();
    // La vinculación se lee en el Perfil; DevOps sin vincular en el puntero.
    expect(screen.getByText(/Externa · /)).toBeInTheDocument();
    expect(screen.getByText("Sus items no cuentan")).toBeInTheDocument();
  });

  it("Competencias navega al plan de la persona", async () => {
    renderDetail(MARIA);
    fireEvent.click(
      await screen.findByRole("button", { name: "Competencias" })
    );
    expect(await screen.findByText("Plan de la persona")).toBeInTheDocument();
  });

  it("vincular con Azure DevOps: buscar por el correo de la persona, vincular, y el detalle se refresca", async () => {
    renderDetail(CAMILA);
    fireEvent.click(
      await screen.findByRole("button", { name: "Vincular con Azure DevOps" })
    );
    // El drawer trae el correo corporativo de Camila y todavía no deja vincular.
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByLabelText(/Correo corporativo/)).toHaveValue(
      "camila.restrepo@tuya.com"
    );
    expect(
      within(drawer).getByRole("button", { name: "Vincular" })
    ).toBeDisabled();

    fireEvent.click(within(drawer).getByRole("button", { name: "Buscar" }));
    expect(await within(drawer).findByText("Coincide")).toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole("button", { name: "Vincular" }));
    expect(await screen.findByText("Identidad vinculada")).toBeInTheDocument();
    // La fila del Perfil pasa a Vinculada y el puntero trae la lectura del
    // sprint: con un solo sprint sellado, No evaluable con su motivo.
    expect(await screen.findByText("Vinculada")).toBeInTheDocument();
    expect(screen.getByText("No evaluable")).toBeInTheDocument();
    expect(screen.getByText("Histórico insuficiente")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Vincular con Azure DevOps" })
    ).not.toBeInTheDocument();
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
    const panel = screen.getByText("Stacks").closest("section")!;
    expect(within(panel).getByText("AS400")).toBeInTheDocument();
    fireEvent.click(within(panel).getByRole("link", { name: "Editar" }));
    await screen.findByText("Stacks de María González");
    const row = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByRole("button", { name: "Quitar AS400" })
      )!;
    fireEvent.click(within(row).getByRole("button", { name: "Quitar AS400" }));
    expect(
      screen.getByText("Nadie quedaría cubriendo este stack")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() =>
      expect(
        screen.queryByText("Stacks de María González")
      ).not.toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(panel).queryByText("AS400")).not.toBeInTheDocument()
    );
    const detail = await personDetailService.getDetail(MARIA);
    expect(detail.stacks.some((s) => s.name === "AS400")).toBe(false);
  });
});
