import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("abre la superficie desde su disparador", () => {
    render(
      <Popover>
        <PopoverTrigger>
          <button type="button">Filtros</button>
        </PopoverTrigger>
        <PopoverContent aria-label="Filtros">
          <p>Contenido</p>
        </PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("se ancla a un elemento propio sin disparador, controlado desde afuera", () => {
    // Una cuadrícula con muchas celdas: un solo Popover que mueve su ancla a la
    // celda activada, en vez de un Popover por celda.
    function Grid() {
      const [active, setActive] = useState<string | null>(null);

      return (
        <Popover open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
          {["A", "B"].map((cell) =>
            active === cell ? (
              <PopoverAnchor key={cell}>
                <button type="button" onClick={() => setActive(cell)}>
                  Celda {cell}
                </button>
              </PopoverAnchor>
            ) : (
              <button key={cell} type="button" onClick={() => setActive(cell)}>
                Celda {cell}
              </button>
            ),
          )}
          <PopoverContent aria-label="Detalle">
            <p>Detalle de {active}</p>
          </PopoverContent>
        </Popover>
      );
    }

    render(<Grid />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Celda B" }));

    const surface = screen.getByRole("dialog", { name: "Detalle" });
    expect(surface).toBeInTheDocument();
    expect(screen.getByText("Detalle de B")).toBeInTheDocument();
    // El ancla es el propio botón, no un envoltorio: `asChild` no agrega nodo.
    expect(screen.getByRole("button", { name: "Celda B" }).tagName).toBe("BUTTON");
  });

  it("trae relleno por defecto y lo saca cuando el contenido va a sangre", () => {
    render(
      <Popover defaultOpen>
        <PopoverContent aria-label="Con relleno">
          <p>Contenido</p>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole("dialog", { name: "Con relleno" }).className).toContain("p-4");

    render(
      <Popover defaultOpen>
        <PopoverContent aria-label="A sangre" padded={false}>
          <p>Contenido</p>
        </PopoverContent>
      </Popover>,
    );
    const flush = screen.getByRole("dialog", { name: "A sangre" });
    expect(flush.className).not.toContain("p-4");
    // Sin relleno sigue siendo la misma superficie: borde, radio y elevación.
    expect(flush.className).toContain("border-neutral-default");
    expect(flush.className).toContain("rounded-control");
    expect(flush.className).toContain("shadow-md");
  });

  describe("foco en modo controlado sin disparador", () => {
    function Grid() {
      const [open, setOpen] = useState(false);
      const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

      return (
        <>
          <button type="button">Antes</button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor virtualRef={{ current: anchor }} />
            <button
              type="button"
              onClick={(event) => {
                setAnchor(event.currentTarget);
                setOpen(true);
              }}
            >
              Celda
            </button>
            <PopoverContent aria-label="Detalle">
              <button type="button">Adentro</button>
            </PopoverContent>
          </Popover>
          <button type="button">Después</button>
        </>
      );
    }

    it("devuelve el foco al elemento anclado al cerrar con Escape", async () => {
      render(<Grid />);
      const cell = screen.getByRole("button", { name: "Celda" });
      cell.focus();
      fireEvent.click(cell);

      await screen.findByRole("dialog", { name: "Detalle" });
      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
      // Sin esto el foco termina en el body: Radix apunta a su disparador, y
      // en modo controlado no hay ninguno.
      expect(cell).toHaveFocus();
    });

    it("no arrastra el foco de vuelta cuando el cierre vino de afuera", async () => {
      render(<Grid />);
      const cell = screen.getByRole("button", { name: "Celda" });
      cell.focus();
      fireEvent.click(cell);
      await screen.findByRole("dialog", { name: "Detalle" });

      const afuera = screen.getByRole("button", { name: "Después" });
      // Radix cierra recién con el click que sigue al pointerdown, para no
      // cerrarse a mitad de un arrastre.
      fireEvent.pointerDown(afuera);
      fireEvent.click(afuera);

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
      expect(cell).not.toHaveFocus();
    });

    it("deja que el consumidor decida si declara onCloseAutoFocus", async () => {
      const outside = document.createElement("button");
      outside.textContent = "Elegido";
      document.body.appendChild(outside);

      function WithOwnHandler() {
        const [open, setOpen] = useState(false);
        const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor virtualRef={{ current: anchor }} />
            <button
              type="button"
              onClick={(event) => {
                setAnchor(event.currentTarget);
                setOpen(true);
              }}
            >
              Celda propia
            </button>
            <PopoverContent
              aria-label="Propio"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                outside.focus();
              }}
            >
              <button type="button">Adentro</button>
            </PopoverContent>
          </Popover>
        );
      }

      render(<WithOwnHandler />);
      const cell = screen.getByRole("button", { name: "Celda propia" });
      cell.focus();
      fireEvent.click(cell);
      await screen.findByRole("dialog", { name: "Propio" });

      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
      expect(outside).toHaveFocus();
      outside.remove();
    });
  });
});
