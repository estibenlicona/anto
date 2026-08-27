import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InitiativesList } from "../InitiativesList";
import { InitiativesStatsCards } from "../InitiativesStatsCards";
import { validateInitiative, toInitiativeInput } from "../initiativeValidation";
import { initiativeAdapter } from "../../adapters/InitiativeAdapter";
import type { InitiativeDto } from "../../services/initiativeService";

const base: InitiativeDto = {
  id: "i1",
  name: "Pago con QR",
  squadId: "s1",
  squadName: "Canales",
  productOwner: "Diego",
  targetMonths: 6,
  status: "Evaluating",
  evaluation: null,
  createdAtUtc: "2026-08-01T00:00:00Z",
  squadHasOtherActive: false,
};

const evaluated: InitiativeDto = {
  ...base,
  id: "i2",
  name: "Kafka",
  status: "Active",
  evaluation: {
    triage: [],
    answers: {},
    targetMonths: 6,
    points: 10,
    maxPoints: 20,
    pct: 50,
    talla: "M",
    pmMin: 3,
    pmMax: 6,
    fteExpected: 0.75,
    fteMin: 0.5,
    fteMax: 1,
    dimensions: [],
    mix: [],
    triageVerdict: "Required",
    savedAtUtc: "2026-08-01T00:00:00Z",
  },
};

const noop = () => {};
const listProps = {
  loading: false,
  error: null,
  onRetry: noop,
  onCreate: noop,
  onEdit: noop,
  onActivate: noop,
  onClose: noop,
  page: 1,
  pageSize: 10,
  total: 2,
  totalPages: 1,
  onPageChange: noop,
  onPageSizeChange: noop,
  search: "",
  onSearchChange: noop,
  statuses: [],
  onStatusesChange: noop,
  squadOptions: [{ value: "s1", label: "Canales" }],
  squadIds: [],
  onSquadIdsChange: noop,
  tallaOptions: ["XS", "S", "M", "L", "XL"],
  tallas: [],
  onTallasChange: noop,
};

const renderList = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("InitiativesList", () => {
  it("fila con talla muestra badge y FTE; sin talla muestra el enlace Evaluar y un guion", () => {
    renderList(
      <InitiativesList
        {...listProps}
        initiatives={[base, evaluated].map(initiativeAdapter.toEntity)}
      />
    );
    const qr = screen.getByText("Pago con QR").closest("tr")!;
    expect(within(qr).getByRole("link", { name: "Evaluar" })).toHaveAttribute(
      "href",
      "/app/lead/iniciativas/i1/evaluacion"
    );
    expect(within(qr).getByText("—")).toBeInTheDocument();
    expect(
      within(qr).queryByRole("button", { name: "Evaluar" })
    ).not.toBeInTheDocument();
    const kafka = screen.getByText("Kafka").closest("tr")!;
    expect(within(kafka).getByText("M")).toBeInTheDocument();
    expect(within(kafka).getByText("0,75")).toBeInTheDocument();
    expect(within(kafka).getByText("Activa")).toBeInTheDocument();
  });

  it("el menú deshabilita Activar sin talla y Cerrar sin estar activa", () => {
    const onActivate = vi.fn();
    renderList(
      <InitiativesList
        {...listProps}
        initiatives={[base].map(initiativeAdapter.toEntity)}
        onActivate={onActivate}
      />
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    expect(screen.getByRole("menuitem", { name: "Activar" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByRole("menuitem", { name: "Cerrar" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Activar" }));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("el filtro por talla llama con la selección", () => {
    const onTallasChange = vi.fn();
    renderList(
      <InitiativesList
        {...listProps}
        initiatives={[evaluated].map(initiativeAdapter.toEntity)}
        onTallasChange={onTallasChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Talla/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "M" }));
    expect(onTallasChange).toHaveBeenCalledWith(["M"]);
  });

  it("sin iniciativas y sin filtros ofrece crear la primera", () => {
    const onCreate = vi.fn();
    renderList(
      <InitiativesList {...listProps} initiatives={[]} onCreate={onCreate} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Nueva iniciativa" }));
    expect(onCreate).toHaveBeenCalled();
  });
});

describe("InitiativesStatsCards", () => {
  it("muestra sin evaluar, activas por talla y FTE demandado", () => {
    const { container } = render(
      <InitiativesStatsCards
        loading={false}
        stats={{
          total: 7,
          unevaluated: 2,
          active: 4,
          activeByTalla: [
            { talla: "S", count: 1 },
            { talla: "M", count: 3 },
          ],
          fteDemand: 2.89,
        }}
      />
    );
    expect(screen.getByText("SIN EVALUAR")).toBeInTheDocument();
    // "de 7 iniciativas" es el pie de activas y también el de sin evaluar.
    expect(screen.getAllByText("de 7 iniciativas")).toHaveLength(2);
    const porTalla = screen.getByRole("list", { name: "Activas por talla" });
    expect(within(porTalla).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("S").closest("li")).toHaveTextContent("1");
    expect(screen.getByText("M").closest("li")).toHaveTextContent("3");
    expect(screen.getByText("2,89")).toBeInTheDocument();
    // Los pies llevan datos, no explicaciones: la unidad con el conteo de
    // activas, y la relación con el total.
    expect(screen.getByText("FTE de 4 activas")).toBeInTheDocument();
    expect(
      screen.queryByText(/FTE esperado que suman/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Sin talla no entran/)).not.toBeInTheDocument();
    // Una sola medida de separación en la vista (gap-3, como en ausencias):
    // el grid dejó el gap-4 que lo hacía verse más suelto que el resto.
    const grid = container.firstElementChild!;
    expect(grid).toHaveClass("grid", "gap-3");
    expect(grid).not.toHaveClass("gap-4");
  });

  it("concuerda los pies en singular con una activa y una iniciativa", () => {
    render(
      <InitiativesStatsCards
        loading={false}
        stats={{
          total: 1,
          unevaluated: 0,
          active: 1,
          activeByTalla: [{ talla: "S", count: 1 }],
          fteDemand: 0.5,
        }}
      />
    );
    expect(screen.getByText("FTE de 1 activa")).toBeInTheDocument();
    expect(screen.getAllByText("de 1 iniciativa")).toHaveLength(2);
  });
});

describe("validateInitiative", () => {
  it("exige nombre, célula y PO, y acota el plazo", () => {
    const errors = validateInitiative({
      name: "",
      squadId: "",
      productOwner: "",
      targetMonths: "0",
    });
    expect(Object.keys(errors).sort()).toEqual([
      "name",
      "productOwner",
      "squadId",
      "targetMonths",
    ]);
    expect(
      validateInitiative({
        name: "X",
        squadId: "s",
        productOwner: "P",
        targetMonths: "37",
      }).targetMonths
    ).toMatch(/1 a 36/);
    expect(
      validateInitiative({
        name: "X",
        squadId: "s",
        productOwner: "P",
        targetMonths: "6",
      })
    ).toEqual({});
    expect(
      toInitiativeInput({
        name: " X ",
        squadId: "s",
        productOwner: " P ",
        targetMonths: "6",
      })
    ).toEqual({
      name: "X",
      squadId: "s",
      productOwner: "P",
      targetMonths: 6,
    });
  });
});
