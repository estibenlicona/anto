import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { EditStacksDrawer } from "../EditStacksDrawer";
import { assigned } from "./fixtures";

const CATALOG = [".NET", "AS400", "Azure", "Kafka", "React Native"];

function renderDrawer(
  overrides: Partial<React.ComponentProps<typeof EditStacksDrawer>> = {}
) {
  const onSubmit = vi.fn();
  render(
    <EditStacksDrawer
      open
      onOpenChange={() => {}}
      personName="María González"
      current={assigned.stacks}
      catalog={CATALOG}
      saving={false}
      serverError={null}
      onSubmit={onSubmit}
      {...overrides}
    />
  );
  return { onSubmit };
}

// El Combobox múltiple también expone un "Quitar X" por chip: las consultas
// van a la fila de la lista, que es la que tiene el nivel y el botón propio.
function rowFor(name: string): HTMLElement {
  const rows = screen
    .getAllByRole("listitem")
    .filter((li) =>
      within(li).queryByRole("button", { name: `Quitar ${name}` })
    );
  expect(rows).toHaveLength(1);
  return rows[0];
}
const removeFrom = (name: string) =>
  fireEvent.click(
    within(rowFor(name)).getByRole("button", { name: `Quitar ${name}` })
  );

describe("EditStacksDrawer", () => {
  it("arranca con los stacks actuales, su nivel y el principal marcado", () => {
    renderDrawer();
    expect(screen.getByText("Stacks de María González")).toBeInTheDocument();
    expect(within(rowFor(".NET")).getByText("Principal")).toBeInTheDocument();
    expect(
      within(rowFor(".NET")).getByRole("radio", { name: "Avanz." })
    ).toBeChecked();
    expect(
      within(rowFor("AS400")).getByRole("radio", { name: "Comp." })
    ).toBeChecked();
  });

  it("cambiar el nivel y guardar envía la lista con el principal primero", () => {
    const { onSubmit } = renderDrawer();
    fireEvent.click(
      within(rowFor("AS400")).getByRole("radio", { name: "Exp." })
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSubmit).toHaveBeenCalledWith([
      { name: ".NET", level: 3, isPrimary: true },
      { name: "AS400", level: 4, isPrimary: false },
    ]);
  });

  it("quitar un stack que nadie más cubre avisa, y quitar el principal lo hereda el siguiente", () => {
    const { onSubmit } = renderDrawer();
    removeFrom("AS400");
    expect(
      screen.getByText("El chapter quedaría sin cobertura")
    ).toBeInTheDocument();
    expect(screen.getByText(/Nadie más cubre AS400/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSubmit).toHaveBeenLastCalledWith([
      { name: ".NET", level: 3, isPrimary: true },
    ]);
  });

  it("quitar el principal se lo pasa al que queda; sin stacks se puede guardar vacío", () => {
    const { onSubmit } = renderDrawer();
    removeFrom(".NET");
    expect(within(rowFor("AS400")).getByText("Principal")).toBeInTheDocument();
    removeFrom("AS400");
    expect(screen.getByText(/Todavía no tiene stacks/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSubmit).toHaveBeenLastCalledWith([]);
  });

  it("agrega desde el catálogo con nivel competente por defecto", async () => {
    const { onSubmit } = renderDrawer();
    // cmdk desplaza la opción activa; jsdom no implementa scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn();
    const trigger = screen.getByLabelText("Del catálogo del chapter");
    fireEvent.click(trigger);
    await screen.findByRole("listbox");
    const option = (await screen.findAllByRole("option")).find((o) =>
      o.textContent?.includes("React Native")
    );
    expect(option).toBeDefined();
    fireEvent.click(option!);
    expect(
      within(rowFor("React Native")).getByRole("radio", { name: "Comp." })
    ).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSubmit).toHaveBeenLastCalledWith([
      { name: ".NET", level: 3, isPrimary: true },
      { name: "AS400", level: 2, isPrimary: false },
      { name: "React Native", level: 2, isPrimary: false },
    ]);
  });

  it("muestra el error del servidor", () => {
    renderDrawer({ serverError: "No se pudo guardar" });
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
  });
});
