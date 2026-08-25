import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Table, TableBody, TableCell, TableDensity, TableHead, TableHeader, TableRow } from "./table";

function renderTable(props: { density?: TableDensity; stickyFirstColumn?: boolean } = {}) {
  render(
    <Table {...props} aria-label="Matriz">
      <TableHeader>
        <TableRow>
          <TableHead>Persona</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Paula</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
  return {
    header: screen.getByRole("columnheader", { name: "Persona" }),
    cell: screen.getByRole("cell", { name: "Paula" }),
    scroller: screen.getByRole("table").parentElement as HTMLElement,
  };
}

/**
 * jsdom no hace layout, así que `scrollLeft` siempre lee 0 y asignarlo no
 * hace nada. Se reemplaza la propiedad y se dispara el evento a mano, que es
 * exactamente lo que el navegador haría al desplazar.
 */
function scrollTo(scroller: HTMLElement, scrollLeft: number) {
  Object.defineProperty(scroller, "scrollLeft", { value: scrollLeft, configurable: true });
  fireEvent.scroll(scroller);
}

/** El número de `py-N` de una clase de padding, para poder compararlos. */
function verticalPadding(el: HTMLElement) {
  const match = el.className.match(/py-([\d.]+)/);
  expect(match, `sin padding vertical en "${el.className}"`).not.toBeNull();
  return Number(match![1]);
}

function horizontalPadding(el: HTMLElement) {
  const match = el.className.match(/px-([\d.]+)/);
  expect(match, `sin padding horizontal en "${el.className}"`).not.toBeNull();
  return Number(match![1]);
}

describe("Densidad de Table", () => {
  it("matrix queda por debajo de compact en los dos ejes", () => {
    const compact = renderTable({ density: "compact" });
    const compactPadding = {
      x: horizontalPadding(compact.cell),
      y: verticalPadding(compact.cell),
    };
    screen.getByRole("table").remove();

    const matrix = renderTable({ density: "matrix" });
    expect(horizontalPadding(matrix.cell)).toBeLessThan(compactPadding.x);
    expect(verticalPadding(matrix.cell)).toBeLessThan(compactPadding.y);
  });

  it("la cabecera sigue siendo más baja que el cuerpo en densidad de matriz", () => {
    const { header, cell } = renderTable({ density: "matrix" });
    expect(verticalPadding(header)).toBeLessThan(verticalPadding(cell));
  });

  it("la densidad por defecto no cambia", () => {
    const { cell } = renderTable();
    expect(cell.className).toContain("px-4 py-3");
  });
});

describe("Columna fija de Table", () => {
  it("fija la primera celda de cada fila y le da el fondo opaco de su sección", () => {
    const { scroller } = renderTable({ stickyFirstColumn: true });
    expect(scroller.className).toContain("[&_tr:not([data-detail])>*:first-child]:sticky");
    expect(scroller.className).toContain("[&_tr:not([data-detail])>*:first-child]:left-0");
    expect(scroller.className).toContain("[&_thead_tr>*:first-child]:bg-neutral-subtlest");
    expect(scroller.className).toContain("[&_tbody_tr:not([data-detail])>*:first-child]:bg-neutral-default");
  });

  it("no separa mientras no haya nada oculto a la izquierda, y separa al desplazar", () => {
    const { scroller } = renderTable({ stickyFirstColumn: true });
    expect(scroller).toHaveAttribute("data-scrolled", "false");

    scrollTo(scroller, 240);
    expect(scroller).toHaveAttribute("data-scrolled", "true");

    scrollTo(scroller, 0);
    expect(scroller).toHaveAttribute("data-scrolled", "false");
  });

  it("una tabla sin la opción no cambia en nada", () => {
    const { scroller } = renderTable();
    expect(scroller).not.toHaveAttribute("data-scrolled");
    expect(scroller.className).not.toContain("sticky");
    expect(scroller.className).toContain("overflow-x-auto");

    scrollTo(scroller, 240);
    expect(scroller).not.toHaveAttribute("data-scrolled");
  });
});

function renderExpandable(open: string[] = [], onToggle = vi.fn()) {
  const people = ["Paula", "Andrés"];
  render(
    <Table stickyFirstColumn aria-label="Matriz">
      <TableHeader>
        <TableRow>
          <TableHead>Persona</TableHead>
          <TableHead align="right">Brechas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow
            key={person}
            detailLabel={`Ver detalle de ${person}`}
            expanded={open.includes(person)}
            onExpandedChange={(next) => onToggle(person, next)}
            detail={<p>Criterios de {person}</p>}
          >
            <TableCell>{person}</TableCell>
            <TableCell align="right">2</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  return onToggle;
}

describe("Fila con detalle de Table", () => {
  it("el control anuncia su estado y a qué fila pertenece, y no decide por su cuenta", () => {
    const onToggle = renderExpandable();
    const control = screen.getByRole("button", { name: "Ver detalle de Paula" });
    expect(control).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(control);
    expect(onToggle).toHaveBeenCalledWith("Paula", true);
    // No se abrió sola: sigue cerrada hasta que el consumidor lo diga.
    expect(control).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Criterios de Paula")).not.toBeInTheDocument();
  });

  it("abre el detalle como una fila de ancho completo asociada a su control", () => {
    renderExpandable(["Paula"]);
    const control = screen.getByRole("button", { name: "Ver detalle de Paula" });
    expect(control).toHaveAttribute("aria-expanded", "true");

    const detail = document.getElementById(control.getAttribute("aria-controls")!)!;
    expect(detail.tagName).toBe("TR");
    expect(detail).not.toHaveAttribute("hidden");
    expect(detail.querySelector("td")).toHaveAttribute("colspan", "2");
    expect(detail).toHaveTextContent("Criterios de Paula");
  });

  it("se opera con el teclado igual que cualquier otro control", () => {
    const onToggle = renderExpandable(["Paula"]);
    const control = screen.getByRole("button", { name: "Ver detalle de Paula" });
    control.focus();
    expect(control).toHaveFocus();
    fireEvent.keyDown(control, { key: "Enter" });
    fireEvent.click(control);
    expect(onToggle).toHaveBeenCalledWith("Paula", false);
  });

  it("deja abiertas dos filas a la vez", () => {
    renderExpandable(["Paula", "Andrés"]);
    expect(screen.getByText("Criterios de Paula")).toBeInTheDocument();
    expect(screen.getByText("Criterios de Andrés")).toBeInTheDocument();
  });

  it("no agrega una columna para el control ni rompe la estructura de la tabla", () => {
    renderExpandable(["Paula"]);
    const header = screen.getByRole("row", { name: /Persona/ });
    expect(header.querySelectorAll("th")).toHaveLength(2);

    const paula = screen.getByRole("button", { name: "Ver detalle de Paula" }).closest("tr")!;
    expect(paula.querySelectorAll("td")).toHaveLength(2);

    // La fila de detalle queda fuera de la columna fija: su celda ocupa todo
    // el ancho y anclarla a la izquierda no significaría nada.
    const detail = paula.nextElementSibling!;
    expect(detail).toHaveAttribute("data-detail");
  });

  it("una tabla sin filas desplegables no reserva la columna del control", () => {
    renderTable();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Paula" }).querySelectorAll("td")).toHaveLength(1);
  });
});
