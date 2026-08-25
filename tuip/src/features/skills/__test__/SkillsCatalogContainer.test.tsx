import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { ToastProvider } from "@tuya-ui/components";
import { server } from "../../../mocks/server";
import { resetSkillsMock } from "../../../mocks/handlers/skills.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { skillsService } from "../services/skillsService";
import { SkillsCatalogContainer } from "../SkillsCatalogContainer";

function renderCatalog() {
  return render(
    <ToastProvider>
      <SkillsCatalogContainer />
    </ToastProvider>
  );
}

/** El bloque de un nivel dentro del detalle, para no buscar en toda la pantalla. */
function levelSection(name: RegExp): HTMLElement {
  return screen
    .getByRole("heading", { name })
    .closest("section") as HTMLElement;
}

describe("SkillsCatalogContainer", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
  });

  it("agrupa el catálogo y abre la primera habilidad", async () => {
    renderCatalog();

    expect(await screen.findByText("Técnicas · 5")).toBeInTheDocument();
    expect(screen.getByText("Humanas · 4")).toBeInTheDocument();
    expect(screen.getByText("9 habilidades")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Conocimiento del negocio" })
    ).toBeInTheDocument();
  });

  it("muestra la cantidad propia de cada nivel, sin asumir cinco", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    expect(
      within(levelSection(/1 · Principiante/)).getByText("5 criterios")
    ).toBeInTheDocument();
    expect(
      within(levelSection(/3 · Avanzado/)).getByText("6 criterios")
    ).toBeInTheDocument();
    expect(
      within(levelSection(/4 · Experto/)).getByText("4 criterios")
    ).toBeInTheDocument();
  });

  it("señala la habilidad incompleta nombrando el nivel que le falta", async () => {
    renderCatalog();
    await screen.findByText("Técnicas · 5");

    fireEvent.click(screen.getByRole("button", { name: /Arquitectura/ }));

    // Una vez en el índice y otra en el detalle, que es donde se corrige.
    await waitFor(() =>
      expect(
        screen.getAllByText(/Avanzado sin criterios/).length
      ).toBeGreaterThan(0)
    );
    expect(
      within(levelSection(/3 · Avanzado/)).getByText("Sin criterios")
    ).toBeInTheDocument();
  });

  it("agrega un criterio y el contador del nivel acompaña", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    const experto = levelSection(/4 · Experto/);
    fireEvent.click(
      within(experto).getByRole("button", { name: "Agregar criterio" })
    );
    fireEvent.change(screen.getByLabelText("Nuevo criterio de Experto"), {
      target: { value: "Representa al capítulo ante el comité técnico." },
    });
    fireEvent.click(within(experto).getByRole("button", { name: "Agregar" }));

    await waitFor(() =>
      expect(
        within(levelSection(/4 · Experto/)).getByText("5 criterios")
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText("Representa al capítulo ante el comité técnico.")
    ).toBeInTheDocument();
  });

  it("no deja agregar un criterio vacío", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    const experto = levelSection(/4 · Experto/);
    fireEvent.click(
      within(experto).getByRole("button", { name: "Agregar criterio" })
    );
    fireEvent.change(screen.getByLabelText("Nuevo criterio de Experto"), {
      target: { value: "   " },
    });

    expect(
      within(experto).getByRole("button", { name: "Agregar" })
    ).toBeDisabled();
  });

  it("quita un criterio y los demás conservan su orden", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    const primerCriterio =
      "Es referente del dominio: otras células lo consultan.";
    const segundoCriterio =
      "Sus decisiones cambian la hoja de ruta del producto.";
    expect(screen.getByText(primerCriterio)).toBeInTheDocument();

    fireEvent.click(
      within(levelSection(/4 · Experto/)).getByRole("button", {
        name: "Quitar criterio 1 de Experto",
      })
    );

    await waitFor(() =>
      expect(screen.queryByText(primerCriterio)).not.toBeInTheDocument()
    );
    const experto = levelSection(/4 · Experto/);
    expect(within(experto).getByText("3 criterios")).toBeInTheDocument();
    expect(within(experto).getAllByRole("listitem")[0]).toHaveTextContent(
      segundoCriterio
    );
  });

  it("muestra el rol sin definir y deja declararlo y retirarlo", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    // El Select de tuip no se abre en jsdom (Radix monta el listado en un
    // portal al interactuar); acá se comprueba lo que la fila muestra, y la
    // ida y vuelta real se ejercita contra el servicio.
    const fila = screen
      .getByRole("cell", { name: "Data Analyst" })
      .closest("tr") as HTMLElement;
    expect(
      within(fila).getByLabelText("Nivel esperado de Data Analyst")
    ).toBeInTheDocument();
    expect(within(fila).getByText("Sin definir")).toBeInTheDocument();

    // Un rol con nivel declarado se distingue del que no lo tiene.
    const arquitecto = screen
      .getByRole("cell", { name: "Arquitecto" })
      .closest("tr") as HTMLElement;
    expect(within(arquitecto).getByText(/Experto/)).toBeInTheDocument();

    const negocio = (await skillsService.get()).skills[0];
    expect(
      negocio.expectations.find((e) => e.position === "Data Analyst")?.level
    ).toBeNull();

    await skillsService.setExpectation(negocio.id, "Data Analyst", 2);
    const despues = (await skillsService.get()).skills[0];
    expect(
      despues.expectations.find((e) => e.position === "Data Analyst")?.level
    ).toBe(2);
  });

  it("rechaza el nombre repetido al crear, sin cerrar el drawer", async () => {
    renderCatalog();
    await screen.findByText("Técnicas · 5");

    fireEvent.click(screen.getByRole("button", { name: /Nueva habilidad/ }));
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Comunicación" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear habilidad" }));

    expect(
      await screen.findByText(/Ya existe una habilidad llamada "Comunicación"/)
    ).toBeInTheDocument();
    expect(screen.getByText("9 habilidades")).toBeInTheDocument();
  });

  it("crea una habilidad que nace incompleta", async () => {
    renderCatalog();
    await screen.findByText("Técnicas · 5");

    fireEvent.click(screen.getByRole("button", { name: /Nueva habilidad/ }));
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Observabilidad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear habilidad" }));

    expect(await screen.findByText("10 habilidades")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Observabilidad/ }));
    await waitFor(() =>
      expect(
        screen.getAllByText(/4 niveles sin criterios/).length
      ).toBeGreaterThan(0)
    );
  });

  it("al intentar borrar una habilidad en uso ofrece desactivarla", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const aviso = await screen.findByText(/ya se usó en evaluaciones cerradas/);
    // La salida va dentro del aviso, no sólo en el encabezado: el 400 dice qué
    // hacer y la acción tiene que estar donde se lee.
    const alerta = aviso.closest('[role="alert"]') as HTMLElement;
    fireEvent.click(within(alerta).getByRole("button", { name: "Desactivar" }));
    await waitFor(() =>
      expect(screen.getAllByText("Inactiva").length).toBeGreaterThan(0)
    );
    expect(screen.getByText("9 habilidades")).toBeInTheDocument();
  });

  it("con el catálogo vacío invita a crear la primera", async () => {
    server.use(
      http.get("/skills-catalog", () =>
        HttpResponse.json({ version: 1, positions: [], skills: [] })
      )
    );
    renderCatalog();

    expect(
      await screen.findByText("Todavía no hay habilidades")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear la primera" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Técnicas/)).not.toBeInTheDocument();
  });

  it("avisa que editar no recalcula las evaluaciones cerradas", async () => {
    renderCatalog();
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    expect(
      screen.getByText(/no recalcula las evaluaciones ya cerradas/)
    ).toBeInTheDocument();
  });
  it("se presenta con encabezado, igual que Líneas de expertise", async () => {
    renderCatalog();

    expect(
      await screen.findByRole("heading", {
        name: "Habilidades y niveles",
        level: 1,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El catálogo con el que se evalúa/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Nueva habilidad/ })
    ).toBeInTheDocument();
  });

  it("no le da a eliminar el mismo tratamiento que a editar", async () => {
    renderCatalog();
    await screen.findByText("Técnicas · 5");

    const editar = await screen.findByRole("button", { name: "Editar" });
    const eliminar = screen.getByRole("button", { name: "Eliminar" });
    const desactivar = screen.getByRole("button", { name: "Desactivar" });

    // Se comparan los tratamientos entre sí y no contra un nombre de variante:
    // lo que el requisito exige es que se distingan, y atarlo a "subtle" o
    // "danger" se rompe cuando el sistema de diseño renombre.
    expect(eliminar.className).not.toBe(editar.className);
    expect(desactivar.className).not.toBe(editar.className);
    // Y desactivar tampoco se ve como eliminar: una se deshace y la otra no.
    expect(desactivar.className).not.toBe(eliminar.className);
  });
});
