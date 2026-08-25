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
  });
});
