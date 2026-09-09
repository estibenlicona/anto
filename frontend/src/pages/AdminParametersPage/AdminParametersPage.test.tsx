import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import {
  MODEL_VERSION_ROUTE,
  PARAMETERS_ROUTE,
  modelVersionPath,
  parametersPath,
} from "@features/admin-shell/adapters/ParametersRoutes";
import { modulePath } from "@shared/services/modulePath";
import { resetModelVersionsMock } from "../../mocks/handlers/model-versions.handlers";
import { AdminParametersPage } from "./AdminParametersPage";
import { AdminModelVersionPage } from "../AdminModelVersionPage/AdminModelVersionPage";

/**
 * Las dos pantallas se montan juntas sobre el mismo router porque lo que hay que
 * comprobar es justamente la navegación entre ellas: que un impedimento lleve a
 * la sección donde se arregla, y que abrir una versión abra el editor.
 *
 * Las rutas se montan desde la **misma definición** que usa la tabla de rutas
 * del módulo. Escritas a mano, este test montaba la ruta equivocada junto con
 * la pantalla y pasaba en verde mientras el enlace real caía en Not found.
 */
function renderApp(initialPath = parametersPath()) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path={modulePath(PARAMETERS_ROUTE)} element={<AdminParametersPage />} />
          <Route
            path={modulePath(MODEL_VERSION_ROUTE)}
            element={<AdminModelVersionPage />}
          />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

afterEach(() => {
  resetModelVersionsMock();
});

it("el enlace a una versión cae dentro de la ruta que declara el módulo", () => {
  // El fallo real: la pantalla armaba `admin/parametros/…` y la tabla de rutas
  // declaraba `parametros/…`. Los dos salen de la misma definición, así que la
  // única forma de que discrepen es cambiar una y no la otra.
  expect(modelVersionPath("MOD-F1", 3, "mix")).toBe(
    modulePath(MODEL_VERSION_ROUTE)
      .replace(":modeloId", "MOD-F1")
      .replace(":version", "3")
      .replace(":seccion", "mix")
  );
});

