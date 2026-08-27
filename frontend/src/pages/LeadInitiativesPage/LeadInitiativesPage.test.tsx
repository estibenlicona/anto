import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetInitiativesMock } from "../../mocks/handlers/initiatives.handlers";
import { resetSquadsMock } from "../../mocks/handlers/squads.handlers";
import { LeadInitiativesPage } from "./LeadInitiativesPage";

describe("LeadInitiativesPage", () => {
  afterEach(() => {
    resetInitiativesMock();
    resetSquadsMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/app/lead/iniciativas"]}>
          <LeadInitiativesPage />
        </MemoryRouter>
      </ToastProvider>
    );
    // Se espera a que el listado cargue para no dejar peticiones a medias.
    await screen.findByText("Kafka Migration");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Gestionar Iniciativas");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
