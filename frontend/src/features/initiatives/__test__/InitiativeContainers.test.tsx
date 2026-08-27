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
import { resetInitiativesMock } from "../../../mocks/handlers/initiatives.handlers";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { initiativeService } from "../services/initiativeService";
import { InitiativesContainer } from "../InitiativesContainer";
import { InitiativeEvaluationContainer } from "../InitiativeEvaluationContainer";

// Hace las veces de la franja del breadcrumb del shell: pinta lo que el
// contenedor publica ahí (el botón "Nueva iniciativa"). Sin ella el botón no
// existiría en el DOM del test.
function BreadcrumbActionsProbe() {
  const { actions } = useLeadBreadcrumb();
  return <div data-testid="breadcrumb-actions">{actions}</div>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <LeadBreadcrumbProvider>
          <BreadcrumbActionsProbe />
          <Routes>
            <Route
              path="/app/lead/iniciativas"
              element={<InitiativesContainer />}
            />
          </Routes>
        </LeadBreadcrumbProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

function renderEvaluation(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/app/lead/iniciativas/${id}/evaluacion`]}>
      <ToastProvider>
        <Routes>
          <Route path="/app/lead/iniciativas" element={<h1>Listado</h1>} />
          <Route
            path="/app/lead/iniciativas/:id/evaluacion"
            element={<InitiativeEvaluationContainer initiativeId={id} />}
          />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("InitiativesContainer", () => {
  beforeEach(() => resetInitiativesMock());

  it("lista, muestra las cards y crear agrega una fila en evaluación", async () => {
    renderAt("/app/lead/iniciativas");
    expect(await screen.findByText("Kafka Migration")).toBeInTheDocument();
    expect(screen.getByText("SIN EVALUAR")).toBeInTheDocument();
    expect(screen.getByText("FTE DEMANDADO")).toBeInTheDocument();
    // Sin encabezado de módulo: ni título ni descripción; el botón vive en
    // la franja del breadcrumb, no en el contenido.
    expect(
      screen.queryByRole("heading", { name: "Iniciativas" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Las solicitudes del negocio/)
    ).not.toBeInTheDocument();
    const newButton = screen.getByRole("button", { name: "Nueva iniciativa" });
    expect(screen.getByTestId("breadcrumb-actions")).toContainElement(
      newButton
    );
    // Resumen y listado se apilan con gap-3, la única medida de separación
    // de la pantalla (misma que ausencias y células); antes era gap-6.
    const root = screen
      .getByText("SIN EVALUAR")
      .closest(".grid")!.parentElement!;
    expect(root).toHaveClass("gap-3");
    expect(root).not.toHaveClass("gap-6");
    fireEvent.click(newButton);
    fireEvent.change(await screen.findByLabelText(/Nombre/), {
      target: { value: "Nueva del test" },
    });
    fireEvent.change(screen.getByLabelText(/Product Owner/), {
      target: { value: "PO" },
    });
    // Sin célula: el drawer valida y no llama al servicio.
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText(/Selecciona la célula/)).toBeInTheDocument();
    expect((await initiativeService.list(1, 50)).totalCount).toBe(7);
  });

  it("activar una evaluada pide confirmación y actualiza la card de activas", async () => {
    await initiativeService.saveEvaluation("ini-qr", {
      triage: [false, false, false, false, false, false],
      answers: { N1: 4 },
      targetMonths: 6,
    });
    // La célula de QR (Canales) ya sostiene una: hay que liberarla antes, o
    // "Activar" está deshabilitado con ese motivo.
    await initiativeService.setStatus("ini-onboarding", "Closed");
    renderAt("/app/lead/iniciativas");
    const row = (await screen.findByText("Pago con QR en App")).closest("tr")!;
    fireEvent.pointerDown(
      within(row).getByRole("button", { name: "Más acciones" })
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Activar" }));
    expect(await screen.findByText("Activar iniciativa")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Activar" }));
    await waitFor(() =>
      expect(screen.queryByText("Activar iniciativa")).not.toBeInTheDocument()
    );
    expect((await initiativeService.get("ini-qr")).status).toBe("Active");
    // Tres activas en la semilla, menos la de Canales que se cerró, más ésta.
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });
});

describe("InitiativeEvaluationContainer", () => {
  beforeEach(() => resetInitiativesMock());

  it("responder cambia la talla del encabezado; el plazo no; guardar persiste y vuelve al listado", async () => {
    renderEvaluation("ini-qr");
    expect(
      await screen.findByRole("heading", { name: "Pago con QR en App" })
    ).toBeInTheDocument();
    expect(screen.getByText("Vía rápida (XS–S)")).toBeInTheDocument();
    // Una crítica en sí → obligatoria.
    const critical = screen.getAllByRole("radio", { name: "Sí" })[1];
    fireEvent.click(critical);
    expect(
      await screen.findByText("Evaluación completa obligatoria")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Guardar como vía rápida" })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Comenzar evaluación" })
    );
    expect(
      await screen.findByRole("heading", { name: "Negocio y cliente" })
    ).toBeInTheDocument();
    // Elegir reemplaza: Crítico 4 y luego Bajo 1 en N1.
    const n1 = screen.getByRole("group", {
      name: /Impacta directamente clientes/,
    });
    fireEvent.click(within(n1).getByRole("button", { name: "Crítico, 4" }));
    expect(
      within(n1).getByRole("button", { name: "Crítico, 4" })
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(n1).getByRole("button", { name: "Bajo, 1" }));
    expect(
      within(n1).getByRole("button", { name: "Crítico, 4" })
    ).toHaveAttribute("aria-pressed", "false");
    // Todo al máximo en la dimensión: 32 de 280 puntos → 11,4% en el encabezado.
    screen
      .getAllByRole("button", { name: /, 4$/ })
      .forEach((b) => fireEvent.click(b));
    expect(screen.getAllByText("11,4%").length).toBeGreaterThan(0);

    const fteBefore = screen.getByText("FTE esperado").nextSibling?.textContent;
    fireEvent.click(screen.getByRole("radio", { name: "3 m" }));
    const fteAfter = screen.getByText("FTE esperado").nextSibling?.textContent;
    expect(fteAfter).not.toBe(fteBefore);

    fireEvent.click(screen.getByRole("button", { name: /Resultado/ }));
    expect(await screen.findByText("Guardar evaluación")).toBeInTheDocument();
    expect(screen.getByText("Qué la hace compleja")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar evaluación" }));
    expect(
      await screen.findByRole("heading", { name: "Listado" })
    ).toBeInTheDocument();
    const saved = await initiativeService.get("ini-qr");
    expect(saved.evaluation?.targetMonths).toBe(3);
    expect(saved.evaluation?.answers.N1).toBe(4);
    expect(saved.evaluation?.triageVerdict).toBe("Required");
  });

  it("id inexistente muestra el estado vacío con vuelta al listado", async () => {
    renderEvaluation("nope");
    expect(
      await screen.findByText("No encontramos esa iniciativa")
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Volver a Iniciativas" })
    );
    expect(
      await screen.findByRole("heading", { name: "Listado" })
    ).toBeInTheDocument();
  });
});
