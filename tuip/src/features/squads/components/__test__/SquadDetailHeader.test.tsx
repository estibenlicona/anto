import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SquadDetailHeader } from "../SquadDetailHeader";
import type { Squad } from "../../adapters/SquadAdapter";

const squad: Squad = {
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High",
  criticalityLabel: "Alta",
  description: "Servicios core y APIs compartidas.",
  memberCount: 4,
  members: [],
  allocatedFte: 2.7,
  bauFte: 1.7,
  transformationFte: 1,
  peopleAvailableFte: 3.8,
  activeInitiative: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

function renderHeader(
  overrides: Partial<React.ComponentProps<typeof SquadDetailHeader>> = {}
) {
  const props = {
    squad,
    onEdit: vi.fn(),
    onAssign: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  render(
    <MemoryRouter>
      <SquadDetailHeader {...props} />
    </MemoryRouter>
  );
  return props;
}

describe("SquadDetailHeader", () => {
  it("muestra nombre como h1, criticidad en español, tribu, descripción y la vuelta al listado", () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { level: 1, name: "Backend Platform" })
    ).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.queryByText("High")).not.toBeInTheDocument();
    expect(screen.getByText("Ecosistema Digital")).toBeInTheDocument();
    expect(
      screen.getByText("Servicios core y APIs compartidas.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Células/ })).toHaveAttribute(
      "href",
      "/app/lead/celulas"
    );
  });

  it("dispara editar, asignar y eliminar", () => {
    const props = renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Editar célula" }));
    expect(props.onEdit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Asignar persona" }));
    expect(props.onAssign).toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Eliminar célula" }));
    expect(props.onDelete).toHaveBeenCalled();
  });
});
