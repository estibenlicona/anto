import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("renders dashboard title", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
