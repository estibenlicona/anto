import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MainLayout } from "./MainLayout";

describe("MainLayout", () => {
  it("renders header, sidebar, content, and footer", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(screen.getByText(/Menu lateral/i)).toBeInTheDocument();
    expect(screen.getByText(/Copyrigth/i)).toBeInTheDocument();
    // Header and Outlet are present
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
