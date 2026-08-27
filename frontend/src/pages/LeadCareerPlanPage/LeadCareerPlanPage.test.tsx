import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { resetSkillsMock } from "../../mocks/handlers/skills.handlers";
import { resetAssessmentsMock } from "../../mocks/handlers/assessments.handlers";
import { resetPeopleMock } from "../../mocks/handlers/people.handlers";
import { LeadCareerPlanPage } from "./LeadCareerPlanPage";

describe("LeadCareerPlanPage", () => {
  afterEach(() => {
    resetSkillsMock();
    resetAssessmentsMock();
    resetPeopleMock();
  });

  it("keeps a single screen-reader-only h1 with the breadcrumb name", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/competencias"]}>
        <LeadCareerPlanPage />
      </MemoryRouter>
    );
    // Se espera a que la matriz cargue para no dejar peticiones a medias.
    await screen.findByText("Paula Ramírez");
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Competencias");
    expect(headings[0]).toHaveClass("sr-only");
  });
});
