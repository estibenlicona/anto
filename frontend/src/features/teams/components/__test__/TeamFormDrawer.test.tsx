import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamFormDrawer, type TeamFormDrawerProps } from "../TeamFormDrawer";
import type { Team } from "../../adapters/TeamAdapter";

const team: Team = {
  id: "t1",
  name: "Ecosistema Digital",
  description: "Canales digitales y banca en línea",
  squadCount: 2,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

function renderDrawer(overrides: Partial<TeamFormDrawerProps> = {}) {
  return render(
    <TeamFormDrawer
      open
      onOpenChange={() => {}}
      saving={false}
      serverError={null}
      onSubmit={() => {}}
      {...overrides}
    />
  );
}

describe("TeamFormDrawer", () => {
  it("se captura la descripción en un campo de varias líneas", () => {
    renderDrawer();
    const campo = screen.getByLabelText("Descripción");
    expect(campo.tagName).toBe("TEXTAREA");
    expect(Number(campo.getAttribute("rows"))).toBeGreaterThan(1);
  });

  it("precarga nombre y descripción al editar", () => {
    renderDrawer({ team });
    expect(screen.getByLabelText(/Nombre/)).toHaveValue("Ecosistema Digital");
    expect(screen.getByLabelText("Descripción")).toHaveValue(
      "Canales digitales y banca en línea"
    );
    expect(
      screen.getByRole("button", { name: "Guardar cambios" })
    ).toBeInTheDocument();
  });

  it("envía los valores al confirmar un alta válida", () => {
    const onSubmit = vi.fn();
    renderDrawer({ onSubmit });

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Nuevo Equipo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear equipo" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Nuevo Equipo",
      description: "",
    });
  });

  it("impide el envío sin nombre y lo señala, sin llamar a onSubmit", () => {
    const onSubmit = vi.fn();
    renderDrawer({ onSubmit });

    fireEvent.click(screen.getByRole("button", { name: "Crear equipo" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(
      screen.getByText("1 campo obligatorio sin llenar")
    ).toBeInTheDocument();
  });

  it("impide el envío con nombre o descripción demasiado largos", () => {
    const onSubmit = vi.fn();
    renderDrawer({ onSubmit });

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "a".repeat(101) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear equipo" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("El nombre no puede superar los 100 caracteres")
    ).toBeInTheDocument();
  });

  it("muestra el error del servidor y conserva los datos ingresados", () => {
    renderDrawer({ team, serverError: "Ya existe un equipo con ese nombre" });

    expect(
      screen.getByText("Ya existe un equipo con ese nombre")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/)).toHaveValue("Ecosistema Digital");
  });
});
