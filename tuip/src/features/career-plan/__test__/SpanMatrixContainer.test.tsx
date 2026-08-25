import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../../mocks/server";
import { resetSkillsMock } from "../../../mocks/handlers/skills.handlers";
import { resetAssessmentsMock } from "../../../mocks/handlers/assessments.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { SpanMatrixContainer } from "../SpanMatrixContainer";

const NEGOCIO = "s1000000-0000-0000-0000-000000000001";
const ARQUITECTURA = "s1000000-0000-0000-0000-000000000005";

function renderMatrix() {
  return render(
    <MemoryRouter>
      <SpanMatrixContainer />
    </MemoryRouter>
  );
}

/** La fila de una persona por su nombre. */
function row(name: string): HTMLElement {
  return screen.getByText(name).closest("tr") as HTMLElement;
}

describe("SpanMatrixContainer", () => {
  /**
   * Los encabezados de columna propiamente dichos. El renglón de arriba rotula
   * los grupos con celdas que abarcan varias columnas, y contarlas junto a las
   * demás mezcla dos cosas distintas.
   */
  function columnas(): HTMLElement[] {
    const filas = screen.getAllByRole("row");
    const encabezado = filas[1];
    return [...encabezado.querySelectorAll("th")] as HTMLElement[];
  }

  /**
   * Al detalle de una habilidad ya no se llega desde su encabezado —las
   * columnas no llevan nombre a la vista—, sino desde el detalle de
   * cualquiera de sus celdas.
   */
  async function abrirHabilidad(nombre: string) {
    const cuadros = screen.getAllByRole("button", {
      name: new RegExp(`, ${nombre}:`),
    });
    fireEvent.click(cuadros[0]);
    const celda = await screen.findByRole("region", {
      name: "Detalle de la celda",
    });
    fireEvent.click(within(celda).getByText("Ver la habilidad"));
    return await screen.findByRole("dialog", { name: nombre });
  }

  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
  });

  it("dibuja una fila por persona y una columna por habilidad activa", async () => {
    renderMatrix();

    expect(
      await screen.findByRole("columnheader", { name: "Persona" })
    ).toBeInTheDocument();
    // Nueve habilidades activas más Persona y Brechas.
    expect(columnas()).toHaveLength(11);
    expect(screen.getByText("Paula Ramírez")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });

  it("identifica cada columna con una sigla de dos letras, no con el nombre", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    // El nombre completo sigue siendo el nombre accesible de la columna —sin
    // él la tabla no se puede recorrer con un lector de pantalla— pero lo que
    // se dibuja son dos letras.
    const columna = screen.getByRole("columnheader", {
      name: "Conocimiento del negocio",
    });
    const visible = columna.querySelector("[aria-hidden='true']");
    expect(visible?.textContent).toBe("CN");
    expect(columna.querySelector(".sr-only")?.textContent).toBe(
      "Conocimiento del negocio"
    );
  });

  it("rotula los grupos sobre las columnas que les corresponden", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    // Con las siglas de dos letras, la frontera entre técnicas y humanas no se
    // puede deducir del encabezado: hay que rotularla.
    const grupos = screen.getAllByRole("row")[0];
    const rotulos = [...grupos.querySelectorAll("th")]
      .map((h) => h.textContent?.trim())
      .filter(Boolean);
    expect(rotulos).toEqual(["TÉCNICAS", "HUMANAS"]);

    // Y al acotar a un grupo queda su rótulo solo, no dos con uno vacío.
    fireEvent.click(screen.getByRole("radio", { name: "Humanas" }));
    await waitFor(() => {
      const acotados = [...screen.getAllByRole("row")[0].querySelectorAll("th")]
        .map((h) => h.textContent?.trim())
        .filter(Boolean);
      expect(acotados).toEqual(["HUMANAS"]);
    });
  });

  it("ofrece abrir las evaluaciones que faltan, no sólo avisar que faltan", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    expect(
      screen.getByText(/Sin evaluación cerrada no hay brecha que medir/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Abrir evaluaciones" })
    ).toBeInTheDocument();
  });

  it("sin celda activa la columna de apoyo no deja un hueco esperando", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    // El detalle no está montado, y los dos bloques del chapter ocupan la
    // columna en vez de un espacio en blanco reservado.
    expect(
      screen.queryByRole("region", { name: "Detalle de la celda" })
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText("Dónde se concentra la brecha")
    ).toBeInTheDocument();
    expect(screen.getByText("Pendientes de gestión")).toBeInTheDocument();
  });

  it("el detalle convive con la matriz: no la reemplaza ni la tapa", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const cuadros = screen.getAllByRole("button", {
      name: new RegExp(", Conocimiento del negocio:"),
    });
    fireEvent.click(cuadros[0]);
    await screen.findByRole("region", { name: "Detalle de la celda" });

    // La comparación entre la celda abierta y el resto del mapa es la lectura
    // que la pantalla existe para permitir: la tabla entera sigue ahí, con su
    // pie, y los bloques del chapter no se van.
    expect(screen.getAllByRole("row").length).toBeGreaterThan(3);
    expect(screen.getByText("Con brecha")).toBeInTheDocument();
    expect(screen.getByText("Pendientes de gestión")).toBeInTheDocument();
  });

  it("el detalle se cierra desde su propio encabezado", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const cuadros = screen.getAllByRole("button", {
      name: new RegExp(", Conocimiento del negocio:"),
    });
    fireEvent.click(cuadros[0]);
    const panel = await screen.findByRole("region", {
      name: "Detalle de la celda",
    });

    fireEvent.click(
      within(panel).getByRole("button", { name: "Cerrar el detalle" })
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Detalle de la celda" })
      ).not.toBeInTheDocument()
    );
  });

  it("marca el mismo nivel distinto según el cargo de cada persona", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    // Paula (Data Engineer) y María (Backend Dev) están las dos en Competente
    // en Conocimiento del negocio; el cargo de Paula pide Avanzado.
    const paula = row("Paula Ramírez");
    const maria = row("María González");

    expect(
      within(paula).getByLabelText(/Conocimiento del negocio.*le falta 1 nivel/)
    ).toBeInTheDocument();
    expect(
      within(maria).getByLabelText(
        /Conocimiento del negocio.*al nivel que pide su cargo/
      )
    ).toBeInTheDocument();
  });

  it("deja sin dato a quien no tiene evaluación y no la cuenta", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    // Andrés Martínez no tiene evaluación cerrada.
    const andres = row("Andrés Martínez");
    expect(within(andres).getByText("Sin evaluar")).toBeInTheDocument();
    // Sus cuadros lo dicen uno por uno, sin inventar un cero.
    expect(
      within(andres).getAllByRole("button", { name: /sin evaluar/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/personas sin evaluar, que no cuentan en los totales/)
    ).toBeInTheDocument();
  });

  it("cierra cada columna con cuántas personas tienen brecha, y el total del span", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const pie = screen.getByText("Con brecha").closest("tr") as HTMLElement;
    const celdas = [...pie.querySelectorAll("td")];
    // Sin la de "Con brecha" ni el total: una cifra por columna.
    const porColumna = celdas.slice(1, -1).map((c) => Number(c.textContent));
    const total = Number(celdas[celdas.length - 1].textContent);

    // Con las semillas hay seis brechas repartidas en cinco habilidades, y la
    // suma de las columnas tiene que ser el total: si el pie contara sobre otro
    // conjunto que la fila, estas dos cifras se separarían.
    expect(porColumna).toHaveLength(9);
    expect(porColumna.reduce((a, b) => a + b, 0)).toBe(total);
    expect(total).toBe(6);

    // Y el encabezado de la pantalla dice lo mismo que el pie, con el rótulo
    // que corresponde a una cifra que sigue al recorte.
    expect(screen.getByText(/6 brechas a la vista/)).toBeInTheDocument();
  });

  it("los indicadores del chapter no se mueven al acotar la matriz", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const cobertura = await screen.findByText(
      /de \d+ personas · sin evaluación/
    );
    const criticas = screen.getByText(/de \d+ brechas? abiertas?/);
    const antes = [cobertura.textContent, criticas.textContent];

    fireEvent.click(screen.getByRole("radio", { name: "Técnicas" }));
    await waitFor(() => expect(columnas()).toHaveLength(7));

    // Los totales de la tabla siguieron al recorte; estas cifras no, porque
    // describen al chapter y no a lo que está a la vista.
    expect([
      screen.getByText(/de \d+ personas · sin evaluación/).textContent,
      screen.getByText(/de \d+ brechas? abiertas?/).textContent,
    ]).toEqual(antes);
  });

  it("acota a las técnicas y recalcula los totales, diciéndolo", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");
    expect(columnas()).toHaveLength(11);

    fireEvent.click(screen.getByRole("radio", { name: "Técnicas" }));

    await waitFor(() =>
      // Cinco técnicas más Persona y Brechas.
      expect(columnas()).toHaveLength(7)
    );
    expect(
      screen.getByText(
        /Los totales cuentan sólo las 5 habilidades a la vista, de 9/
      )
    ).toBeInTheDocument();
  });

  it("ordena las filas por brechas, de mayor a menor", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    /** La última celda de cada fila del cuerpo es su total de brechas. */
    const gapsPorFila = () =>
      screen
        .getAllByRole("row")
        .slice(2, -1)
        .map((r) => {
          const celdas = r.querySelectorAll("td");
          return celdas[celdas.length - 1].textContent ?? "";
        })
        .filter((t) => t !== "Sin evaluar")
        .map(Number);

    const porBrechas = gapsPorFila();
    expect(porBrechas.length).toBeGreaterThan(1);
    expect(porBrechas).toEqual([...porBrechas].sort((a, b) => b - a));

    // Cambiar el criterio cambia el orden.
    fireEvent.click(screen.getByRole("radio", { name: "Por nombre" }));
    await waitFor(() => expect(gapsPorFila()).not.toEqual(porBrechas));
  });

  it("ordena las columnas por brechas dentro de cada grupo", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const pie = screen.getByText("Con brecha").closest("tr") as HTMLElement;
    const celdas = [...pie.querySelectorAll("td")];
    // Sin la de "Con brecha" ni el total del span.
    const porColumna = celdas.slice(1, -1).map((c) => Number(c.textContent));

    // El grupo manda y la criticidad ordena dentro de él: cruzando los grupos,
    // las columnas quedarían intercaladas y la matriz no podría decir dónde
    // empieza cada uno.
    const tramos = [...screen.getAllByRole("row")[0].querySelectorAll("th")]
      .map((h) => Number(h.getAttribute("colspan") ?? 0))
      .filter((n) => n > 0);
    expect(tramos.length).toBeGreaterThan(1);

    let desde = 0;
    for (const largo of tramos) {
      const grupo = porColumna.slice(desde, desde + largo);
      expect(grupo).toEqual([...grupo].sort((a, b) => b - a));
      desde += largo;
    }
  });

  it("abre el detalle de una habilidad con las personas agrupadas por nivel", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const panel = await abrirHabilidad("Conocimiento del negocio");

    // Los cuatro niveles, en orden y aunque alguno no tenga a nadie. Se buscan
    // por encabezado: el nombre del nivel también aparece dentro de una marca
    // de brecha ("pide Avanzado"), que no es un grupo.
    expect(
      within(panel)
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent)
    ).toEqual([
      "1 · Principiante",
      "2 · Competente",
      "3 · Avanzado",
      "4 · Experto",
    ]);
  });

  it("en el detalle, dos personas del mismo nivel se marcan distinto", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const panel = await abrirHabilidad("Conocimiento del negocio");

    // Paula y María comparten Competente; Paula debe Avanzado y María no.
    const paula = within(panel).getByText("Paula Ramírez").closest("li")!;
    const maria = within(panel).getByText("María González").closest("li")!;

    expect(paula).toHaveTextContent("−1 · pide Avanzado");
    expect(maria).toHaveTextContent("Al nivel");
  });

  it("un nivel sin nadie se muestra igual, para que el reparto se lea completo", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    const panel = await abrirHabilidad("Arquitectura");

    expect(
      within(panel).getAllByText("Nadie en este nivel").length
    ).toBeGreaterThan(0);
  });

  it("dibuja todos los cuadros del mismo tamaño, con nombres de largo distinto", async () => {
    renderMatrix();
    await screen.findByText("Paula Ramírez");

    // "Ciclo de desarrollo de software" y "Arquitectura" no se parecen en
    // largo; lo que el nombre puede cambiar es el encabezado, no el cuadro.
    // Acotado a la tabla: fuera de ella hay botones cuyo nombre también dice
    // "sin evaluar" —los pendientes de la columna de apoyo— y colarlos rompía
    // la comparación de medidas.
    const tabla = screen.getByRole("table");
    const cuadros = within(tabla).getAllByRole("button", {
      name: /: |sin evaluar/i,
    });
    const medidas = new Set(
      cuadros.map((c) => c.style.width + "x" + c.style.height)
    );

    expect(cuadros.length).toBeGreaterThan(20);
    expect(medidas.size).toBe(1);
    expect([...medidas][0]).toMatch(/^\d+pxx\d+px$/);
  });

  describe("el detalle de una celda", () => {
    /** El cuadro de una persona en una habilidad. */
    function cuadro(persona: string, habilidad: RegExp): HTMLElement {
      return within(row(persona)).getByLabelText(habilidad);
    }

    it("abre el detalle de una celda con brecha", async () => {
      renderMatrix();
      await screen.findByText("Paula Ramírez");

      fireEvent.click(cuadro("Paula Ramírez", /Conocimiento del negocio/));

      const panel = await screen.findByRole("region", {
        name: "Detalle de la celda",
      });
      expect(within(panel).getByText("Paula Ramírez")).toBeInTheDocument();
      expect(
        within(panel).getByText("Conocimiento del negocio")
      ).toBeInTheDocument();
      // La fecha de la evaluación: una brecha de hace un año no es lo mismo
      // que una de este mes.
      await waitFor(() =>
        expect(within(panel).getByText(/evaluada el /)).toBeInTheDocument()
      );
      expect(within(panel).getByText(/Le falta para /)).toBeInTheDocument();
      expect(within(panel).getByText("Ver su plan")).toBeInTheDocument();
      expect(within(panel).getByText("Ver la habilidad")).toBeInTheDocument();
    });

    it("dice cuántas personas más del span tienen brecha, con el número del pie", async () => {
      renderMatrix();
      await screen.findByText("Paula Ramírez");

      // La posición de la columna en el orden actual, para leer su pie.
      const rotulos = columnas().map((h) => h.textContent);
      // Por inclusión y no por igualdad: el encabezado dibuja la sigla y
      // guarda el nombre completo como texto accesible, así que su contenido
      // es "CN" seguido del nombre.
      const indice = rotulos.findIndex((t) =>
        t?.includes("Conocimiento del negocio")
      );
      const pie = screen.getByText("Con brecha").closest("tr") as HTMLElement;
      const delPie = Number(
        [...pie.querySelectorAll("td")][indice].textContent
      );

      fireEvent.click(cuadro("Paula Ramírez", /Conocimiento del negocio/));
      const panel = await screen.findByRole("region", {
        name: "Detalle de la celda",
      });

      // El panel dice el mismo número que el pie, sea cual sea: el conteo sale
      // del mismo cálculo, así que no pueden discrepar.
      expect(delPie).toBeGreaterThan(0);
      expect(
        within(panel).getByText(
          delPie === 1
            ? "Es la única persona del span con brecha acá."
            : delPie + " personas del span tienen brecha acá."
        )
      ).toBeInTheDocument();
    });

    it("abre el detalle de una celda sin brecha", async () => {
      renderMatrix();
      await screen.findByText("Paula Ramírez");

      fireEvent.click(
        cuadro("María González", /Conocimiento del negocio.*al nivel/)
      );
      const panel = await screen.findByRole("region", {
        name: "Detalle de la celda",
      });

      await waitFor(() =>
        expect(within(panel).getByText("Al nivel")).toBeInTheDocument()
      );
      // Sin brecha no hay criterios faltantes ni conteo de columna.
      expect(
        within(panel).queryByText(/Le falta para /)
      ).not.toBeInTheDocument();
      expect(
        within(panel).queryByText(/tienen brecha acá/)
      ).not.toBeInTheDocument();
    });

    it("abre el detalle de una celda sin evaluar y ofrece evaluarla", async () => {
      renderMatrix();
      await screen.findByText("Paula Ramírez");

      fireEvent.click(
        cuadro("Andrés Martínez", /Conocimiento del negocio: sin evaluar/i)
      );
      const panel = await screen.findByRole("region", {
        name: "Detalle de la celda",
      });

      expect(
        within(panel).getByText(/no tiene ninguna evaluación cerrada/)
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole("button", { name: /Evaluar a Andrés/ })
      ).toBeInTheDocument();
    });

    it("se cierra con Escape y devuelve el foco a la celda", async () => {
      renderMatrix();
      await screen.findByText("Paula Ramírez");

      const celda = cuadro("Paula Ramírez", /Conocimiento del negocio/);
      // El cuadro es un botón nativo: el navegador lo activa con Enter y con
      // Espacio sin que la pantalla tenga que manejar teclas.
      expect(celda.tagName).toBe("BUTTON");
      celda.focus();
      fireEvent.click(celda);

      const panel = await screen.findByRole("region", {
        name: "Detalle de la celda",
      });
      expect(celda).toHaveAttribute("aria-expanded", "true");
      // El cuadro apunta a la región que abrió: el panel aparece lejos, al
      // final del DOM, y sin esa atadura nada dice qué abrió qué.
      expect(celda.getAttribute("aria-controls")).toBe(panel.id);

      // El foco se mueve al panel antes de cerrar. Sin esto, el foco nunca
      // salió del cuadro y la prueba pasaría igual aunque la devolución no
      // existiera: no distinguiría el arreglo del defecto.
      const cerrar = within(panel).getByRole("button", {
        name: "Cerrar el detalle",
      });
      cerrar.focus();
      expect(cerrar).toHaveFocus();

      fireEvent.keyDown(document, { key: "Escape" });

      await waitFor(() =>
        expect(
          screen.queryByRole("region", { name: "Detalle de la celda" })
        ).not.toBeInTheDocument()
      );
      await waitFor(() => expect(celda).toHaveFocus());
    });
  });

  it("con el span sin evaluaciones cerradas invita a evaluar", async () => {
    server.use(
      http.get("/career-plan/span", () =>
        HttpResponse.json({
          skills: [
            {
              skillId: NEGOCIO,
              skillName: "Conocimiento del negocio",
              group: "technical",
            },
            {
              skillId: ARQUITECTURA,
              skillName: "Arquitectura",
              group: "technical",
            },
          ],
          people: [
            {
              personId: "p1",
              personName: "Ana Ruiz",
              role: "QA Engineer",
              evaluated: false,
              cells: [
                { skillId: NEGOCIO, level: null, expectedLevel: 2, gap: null },
                {
                  skillId: ARQUITECTURA,
                  level: null,
                  expectedLevel: null,
                  gap: null,
                },
              ],
            },
          ],
        })
      )
    );
    renderMatrix();

    expect(
      await screen.findByText("Todavía no hay evaluaciones cerradas")
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
