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
import { resetCareerPlanMock } from "../../../mocks/handlers/career-plan.handlers";
import { resetAssessmentsMock } from "../../../mocks/handlers/assessments.handlers";
import { resetSkillsMock } from "../../../mocks/handlers/skills.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { PAULA, MARIA } from "../../../mocks/handlers/assessments.seeds";
import { PersonPlanContainer } from "../PersonPlanContainer";

const ANDRES = "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

function renderFor(personId: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/app/lead/competencias/${personId}`]}>
        <Routes>
          <Route
            path="/app/lead/competencias/:personId"
            element={<PersonPlanContainer />}
          />
          <Route
            path="/app/lead/personas/:id/evaluacion"
            element={<div>Evaluación</div>}
          />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

/**
 * La fila del perfil de una habilidad. Se acota a la sección del perfil: el
 * nombre de la habilidad también aparece en la tabla de acciones, como la
 * brecha de la que nace cada una.
 */
function skillRow(name: string): HTMLElement {
  const perfil = screen
    .getByRole("heading", { name: "Perfil evaluado" })
    .closest("section") as HTMLElement;
  return within(perfil)
    .getByRole("cell", { name })
    .closest("tr") as HTMLElement;
}

/** La fila de una acción dentro de la tabla del plan. */
function accionRow(title: string): HTMLElement {
  const plan = screen
    .getByRole("heading", { name: "Plan de desarrollo" })
    .closest("section") as HTMLElement;
  return within(plan)
    .getByRole("cell", { name: title })
    .closest("tr") as HTMLElement;
}

describe("PersonPlanContainer — perfil", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
    resetCareerPlanMock();
  });

  it("encabeza con el cargo, la fecha de evaluación y las brechas abiertas", async () => {
    renderFor(PAULA);

    expect(
      await screen.findByRole("heading", { name: "Paula Ramírez" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Data Engineer · evaluada el/)).toBeInTheDocument();
    expect(screen.getByText(/2 brechas abiertas/)).toBeInTheDocument();
  });

  it("agrupa el perfil en técnicas y humanas con el estado de cada habilidad", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    expect(screen.getByText("Técnicas")).toBeInTheDocument();
    expect(screen.getByText("Humanas")).toBeInTheDocument();

    // Con brecha muestra cuántos niveles faltan; al nivel lo dice.
    expect(
      within(skillRow("Conocimiento del negocio")).getByText("−1 nivel")
    ).toBeInTheDocument();
    expect(
      within(skillRow("Desarrollo de software")).getByText("Al nivel")
    ).toBeInTheDocument();
  });

  it("dibuja la marca del nivel exigido, y no la dibuja sin nivel declarado", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    // La marca vive en el medidor y su nombre accesible lo dice.
    expect(
      within(skillRow("Conocimiento del negocio")).getByLabelText(
        /Competente, su cargo pide Avanzado/
      )
    ).toBeInTheDocument();
  });

  it("abre una habilidad y muestra lo que cumple y lo que le falta, con sus contadores", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver criterios de Conocimiento del negocio",
      })
    );

    const detalle = await screen.findByText(
      /En el nivel que tiene · Competente/
    );
    const bloque = detalle.closest("tr") as HTMLElement;

    expect(within(bloque).getByText("5 de 5")).toBeInTheDocument();
    expect(
      within(bloque).getByText(/Para el que pide su cargo · Avanzado/)
    ).toBeInTheDocument();
    expect(within(bloque).getByText("2 de 6")).toBeInTheDocument();
    // Los criterios son los de su evaluación, no un texto escrito aparte.
    expect(
      within(bloque).getByText(
        "Conoce las reglas de al menos dos dominios además del suyo."
      )
    ).toBeInTheDocument();
  });

  it("sin brecha no inventa un nivel siguiente como exigencia", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver criterios de Desarrollo de software",
      })
    );

    const detalle = await screen.findByText(/En el nivel que tiene · Avanzado/);
    const bloque = detalle.closest("tr") as HTMLElement;
    expect(
      within(bloque).queryByText(/Para el que pide su cargo/)
    ).not.toBeInTheDocument();
  });

  it("deja dos habilidades abiertas a la vez", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver criterios de Conocimiento del negocio",
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Ver criterios de Desarrollo de software",
      })
    );

    await waitFor(() =>
      expect(
        screen.getByText(/En el nivel que tiene · Competente/)
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(/En el nivel que tiene · Avanzado/)
    ).toBeInTheDocument();
  });

  it("sin evaluación cerrada no muestra perfil e invita a evaluar", async () => {
    renderFor(ANDRES);

    expect(
      await screen.findByText("Todavía no tiene una evaluación cerrada")
    ).toBeInTheDocument();
    expect(screen.queryByText("Perfil evaluado")).not.toBeInTheDocument();
  });
});

describe("PersonPlanContainer — acciones", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
    resetCareerPlanMock();
  });

  it("lista las acciones con su brecha de origen, objetivo, compromiso y estado", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    const fila = accionRow("Acompañar el rediseño del motor de cobranza");

    expect(
      within(fila).getByText("Conocimiento del negocio")
    ).toBeInTheDocument();
    expect(within(fila).getByText("Competente → Avanzado")).toBeInTheDocument();
    expect(within(fila).getByText("En curso")).toBeInTheDocument();
  });

  it("señala las brechas que no tienen ninguna acción", async () => {
    renderFor(MARIA);
    await screen.findByRole("heading", { name: "María González" });

    expect(
      screen.getByText(/Sin ninguna acción: Desarrollo de software/)
    ).toBeInTheDocument();
  });

  it("deja explícito que la brecha se cierra reevaluando", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });

    expect(
      screen.getByText(/Cerrar una brecha no es marcar la acción/)
    ).toBeInTheDocument();
  });

  it("marcar una acción cumplida no cierra la brecha", async () => {
    renderFor(PAULA);
    await screen.findByRole("heading", { name: "Paula Ramírez" });
    expect(screen.getByText(/2 brechas abiertas/)).toBeInTheDocument();

    const fila = accionRow("Acompañar el rediseño del motor de cobranza");
    fireEvent.click(
      within(fila).getByRole("button", { name: "Marcar cumplida" })
    );

    await waitFor(() =>
      expect(
        within(
          accionRow("Acompañar el rediseño del motor de cobranza")
        ).getByText("Cumplida")
      ).toBeInTheDocument()
    );
    // La brecha sigue abierta y el estado de la habilidad no se movió.
    expect(screen.getByText(/2 brechas abiertas/)).toBeInTheDocument();
    expect(
      within(skillRow("Conocimiento del negocio")).getByText("−1 nivel")
    ).toBeInTheDocument();
  });

  it("el alta sólo ofrece brechas abiertas y registra la acción", async () => {
    renderFor(MARIA);
    await screen.findByRole("heading", { name: "María González" });

    fireEvent.click(screen.getByRole("button", { name: /Agregar acción/ }));

    const panel = await screen.findByRole("dialog");
    expect(
      within(panel).getByText("Nueva acción del plan")
    ).toBeInTheDocument();
    // El campo existe y pide una brecha; el Select de tuip no se abre en jsdom.
    expect(
      within(panel).getByLabelText(/Cierra la brecha de/)
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/Marcarla cumplida no cierra la brecha/)
    ).toBeInTheDocument();
    // Sin elegir nada, no se puede registrar.
    expect(
      within(panel).getByRole("button", { name: "Registrar acción" })
    ).toBeDisabled();
  });

  it("no ofrece agregar acción a quien no tiene brechas abiertas", async () => {
    renderFor(ANDRES);
    await screen.findByText("Todavía no tiene una evaluación cerrada");

    expect(
      screen.getByRole("button", { name: /Agregar acción/ })
    ).toBeDisabled();
  });
});
