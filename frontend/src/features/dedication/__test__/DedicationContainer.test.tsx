import { describe, it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { http, HttpResponse } from "msw";
import { server } from "../../../mocks/server";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import { resetDedicationMock } from "../../../mocks/handlers/dedication.handlers";
import { resetPersonDetailMock } from "../../../mocks/handlers/personDetail.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetAbsencesMock } from "../../../mocks/handlers/absences.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import { resetSprintConfigMock } from "../../../mocks/handlers/sprint-config.handlers";
import { CAMILA } from "../../../mocks/handlers/personDetail.seeds";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { DedicationContainer } from "../DedicationContainer";

// Hace las veces de la franja del shell: ahí publica el listado su acción.
function BreadcrumbActionsProbe() {
  const { actions } = useLeadBreadcrumb();
  return <div data-testid="breadcrumb-actions">{actions}</div>;
}

function renderContainer() {
  return render(
    <ToastProvider>
      <LeadBreadcrumbProvider>
        <MemoryRouter initialEntries={["/capacidad/dedicacion"]}>
          <BreadcrumbActionsProbe />
          <DedicationContainer />
        </MemoryRouter>
      </LeadBreadcrumbProvider>
    </ToastProvider>
  );
}

const cardOf = (title: string) =>
  screen.getByText(title).closest('[class*="rounded-surface"]') as HTMLElement;

describe("DedicationContainer", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    resetDedicationMock();
    resetPersonDetailMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetPeopleMock();
    resetSquadsMock();
    resetSprintConfigMock();
  });

  it("indicadores por señal, tabla ordenada por señal accionable y una fila leída completa", async () => {
    renderContainer();
    expect(
      await screen.findByRole("link", { name: "Valentina Ospina" })
    ).toBeInTheDocument();

    // Los cuatro indicadores del sprint en curso, uno por señal accionable.
    const overload = cardOf("POSIBLE SOBREASIGNACIÓN");
    expect(within(overload).getByText("5")).toHaveClass("text-danger-default");
    expect(within(overload).getByText(/Carlos López/)).toBeInTheDocument();
    const underload = cardOf("POSIBLE SUBASIGNACIÓN");
    expect(within(underload).getByText("3")).toHaveClass(
      "text-warning-default"
    );
    const usual = cardOf("CARGA HABITUAL");
    expect(within(usual).getByText("2")).toBeInTheDocument();
    expect(
      within(usual).getByText("Dentro de la tolerancia de sus señales")
    ).toBeInTheDocument();
    expect(screen.queryByText("A REVISAR")).not.toBeInTheDocument();
    const notEvaluable = cardOf("NO EVALUABLES");
    expect(within(notEvaluable).getByText("/ 18")).toBeInTheDocument();
    expect(within(notEvaluable).getByText(/sin identidad/)).toBeInTheDocument();
    expect(
      within(notEvaluable).getByText(/histórico insuficiente/)
    ).toBeInTheDocument();

    // Orden: las dos señales accionables primero, luego la carga habitual y
    // al final lo que no se pudo evaluar.
    const links = screen
      .getAllByRole("link")
      .filter((a) =>
        a.getAttribute("href")?.startsWith("/capacidad/dedicacion/")
      );
    // Laura abre el listado: es la que más se desvía de lo suyo (+73 %).
    expect(links[0]).toHaveTextContent("Laura Ruiz");
    expect(links.slice(0, 8).map((a) => a.textContent)).toContain(
      "Carlos López"
    );

    // Carlos: capacidad sobre su contrato de 0.5 (media jornada), demanda en
    // SP contra su histórico, multitarea, y sólo el icono de señal al final.
    const carlosRow = screen
      .getByRole("link", { name: "Carlos López" })
      .closest("tr") as HTMLElement;
    expect(
      within(carlosRow).getByRole("img", {
        name: /Capacidad de Carlos López: 0\.45 \/ 0\.50 FTE/,
      })
    ).toBeInTheDocument();
    expect(
      within(carlosRow).getByRole("img", {
        name: "Demanda de Carlos López: 30 SP · habitual 22",
      })
    ).toBeInTheDocument();
    // La capacidad también en horas, y la desviación con su tolerancia.
    expect(
      within(carlosRow).getByText("36 h · −4 h por ausencias")
    ).toBeInTheDocument();
    expect(within(carlosRow).getByText("+36 %")).toBeInTheDocument();
    expect(within(carlosRow).getByText("Tolerancia ±25 %")).toBeInTheDocument();
    // El foco: las dos cifras que lo sostienen, bajo su medidor.
    expect(
      within(carlosRow).getByText("2 iniciativas · 4 HUs")
    ).toBeInTheDocument();
    expect(within(carlosRow).getByText("Backend Platform")).toBeInTheDocument();
    // Las iniciativas del sprint, no la activa de la célula. Sus dos épicas
    // cuelgan de la misma iniciativa: cuentan dos para la multitarea y dan una
    // sola marca, porque repetir el rótulo no dice en qué más anduvo.
    expect(within(carlosRow).getAllByText("Kafka Migration")).toHaveLength(1);
    // El sprint es del listado entero: no hay columna por fila.
    expect(within(carlosRow).queryByText("S18")).not.toBeInTheDocument();
    expect(
      within(carlosRow).getByRole("img", {
        name: "Posible sobreasignación · 4 señales concurrentes",
      })
    ).toBeInTheDocument();

    // Ni sprint, ni FTE comprometido, ni FTE asignado, ni actividad.
    const headers = screen
      .getAllByRole("columnheader")
      .map((h) => h.textContent);
    expect(headers).toEqual([
      "Colaborador",
      "Célula e iniciativas",
      "Capacidad",
      "Demanda vs habitual",
      "Foco",
      "Balance",
    ]);
    for (const header of headers) {
      expect(header).not.toMatch(/sprint|asignado|comprometido|actividad/i);
    }
  });

  it("los cuatro iconos de señal aparecen, y el no evaluable dice su motivo", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });

    expect(
      screen.getByRole("img", {
        name: "Posible sobreasignación · 4 señales concurrentes",
      })
    ).toHaveClass("text-danger-default");
    // La subasignación va en advertencia: es una decisión de carga, no contexto.
    expect(
      screen.getByRole("img", {
        name: "Posible subasignación · 3 señales concurrentes",
      })
    ).toHaveClass("text-warning-default");
    expect(
      screen.getAllByRole("img", { name: "Carga habitual" })[0]
    ).toHaveClass("text-success-default");
    // El estado intermedio ya no existe en ninguna fila.
    expect(screen.queryByRole("img", { name: /Revisar/ })).toBeNull();

    // Las no evaluables cierran el orden, así que caen en la segunda página.
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    await screen.findByRole("link", { name: "Camila Restrepo" });
    expect(
      screen.getAllByRole("img", {
        name: "No evaluable · Sin identidad DevOps",
      })[0]
    ).toHaveClass("text-neutral-subtlest");
    expect(
      screen.getByRole("img", {
        name: "No evaluable · Sin sprint en Azure DevOps",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "No evaluable · Histórico insuficiente" })
    ).toBeInTheDocument();
  });

  it("la célula que se comporta igual se anota en el tooltip de la fila", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    const paulaRow = screen
      .getByRole("link", { name: "Paula Ramírez" })
      .closest("tr") as HTMLElement;
    expect(
      within(paulaRow).getByRole("img", {
        name: "Posible subasignación · 3 señales concurrentes · la célula se comporta igual",
      })
    ).toBeInTheDocument();
  });

  it("no ofrece filtro por señal: los indicadores ya separan por señal", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    expect(
      screen.queryByRole("button", { name: /Señal/ })
    ).not.toBeInTheDocument();
  });

  it("filtra por célula con el desplegable de los demás listados, y el conteo lo dice", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    expect(screen.getByText("18 de 18 personas")).toBeInTheDocument();

    // El mismo FilterButton de Personas: se abre y se marca la opción.
    fireEvent.click(screen.getByRole("button", { name: /Célula/ }));
    fireEvent.click(
      await screen.findByRole("checkbox", { name: "Plataforma de Datos" })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("link", { name: "Valentina Ospina" })
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: "Paula Ramírez" })
    ).toBeInTheDocument();
    expect(screen.getByText("2 de 18 personas")).toBeInTheDocument();
    // Los indicadores describen el sprint, no el filtro.
    expect(
      within(cardOf("NO EVALUABLES")).getByText("/ 18")
    ).toBeInTheDocument();
  });

  it("el navegador de sprint mueve el listado entero", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    const strip = screen.getByTestId("breadcrumb-actions");
    expect(within(strip).getByText("S18")).toBeInTheDocument();
    expect(within(strip).getByText("En curso")).toBeInTheDocument();
    // En el sprint en curso no se avanza: mirar adelante no dice nada todavía.
    expect(
      within(strip).getByRole("button", { name: "Sprint siguiente" })
    ).toBeDisabled();

    fireEvent.click(
      within(strip).getByRole("button", { name: "Sprint anterior" })
    );
    await waitFor(() =>
      expect(within(strip).getByText("S17")).toBeInTheDocument()
    );
    expect(within(strip).queryByText("En curso")).not.toBeInTheDocument();
    // En un sprint sellado en el que todos cumplieron, nadie pide decisión.
    await waitFor(() =>
      expect(
        within(cardOf("POSIBLE SOBREASIGNACIÓN")).getByText("0")
      ).toBeInTheDocument()
    );
  });

  it("la fila sin identidad no trae cifras y sigue llevando a su dashboard", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o cargo"), {
      target: { value: "Camila" },
    });
    await waitFor(
      () => {
        expect(
          screen.getByRole("link", { name: "Camila Restrepo" })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("link", { name: "Valentina Ospina" })
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    const link = screen.getByRole("link", { name: "Camila Restrepo" });
    expect(link).toHaveAttribute("href", `/capacidad/dedicacion/${CAMILA}`);
    const row = link.closest("tr") as HTMLElement;
    expect(within(row).queryByRole("img", { name: /FTE/ })).toBeNull();
    expect(within(row).queryByRole("img", { name: /SP/ })).toBeNull();
    expect(
      within(row).getByRole("img", {
        name: "No evaluable · Sin identidad DevOps",
      })
    ).toBeInTheDocument();
  });

  it("actualizar todas desde la franja del breadcrumb: estado de actualización, toast y hora nueva", async () => {
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    const strip = screen.getByTestId("breadcrumb-actions");
    expect(within(strip).getByText(/Actualizado hace/)).toBeInTheDocument();
    const button = within(strip).getByRole("button", {
      name: "Actualizar",
    });
    fireEvent.click(button);
    expect(
      await within(strip).findByRole("button", { name: "Actualizando…" })
    ).toBeDisabled();
    expect(
      await screen.findByText("Actualizado desde Azure DevOps", undefined, {
        timeout: 3000,
      })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(strip).getByText("Actualizado hace un momento")
      ).toBeInTheDocument()
    );
  });

  it("si la actualización falla, avisa en rol de peligro y conserva los datos", async () => {
    server.use(
      http.post("/dedication/collaborators/sync", () =>
        HttpResponse.json({ message: "DevOps no responde" }, { status: 502 })
      )
    );
    renderContainer();
    await screen.findByRole("link", { name: "Valentina Ospina" });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(
      await screen.findByText("No se pudo actualizar desde Azure DevOps")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Valentina Ospina" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Actualizado hace/)).toBeInTheDocument();
  });

  it("sin colaboradores muestra el estado vacío y no la tabla", async () => {
    // Sin acotar por titular ya no hay forma de llegar al vacío entrando como
    // el lead de un chapter sin gente: el caso se produce cuando no hay
    // ninguna persona registrada, y se ejercita vaciando la respuesta.
    server.use(
      http.get("/dedication/collaborators", () =>
        HttpResponse.json({
          items: [],
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
          summary: {
            total: 0,
            possibleOverload: 0,
            possibleUnderload: 0,
            usual: 0,
            notEvaluable: 0,
            noIdentity: 0,
            noSprint: 0,
            insufficientHistory: 0,
            overloadPeople: [],
            underloadPeople: [],
          },
          sprint: null,
          settings: {
            hoursPerSprint: 80,
            historyWindow: 6,
            minSprintsToEvaluate: 3,
            tolerancePercentage: 25,
          },
          lastSyncedAt: null,
        })
      )
    );
    renderContainer();
    expect(await screen.findByText("Sin colaboradores")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("si el listado falla, muestra el error dentro de la tabla con reintento", async () => {
    server.use(
      http.get("/dedication/collaborators", () =>
        HttpResponse.json({ message: "Error de servidor" }, { status: 500 })
      )
    );
    renderContainer();
    expect(
      await screen.findByText("No se pudo cargar el balance de carga")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reintentar" })
    ).toBeInTheDocument();
  });
});
