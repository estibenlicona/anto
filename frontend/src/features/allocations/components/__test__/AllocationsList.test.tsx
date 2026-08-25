import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AllocationsList,
  availabilityReading,
  type AllocationsListProps,
} from "../AllocationsList";
import type { Allocation } from "../../adapters/AllocationAdapter";

const allocation: Allocation = {
  id: "a1",
  personId: "p1",
  personName: "María González",
  squadId: "s1",
  squadName: "Backend Platform",
  dedicationPercentage: 80,
  bauPercentage: 50,
  transformationPercentage: 30,
  personPosition: "Backend Dev",
  personModality: "Hybrid",
  personSeniority: 3,
  personSeniorityLabel: "Avanzado",
  personAvailablePercentage: 20,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

const noop = () => {};

const baseProps: AllocationsListProps = {
  allocations: [],
  loading: false,
  error: null,
  onRetry: noop,
  onCreate: noop,
  onEdit: noop,
  onRemove: noop,
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
  onPageChange: noop,
  onPageSizeChange: noop,
  search: "",
  onSearchChange: noop,
  seniorityOptions: [
    { value: 1, label: "Principiante" },
    { value: 4, label: "Experto" },
  ],
  selectedSeniorities: [],
  onSenioritiesChange: noop,
};

function renderList(overrides: Partial<AllocationsListProps> = {}) {
  return render(<AllocationsList {...baseProps} {...overrides} />);
}

describe("availabilityReading", () => {
  it("reads free percentage and plain zero", () => {
    expect(availabilityReading(allocation).text).toBe("20% libre");
    expect(
      availabilityReading({
        ...allocation,
        dedicationPercentage: 100,
        personAvailablePercentage: 0,
      }).text
    ).toBe("0% libre");
  });
});

describe("AllocationsList", () => {
  it("renders a loading state", () => {
    renderList({ loading: true });
    expect(screen.getByText("Cargando asignaciones…")).toBeInTheDocument();
  });

  it("renders the first-time empty state with a create action and no toolbar", () => {
    const onCreate = vi.fn();
    renderList({ onCreate });
    expect(
      screen.getByText("Todavía no hay personas asignadas")
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Buscar por nombre o cargo")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Asignar persona" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders a 'no results' empty state keeping the toolbar when a filter is active", () => {
    renderList({ search: "zzz" });
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por nombre o cargo")
    ).toBeInTheDocument();
  });

  it("renders an error state with a retry action", () => {
    const onRetry = vi.fn();
    renderList({ error: "Error de red", onRetry });
    expect(screen.getByText("Error de red")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders the person with initials, position · modality, and seniority", () => {
    renderList({ allocations: [allocation] });
    expect(screen.getByText("MG")).toBeInTheDocument();
    expect(screen.getByText("María González")).toBeInTheDocument();
    expect(screen.getByText("Backend Dev · Híbrido")).toBeInTheDocument();
    expect(screen.getByText("Avanzado")).toBeInTheDocument();
  });

  it("renders dedication as a bar with the state threshold class and the percentage", () => {
    const { container } = renderList({
      allocations: [
        allocation,
        { ...allocation, id: "a2", dedicationPercentage: 100 },
      ],
    });
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(container.querySelector(".bg-success-bold")).toHaveStyle({
      width: "80%",
    });
    expect(container.querySelector(".bg-warning-bold")).toHaveStyle({
      width: "100%",
    });
  });

  it("renders the BAU / Transformación split and the availability reading", () => {
    renderList({
      allocations: [
        allocation,
        {
          ...allocation,
          id: "a2",
          personName: "Paula Ramírez",
          dedicationPercentage: 40,
          bauPercentage: 40,
          transformationPercentage: 0,
          personAvailablePercentage: 0,
        },
      ],
    });
    expect(screen.getByText("BAU 50% · Transf. 30%")).toBeInTheDocument();
    expect(screen.getByText("20% libre")).toBeInTheDocument();
    expect(screen.getByText("0% libre")).toBeInTheDocument();
  });

  it("wires edit and remove through the row menu", () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    renderList({ allocations: [allocation], onEdit, onRemove });
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(allocation);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Quitar" }));
    expect(onRemove).toHaveBeenCalledWith(allocation);
  });

  it("forwards search input and seniority filter changes", async () => {
    const onSearchChange = vi.fn();
    const onSenioritiesChange = vi.fn();
    renderList({
      allocations: [allocation],
      onSearchChange,
      onSenioritiesChange,
    });

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o cargo"), {
      target: { value: "dev" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("dev");

    fireEvent.click(screen.getByRole("button", { name: /Seniority/ }));
    fireEvent.click(await screen.findByLabelText("Experto"));
    expect(onSenioritiesChange).toHaveBeenCalledWith([4]);
  });
});
