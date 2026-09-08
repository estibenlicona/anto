import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamsList, type TeamsListProps } from "../TeamsList";
import type { Team } from "../../adapters/TeamAdapter";

const team: Team = {
  id: "t1",
  name: "Ecosistema Digital",
  description: "Canales digitales y banca en línea",
  squadCount: 3,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

const noop = () => {};

const baseProps: TeamsListProps = {
  teams: [],
  loading: false,
  error: null,
  onRetry: noop,
  onCreate: noop,
  onEdit: noop,
  onDelete: noop,
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  onPageChange: noop,
  onPageSizeChange: noop,
  search: "",
  onSearchChange: noop,
};

function renderList(overrides: Partial<TeamsListProps> = {}) {
  return render(<TeamsList {...baseProps} {...overrides} />);
}

describe("TeamsList", () => {
  it("renders a loading state", () => {
    renderList({ loading: true });
    expect(screen.getByText("Cargando equipos…")).toBeInTheDocument();
  });

  it("renders the first-time empty state with a create action and no toolbar", () => {
    const onCreate = vi.fn();
    renderList({ onCreate });
    expect(screen.getByText("Todavía no hay equipos")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Buscar por nombre")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nuevo equipo" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders a 'no results' empty state keeping the toolbar when a search is active", () => {
    renderList({ search: "zzz" });
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(
      screen.queryByText("Todavía no hay equipos")
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por nombre")
    ).toBeInTheDocument();
  });

  it("renders an error state with a retry action", () => {
    const onRetry = vi.fn();
    renderList({ error: "Error de red", onRetry });
    expect(
      screen.getByText("No se pudieron cargar los equipos")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders a row with the team's name, description and squad count", () => {
    renderList({ teams: [team], total: 1, totalPages: 1 });
    expect(screen.getByText("Ecosistema Digital")).toBeInTheDocument();
    expect(
      screen.getByText("Canales digitales y banca en línea")
    ).toBeInTheDocument();
    expect(screen.getByText("3 células")).toBeInTheDocument();
  });

  it("shows 'Sin células' for a team with no squads", () => {
    renderList({
      teams: [{ ...team, squadCount: 0 }],
      total: 1,
      totalPages: 1,
    });
    expect(screen.getByText("Sin células")).toBeInTheDocument();
  });

  it("shows singular '1 célula'", () => {
    renderList({
      teams: [{ ...team, squadCount: 1 }],
      total: 1,
      totalPages: 1,
    });
    expect(screen.getByText("1 célula")).toBeInTheDocument();
  });

  it("opens the row menu and calls onEdit/onDelete", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderList({
      teams: [team],
      total: 1,
      totalPages: 1,
      onEdit,
      onDelete,
    });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(team);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledWith(team);
  });

  it("searching calls onSearchChange", () => {
    const onSearchChange = vi.fn();
    renderList({ teams: [team], total: 1, totalPages: 1, onSearchChange });
    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre"), {
      target: { value: "pagos" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("pagos");
  });
});
