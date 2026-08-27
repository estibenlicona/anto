import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { OptionCard, OptionCardGroup } from "./option-card";

function renderGroup(onValueChange = vi.fn(), value?: string) {
  render(
    <OptionCardGroup label="¿Qué es?" value={value} onValueChange={onValueChange} columns={3}>
      <OptionCard value="initiative" title="Iniciativa" description="Trabajo de una iniciativa" shortcut="1">
        <select aria-label="Iniciativa activa">
          <option>Kafka Migration</option>
        </select>
      </OptionCard>
      <OptionCard value="bau" title="BAU" icon="bau" shortcut="2" />
      <OptionCard value="skip" title="Saltar" disabled />
      <OptionCard value="discard" title="Descartar" shortcut="3" />
    </OptionCardGroup>
  );
  return onValueChange;
}

describe("OptionCardGroup", () => {
  it("es un radiogroup cuyo click selecciona y notifica", () => {
    const onValueChange = renderGroup();
    expect(screen.getByRole("radiogroup", { name: "¿Qué es?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "BAU" }));
    expect(onValueChange).toHaveBeenCalledWith("bau");
  });

  it("la tarjeta elegida marca el radio lleno y el borde neutro, sin marca, y no cambia de tamaño", () => {
    renderGroup(vi.fn(), "initiative");
    const chosen = screen.getByRole("radio", { name: "Iniciativa" });
    expect(chosen).toHaveAttribute("aria-checked", "true");
    const card = chosen.parentElement!;
    expect(card.className).toContain("border-bold");
    expect(card.className).toContain("border-neutral-bold");
    expect(card.className).toContain("p-[15px]");
    expect(card.className).not.toMatch(/brand/);
    const other = screen.getByRole("radio", { name: "BAU" }).parentElement!;
    expect(other.className).toContain("p-4");
    expect(other.className).toContain("border-default");
    // El punto elegido no puede cargar `border-default` junto a
    // `border-[6px]`: en el stylesheet `border-default` va después y gana,
    // dejando el radio visualmente vacío aunque esté seleccionado.
    const dot = chosen.querySelector("span")!;
    expect(dot.className).toContain("border-[6px]");
    expect(dot.className).not.toContain("border-default");
    const otherDot = screen
      .getByRole("radio", { name: "BAU" })
      .querySelector("span")!;
    expect(otherDot.className).toContain("border-default");
    expect(otherDot.className).not.toContain("border-[6px]");
  });

  it("las flechas mueven foco y selección con wrap y saltan las deshabilitadas", () => {
    const onValueChange = renderGroup(vi.fn(), "bau");
    const bau = screen.getByRole("radio", { name: "BAU" });
    bau.focus();
    fireEvent.keyDown(bau, { key: "ArrowRight" });
    // "Saltar" está deshabilitada: pasa a Descartar.
    expect(onValueChange).toHaveBeenLastCalledWith("discard");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Descartar" }));
    fireEvent.keyDown(screen.getByRole("radio", { name: "Descartar" }), { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenLastCalledWith("initiative");
    fireEvent.keyDown(screen.getByRole("radio", { name: "Iniciativa" }), { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith("discard");
  });

  it("Espacio y Enter seleccionan; una deshabilitada no responde", () => {
    const onValueChange = renderGroup();
    fireEvent.keyDown(screen.getByRole("radio", { name: "Descartar" }), { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith("discard");
    fireEvent.keyDown(screen.getByRole("radio", { name: "BAU" }), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("bau");
    onValueChange.mockClear();
    const skip = screen.getByRole("radio", { name: "Saltar" });
    expect(skip).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(skip);
    fireEvent.keyDown(skip, { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("sólo una tarjeta lleva el tab stop; el contenido interno no cambia la selección", () => {
    const onValueChange = renderGroup(vi.fn(), "initiative");
    const radios = screen.getAllByRole("radio");
    expect(radios.filter((r) => r.getAttribute("tabindex") === "0")).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "Iniciativa" })).toHaveAttribute("tabindex", "0");
    const select = screen.getByLabelText("Iniciativa activa");
    expect(select).not.toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(select, { key: "ArrowDown" });
    fireEvent.click(select);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("dibuja el icono de la tarjeta sin darle nombre accesible propio", () => {
    renderGroup();
    // El icono acompaña al título, que ya nombra la opción: anunciarlo otra
    // vez haría que el lector de pantalla dijera lo mismo dos veces.
    const radio = screen.getByRole("radio", { name: "BAU" });
    const svg = radio.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // Y una tarjeta sin icono sigue sin dibujar ninguno.
    expect(
      screen.getByRole("radio", { name: "Descartar" }).querySelector("svg")
    ).toBeNull();
  });

  it("las flechas siguen moviendo la selección aunque el padre re-renderice", () => {
    // El grupo controlado desde fuera: cada selección re-renderiza al padre.
    // Con el orden guardado en un ref que el grupo vaciaba en cada render,
    // la segunda flecha se encontraba la lista vacía y no movía nada.
    function Padre() {
      const [value, setValue] = useState("initiative");
      return (
        <OptionCardGroup label="¿Qué es?" value={value} onValueChange={setValue} columns={3}>
          <OptionCard value="initiative" title="Iniciativa" />
          <OptionCard value="bau" title="BAU" />
          <OptionCard value="discard" title="Descartar" />
        </OptionCardGroup>
      );
    }
    render(<Padre />);
    fireEvent.keyDown(screen.getByRole("radio", { name: "Iniciativa" }), { key: "ArrowRight" });
    expect(screen.getByRole("radio", { name: "BAU" })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(screen.getByRole("radio", { name: "BAU" }), { key: "ArrowRight" });
    expect(screen.getByRole("radio", { name: "Descartar" })).toHaveAttribute("aria-checked", "true");
  });

  it("muestra el atajo con Kbd", () => {
    renderGroup();
    const kbd = screen.getByText("1");
    expect(kbd.tagName).toBe("KBD");
  });
});
