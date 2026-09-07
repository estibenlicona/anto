import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetDedicationMock } from "../../mocks/handlers/dedication.handlers";
import { LeadDedicationPage } from "./LeadDedicationPage";

describe("LeadDedicationPage", () => {
  afterEach(() => {
    resetDedicationMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/app/lead/dedicacion"]}>
          <LeadDedicationPage />
        </MemoryRouter>
      </ToastProvider>
    );
    // Se espera a que el listado cargue para no dejar peticiones a medias.
    await screen.findByRole("link", { name: "Valentina Ospina" });
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Capacidad");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
