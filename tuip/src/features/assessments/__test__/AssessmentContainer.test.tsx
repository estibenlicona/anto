import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetAssessmentsMock } from "../../../mocks/handlers/assessments.handlers";
import { resetSkillsMock } from "../../../mocks/handlers/skills.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { PAULA, LAURA } from "../../../mocks/handlers/assessments.seeds";
import { AssessmentContainer } from "../AssessmentContainer";

const ANDRES = "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

function renderFor(personId: string) {
  return render(
    <ToastProvider>
      <MemoryRouter
        initialEntries={[`/app/lead/personas/${personId}/evaluacion`]}
      >
        <Routes>
          <Route
            path="/app/lead/personas/:id/evaluacion"
            element={<AssessmentContainer />}
          />
          <Route path="/app/lead/personas/:id" element={<div>Ficha</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

/** La tarjeta de un nivel dentro del selector, por su título. */
function levelCard(name: RegExp): HTMLElement {
  return screen.getByRole("radio", { name }).parentElement as HTMLElement;
}

describe("AssessmentContainer", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
  });

  it("ofrece abrir la evaluación de quien no tiene ninguna", async () => {
    renderFor(ANDRES);

    expect(
      await screen.findByText("Esta persona todavía no tiene evaluación")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir evaluación" }));

    expect(
      await screen.findByText("0 de 9 habilidades evaluadas")
    ).toBeInTheDocument();
  });

  it("muestra el avance y qué pide el cargo en la habilidad abierta", async () => {
    renderFor(LAURA);

    expect(
      await screen.findByText(/Evaluación de Laura Ruiz/)
    ).toBeInTheDocument();
    expect(
      screen.getByText("4 de 9 habilidades evaluadas")
    ).toBeInTheDocument();

    // Abre la primera sin evaluar: Desarrollo de software.
    expect(
      screen.getByRole("heading", { name: "Desarrollo de software" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El cargo de QA Engineer requiere un nivel Competente/)
    ).toBeInTheDocument();
  });

  it("cada nivel cuenta sus propios criterios, sin asumir una cantidad", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    fireEvent.click(
      screen.getByRole("button", { name: /Conocimiento del negocio/ })
    );

    // 5·5·6·4 en el catálogo; la semilla marcó los 5 de Competente y 1 de Avanzado.
    await waitFor(() =>
      expect(
        within(levelCard(/1 · Principiante/)).getByText("cumple 5 de 5")
      ).toBeInTheDocument()
    );
    expect(
      within(levelCard(/3 · Avanzado/)).getByText("cumple 1 de 6")
    ).toBeInTheDocument();
    expect(
      within(levelCard(/4 · Experto/)).getByText("cumple 0 de 4")
    ).toBeInTheDocument();
  });

  it("marcar un criterio mueve el contador sin cambiar el nivel elegido", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });
    fireEvent.click(
      screen.getByRole("button", { name: /Conocimiento del negocio/ })
    );
    await screen.findByText("cumple 1 de 6");

    const elegido = screen.getByRole("radio", { name: /2 · Competente/ });
    expect(elegido).toHaveAttribute("aria-checked", "true");

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Propone alternativas en términos de costo, riesgo y tiempo.",
      })
    );

    expect(screen.getByText("cumple 2 de 6")).toBeInTheDocument();
    // El sistema no decide el nivel por su cuenta.
    expect(
      screen.getByRole("radio", { name: /2 · Competente/ })
    ).toHaveAttribute("aria-checked", "true");
  });

  it("la brecha sale sola de los criterios sin marcar del nivel exigido", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    const brecha = screen
      .getByRole("heading", { name: "Brecha" })
      .closest("section") as HTMLElement;

    expect(
      within(brecha).getByText(/−1 nivel · su cargo pide Avanzado/)
    ).toBeInTheDocument();
    expect(
      within(brecha).getByText("Le falta para Avanzado")
    ).toBeInTheDocument();
    // Los cuatro criterios sin marcar de Avanzado, sin escribirlos de nuevo.
    expect(within(brecha).getAllByRole("listitem")).toHaveLength(4);
    expect(
      within(brecha).getByText(
        "Conoce las reglas de al menos dos dominios además del suyo."
      )
    ).toBeInTheDocument();
    expect(
      within(brecha).getByText(/Sale solo de los criterios sin marcar/)
    ).toBeInTheDocument();
  });

  it("la brecha se arma mientras se decide, sin tener que guardar", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    const brecha = () =>
      screen
        .getByRole("heading", { name: "Brecha" })
        .closest("section") as HTMLElement;

    // Sin nivel elegido todavía no hay nada que comparar.
    expect(brecha()).toHaveTextContent("Sin evaluar");

    // QA Engineer pide Competente: elegir Principiante la abre en el momento.
    fireEvent.click(screen.getByRole("radio", { name: /1 · Principiante/ }));
    expect(brecha()).toHaveTextContent("su cargo pide Competente");
    expect(within(brecha()).getAllByRole("listitem")).toHaveLength(6);

    // Marcar un criterio del nivel exigido la achica sin guardar nada.
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Escribe pruebas de los bordes, no sólo del camino feliz.",
      })
    );
    expect(within(brecha()).getAllByRole("listitem")).toHaveLength(5);

    // Y elegir el nivel exigido la cierra.
    fireEvent.click(screen.getByRole("radio", { name: /2 · Competente/ }));
    expect(brecha()).toHaveTextContent("Al nivel que pide su cargo");
    expect(within(brecha()).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("exige la nota cuando el nivel elegido abre brecha, y no antes", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    // QA Engineer pide Competente: elegir Principiante abre brecha.
    fireEvent.click(screen.getByRole("radio", { name: /1 · Principiante/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar y siguiente" })
    );

    expect(
      await screen.findByText("Con brecha la nota es obligatoria.")
    ).toBeInTheDocument();
    // No avanzó.
    expect(
      screen.getByRole("heading", { name: "Desarrollo de software" })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nota de la evaluación/), {
      target: {
        value: "Recién entró al equipo; se acompaña con pair programming.",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar y siguiente" })
    );

    await waitFor(() =>
      expect(
        screen.getByText("5 de 9 habilidades evaluadas")
      ).toBeInTheDocument()
    );
  });

  it("guarda y retoma lo marcado", async () => {
    const { unmount } = renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    fireEvent.click(screen.getByRole("radio", { name: /3 · Avanzado/ }));
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Diseña la solución técnica de una historia completa.",
      })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar y siguiente" })
    );
    await waitFor(() =>
      expect(
        screen.getByText("5 de 9 habilidades evaluadas")
      ).toBeInTheDocument()
    );
    unmount();

    renderFor(LAURA);
    await screen.findByText("5 de 9 habilidades evaluadas");
    fireEvent.click(
      screen.getByRole("button", { name: /Desarrollo de software/ })
    );

    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /3 · Avanzado/ })
      ).toHaveAttribute("aria-checked", "true")
    );
    expect(
      screen.getByRole("checkbox", {
        name: "Diseña la solución técnica de una historia completa.",
      })
    ).toBeChecked();
  });

  describe("el encabezado", () => {
    it("presenta guardar como acción secundaria, distinta de la primaria", async () => {
      renderFor(LAURA);
      await screen.findByRole("heading", { name: "Desarrollo de software" });

      const guardar = screen.getByRole("button", {
        name: "Guardar y seguir después",
      });
      const cerrar = screen.getByRole("button", { name: "Cerrar evaluación" });

      // El borde es lo que dibuja dónde termina el área clicable; sin él se
      // leía como texto.
      expect(guardar.className).toContain("border");
      expect(guardar.className).not.toEqual(cerrar.className);
    });

    it("guardar sigue llevando a la ficha de la persona", async () => {
      renderFor(LAURA);
      await screen.findByRole("heading", { name: "Desarrollo de software" });

      fireEvent.click(
        screen.getByRole("button", { name: "Guardar y seguir después" })
      );

      expect(await screen.findByText("Ficha")).toBeInTheDocument();
    });

    it("ya no lleva el aviso permanente sobre lo que implica cerrar", async () => {
      renderFor(LAURA);
      await screen.findByRole("heading", { name: "Desarrollo de software" });

      expect(
        screen.queryByText(/Cerrar fija los niveles/)
      ).not.toBeInTheDocument();
    });
  });

  describe("la confirmación de cierre", () => {
    /**
     * Deja la evaluación de Laura completa, que es lo que habilita cerrar.
     * Recorre el índice fila por fila en vez de buscar las que dicen
     * "Pendiente": la que está abierta dice "Evaluando", así que buscarlas por
     * esa palabra dejaría siempre una sin evaluar.
     */
    async function completar() {
      renderFor(LAURA);
      await screen.findByRole("heading", { name: "Desarrollo de software" });

      const indice = screen
        .getByRole("heading", { name: "Habilidades" })
        .closest("div")!.parentElement as HTMLElement;

      // Los nombres se toman antes de tocar nada: las filas se re-renderizan
      // y una referencia al nodo quedaría desconectada.
      const nombres = within(indice)
        .getAllByRole("button")
        .map((f) => f.textContent!.replace(/Evaluando|Pendiente/g, "").trim());

      for (const nombre of nombres) {
        fireEvent.click(
          within(indice).getByRole("button", { name: new RegExp(nombre) })
        );
        // Antes de elegir nivel, esperar a que el panel sea el de esta
        // habilidad: el guardado anterior mueve la selección por su cuenta, y
        // sin esto se le elegiría el nivel a la que quedó abierta.
        await screen.findByRole("heading", { name: nombre });

        fireEvent.click(screen.getByRole("radio", { name: /4 · Experto/ }));
        const guardar = () =>
          screen.getByRole("button", { name: "Guardar y siguiente" });
        await waitFor(() => expect(guardar()).not.toBeDisabled());
        fireEvent.click(guardar());
        await waitFor(() =>
          expect(
            within(indice).getByRole("button", { name: new RegExp(nombre) })
          ).not.toHaveTextContent("Pendiente")
        );
      }

      await waitFor(() =>
        expect(
          screen.getByText("9 de 9 habilidades evaluadas")
        ).toBeInTheDocument()
      );
    }

    it("pide confirmación en vez de cerrar de un clic", async () => {
      await completar();
      fireEvent.click(
        screen.getByRole("button", { name: "Cerrar evaluación" })
      );

      const dialogo = await screen.findByRole("dialog");
      expect(dialogo).toHaveTextContent(
        /¿Cerrar la evaluación de Laura Ruiz\?/
      );
      // Las tres cosas que hay que saber antes de decidir.
      expect(dialogo).toHaveTextContent(/Se fijan los niveles/);
      expect(dialogo).toHaveTextContent(/se abre el plan de carrera/);
      expect(dialogo).toHaveTextContent(/No se deshace/);
      // Nada se cerró todavía.
      expect(screen.queryByText("Cerrada")).not.toBeInTheDocument();
    });

    it("desistir deja la evaluación en curso", async () => {
      await completar();
      fireEvent.click(
        screen.getByRole("button", { name: "Cerrar evaluación" })
      );
      const dialogo = await screen.findByRole("dialog");
      fireEvent.click(
        within(dialogo).getByRole("button", { name: "Cancelar" })
      );

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
      expect(screen.queryByText("Cerrada")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cerrar evaluación" })
      ).toBeInTheDocument();
    });

    it("confirmar cierra y deja la evaluación de sólo lectura", async () => {
      await completar();
      fireEvent.click(
        screen.getByRole("button", { name: "Cerrar evaluación" })
      );
      const dialogo = await screen.findByRole("dialog");
      fireEvent.click(
        within(dialogo).getByRole("button", { name: "Cerrar evaluación" })
      );

      expect(await screen.findByText("Cerrada")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cerrar evaluación" })
      ).not.toBeInTheDocument();
    });
  });

  describe("los estados del índice", () => {
    it("distingue evaluando, pendiente y evaluada", async () => {
      renderFor(LAURA);
      await screen.findByRole("heading", { name: "Desarrollo de software" });

      // Laura tiene 4 de 9 evaluadas. De las 5 que faltan, la abierta lleva
      // "Evaluando" y las otras 4 "Pendiente".
      expect(screen.getAllByText("Evaluando")).toHaveLength(1);
      expect(screen.getAllByText("Pendiente")).toHaveLength(4);

      // Las 4 ya evaluadas no llevan palabra: se dicen por su marca propia,
      // que es lo que el índice hacía a propósito y se conserva.
      const indice = screen
        .getByRole("heading", { name: "Habilidades" })
        .closest("div")!.parentElement as HTMLElement;
      const filas = within(indice).getAllByRole("button");
      expect(filas).toHaveLength(9);
      expect(
        filas.filter((b) => within(b).queryByText(/Evaluando|Pendiente/))
      ).toHaveLength(5);
    });

    it("el estado Evaluando acompaña a la habilidad que se abre", async () => {
      renderFor(LAURA);
      await screen.findByRole("heading", { name: "Desarrollo de software" });

      const antes = screen
        .getByText("Evaluando")
        .closest("button") as HTMLElement;
      expect(antes).toHaveTextContent("Desarrollo de software");

      fireEvent.click(screen.getByRole("button", { name: /Arquitectura/ }));

      await waitFor(() => {
        const ahora = screen
          .getByText("Evaluando")
          .closest("button") as HTMLElement;
        expect(ahora).toHaveTextContent("Arquitectura");
      });
      expect(screen.getAllByText("Evaluando")).toHaveLength(1);
    });
  });

  it("no deja cerrar incompleta y dice cuáles faltan", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    fireEvent.click(screen.getByRole("button", { name: "Cerrar evaluación" }));

    // Ni siquiera llega a preguntar: con habilidades sin nivel el cierre no
    // procede, y eso se sabe en la pantalla.
    const aviso = await screen.findByText(/Faltan por evaluar:/);
    expect(aviso).toHaveTextContent("Desarrollo de software");
    expect(
      screen.queryByRole("dialog", { name: /Cerrar la evaluación/ })
    ).not.toBeInTheDocument();
  });

  it("dice arriba por qué no cerró cuando lo bloquea la habilidad abierta", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    // Nivel elegido que abre brecha, sin nota: el cierre se frena en el
    // guardado, y el motivo tiene que verse donde está el botón.
    fireEvent.click(screen.getByRole("radio", { name: /1 · Principiante/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cerrar evaluación" }));

    expect(
      await screen.findByText(
        /No se pudo cerrar: Desarrollo de software quedó sin guardar/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Con brecha la nota es obligatoria.")
    ).toBeInTheDocument();
  });

  it("una evaluación cerrada es de sólo lectura", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });

    expect(screen.getByText("Cerrada")).toBeInTheDocument();
    expect(screen.getByText(/No se corrige/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cerrar evaluación" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Guardar y siguiente" })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")[0]).toBeDisabled();
  });

  it("desde una cerrada se puede abrir una evaluación nueva", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Conocimiento del negocio" });
    expect(screen.getByText("Cerrada")).toBeInTheDocument();

    // La regla dice que corregir es evaluar de nuevo; la acción está junto a
    // la regla, no escondida en otra pantalla.
    fireEvent.click(screen.getByRole("button", { name: "Evaluar de nuevo" }));

    expect(await screen.findByText("En curso")).toBeInTheDocument();
    expect(
      screen.getByText("0 de 9 habilidades evaluadas")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar evaluación" })
    ).toBeInTheDocument();
  });

  it("dice cuando el cargo no declara nivel, sin inventar una brecha", async () => {
    renderFor(LAURA);
    await screen.findByRole("heading", { name: "Desarrollo de software" });

    fireEvent.click(screen.getByRole("button", { name: /Arquitectura/ }));

    expect(
      await screen.findByText(/El cargo de QA Engineer no requiere un nivel/)
    ).toBeInTheDocument();

    const brecha = screen
      .getByRole("heading", { name: "Brecha" })
      .closest("section") as HTMLElement;
    expect(brecha).toHaveTextContent(
      "Su cargo no declara nivel en esta habilidad"
    );
    expect(brecha).not.toHaveTextContent("Le falta para");
    expect(within(brecha).queryAllByRole("listitem")).toHaveLength(0);
  });
});
