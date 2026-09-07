import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastProvider } from "@tuya-ui/components";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { resetDedicationMock } from "../../mocks/handlers/dedication.handlers";
import { AdminDevOpsPage } from "./AdminDevOpsPage";

function renderPage() {
  return render(
    <ToastProvider>
      <AdminDevOpsPage />
    </ToastProvider>
  );
}

describe("AdminDevOpsPage", () => {
  afterEach(() => {
    resetDedicationMock();
  });

  it("renders the page header", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Integración con Azure DevOps" })
    ).toBeInTheDocument();
  });

  it("renders the ingestion pipeline steps", () => {
    renderPage();
    expect(screen.getByText("Azure DevOps")).toBeInTheDocument();
    expect(screen.getByText("Job de ingesta")).toBeInTheDocument();
    expect(screen.getByText("API de la plataforma")).toBeInTheDocument();
  });

  it("renders the connection and ingestion job cards, with the connection test still disabled and no secret field", () => {
    renderPage();
    expect(screen.getByText("Conexión")).toBeInTheDocument();
    expect(screen.getByText("Job de ingesta diaria")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Probar conexión" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Ejecutar ingesta ahora" })
    ).toBeEnabled();
    expect(screen.queryByLabelText("Secreto")).not.toBeInTheDocument();
  });

  it("runs the ingestion and updates the last execution time", async () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Ejecutar ingesta ahora" })
    );

    expect(
      screen.getByRole("button", { name: "Ejecutando…" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Ejecutar ingesta ahora" })
      ).toBeEnabled();
    });

    expect(screen.getByText(/Actualizado hace/)).toBeInTheDocument();
  });

  it("shows a retry alert when the ingestion fails", async () => {
    server.use(
      http.post("/dedication/collaborators/sync", () =>
        HttpResponse.json(
          { message: "Azure DevOps no respondió" },
          { status: 502 }
        )
      )
    );

    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Ejecutar ingesta ahora" })
    );

    await waitFor(() => {
      expect(
        screen.getByText("No se pudo ejecutar la ingesta")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: "Reintentar" })
    ).toBeInTheDocument();
  });
});
