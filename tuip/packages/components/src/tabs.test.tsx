import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("la descripción forma parte del nombre de la pestaña y va en regular", () => {
    render(
      <Tabs defaultValue="historias">
        <TabsList>
          <TabsTrigger value="historias" description="6 historias · 30 SP">
            Historias
          </TabsTrigger>
        </TabsList>
        <TabsContent value="historias">Contenido</TabsContent>
      </Tabs>,
    );

    // Como el contador: quien navega con lector de pantalla oye qué guarda la
    // pestaña sin tener que abrirla.
    const tab = screen.getByRole("tab", {
      name: (name) => name.includes("Historias") && name.includes("6 historias · 30 SP"),
    });
    const description = screen.getByText("6 historias · 30 SP");
    expect(description.className).toContain("text-label");
    expect(description.className).toContain("font-normal");
    // Con descripción el disparador apila y toma su relleno; sin ella, no.
    expect(tab.className).toContain("flex-col");
    expect(tab.className).toContain("px-3");
  });

  it("sin descripción el disparador es la fila de siempre", () => {
    render(
      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen">Contenido</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab", { name: "Resumen" });
    expect(tab.className).not.toContain("flex-col");
    expect(tab.className).toContain("pb-3.5");
  });

  it("la lista en variante surface encabeza una card; la de línea no cambia", () => {
    const { unmount } = render(
      <Tabs defaultValue="a">
        <TabsList variant="surface">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Contenido</TabsContent>
      </Tabs>,
    );
    const surface = screen.getByRole("tablist");
    expect(surface.className).toContain("bg-neutral-subtlest");
    expect(surface.className).toContain("px-4");
    expect(surface.className).toContain("gap-1");
    unmount();

    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Contenido</TabsContent>
      </Tabs>,
    );
    const line = screen.getByRole("tablist");
    expect(line.className).toContain("gap-7");
    expect(line.className).not.toContain("bg-neutral-subtlest");
  });
});
