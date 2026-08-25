import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminHomePage } from "./AdminHomePage";

describe("AdminHomePage", () => {
  it("renders the page header", () => {
    render(<AdminHomePage />);
    expect(
      screen.getByRole("heading", { name: "Estado de la plataforma" })
    ).toBeInTheDocument();
  });

  it("renders the configuración vigente and autenticación cards", () => {
    render(<AdminHomePage />);
    expect(screen.getByText("Configuración vigente")).toBeInTheDocument();
    expect(
      screen.getByText("Autenticación y autorización")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Calendario de sprints").length).toBeGreaterThan(
      0
    );
  });
});
