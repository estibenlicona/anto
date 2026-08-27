import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { segmentFillClass } from "@tuya-ui/components";
import { PeopleList } from "../PeopleList";
import type { Person } from "../../adapters/PersonAdapter";

// El nombre de cada fila es un `Link`, que fuera de un router lanza al
// renderizar. Todos los casos montan a través de este helper.
function renderList(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const person: Person = {
  id: "1",
  name: "María González",
  documentId: "1036884001",
  userPrincipalName: "maria.gonzalez@tuya.com",
  position: "Backend Dev",
  role: "Contributor",
  technicalLeadId: null,
  technicalLeadName: null,
  technicalLeadOfCount: 0,
  seniority: 3,
  seniorityLabel: "Avanzado",
  modality: "Hybrid",
  availableFte: 1,
  utilization: 40,
  monthlyCost: 7900000,
  startDate: "2023-03-01",
  providerId: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
  stacks: [
    { name: ".NET", level: 3, isPrimary: true },
    { name: "Azure", level: 2, isPrimary: false },
    { name: "SQL Server", level: 2, isPrimary: false },
    { name: "AS400", level: 2, isPrimary: false },
    { name: "Kafka", level: 1, isPrimary: false },
  ],
};

const noop = () => {};

const pagination = {
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
  onPageChange: noop,
  onPageSizeChange: noop,
};

const filters = {
  search: "",
  onSearchChange: noop,
  seniorityOptions: [
    { value: 1, label: "Principiante" },
    { value: 2, label: "Competente" },
    { value: 3, label: "Avanzado" },
    { value: 4, label: "Experto" },
  ],
  selectedSeniorities: [],
  onSenioritiesChange: noop,
  stackOptions: [".NET", "AS400", "Azure", "Kafka", "SQL Server"],
  selectedStacks: [],
  onStacksChange: noop,
};

const listProps = {
  loading: false,
  error: null,
  onRetry: noop,
  onCreate: noop,
  onEdit: noop,
  onDelete: noop,
  ...pagination,
  ...filters,
};

describe("PeopleList", () => {
  it("renders a loading state", () => {
    renderList(
      <PeopleList
        people={[]}
        loading
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );
    expect(screen.getByText("Cargando personas…")).toBeInTheDocument();
  });

  // La barra es un slot de la tabla: se queda montada, con su valor, mientras
  // los resultados cambian de estado; la paginación no, porque no hay filas.
  it("keeps the toolbar mounted while loading, without pagination", () => {
    renderList(<PeopleList people={[]} {...listProps} loading search="mar" />);
    expect(screen.getByText("Cargando personas…")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por nombre o cargo")
    ).toHaveValue("mar");
    expect(
      screen.getByRole("button", { name: /Seniority/ })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it("keeps the toolbar mounted on error, with the retry action under the headers", () => {
    renderList(<PeopleList people={[]} {...listProps} error="Error de red" />);
    expect(screen.getByText("Error de red")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por nombre o cargo")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Nombre" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it("renders an empty state with a create action", () => {
    const onCreate = vi.fn();
    renderList(
      <PeopleList
        people={[]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={onCreate}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );
    expect(screen.getByText("Todavía no hay personas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nueva persona" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders an error state with a retry action", () => {
    const onRetry = vi.fn();
    renderList(
      <PeopleList
        people={[]}
        loading={false}
        error="Error de red"
        onRetry={onRetry}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );
    expect(screen.getByText("Error de red")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders the people, the pagination summary, and wires edit/delete actions via the row menu", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderList(
      <PeopleList
        people={[person]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={onEdit}
        onDelete={onDelete}
        {...pagination}
        {...filters}
      />
    );
    expect(screen.getByText("María González")).toBeInTheDocument();
    expect(screen.getByText("Backend Dev")).toBeInTheDocument();
    // El nombre del nivel sigue siendo texto, ahora dentro de la card del
    // sistema y no de un Badge: el seniority dejó de compartir vocabulario
    // visual con los estados.
    expect(screen.getByText("Avanzado")).toBeInTheDocument();
    // El medidor no lleva nombre propio: quien nombra el dato es la card que
    // lo contiene, y duplicarlo haría que el lector anuncie el nivel dos veces.
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByLabelText("Avanzado")).toBeInTheDocument();
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
    expect(screen.getByText("maria.gonzalez@tuya.com")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(onEdit).toHaveBeenCalledWith(person);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledWith(person);
  });

  it("links each person's name to their detail screen", () => {
    renderList(
      <PeopleList
        people={[person]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );

    const link = screen.getByRole("link", { name: "María González" });
    expect(link).toHaveAttribute("href", "/app/lead/personas/1");
    // `asChild` cede la etiqueta al Link del router: un solo ancla por nombre,
    // no una anidada dentro de otra.
    expect(link.querySelector("a")).toBeNull();
  });

  it("no muestra el nombre en el color de marca", () => {
    renderList(
      <PeopleList
        people={[person]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );

    // Se asserta la ausencia del rojo y no la presencia de un gris concreto:
    // qué paso de neutro usa el tono es asunto de `tuip`, que tiene su propia
    // prueba para eso. Lo que esta pantalla pidió es que no haya marca.
    const link = screen.getByRole("link", { name: "María González" });
    expect(link.className).not.toMatch(/brand/);
  });

  it("deja el nombre alcanzable con el teclado y anunciado como enlace", () => {
    renderList(
      <PeopleList
        people={[person]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );

    // Sin señal visual en reposo, esto es lo que sostiene la accesibilidad:
    // sigue siendo un ancla con destino, así que entra en el orden de
    // tabulación y un lector de pantalla lo anuncia como enlace.
    const link = screen.getByRole("link", { name: "María González" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href");
    link.focus();
    expect(link).toHaveFocus();
  });

  it("renders the toolbar and notifies search changes", () => {
    const onSearchChange = vi.fn();
    renderList(
      <PeopleList
        people={[person]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
        onSearchChange={onSearchChange}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o cargo"), {
      target: { value: "maría" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("maría");
    expect(
      screen.getByRole("button", { name: /Seniority/ })
    ).toBeInTheDocument();
  });

  it("renders a no-results state when a filter is active but nothing matches", () => {
    renderList(
      <PeopleList
        people={[]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
        search="ninguna coincidencia"
      />
    );
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(
      screen.queryByText("Todavía no hay personas")
    ).not.toBeInTheDocument();
  });

  it("un seniority fuera de la escala cae en el estado vacío de la card, sin romper la fila", () => {
    renderList(
      <PeopleList
        people={[
          person,
          {
            ...person,
            id: "2",
            name: "Julián Pérez",
            seniorityLabel: "Senior",
          },
        ]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );

    // La fila sigue ahí y muestra el estado vacío documentado, no un tono
    // inventado ni una celda en blanco.
    expect(screen.getByText("Julián Pérez")).toBeInTheDocument();
    expect(screen.getByText("Sin nivel")).toBeInTheDocument();
    // Sólo la fila con nivel conocido tiene medidor.
    expect(screen.getAllByRole("meter")).toHaveLength(1);
  });

  it("todas las celdas de seniority piden el mismo ancho, cualquiera sea el nivel", () => {
    renderList(
      <PeopleList
        people={[
          person,
          { ...person, id: "2", seniorityLabel: "Principiante" },
          { ...person, id: "3", seniorityLabel: "Experto" },
          { ...person, id: "4", seniorityLabel: "Senior" },
        ]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );

    // El ancho lo fija la utilidad del token, no el contenido: si una fila
    // pidiera otra, la columna dejaría de ser comparable. jsdom no maqueta,
    // así que lo que se verifica es que las cuatro pidan la misma medida.
    const cards = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => row.querySelector(".w-seniority-card"));

    expect(cards).toHaveLength(4);
    expect(cards.every((card) => card !== null)).toBe(true);
  });

  it("muestra las columnas de FTE y utilización con la barra por umbral", () => {
    const withUtilization = (
      id: string,
      name: string,
      availableFte: number,
      utilization: number
    ): Person => ({
      ...person,
      id,
      name,
      userPrincipalName: `${id}@tuya.com`,
      availableFte,
      utilization,
    });
    renderList(
      <PeopleList
        people={[
          withUtilization("u0", "Persona Cero", 1, 0),
          withUtilization("u60", "Persona Media", 0.8, 60),
          withUtilization("u100", "Persona Tope", 1, 100),
          withUtilization("u120", "Persona Sobre", 0.5, 120),
        ]}
        loading={false}
        error={null}
        onRetry={noop}
        onCreate={noop}
        onEdit={noop}
        onDelete={noop}
        {...pagination}
        {...filters}
      />
    );

    expect(screen.getByText("FTE")).toBeInTheDocument();
    expect(screen.getByText("Utilización")).toBeInTheDocument();

    const rowFor = (name: string) =>
      screen.getByText(name).closest("tr") as HTMLElement;

    // FTE como número plano.
    expect(rowFor("Persona Media").textContent).toContain("0.8");
    expect(rowFor("Persona Sobre").textContent).toContain("0.5");

    // Cantidad, no estado (Meter de tuip con tone): el relleno es siempre el
    // azul de acento sobre la pista gris, 0 deja la barra vacía, >100 satura
    // al ancho completo sin cambiar de color, y la cifra es la señal.
    const BLUE = segmentFillClass({ tone: "blue" });
    const fillOf = (name: string) =>
      rowFor(name).querySelector(
        '[role="progressbar"] > div'
      ) as HTMLElement | null;

    expect(fillOf("Persona Cero")?.style.width).toBe("0%");
    expect(rowFor("Persona Cero").textContent).toContain("0%");

    expect(fillOf("Persona Media")?.className).toContain(BLUE);
    expect(fillOf("Persona Media")?.style.width).toBe("60%");
    expect(rowFor("Persona Media").textContent).toContain("60%");

    expect(fillOf("Persona Tope")?.className).toContain(BLUE);
    expect(fillOf("Persona Tope")?.className).not.toContain("bg-warning-bold");
    expect(fillOf("Persona Tope")?.style.width).toBe("100%");

    expect(fillOf("Persona Sobre")?.className).toContain(BLUE);
    expect(fillOf("Persona Sobre")?.className).not.toContain("bg-danger-bold");
    // Saturada: el relleno no desborda el track.
    expect(fillOf("Persona Sobre")?.style.width).toBe("100%");
    expect(rowFor("Persona Sobre").textContent).toContain("120%");
  });
  it("muestra los stacks como Tags, el principal primero y el resto resumido en +N; sin columna Rol", () => {
    renderList(<PeopleList people={[person]} {...listProps} />);
    expect(
      screen.queryByRole("columnheader", { name: "Rol" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Stacks" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Arquitecto")).not.toBeInTheDocument();
    const row = screen.getByText("María González").closest("tr")!;
    const cell = within(row).getByText(".NET").closest("td")!;
    const tags = Array.from(cell.querySelectorAll("span")).map(
      (s) => s.textContent
    );
    expect(tags.slice(0, 3)).toEqual([".NET", "Azure", "SQL Server"]);
    expect(within(cell).queryByText("AS400")).not.toBeInTheDocument();
    expect(within(cell).getByText("+2")).toHaveAttribute(
      "title",
      "AS400, Kafka"
    );
  });

  it("sin stacks muestra un guion", () => {
    renderList(
      <PeopleList people={[{ ...person, stacks: [] }]} {...listProps} />
    );
    const row = screen.getByText("María González").closest("tr")!;
    expect(within(row).getByText("—")).toBeInTheDocument();
  });

  it("el filtro por stack llama con la selección", () => {
    const onStacksChange = vi.fn();
    renderList(
      <PeopleList
        people={[person]}
        {...listProps}
        onStacksChange={onStacksChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Stack/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Azure" }));
    expect(onStacksChange).toHaveBeenCalledWith(["Azure"]);
  });
});
