import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../mocks/handlers/squads.handlers";
import { resetAllocationsMock } from "../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../mocks/handlers/people.handlers";
import { LeadSquadsPage } from "./LeadSquadsPage";

describe("LeadSquadsPage", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/app/lead/celulas"]}>
          <LeadSquadsPage />
        </MemoryRouter>
      </ToastProvider>
    );
    // Se espera a que el listado cargue para no dejar peticiones a medias.
    await screen.findByText("Backend Platform");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Gestionar Células");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