describe("Parámetros del modelo", () => {
  it("muestra los modelos con sus versiones y sus tres estados", async () => {
    renderApp();

    expect(
      await screen.findByText("Estimación paramétrica de iniciativas")
    ).toBeInTheDocument();
    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByText("Vigente")).toBeInTheDocument();
    expect(screen.getByText("Archivada")).toBeInTheDocument();
  });

  it("no repite el título de la pantalla fuera del encabezado accesible", async () => {
    renderApp();
    await screen.findByText("Estimación paramétrica de iniciativas");

    const heading = screen.getByRole("heading", { name: "Parámetros del modelo" });
    expect(heading).toHaveClass("sr-only");
  });

  it("dice cuántas estimaciones calculó cada versión", async () => {
    renderApp();

    expect(await screen.findByText("123")).toBeInTheDocument();
  });

  it("una versión publicada ofrece crear una nueva en vez de un botón muerto", async () => {
    renderApp();
    await screen.findByText("Vigente");

    expect(
      screen.getByRole("button", { name: "Crear versión nueva" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seguir editando" })).toBeEnabled();
  });

  it("seguir editando abre el editor de esa versión", async () => {
    renderApp();
    fireEvent.click(await screen.findByRole("button", { name: "Seguir editando" }));

    expect(await screen.findByRole("heading", { name: /Versión 3/ })).toBeInTheDocument();
  });
});

describe("Editor de una versión", () => {
  it("abre en dimensiones y muestra el contexto de lo que se edita", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "dimensiones"));

    expect(await screen.findByRole("heading", { name: /Versión 3/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dimensiones" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(await screen.findByDisplayValue("Negocio y cliente")).toBeInTheDocument();
  });

  it("cambiar de sección muestra la nueva y oculta la anterior", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "dimensiones"));
    await screen.findByDisplayValue("Negocio y cliente");

    fireEvent.click(screen.getByRole("button", { name: "Tallas" }));

    expect(await screen.findByText("PM esperado")).toBeInTheDocument();
    expect(screen.queryByLabelText("Texto de N1")).not.toBeInTheDocument();
  });

  it("las cinco secciones están en la barra, en orden", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "dimensiones"));
    const nav = await screen.findByRole("navigation", { name: "Secciones del modelo" });

    expect(
      within(nav)
        .getAllByRole("button")
        .map((button) => button.textContent)
    ).toEqual(["Dimensiones", "Drivers", "Tallas", "Mix", "Publicar"]);
  });

  /**
   * Que el rótulo esté en la barra no dice que la sección exista: cada una
   * tiene que traer su propio contenido, y una vacía se vería igual de bien
   * en la barra.
   */
  it.each([
    ["dimensiones", () => screen.findByDisplayValue("Negocio y cliente")],
    ["drivers", () => screen.findByLabelText("N1 en Tamaño")],
    ["tallas", () => screen.findByText("PM esperado")],
    ["mix", () => screen.findByLabelText("Backend Dev en XS")],
    ["publicar", () => screen.findByLabelText("Validación de la versión")],
  ] as const)("la sección %s trae su propio contenido", async (seccion, find) => {
    renderApp(modelVersionPath("MOD-F1", 3, seccion));

    expect(await find()).toBeInTheDocument();
  });
  it("una versión publicada se muestra sin controles de edición", async () => {
    renderApp(modelVersionPath("MOD-F1", 2, "dimensiones"));
    await screen.findByRole("heading", { name: /Versión 2/ });

    await waitFor(() =>
      expect(screen.queryByLabelText("Texto de N1")).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole("button", { name: "Crear una versión nueva a partir de ésta" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Guardar" })).not.toBeInTheDocument();
  });

  it("la matriz de pesos distingue «no aporta» de un cero", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "drivers"));

    // N1 no aporta a riesgo: su celda no es un cero.
    const cell = await screen.findByLabelText("N1 en Riesgo");
    expect(cell).toHaveValue(null);
    expect(screen.getByLabelText("N1 en Tamaño")).toHaveValue(2);
  });

  it("el mix marca la columna que no cierra en 100", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "mix"));
    const cell = await screen.findByLabelText("Backend Dev en XS");

    fireEvent.change(cell, { target: { value: "50" } });

    expect(await screen.findByText("50%")).toBeInTheDocument();
  });

  it("un impedimento lleva a la sección donde se arregla", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "mix"));

    // Se rompe el mix a propósito y se guarda.
    fireEvent.change(await screen.findByLabelText("Backend Dev en XS"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Publicar/ })).toHaveTextContent("1")
    );

    fireEvent.click(screen.getByRole("button", { name: /Publicar/ }));

    const goTo = await screen.findByRole("button", { name: "Ir a arreglarlo" });
    fireEvent.click(goTo);

    expect(await screen.findByLabelText("Backend Dev en XS")).toBeInTheDocument();
  });

  it("publicar dice cuántos impedimentos faltan en vez de quedar gris sin explicación", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "mix"));
    fireEvent.change(await screen.findByLabelText("Backend Dev en XS"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Publicar/ })).toHaveTextContent("1")
    );

    fireEvent.click(screen.getByRole("button", { name: /Publicar/ }));

    const button = await screen.findByRole("button", { name: /Falta.? 1 impedimento/ });
    expect(button).toBeDisabled();
  });

  it("el historial muestra fecha, autor y qué cambió, y dice que el autor es declarativo", async () => {
    renderApp(modelVersionPath("MOD-F1", 3, "publicar"));

    expect(await screen.findByText(/firma declarativa/)).toBeInTheDocument();
    expect(screen.getByText("Se creó la versión 3.")).toBeInTheDocument();
    expect(screen.getByText("Estiben Licona")).toBeInTheDocument();
  });
});
