import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetBillingMock } from "../../mocks/handlers/billing.handlers";
import { resetPeopleMock } from "../../mocks/handlers/people.handlers";
import { resetAbsencesMock } from "../../mocks/handlers/absences.handlers";
import { resetAllocationsMock } from "../../mocks/handlers/allocations.handlers";
import { LeadBillingPage } from "./LeadBillingPage";

describe("LeadBillingPage", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetBillingMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={["/app/lead/facturacion"]}>
          <LeadBillingPage />
        </MemoryRouter>
      </ToastProvider>
    );
    // Se espera a que el listado cargue para no dejar peticiones a medias.
    await screen.findByText("Carlos López");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Prefacturación");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
