import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BacklogHeader } from "../BacklogHeader";
import { BacklogQueue } from "../BacklogQueue";
import { CurrentStoryPanel } from "../CurrentStoryPanel";
import { RejectItemDrawer } from "../RejectItemDrawer";
import { catalogs, changed, story, summary } from "./fixtures";

const wrap = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("BacklogHeader", () => {
  it("muestra el progreso del día", () => {
    render(<BacklogHeader summary={summary} />);
    expect(screen.getByText(/clasificadas hoy/)).toHaveTextContent(
      "2 clasificadas hoy · quedan 8 de 10"
    );
    expect(
      screen.getByRole("progressbar", { name: "Progreso del día" })
    ).toBeInTheDocument();
  });
});

describe("BacklogQueue", () => {
  function renderQueue(
    over: Partial<React.ComponentProps<typeof BacklogQueue>> = {}
  ) {
    const props = {
      items: [changed, story],
      summary,
      currentId: changed.id,
      view: "pending" as const,
      onViewChange: vi.fn(),
      squadId: null,
      onSquadChange: vi.fn(),
      personFilter: null,
      onClearPerson: vi.fn(),
      onSelect: vi.fn(),
      onUndo: vi.fn(),
      ...over,
    };
    wrap(<BacklogQueue {...props} />);
    return props;
  }

  it("chips por célula con contador, la en curso resaltada y el aviso de cambio de asignado", () => {
    const props = renderQueue();
    expect(screen.getByRole("button", { name: "Todas, 8" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Backend Platform, 5" })
    );
    expect(props.onSquadChange).toHaveBeenCalledWith("s1");
    const rows = screen.getAllByRole("listitem");
    expect(rows[0].className).toContain("bg-brand-subtle");
    expect(
      within(rows[0]).getByText(/cambió de asignado · Carlos López/)
    ).toBeInTheDocument();
    expect(
      within(rows[1]).getByText(/Backend Platform · Carlos López/)
    ).toBeInTheDocument();
    fireEvent.click(
      within(rows[1]).getByRole("button", {
        name: "Consumer group: rebalanceo",
      })
    );
    expect(props.onSelect).toHaveBeenCalledWith(story);
    expect(
      screen.getByText(/3 historias de personas sin identidad DevOps/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "vincular identidades" })
    ).toHaveAttribute("href", "/app/lead/personas");
  });

  it("filtro por persona como chip removible; vacío con estado", () => {
    const props = renderQueue({
      items: [],
      personFilter: { id: "p1", name: "Carlos López" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Quitar el filtro por persona" })
    );
    expect(props.onClearPerson).toHaveBeenCalled();
    expect(
      screen.getByText("No queda nada por clasificar")
    ).toBeInTheDocument();
  });

  it("en Clasificadas muestra el resultado y deshacer", () => {
    const done = {
      ...story,
      status: "Classified" as const,
      outcomeLabel: "Iniciativa · Kafka Migration",
    };
    const props = renderQueue({
      items: [done],
      view: "classified",
      currentId: null,
    });
    expect(
      screen.getByText(/Iniciativa · Kafka Migration/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Deshacer" }));
    expect(props.onUndo).toHaveBeenCalledWith(done);
  });
});

describe("CurrentStoryPanel", () => {
  function renderPanel(
    over: Partial<React.ComponentProps<typeof CurrentStoryPanel>> = {}
  ) {
    const props = {
      story,
      position: 1,
      total: 8,
      catalogs,
      values: {
        kind: "Initiative" as const,
        initiativeId: "ini-kafka",
        bauCategory: "",
      },
      errors: {},
      onChange: vi.fn(),
      onSave: vi.fn(),
      onSkip: vi.fn(),
      onReject: vi.fn(),
      saving: false,
      onShowClassified: vi.fn(),
      hasFilter: false,
      onClearFilter: vi.fn(),
      ...over,
    };
    wrap(<CurrentStoryPanel {...props} />);
    return props;
  }

  it("tres zonas, la sugerida elegida, atajos y un solo primario", () => {
    const props = renderPanel();
    expect(
      screen.getByRole("heading", { name: "Consumer group: rebalanceo" })
    ).toBeInTheDocument();
    expect(screen.getByText("Migración plataforma Kafka")).toBeInTheDocument();
    expect(screen.getByText(/1 de 8/)).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.getByText(/identidad vinculada/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Iniciativa" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(
      screen.getByText("Sugerida: el Epic está mapeado a esta iniciativa.")
    ).toBeInTheDocument();
    expect(screen.getAllByText("1").some((el) => el.tagName === "KBD")).toBe(
      true
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar y siguiente" })
    );
    expect(props.onSave).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Saltar por ahora" }));
    expect(props.onSkip).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "No es de Carlos…" }));
    expect(props.onReject).toHaveBeenCalled();
    const primaries = screen
      .getAllByRole("button")
      .filter((b) => b.className.includes("bg-brand-bold"));
    expect(primaries).toHaveLength(1);
  });

  it("muestra el cambio de asignado y los errores de validación", () => {
    renderPanel({
      story: changed,
      values: { kind: "Bau", initiativeId: "", bauCategory: "" },
      errors: { bauCategory: "Selecciona la categoría" },
    });
    expect(
      screen.getByText(/Cambió de asignado: antes jpena@tuya/)
    ).toBeInTheDocument();
    expect(screen.getByText("Selecciona la categoría")).toBeInTheDocument();
  });

  it("elegir una tarjeta notifica el cambio", () => {
    const props = renderPanel({
      values: { kind: "", initiativeId: "", bauCategory: "" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Descartar" }));
    expect(props.onChange).toHaveBeenCalledWith({
      kind: "Discard",
      initiativeId: "",
      bauCategory: "",
    });
  });

  it("estado vacío con y sin filtro", () => {
    const props = renderPanel({ story: null, hasFilter: true });
    expect(screen.getByText("Nada por clasificar acá")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Quitar el filtro" }));
    expect(props.onClearFilter).toHaveBeenCalled();
  });
});

describe("RejectItemDrawer", () => {
  function renderDrawer(onSubmit = vi.fn()) {
    render(
      <RejectItemDrawer
        open
        onOpenChange={() => {}}
        story={changed}
        catalogs={catalogs}
        candidates={[{ id: "p2", name: "Julián Peña" }]}
        saving={false}
        serverError={null}
        onSubmit={onSubmit}
      />
    );
    return onSubmit;
  }

  it("exige el motivo y envía el plan con el motivo elegido", () => {
    const onSubmit = renderDrawer();
    expect(
      screen.getByRole("heading", { name: "Rechazar: no es de Carlos" })
    ).toBeInTheDocument();
    expect(screen.getByText(/antes jpena@tuya/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Selecciona el motivo");
    fireEvent.click(screen.getByRole("button", { name: "Duplicado" }));
    expect(screen.getByRole("button", { name: "Duplicado" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    fireEvent.change(screen.getByLabelText("Detalle"), {
      target: { value: "Es la misma que #12299" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(onSubmit).toHaveBeenCalledWith({
      reason: "Duplicate",
      reassignToPersonId: undefined,
      detail: "Es la misma que #12299",
    });
  });
});
