import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  DeleteTeamConfirmDialog,
  type DeleteTeamConfirmDialogProps,
} from "../DeleteTeamConfirmDialog";
import type { Team } from "../../adapters/TeamAdapter";

const team: Team = {
  id: "t1",
  name: "Ecosistema Digital",
  description: "",
  squadCount: 0,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

function renderDialog(overrides: Partial<DeleteTeamConfirmDialogProps> = {}) {
  return render(
    <DeleteTeamConfirmDialog
      open
      onOpenChange={() => {}}
      team={team}
      deleting={false}
      serverError={null}
      onConfirm={() => {}}
      {...overrides}
    />
  );
}

describe("DeleteTeamConfirmDialog", () => {
  it("sin células: muestra el diálogo de confirmación normal", () => {
    renderDialog();
    expect(screen.getByText("Eliminar equipo")).toBeInTheDocument();
    expect(screen.getByText(team.name)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Eliminar" })
    ).toBeInTheDocument();
  });

  it("confirmar llama a onConfirm", () => {
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("cancelar cierra sin llamar a onConfirm", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    renderDialog({ onConfirm, onOpenChange });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("bloqueada por células asociadas: muestra el aviso en vez del diálogo de confirmación", () => {
    const onConfirm = vi.fn();
    renderDialog({ team: { ...team, squadCount: 3 }, onConfirm });

    expect(
      screen.getByText("No se puede eliminar este equipo")
    ).toBeInTheDocument();
    expect(screen.getByText("Tiene células asociadas")).toBeInTheDocument();
    expect(screen.getByText(/3 células pertenecen/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Eliminar" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancelar" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Entendido" }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("bloqueada con una sola célula: usa singular", () => {
    renderDialog({ team: { ...team, squadCount: 1 } });
    expect(screen.getByText(/1 célula pertenece/)).toBeInTheDocument();
  });

  it("muestra el error del servidor sin descartar el equipo objetivo", () => {
    renderDialog({ serverError: "No se pudo eliminar el equipo" });
    expect(
      screen.getByText("No se pudo eliminar el equipo")
    ).toBeInTheDocument();
  });
});
