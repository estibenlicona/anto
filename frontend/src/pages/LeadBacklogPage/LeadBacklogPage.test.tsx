import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../mocks/handlers/squads.handlers";
import { resetAllocationsMock } from "../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../mocks/handlers/people.handlers";
import { resetPersonDetailMock } from "../../mocks/handlers/personDetail.handlers";
import { resetBacklogMock } from "../../mocks/handlers/backlog.handlers";
import { LeadBacklogPage } from "./LeadBacklogPage";

describe("LeadBacklogPage", () => {
  afterEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
    resetPersonDetailMock();
    resetBacklogMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/app/lead/backlog"]}>
          <LeadBacklogPage />
        </MemoryRouter>
      </ToastProvider>
    );
    // Se espera a que la cola cargue para no dejar peticiones a medias.
    await screen.findAllByRole("listitem");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Gestionar Backlog");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
