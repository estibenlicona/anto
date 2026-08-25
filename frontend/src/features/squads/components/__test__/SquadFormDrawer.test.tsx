import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SquadFormDrawer } from "../SquadFormDrawer";
import type { Squad } from "../../adapters/SquadAdapter";

const squad: Squad = {
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High",
  criticalityLabel: "Alta",
  description: "Servicios core y APIs compartidas.",
  memberCount: 0,
  members: [],
  allocatedFte: 0,
  bauFte: 0,
  transformationFte: 0,
  peopleAvailableFte: 0,
  activeInitiative: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

function renderDrawer(
  overrides: Partial<Parameters<typeof SquadFormDrawer>[0]> = {}
) {
  return render(
    <SquadFormDrawer
      open
      onOpenChange={() => {}}
      criticalities={["Critical", "High", "Medium", "Low"]}
      criticalitiesLoading={false}
      saving={false}
      serverError={null}
      onSubmit={() => {}}
      {...overrides}
    />
  );
}

describe("SquadFormDrawer — la descripción", () => {
  it("se captura en un campo de varias líneas, no en uno de una", () => {
    renderDrawer();
    const campo = screen.getByLabelText("Descripción");

    // El campo admite 500 caracteres: ofrecer un renglón para escribirlos
    // contradice lo que su propio texto de ayuda anuncia.
    expect(campo.tagName).toBe("TEXTAREA");
    expect(Number(campo.getAttribute("rows"))).toBeGreaterThan(1);
    expect(
      screen.getByText("Opcional, máximo 500 caracteres.")
    ).toBeInTheDocument();
  });

  it("acepta saltos de línea", () => {
    renderDrawer();

    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Primera línea.\nSegunda línea." },
    });

    expect(screen.getByLabelText("Descripción")).toHaveValue(
      "Primera línea.\nSegunda línea."
    );
  });

  it("precarga la descripción al editar", () => {
    renderDrawer({ squad });

    expect(screen.getByLabelText("Descripción")).toHaveValue(
      "Servicios core y APIs compartidas."
    );
  });
});
