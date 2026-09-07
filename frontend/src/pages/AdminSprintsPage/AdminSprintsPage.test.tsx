import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastProvider } from "@tuya-ui/components";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { resetSprintConfigMock } from "../../mocks/handlers/sprint-config.handlers";
import { AdminSprintsPage } from "./AdminSprintsPage";

function renderPage() {
  return render(
    <ToastProvider>
      <AdminSprintsPage />
    </ToastProvider>
  );
}

describe("AdminSprintsPage", () => {
  afterEach(() => {
    resetSprintConfigMock();
  });

  it("renders the page header", async () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Calendario de sprints" })
    ).toBeInTheDocument();
  });

  it("loads the config from the mock and renders the form as editable, with the save action disabled until there are changes", async () => {
    renderPage();

    const weeksInput = await screen.findByLabelText("Semanas por sprint");
    expect(weeksInput).not.toBeDisabled();
    expect(weeksInput).toHaveValue(2);
    expect(screen.getByLabelText("Sprints por quarter")).toHaveValue(6);
    expect(screen.getByLabelText("Horas por sprint")).toHaveValue(80);
    expect(screen.getByLabelText("Hora de cierre del sprint")).toHaveValue(
      "23:00"
    );
    expect(screen.getByLabelText("Ventana de histórico")).toHaveValue(6);
    expect(screen.getByLabelText("Mínimo de sprints para evaluar")).toHaveValue(
      3
    );
    // Cinco numéricos más la hora: nada de tolerancia ni de puntos por FTE.
    expect(screen.getAllByRole("spinbutton")).toHaveLength(5);
    expect(
      screen.queryByLabelText("Puntos por FTE por sprint")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar configuración" })
    ).toBeDisabled();
  });

  it("guarda la ventana de histórico y la rechaza fuera de 3–12", async () => {
    renderPage();
    const windowInput = await screen.findByLabelText("Ventana de histórico");
    fireEvent.change(windowInput, { target: { value: "20" } });
    expect(
      screen.getByText(/Ventana de histórico debe estar entre 3 y 12/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar configuración" })
    ).toBeDisabled();

    fireEvent.change(windowInput, { target: { value: "10" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar configuración" })
    );
    await waitFor(() =>
      expect(screen.getByText("Configuración guardada")).toBeInTheDocument()
    );
    expect(windowInput).toHaveValue(10);
  });

  it("rechaza un mínimo de sprints mayor que la ventana de histórico", async () => {
    renderPage();
    const minInput = await screen.findByLabelText(
      "Mínimo de sprints para evaluar"
    );
    // La ventana por defecto es 6; pedir 6 cabe, y no debe marcar error…
    fireEvent.change(minInput, { target: { value: "6" } });
    expect(
      screen.queryByText(/no puede ser mayor que la ventana de histórico/i)
    ).not.toBeInTheDocument();

    // …pero bajar la ventana por debajo del mínimo sí.
    fireEvent.change(screen.getByLabelText("Ventana de histórico"), {
      target: { value: "5" },
    });
    expect(
      screen.getByText(
        /Mínimo de sprints para evaluar no puede ser mayor que la ventana de histórico/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar configuración" })
    ).toBeDisabled();
  });

  it("rechaza una hora de cierre mal formada", async () => {
    renderPage();
    const timeInput = await screen.findByLabelText("Hora de cierre del sprint");
    fireEvent.change(timeInput, { target: { value: "25:00" } });
    expect(
      screen.getByText(/Hora de cierre del sprint debe tener el formato HH:mm/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar configuración" })
    ).toBeDisabled();
  });

  it("saves successfully and shows a confirmation toast", async () => {
    renderPage();

    const weeksInput = await screen.findByLabelText("Semanas por sprint");
    fireEvent.change(weeksInput, { target: { value: "3" } });

    const saveButton = screen.getByRole("button", {
      name: "Guardar configuración",
    });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(screen.getByText("Configuración guardada")).toBeInTheDocument()
    );
  });

  it("shows a validation error for an out-of-range value and keeps the save action disabled", async () => {
    renderPage();

    const weeksInput = await screen.findByLabelText("Semanas por sprint");
    fireEvent.change(weeksInput, { target: { value: "10" } });

    expect(
      screen.getByText(/Semanas por sprint debe estar entre 1 y 4/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar configuración" })
    ).toBeDisabled();
  });

  it("shows an error toast and keeps the entered values when the mock save fails", async () => {
    server.use(
      http.put("/admin/sprint-config", () =>
        HttpResponse.json({ message: "Error de servidor" }, { status: 500 })
      )
    );
    renderPage();

    const weeksInput = await screen.findByLabelText("Semanas por sprint");
    fireEvent.change(weeksInput, { target: { value: "3" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar configuración" })
    );

    await waitFor(() =>
      expect(
        screen.getByText("Request failed with status code 500")
      ).toBeInTheDocument()
    );
    expect(weeksInput).toHaveValue(3);
  });

  it("renders the '¿Qué usa este calendario?' card", async () => {
    renderPage();
    await screen.findByLabelText("Semanas por sprint");
    expect(screen.getByText("¿Qué usa este calendario?")).toBeInTheDocument();
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Capacidad")).toBeInTheDocument();
    // Las horas del calendario son capacidad, no un parte de trabajo: la
    // tarjeta puede nombrarlas, pero ningún reporte de horas.
    expect(screen.queryByText(/reporte de horas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/horas por semana/i)).not.toBeInTheDocument();
  });
});
