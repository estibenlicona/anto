import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminDevOpsPage } from "./AdminDevOpsPage";

describe("AdminDevOpsPage", () => {
  it("renders the page header", () => {
    render(<AdminDevOpsPage />);
    expect(
      screen.getByRole("heading", { name: "Integración con Azure DevOps" })
    ).toBeInTheDocument();
  });

  it("renders the ingestion pipeline steps", () => {
    render(<AdminDevOpsPage />);
    expect(screen.getByText("Azure DevOps")).toBeInTheDocument();
    expect(screen.getByText("Job de ingesta")).toBeInTheDocument();
    expect(screen.getByText("API de la plataforma")).toBeInTheDocument();
  });

  it("renders the connection and ingestion job cards with disabled actions (read-only skeleton)", () => {
    render(<AdminDevOpsPage />);
    expect(screen.getByText("Conexión")).toBeInTheDocument();
    expect(screen.getByText("Job de ingesta diaria")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Probar conexión" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Ejecutar ingesta ahora" })
    ).toBeDisabled();
  });
});
