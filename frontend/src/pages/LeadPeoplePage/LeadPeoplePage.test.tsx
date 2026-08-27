import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetPeopleMock } from "../../mocks/handlers/people.handlers";
import { LeadPeoplePage } from "./LeadPeoplePage";

describe("LeadPeoplePage", () => {
  afterEach(() => {
    resetPeopleMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/app/lead/personas"]}>
          <LeadPeoplePage />
        </MemoryRouter>
      </ToastProvider>
    );
    // Se espera a que el listado cargue para no dejar peticiones a medias.
    await screen.findByText("María González");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Gestionar Personas");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
