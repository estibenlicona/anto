import { describe, it, expect, beforeEach } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { AdminParametersPage } from "./AdminParametersPage";
import { resetCapabilityMixMock } from "../../mocks/handlers/capability-mix.handlers";
import { resetQuestionPoolMock } from "../../mocks/handlers/question-pool.handlers";
import { resetTallaBandsMock } from "../../mocks/handlers/talla-bands.handlers";
import { server } from "../../mocks/server";

/**
 * Radix activates a tab from `mousedown`, not from `click`, so `fireEvent.click`
 * alone leaves the current panel open — `click` does not imply the earlier
 * events in the sequence. Dispatching the one the trigger actually listens to
 * keeps the test honest without pulling in `user-event`.
 */
function selectTab(name: string) {
  fireEvent.mouseDown(screen.getByRole("tab", { name }));
}

/** Las bandas llegan por HTTP, así que la primera pestaña arranca cargando. */
async function renderLoaded() {
  render(<AdminParametersPage />);
  await waitFor(() =>
    expect(screen.getByText("Cambio menor")).toBeInTheDocument()
  );
}

describe("AdminParametersPage", () => {
  beforeEach(() => {
    resetTallaBandsMock();
    resetCapabilityMixMock();
    resetQuestionPoolMock();
  });

  it("renders the page header", async () => {
    await renderLoaded();
    expect(
      screen.getByRole("heading", {
        name: "Parámetros del modelo de estimación",
      })
    ).toBeInTheDocument();
  });

  it("offers the bandas de talla, mix, pool de preguntas and versionado sections as tabs", async () => {
    await renderLoaded();
    expect(screen.getByRole("tab", { name: "Bandas" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Capacidades" })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Preguntas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Versionado" })).toBeInTheDocument();
  });

  it("opens on the bandas de talla section, with ranges derived from the boundaries", async () => {
    await renderLoaded();
    expect(screen.getByRole("tab", { name: "Bandas" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    // Sin `%` en la celda: lo lleva el encabezado de la columna.
    expect(screen.getByText("0–20")).toBeInTheDocument();
    // La banda siguiente arranca un punto después del límite compartido.
    expect(screen.getByText("21–40")).toBeInTheDocument();
    // Persona-mes con coma y un decimal, para que la columna quede pareja.
    expect(screen.getByText("0,5")).toBeInTheDocument();
    expect(screen.getByText("18,0")).toBeInTheDocument();
  });

  it("shows the selected section and drops the previous one", async () => {
    await renderLoaded();

    selectTab("Capacidades");

    // El mix también llega por HTTP, así que puede resolverse después que las bandas.
    expect(await screen.findByText("Backend Dev")).toBeInTheDocument();
    expect(screen.queryByText("Cambio menor")).not.toBeInTheDocument();
  });

  it("renders the parameter edit action as disabled (no functional editing yet)", async () => {
    await renderLoaded();
    // The action lives in the versionado section, which is not mounted until
    // its tab is selected.
    selectTab("Versionado");

    expect(
      screen.getByRole("button", { name: "Editar parámetros" })
    ).toBeDisabled();
  });
});

describe("AdminParametersPage — editing the talla bands", () => {
  beforeEach(() => {
    resetTallaBandsMock();
    resetCapabilityMixMock();
    resetQuestionPoolMock();
  });

  it("opens the data editor with the saved values, and without the ranges", async () => {
    await renderLoaded();

    fireEvent.click(screen.getByRole("button", { name: "Editar datos" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByDisplayValue("Cambio menor")
    ).toBeInTheDocument();
    // Los límites se ajustan en el otro editor; acá no tienen que estar.
    expect(within(dialog).queryAllByRole("slider")).toHaveLength(0);
  });

  it("opens the ranges editor with the boundaries, and without the band fields", async () => {
    await renderLoaded();

    fireEvent.click(screen.getByRole("button", { name: "Editar reparto" }));

    const dialog = await screen.findByRole("dialog");
    // Un pulgar por límite interior.
    expect(within(dialog).getAllByRole("slider")).toHaveLength(4);
    // Los datos de banda se cargan en el otro editor.
    expect(
      within(dialog).queryByDisplayValue("Cambio menor")
    ).not.toBeInTheDocument();
  });

  it("only offers the band actions while that section is open", async () => {
    await renderLoaded();
    expect(
      screen.getByRole("button", { name: "Editar reparto" })
    ).toBeInTheDocument();

    selectTab("Preguntas");

    // La barra de pestañas la comparten las cuatro secciones, así que estas
    // acciones no deben quedar flotando sobre una a la que no aplican.
    expect(
      screen.queryByRole("button", { name: "Editar reparto" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar datos" })
    ).not.toBeInTheDocument();
  });

  it("keeps the table untouched when the edit is cancelled", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("button", { name: "Editar datos" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByDisplayValue("Cambio menor"), {
      target: { value: "Otra lectura" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Cambio menor")).toBeInTheDocument();
    expect(screen.queryByText("Otra lectura")).not.toBeInTheDocument();
  });

  it("saves a data edit, closes, and shows it in the table", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("button", { name: "Editar datos" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByDisplayValue("Cambio menor"), {
      target: { value: "Retoque mínimo" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar datos" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Retoque mínimo")).toBeInTheDocument();
  });

  it("reports a bad response instead of taking the route down", async () => {
    // Corriendo sin mocks, el dev server responde su index.html con 200 a una
    // ruta que no conoce, así que la pantalla recibe una cadena de HTML. Antes
    // de la guarda de forma eso reventaba el render entero de la ruta.
    server.use(
      http.get("/admin/talla-bands", () =>
        HttpResponse.html("<!doctype html><html></html>")
      )
    );
    render(<AdminParametersPage />);

    expect(
      await screen.findByText(/No se pudieron cargar las bandas/i)
    ).toBeInTheDocument();
    // La pantalla sigue en pie: las otras secciones no dependen de esta.
    expect(screen.getByRole("tab", { name: "Preguntas" })).toBeInTheDocument();
  });

  it("blocks saving while a band field is invalid", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("button", { name: "Editar datos" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByDisplayValue("Cambio menor"), {
      target: { value: "  " },
    });

    expect(
      within(dialog).getByRole("button", { name: "Guardar datos" })
    ).toBeDisabled();
  });
});

describe("AdminParametersPage — editing the capability mix", () => {
  beforeEach(() => {
    resetTallaBandsMock();
    resetCapabilityMixMock();
    resetQuestionPoolMock();
  });

  /** La sección vive detrás de su pestaña, y su tabla llega por HTTP. */
  async function openMixSection() {
    await renderLoaded();
    selectTab("Capacidades");
    await screen.findByText("Backend Dev");
  }

  async function openMixEditor() {
    await openMixSection();
    fireEvent.click(screen.getByRole("button", { name: "Editar mix" }));
    return screen.findByRole("dialog");
  }

  it("derives the columns from the saved bands, in their order", async () => {
    await openMixSection();

    const headers = screen
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent);
    expect(headers).toEqual(["Capacidad", "XS", "S", "M", "L", "XL"]);
  });

  it("opens the editor with the saved mix", async () => {
    const dialog = await openMixEditor();

    expect(within(dialog).getByDisplayValue("Backend Dev")).toBeInTheDocument();
    // Una celda por talla, con la cantidad guardada.
    expect(
      within(dialog).getByRole("spinbutton", { name: "XL de Backend Dev" })
    ).toHaveValue(8);
  });

  it("only offers the mix action while that section is open", async () => {
    await openMixSection();
    expect(
      screen.getByRole("button", { name: "Editar mix" })
    ).toBeInTheDocument();

    selectTab("Bandas");

    expect(
      screen.queryByRole("button", { name: "Editar mix" })
    ).not.toBeInTheDocument();
    // Y las de bandas siguen siendo las suyas: las dos condiciones no se cruzan.
    expect(
      screen.getByRole("button", { name: "Editar reparto" })
    ).toBeInTheDocument();
  });

  it("adds a capability and shows it in the table once saved", async () => {
    const dialog = await openMixEditor();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Agregar capacidad" })
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Nombre de la capacidad 4" }),
      { target: { value: "Diseño" } }
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar mix" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Diseño")).toBeInTheDocument();
  });

  it("keeps the table on the saved mix while the editor holds an unsaved row", async () => {
    const dialog = await openMixEditor();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Agregar capacidad" })
    );

    // La fila nueva vive en el editor; la tabla sigue mostrando lo guardado, o
    // una capacidad a medio escribir se leería como si ya estuviera acordada.
    expect(within(dialog).getAllByRole("textbox")).toHaveLength(4);
    // Con el diálogo abierto el resto de la página queda `aria-hidden`, así que
    // sus filas hay que pedirlas explícitamente.
    expect(screen.getAllByRole("row", { hidden: true })).toHaveLength(4);
  });

  it("removes a capability and drops it from the table once saved", async () => {
    const dialog = await openMixEditor();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Quitar QA Engineer" })
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar mix" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.queryByText("QA Engineer")).not.toBeInTheDocument();
    expect(screen.getByText("Backend Dev")).toBeInTheDocument();
  });

  it("keeps a renamed capability's amounts — the reason each row carries an id", async () => {
    const dialog = await openMixEditor();

    fireEvent.change(within(dialog).getByDisplayValue("Backend Dev"), {
      target: { value: "Backend" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar mix" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const renamed = screen.getByText("Backend").closest("tr")!;
    expect(
      within(renamed)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    ).toEqual(["Backend", "1", "2", "3", "5", "8"]);
  });

  it("discards additions and removals when the edit is cancelled", async () => {
    const dialog = await openMixEditor();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Agregar capacidad" })
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Quitar Arquitecto" })
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Arquitecto")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4); // encabezado + tres
  });

  it("blocks saving while a name is empty or repeated", async () => {
    const dialog = await openMixEditor();
    const save = within(dialog).getByRole("button", { name: "Guardar mix" });
    // Se busca por su rótulo y no por su valor: un valor de sólo espacios se
    // normaliza a vacío al consultarlo, y dejaría de encontrarse.
    const name = within(dialog).getByRole("textbox", {
      name: "Nombre de la capacidad 1",
    });

    fireEvent.change(name, { target: { value: "  " } });
    expect(
      within(dialog).getByText("No puede quedar vacío")
    ).toBeInTheDocument();
    expect(save).toBeDisabled();

    fireEvent.change(name, { target: { value: "QA Engineer" } });
    expect(save).toBeDisabled();
    // Cada campo señala lo suyo, no un aviso suelto al pie.
    expect(
      within(dialog).getAllByText("Ya hay una capacidad con ese nombre")
    ).toHaveLength(2);
  });

  it("reports a bad mix response instead of taking the section down", async () => {
    server.use(
      http.get("/admin/capability-mix", () =>
        HttpResponse.html("<!doctype html><html></html>")
      )
    );
    await renderLoaded();

    selectTab("Capacidades");

    expect(
      await screen.findByText(/No se pudo cargar el mix de capacidades/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar mix" })
    ).not.toBeInTheDocument();
  });

  it("says the section needs the bands when they are unavailable", async () => {
    // El mix se organiza por talla: sin bandas no hay columnas que mostrar.
    server.use(
      http.get("/admin/talla-bands", () =>
        HttpResponse.html("<!doctype html><html></html>")
      )
    );
    render(<AdminParametersPage />);
    await screen.findByText(/No se pudieron cargar las bandas/i);

    selectTab("Capacidades");

    expect(
      await screen.findByText(/necesita las bandas cargadas/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar mix" })
    ).not.toBeInTheDocument();
  });
});

describe("AdminParametersPage — editing the question pool", () => {
  beforeEach(() => {
    resetTallaBandsMock();
    resetCapabilityMixMock();
    resetQuestionPoolMock();
  });

  /** La sección vive detrás de su pestaña, y su tabla llega por HTTP. */
  async function openQuestionsSection() {
    await renderLoaded();
    selectTab("Preguntas");
    await screen.findByText("Negocio y cliente");
  }

  async function openQuestionsEditor() {
    await openQuestionsSection();
    fireEvent.click(screen.getByRole("button", { name: "Editar preguntas" }));
    return screen.findByRole("dialog");
  }

  it("shows the seven dimensions with real counts, weights and max points", async () => {
    await openQuestionsSection();

    const row = screen.getByText("Negocio y cliente").closest("tr")!;
    // Contra el modelo de referencia: 4 preguntas, peso 8, máximo 32 (8 × 4).
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    ).toEqual(["Negocio y cliente", "4", "8", "32"]);
  });

  it("only offers the questions action while that section is open", async () => {
    await openQuestionsSection();
    expect(
      screen.getByRole("button", { name: "Editar preguntas" })
    ).toBeInTheDocument();

    selectTab("Bandas");

    expect(
      screen.queryByRole("button", { name: "Editar preguntas" })
    ).not.toBeInTheDocument();
    // Y las de bandas siguen siendo las suyas: las condiciones no se cruzan.
    expect(
      screen.getByRole("button", { name: "Editar reparto" })
    ).toBeInTheDocument();
  });

  it("opens the editor with the 30 questions grouped by dimension", async () => {
    const dialog = await openQuestionsEditor();

    expect(
      within(dialog).getAllByRole("textbox").length +
        within(dialog).getAllByRole("spinbutton").length
    ).toBeGreaterThan(0);
    // Un campo de texto por pregunta: las 30 del modelo de referencia.
    expect(within(dialog).getAllByRole("textbox")).toHaveLength(30);
    expect(
      within(dialog).getByRole("heading", { name: "Negocio y cliente" })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", {
        name: "Incertidumbre y dependencias",
      })
    ).toBeInTheDocument();
  });

  it("edits a weight, saves, and updates the summary in the table", async () => {
    const dialog = await openQuestionsEditor();

    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "Peso de la pregunta N2",
      }),
      { target: { value: "6" } }
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar preguntas" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const row = screen.getByText("Negocio y cliente").closest("tr")!;
    // N2 pasó de peso 3 a 6: el total de la dimensión sube de 8 a 11, y el
    // máximo de puntos de 32 a 44.
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    ).toEqual(["Negocio y cliente", "4", "11", "44"]);
  });

  it("adds a question to a dimension and shows it counted once saved", async () => {
    const dialog = await openQuestionsEditor();

    const integracionesGroup = within(dialog)
      .getByRole("heading", { name: "Integraciones" })
      .closest("div")!;
    fireEvent.click(
      within(integracionesGroup).getByRole("button", {
        name: "Agregar pregunta",
      })
    );
    // Se acota al grupo de la dimensión: en el diálogo entero la fila nueva
    // no queda última, queda al final de SU grupo, con cuatro dimensiones
    // más renderizándose después.
    const groupTextboxes = within(integracionesGroup).getAllByRole("textbox");
    expect(groupTextboxes).toHaveLength(5); // I1–I4 + la nueva
    fireEvent.change(groupTextboxes[4], {
      target: { value: "¿Pregunta nueva de integraciones?" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar preguntas" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const row = screen.getByText("Integraciones").closest("tr")!;
    // Integraciones tenía 4 preguntas y peso 10; con la nueva (peso 1 por
    // defecto) pasa a 5 preguntas y peso 11.
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    ).toEqual(["Integraciones", "5", "11", "44"]);
  });

  it("removes a question and shows it discounted once saved", async () => {
    const dialog = await openQuestionsEditor();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Quitar la pregunta N1" })
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Guardar preguntas" })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const row = screen.getByText("Negocio y cliente").closest("tr")!;
    // N1 pesaba 2: la dimensión pasa de 4 a 3 preguntas y de peso 8 a 6.
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    ).toEqual(["Negocio y cliente", "3", "6", "24"]);
  });

  it("discards edits, additions and removals when the edit is cancelled", async () => {
    const dialog = await openQuestionsEditor();

    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "Peso de la pregunta N1",
      }),
      { target: { value: "9" } }
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Quitar la pregunta N2" })
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const row = screen.getByText("Negocio y cliente").closest("tr")!;
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    ).toEqual(["Negocio y cliente", "4", "8", "32"]);
  });

  it("blocks saving while a text is empty or a weight is invalid", async () => {
    const dialog = await openQuestionsEditor();
    const save = within(dialog).getByRole("button", {
      name: "Guardar preguntas",
    });

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Texto de la pregunta N1" }),
      { target: { value: "  " } }
    );
    expect(
      within(dialog).getByText("No puede quedar vacío")
    ).toBeInTheDocument();
    expect(save).toBeDisabled();

    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Texto de la pregunta N1" }),
      { target: { value: "Texto corregido" } }
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "Peso de la pregunta N2",
      }),
      { target: { value: "0" } }
    );
    expect(
      within(dialog).getByText("Tiene que ser un número entero de al menos 1")
    ).toBeInTheDocument();
    expect(save).toBeDisabled();
  });

  it("reports a bad question pool response instead of taking the section down", async () => {
    server.use(
      http.get("/admin/question-pool", () =>
        HttpResponse.html("<!doctype html><html></html>")
      )
    );
    await renderLoaded();

    selectTab("Preguntas");

    expect(
      await screen.findByText(/No se pudo cargar el pool de preguntas/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar preguntas" })
    ).not.toBeInTheDocument();
  });
});
