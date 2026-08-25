import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { segmentFillClass, Tag } from "@tuya-ui/components";
import { tallaColor } from "@features/initiatives/adapters/InitiativeAdapter";
import { MIX_COLORS } from "../mixColors";
import { MemoryRouter } from "react-router-dom";
import { SquadsList, type SquadsListProps } from "../SquadsList";
import type { Squad } from "../../adapters/SquadAdapter";

const squad: Squad = {
  activeInitiative: null,
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High",
  criticalityLabel: "Alta",
  description: "Servicios core",
  memberCount: 2,
  members: [
    { id: "p1", name: "Carlos López" },
    { id: "p2", name: "María González" },
  ],
  allocatedFte: 1.8,
  bauFte: 1.1,
  transformationFte: 0.7,
  peopleAvailableFte: 2,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

const noop = () => {};

const baseProps: SquadsListProps = {
  squads: [],
  loading: false,
  error: null,
  onRetry: noop,
  onCreate: noop,
  onEdit: noop,
  onDelete: noop,
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
  onPageChange: noop,
  onPageSizeChange: noop,
  search: "",
  onSearchChange: noop,
  selectedCriticalities: [],
  onCriticalitiesChange: noop,
};

function renderList(overrides: Partial<SquadsListProps> = {}) {
  return render(
    <MemoryRouter>
      <SquadsList {...baseProps} {...overrides} />
    </MemoryRouter>
  );
}

describe("SquadsList", () => {
  it("renders a loading state", () => {
    renderList({ loading: true });
    expect(screen.getByText("Cargando células…")).toBeInTheDocument();
  });

  it("renders the first-time empty state with a create action and no toolbar", () => {
    const onCreate = vi.fn();
    renderList({ onCreate });
    expect(screen.getByText("Todavía no hay células")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Buscar por nombre o equipo")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nueva célula" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders a 'no results' empty state keeping the toolbar when a filter is active", () => {
    renderList({ search: "zzz" });
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(
      screen.queryByText("Todavía no hay células")
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por nombre o equipo")
    ).toBeInTheDocument();
  });

  it("renders an error state with a retry action", () => {
    const onRetry = vi.fn();
    renderList({ error: "Error de red", onRetry });
    expect(screen.getByText("Error de red")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("no repite el rótulo de una columna en otra", () => {
    // El guardián de la colisión que este listado ya tuvo: la agrupación y las
    // personas asignadas se llamaban las dos "Equipo". Si vuelve a pasar, con
    // esas dos palabras o con cualquier otro par, esto falla acá y no en
    // producción.
    renderList({ squads: [squad] });
    const rotulos = screen
      .getAllByRole("columnheader")
      .map((th) => th.textContent?.trim() ?? "")
      .filter((texto) => texto.length > 0);

    expect(new Set(rotulos).size).toBe(rotulos.length);
    expect(rotulos).toContain("Equipo");
    expect(rotulos).toContain("Personas");
  });

  describe("la columna de la iniciativa activa", () => {
    const conActiva = (activeInitiative: Squad["activeInitiative"]): Squad => ({
      ...squad,
      activeInitiative,
    });

    it("muestra su talla y el nombre como enlace a su evaluación", () => {
      renderList({
        squads: [conActiva({ id: "i1", name: "Kafka", talla: "M" })],
      });
      expect(screen.getByText("M")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Kafka" })).toHaveAttribute(
        "href",
        "/app/lead/iniciativas/i1/evaluacion"
      );
    });

    it("la talla y el nombre van en la misma línea", () => {
      // Alineación entre filas: la talla hace de columna dentro de la celda.
      // Apiladas, la celda tendría dos alturas y los nombres no alinearían.
      renderList({
        squads: [conActiva({ id: "i1", name: "Kafka", talla: "M" })],
      });
      const talla = screen.getByText("M");
      const nombre = screen.getByRole("link", { name: "Kafka" });
      expect(talla.parentElement).toBe(nombre.parentElement);
    });

    it("sin activa se lee Sin iniciativa, aunque la célula tenga trabajo en evaluación", () => {
      // Las que están en evaluación no llegan a esta columna: el listado
      // responde por lo que la célula ejecuta.
      renderList({ squads: [conActiva(null)] });
      expect(screen.getByText("Sin iniciativa")).toBeInTheDocument();

      // El guion sostiene la alineación, pero no es contenido que anunciar.
      expect(screen.getByText("—")).toHaveAttribute("aria-hidden", "true");
    });

    it("la talla usa el mismo color que en el módulo de Iniciativas", () => {
      renderList({
        squads: [conActiva({ id: "i1", name: "Kafka", talla: "XL" })],
      });
      const enLista = screen.getByText("XL");

      // El control: la misma talla vestida directamente con el mapa compartido.
      const { container } = render(<Tag color={tallaColor("XL")}>XL</Tag>);
      expect(enLista.className).toBe(container.firstElementChild!.className);
    });

    it("nunca resume varias: ni excedente ni recuento en la celda", () => {
      renderList({
        squads: [
          conActiva({ id: "i1", name: "Kafka", talla: "S" }),
          { ...conActiva(null), id: "2" },
        ],
      });
      expect(screen.getAllByRole("row")).toHaveLength(3); // cabecera + 2 células
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\d+ iniciativas/)).not.toBeInTheDocument();
      expect(screen.queryByText("Sin evaluar")).not.toBeInTheDocument();
    });

    it("el rótulo de la columna está en singular", () => {
      renderList({ squads: [squad] });
      const rotulos = screen
        .getAllByRole("columnheader")
        .map((h) => h.textContent);
      expect(rotulos).toContain("Iniciativa");
      expect(rotulos).not.toContain("Iniciativas");
    });
  });

  it("renders the name as a neutral link to the detail, with the description underneath", () => {
    renderList({ squads: [squad] });
    const link = screen.getByRole("link", { name: "Backend Platform" });
    expect(link).toHaveAttribute("href", "/app/lead/celulas/1");
    const description = screen.getByText("Servicios core");
    expect(description).toHaveAttribute("title", "Servicios core");
    expect(description.className).toContain("truncate");
    expect(screen.getByText("Ecosistema Digital")).toBeInTheDocument();
  });

  it("shows the criticality badge with its Spanish label, not the code", () => {
    renderList({ squads: [squad] });
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.queryByText("High")).not.toBeInTheDocument();
  });

  it("muestra la criticidad sin el punto de estado, sólo con su etiqueta", () => {
    renderList({ squads: [squad] });
    const badge = screen
      .getByText("Alta")
      .closest("[role=status]") as HTMLElement;

    // La criticidad es una clasificación fija, no una condición que esté
    // pasando: el punto no dice nada y compite con la etiqueta.
    expect(badge.querySelector("span")).toBeNull();
    expect(badge).toHaveTextContent("Alta");
    // Y sigue vistiendo el rol que corresponde a su gravedad.
    expect(badge.className).toContain("warning");
  });

  it("shows team avatars with initials and the member count", () => {
    renderList({ squads: [squad] });
    expect(screen.getByText("CL")).toBeInTheDocument();
    expect(screen.getByText("MG")).toBeInTheDocument();
    expect(screen.getByText("2 personas")).toBeInTheDocument();
  });

  it("adds a '+N' avatar when the team is larger than the sample", () => {
    renderList({
      squads: [
        {
          ...squad,
          memberCount: 5,
          members: [
            { id: "p1", name: "Ana Arias" },
            { id: "p2", name: "Bruno Bello" },
            { id: "p3", name: "Carla Cano" },
          ],
        },
      ],
    });
    expect(screen.getByText("AA")).toBeInTheDocument();
    expect(screen.getByText("BB")).toBeInTheDocument();
    expect(screen.getByText("CC")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("5 personas")).toBeInTheDocument();
  });

  it("shows 'Sin personas' and 0.0 FTE for a squad without allocations", () => {
    renderList({
      squads: [
        {
          ...squad,
          memberCount: 0,
          members: [],
          allocatedFte: 0,
          bauFte: 0,
          transformationFte: 0,
          peopleAvailableFte: 0,
        },
      ],
    });
    expect(screen.getByText("Sin personas")).toBeInTheDocument();
    expect(screen.getByText("0.0", { exact: false }).textContent).toBe(
      "0.0 FTE"
    );
    expect(screen.getByText("Sin capacidad asignada")).toBeInTheDocument();
    expect(screen.queryByLabelText(/de ocupación/)).not.toBeInTheDocument();
  });

  it("shows allocated vs team FTE, a warning % at 90, the stacked bar and the free FTE", () => {
    // 1.8 asignado sobre 2.0 del equipo: 90 % → advertencia, 0.2 libre.
    renderList({ squads: [squad] });
    expect(screen.getByText("/ 2.0 FTE")).toBeInTheDocument();
    const pct = screen.getByLabelText("90% de ocupación");
    expect(pct).toHaveTextContent("90%");
    expect(pct.className).toContain("text-warning-default");
    // Las clases salen de tuip y de MIX_COLORS: la escala puede cambiar sin que
    // el test deje de comprobar que cada tramo lleva su tono.
    const bau = document.querySelector(
      `.${segmentFillClass({ color: MIX_COLORS.bau })}`
    ) as HTMLElement;
    const transf = document.querySelector(
      `.${segmentFillClass({ color: MIX_COLORS.transformation })}`
    ) as HTMLElement;
    expect(bau.style.width).toMatch(/^55/);
    expect(transf.style.width).toMatch(/^35/);
    const legend = screen.getByText("0.2 libre").parentElement as HTMLElement;
    expect(legend.textContent).toContain("BAU 1.1");
    expect(legend.textContent).toContain("Transf. 0.7");
  });

  it("reads 'Al tope' in danger when the team FTE is fully allocated", () => {
    renderList({
      squads: [
        { ...squad, allocatedFte: 2, bauFte: 1.2, transformationFte: 0.8 },
      ],
    });
    const pct = screen.getByLabelText("100% de ocupación");
    expect(pct).toHaveTextContent("100%");
    expect(pct.className).toContain("text-danger-default");
    expect(screen.getByText("Al tope")).toBeInTheDocument();
    expect(screen.queryByText(/libre/)).not.toBeInTheDocument();
  });

  it("reads the % in success while there is room", () => {
    renderList({
      squads: [
        { ...squad, allocatedFte: 1, bauFte: 0.6, transformationFte: 0.4 },
      ],
    });
    const pct = screen.getByLabelText("50% de ocupación");
    expect(pct).toHaveTextContent("50%");
    expect(pct.className).toContain("text-success-default");
    expect(screen.getByText("1.0 libre")).toBeInTheDocument();
  });

  it("wires edit and delete through the row menu, without 'Ver equipo'", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderList({ squads: [squad], onEdit, onDelete });
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(squad);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    expect(
      screen.queryByRole("menuitem", { name: "Ver equipo" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledWith(squad);
  });

  describe("el vocabulario de color de la mezcla", () => {
    it("el tramo y su punto de leyenda salen del mismo color", () => {
      renderList({ squads: [squad] });

      for (const parte of ["bau", "transformation"] as const) {
        const clase = segmentFillClass({ color: MIX_COLORS[parte] });
        // El tramo de la barra y el punto de la leyenda: dos elementos con la
        // misma clase de relleno, no dos colores parecidos.
        expect(document.querySelectorAll(`.${clase}`).length).toBeGreaterThan(
          1
        );
      }
    });

    it("no usa tonos de la escala de acento, que es la de seniority", () => {
      renderList({ squads: [squad] });

      // El motivo del cambio: con acento, BAU y Transformación tomaban los
      // mismos tonos que la escala de seniority y se leían como si lo fueran.
      expect(document.querySelectorAll("[class*=accent]")).toHaveLength(0);
    });
  });

  describe("la barra de controles sobrevive a la recarga", () => {
    const toolbar = () => ({
      busqueda: screen.queryByPlaceholderText("Buscar por nombre o equipo"),
      filtro: screen.queryByRole("button", { name: /Criticidad/ }),
    });

    it("sigue montada mientras el listado carga, con el estado de carga sólo en los resultados", () => {
      renderList({ squads: [squad], loading: true, search: "back" });

      expect(screen.getByText("Cargando células…")).toBeInTheDocument();
      // Antes esto era un return temprano: la barra desaparecía entera y el
      // usuario perdía lo que estaba haciendo.
      expect(toolbar().busqueda).toBeInTheDocument();
      expect(toolbar().filtro).toBeInTheDocument();
      expect(toolbar().busqueda).toHaveValue("back");
    });

    it("sigue montada cuando la carga falla", () => {
      renderList({
        error: "Error de red",
        selectedCriticalities: ["Critical"],
      });

      expect(screen.getByText("Error de red")).toBeInTheDocument();
      expect(toolbar().busqueda).toBeInTheDocument();
      expect(toolbar().filtro).toBeInTheDocument();
    });

    it("deja marcar varios criterios sin que el filtro se cierre en el medio", async () => {
      const onCriticalitiesChange = vi.fn();
      const { rerender } = render(
        <MemoryRouter>
          <SquadsList
            {...baseProps}
            squads={[squad]}
            onCriticalitiesChange={onCriticalitiesChange}
          />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole("button", { name: /Criticidad/ }));
      fireEvent.click(await screen.findByLabelText("Crítica"));
      expect(onCriticalitiesChange).toHaveBeenCalledWith(["Critical"]);

      // Lo que el contenedor hace a continuación: vuelve a pedir datos, así que
      // el componente se re-renderiza cargando y con el criterio ya aplicado.
      rerender(
        <MemoryRouter>
          <SquadsList
            {...baseProps}
            squads={[squad]}
            loading
            selectedCriticalities={["Critical"]}
            onCriticalitiesChange={onCriticalitiesChange}
          />
        </MemoryRouter>
      );

      // El panel sigue abierto: se puede marcar el segundo criterio sin
      // reabrirlo.
      expect(screen.getByLabelText("Baja")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Baja"));
      expect(onCriticalitiesChange).toHaveBeenLastCalledWith([
        "Critical",
        "Low",
      ]);
    });
  });

  it("forwards search input and criticality filter changes", async () => {
    const onSearchChange = vi.fn();
    const onCriticalitiesChange = vi.fn();
    renderList({ squads: [squad], onSearchChange, onCriticalitiesChange });

    fireEvent.change(
      screen.getByPlaceholderText("Buscar por nombre o equipo"),
      {
        target: { value: "pagos" },
      }
    );
    expect(onSearchChange).toHaveBeenCalledWith("pagos");

    fireEvent.click(screen.getByRole("button", { name: /Criticidad/ }));
    // Las opciones salen con la etiqueta en español; el valor que vuelve es el código.
    expect(await screen.findByLabelText("Crítica")).toBeInTheDocument();
    expect(screen.getByLabelText("Baja")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Crítica"));
    expect(onCriticalitiesChange).toHaveBeenCalledWith(["Critical"]);
  });
});
