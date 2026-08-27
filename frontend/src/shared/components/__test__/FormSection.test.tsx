import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormSection } from "../FormSection";

describe("FormSection", () => {
  it("no deja que el título arrastre margen propio, que es lo que lo saca de eje", () => {
    render(
      <FormSection icon="user" title="Persona" first>
        <p>contenido</p>
      </FormSection>
    );
    const titulo = screen.getByRole("heading", { level: 3, name: "Persona" });
    // El margen del h3 del navegador entra en la caja del flex y sube el
    // texto medio margen respecto de la pastilla del icono. Se comprueba la
    // clase y no la geometría: jsdom no aplica la hoja de Tailwind, así que
    // medir aquí daría cero siempre y el test no protegería nada.
    expect(titulo.className.split(" ")).toContain("m-0");
  });

  it("pone el icono y el título en la misma fila centrada", () => {
    render(
      <FormSection icon="calendar" title="Ausencia" first>
        <p>contenido</p>
      </FormSection>
    );
    const titulo = screen.getByRole("heading", { level: 3, name: "Ausencia" });
    const fila = titulo.parentElement!;
    expect(fila.className).toContain("items-center");
    // La pastilla es hermana del título dentro de esa misma fila.
    expect(fila.querySelector("svg")).not.toBeNull();
  });
});
