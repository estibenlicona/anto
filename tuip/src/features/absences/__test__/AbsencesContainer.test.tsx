import { describe, it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetAbsencesMock } from "../../../mocks/handlers/absences.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { AbsencesContainer } from "../AbsencesContainer";

/**
 * Carga real vía el servidor de mocks, cuyas semillas son relativas al mes
 * corriente: las aserciones son estructurales (conteos, estados, orígenes),
 * no de fechas puntuales.
 */
function renderAbsences() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={["/app/lead/ausencias"]}>
        <Routes>
          <Route path="/app/lead/ausencias" element={<AbsencesContainer />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

function rowOf(personName: string): HTMLElement {
  return screen.getByText(personName).closest("tr")! as HTMLElement;
}

describe("AbsencesContainer", () => {
  afterEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
  });

  it("muestra el mes corriente: lecturas, origen por fila y acciones sólo en solicitadas", async () => {
    renderAbsences();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Ausencias" })
    ).toBeInTheDocument();
    // Carlos es de GFT; María es de planta.
    expect(await screen.findByText("Carlos López")).toBeInTheDocument();
    expect(within(rowOf("Carlos López")).getByText("GFT")).toBeInTheDocument();
    expect(
      within(rowOf("María González")).getByText("Planta")
    ).toBeInTheDocument();
    // Dos solicitadas → dos pares de acciones; aprobadas y rechazadas sin acciones.
    const approveButtons = screen.getAllByRole("button", { name: "Aprobar" });
    expect(approveButtons).toHaveLength(2);
    // Dentro del listado no va el color de marca: el rojo es de la acción
    // primaria de la pantalla, no de las acciones por fila.
    expect(approveButtons[0].className).not.toMatch(/brand/);
    expect(screen.getAllByText("Solicitada")).toHaveLength(2);
    expect(screen.getAllByText("Aprobada").length).toBeGreaterThanOrEqual(2);
    // KPI de pendientes: la card "Por aprobar" muestra el conteo.
    const pendingCard = screen
      .getByText("Por aprobar")
      .closest("div")!.parentElement!;
    expect(
      within(pendingCard as HTMLElement).getByText("2")
    ).toBeInTheDocument();
    // El impacto agregado nombra la célula más afectada (aprobadas de Backend).
    expect(screen.getByText(/La célula que más pierde es/)).toBeInTheDocument();
  });

  it("una rechazada muestra su motivo de no contar: sin impacto y sin acciones", async () => {
    renderAbsences();
    await screen.findByText("Andrés Martínez");
    const row = rowOf("Andrés Martínez");
    expect(within(row).getByText("Rechazada")).toBeInTheDocument();
    expect(within(row).getByText("—")).toBeInTheDocument();
    expect(
      within(row).queryByRole("button", { name: "Aprobar" })
    ).not.toBeInTheDocument();
  });

  it("una aprobada ofrece rechazar, que es cómo se revierte", async () => {
    renderAbsences();
    await screen.findByText("María González");
    const fila = rowOf("María González");

    // Aprobada de semilla: sin aprobar, pero con la salida disponible.
    expect(within(fila).getByText("Aprobada")).toBeInTheDocument();
    expect(
      within(fila).queryByRole("button", { name: "Aprobar" })
    ).not.toBeInTheDocument();
    expect(
      within(fila).getByRole("button", { name: "Rechazar" })
    ).toBeInTheDocument();
  });

  it("revertir una aprobación la deja rechazada, no solicitada, y baja el impacto", async () => {
    renderAbsences();
    await screen.findByText("María González");

    // El descuento vive en el nodo padre del "de N FTE del chapter": ese
    // sufijo es el denominador y no se mueve. Lo que tiene que moverse es la
    // cifra de arriba.
    const cifra = () =>
      screen.getByText(/de .* FTE del chapter/).parentElement!.textContent!;
    const impactoAntes = cifra();

    fireEvent.click(
      within(rowOf("María González")).getByRole("button", { name: "Rechazar" })
    );
    // El panel dice que la capacidad vuelve: no es lo mismo que no aprobar.
    expect(
      await screen.findByText(/la capacidad vuelve al mes/)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("¿Por qué se rechaza?"), {
      target: { value: "Aprobada por error" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rechazar ausencia" }));

    expect(await screen.findByText("Ausencia rechazada")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        within(rowOf("María González")).getByText("Rechazada")
      ).toBeInTheDocument();
    });

    // Rechazada, NO solicitada: el registro dice que hubo una aprobación y
    // que se revirtió, no que nunca ocurrió.
    const fila = rowOf("María González");
    expect(within(fila).queryByText("Solicitada")).not.toBeInTheDocument();
    // Y es terminal: ninguna acción.
    expect(
      within(fila).queryByRole("button", { name: "Rechazar" })
    ).not.toBeInTheDocument();
    expect(
      within(fila).queryByRole("button", { name: "Aprobar" })
    ).not.toBeInTheDocument();

    // El impacto del mes se movió.
    await waitFor(() => {
      expect(cifra()).not.toBe(impactoAntes);
    });
  });

  it("el aviso del alcance no habla de fases del plan", async () => {
    renderAbsences();
    await screen.findByText("María González");

    // Lo que quien registra necesita saber es qué pasa con lo que registra,
    // no en qué punto del cronograma está el equipo.
    expect(
      screen.getByText(/La ausencia se registra una sola vez/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/fases del plan/)).not.toBeInTheDocument();
    expect(screen.queryByText(/próximas fases/)).not.toBeInTheDocument();
  });

  it("navega al mes anterior (vacío) y vuelve", async () => {
    renderAbsences();
    await screen.findByText("María González");
    fireEvent.click(screen.getByRole("button", { name: "Mes anterior" }));
    expect(await screen.findByText(/Sin ausencias en/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mes siguiente" }));
    expect(await screen.findByText("María González")).toBeInTheDocument();
  });

  it("aprobar una solicitada la consolida y baja el conteo por aprobar", async () => {
    renderAbsences();
    await screen.findByText("Paula Ramírez");
    fireEvent.click(
      within(rowOf("Paula Ramírez")).getByRole("button", { name: "Aprobar" })
    );
    // Aprobar ya no aplica de un clic: confirma en el diálogo.
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Aprobar",
      })
    );
    expect(await screen.findByText("Ausencia aprobada")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Aprobar" })).toHaveLength(
        1
      );
    });
    expect(
      within(rowOf("Paula Ramírez")).getByText("Aprobada")
    ).toBeInTheDocument();
  });

  it("aprobar pregunta antes, con el nombre y la cifra de esa ausencia", async () => {
    renderAbsences();
    await screen.findByText("Paula Ramírez");
    fireEvent.click(
      within(rowOf("Paula Ramírez")).getByRole("button", { name: "Aprobar" })
    );

    // Lo que evita el error es la consecuencia a la vista, no la pregunta:
    // por eso se comprueba que el texto sea de ESTA ausencia y no uno fijo.
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/¿Aprobar la ausencia de Paula Ramírez\?/)
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/FTE de la capacidad del mes/)
    ).toBeInTheDocument();

    // Y el estado no cambió todavía.
    expect(
      within(rowOf("Paula Ramírez")).getByText("Solicitada")
    ).toBeInTheDocument();
  });

  it("la confirmación dice la misma cifra que la fila, no una redondeada", () => {
    // Con un decimal, un impacto de 0.03 se anunciaba como "0.0 FTE" y el
    // diálogo contradecía a la fila desde la que se abrió.
    renderAbsences();
    return screen.findByText("Paula Ramírez").then(() => {
      const enLaFila = within(rowOf("Paula Ramírez"))
        .getByText(/FTE$/)
        .textContent!.replace("−", "")
        .replace(" FTE", "");

      fireEvent.click(
        within(rowOf("Paula Ramírez")).getByRole("button", { name: "Aprobar" })
      );

      return screen.findByRole("dialog").then((dialog) => {
        expect(
          within(dialog).getByText(new RegExp(`Descuenta ${enLaFila} FTE`))
        ).toBeInTheDocument();
      });
    });
  });

  it("cancelar la confirmación deja la ausencia como estaba", async () => {
    renderAbsences();
    await screen.findByText("Paula Ramírez");
    const antes = screen.getAllByRole("button", { name: "Aprobar" }).length;

    fireEvent.click(
      within(rowOf("Paula Ramírez")).getByRole("button", { name: "Aprobar" })
    );
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Cancelar",
      })
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      within(rowOf("Paula Ramírez")).getByText("Solicitada")
    ).toBeInTheDocument();
    // La fila conserva sus dos acciones.
    expect(screen.getAllByRole("button", { name: "Aprobar" })).toHaveLength(
      antes
    );
  });

  it("rechazar exige motivo y deja la fila rechazada", async () => {
    renderAbsences();
    await screen.findByText("Laura Ruiz");
    fireEvent.click(
      within(rowOf("Laura Ruiz")).getByRole("button", { name: "Rechazar" })
    );
    const submit = await screen.findByRole("button", {
      name: "Rechazar ausencia",
    });
    fireEvent.click(submit);
    expect(await screen.findByText("Escribe el motivo")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("¿Por qué se rechaza?"), {
      target: { value: "Cierre de mes contable" },
    });
    fireEvent.click(submit);
    expect(await screen.findByText("Ausencia rechazada")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        within(rowOf("Laura Ruiz")).getByText("Rechazada")
      ).toBeInTheDocument();
    });
  });
});
