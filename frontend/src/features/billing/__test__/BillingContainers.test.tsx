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
import { resetBillingMock } from "../../../mocks/handlers/billing.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { resetAbsencesMock } from "../../../mocks/handlers/absences.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import {
  CURRENT_PERIOD,
  PREVIOUS_PERIOD,
} from "../../../mocks/handlers/billing.seeds";
import { billingService } from "../services/billingService";
import { BillingContainer } from "../BillingContainer";
import { BillingDetailContainer } from "../BillingDetailContainer";

const LIST_PATH = "/app/lead/facturacion";

function renderList(search = "") {
  return render(
    <MemoryRouter initialEntries={[`${LIST_PATH}${search}`]}>
      <ToastProvider>
        <Routes>
          <Route path={LIST_PATH} element={<BillingContainer />} />
          <Route path={`${LIST_PATH}/:id`} element={<h1>Detalle</h1>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
}

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`${LIST_PATH}/${id}`]}>
      <ToastProvider>
        <Routes>
          <Route path={LIST_PATH} element={<h1>Listado</h1>} />
          <Route
            path={`${LIST_PATH}/:id`}
            element={<BillingDetailContainer billingId={id} />}
          />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
}

/** El id de la primera prefactura del mes que ya tiene documento. */
async function firstWithDocument(): Promise<string> {
  const rows = await billingService.listPeriod(CURRENT_PERIOD);
  return rows.find((r) => r.document !== null)!.id;
}

describe("BillingContainer", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetBillingMock();
  });

  it("el mes en curso muestra la prefactura en revisión y generar completa el esperado que falta", async () => {
    renderList();
    expect(await screen.findByText("Andrés Martínez")).toBeInTheDocument();
    // GFT ya tiene factura; los otros dos no tienen ni el esperado.
    expect(screen.getAllByText("En revisión").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sin esperado")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "Generar el esperado del mes" })
    );
    await waitFor(() =>
      expect(screen.getAllByText("Sin prefactura")).toHaveLength(2)
    );
    expect(
      await screen.findByText(/Esperado generado para/)
    ).toBeInTheDocument();
    // Ya generados, no queda nada por generar.
    expect(
      screen.getByRole("button", { name: "Generar el esperado del mes" })
    ).toBeDisabled();
  });

  it("la card del período compara prefacturado contra esperado y nombra la diferencia", async () => {
    renderList();
    await screen.findAllByText("En revisión");
    const card = screen
      .getByText("Esperado vs prefacturado")
      .closest("div")!.parentElement!;
    // La semilla del mes trae el caso del diseño: facturaron sin descontar
    // una ausencia aprobada, así que la lectura es "por encima".
    expect(
      within(card).getByText(/por encima de lo esperado/)
    ).toBeInTheDocument();
  });

  it("el período se lee en el encabezado, no entre los filtros del listado", async () => {
    renderList();
    await screen.findByText("Carlos López");

    // Manda sobre todo lo que la pantalla muestra, indicadores incluidos: no
    // puede tener el mismo peso que un filtro de la tabla.
    const selector = screen.getByRole("combobox", { name: /Período/ });
    const encabezado = screen.getByRole("heading", {
      name: "Prefacturas",
    }).parentElement!;
    expect(encabezado.contains(selector)).toBe(true);
  });

  it("el listado se puede acotar por proveedor, que sigue siendo con quien se reclama", async () => {
    renderList();
    await screen.findByText("Carlos López");

    // Con externos de varios proveedores, el filtro aparece.
    expect(
      screen.getByRole("button", { name: /Proveedor/ })
    ).toBeInTheDocument();
  });

  it("objetar desde el listado exige motivo y deja la prefactura objetada", async () => {
    renderList();
    const row = (await screen.findByText("Carlos López")).closest("tr")!;
    fireEvent.pointerDown(
      within(row).getByRole("button", { name: "Más acciones" })
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Objetar" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Objetar" }));
    expect(
      await screen.findByText("Escribe el motivo de la objeción")
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText("Motivo de la objeción"), {
      target: { value: "No descontaron la incapacidad de Carlos" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Objetar" }));

    await waitFor(() =>
      expect(screen.getByText("Objetada")).toBeInTheDocument()
    );
    const updated = await billingService.get(await firstWithDocument());
    expect(updated.status).toBe("Objected");
    expect(updated.objection?.reason).toBe(
      "No descontaron la incapacidad de Carlos"
    );
  });

  it("abrir desde el menú lleva al detalle", async () => {
    renderList(`?period=${PREVIOUS_PERIOD}`);
    const row = (await screen.findByText("Carlos López")).closest("tr")!;
    fireEvent.pointerDown(
      within(row).getByRole("button", { name: "Más acciones" })
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Abrir" }));
    expect(
      await screen.findByRole("heading", { name: "Detalle" })
    ).toBeInTheDocument();
  });
});

describe("BillingDetailContainer", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetBillingMock();
  });

  it("revisa la prefactura: encabezado por persona e imputación completa", async () => {
    const target = (await billingService.listPeriod(CURRENT_PERIOD)).find(
      (r) => r.document !== null
    )!;
    renderDetail(target.id);

    // El encabezado es la persona; el proveedor y el mes son su subtítulo.
    expect(
      await screen.findByRole("heading", { name: target.personName })
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(target.providerName))
    ).toBeInTheDocument();

    // La imputación se lee entera, sin salir de la pantalla.
    expect(screen.getByText("Célula o CoE")).toBeInTheDocument();
    expect(screen.getByText("Cuenta contable")).toBeInTheDocument();
    expect(screen.getByText("Centro de costos")).toBeInTheDocument();
    expect(screen.getByText("Orden de compra")).toBeInTheDocument();

    // Y lo que nadie llenó se dice, en vez de dejarse en blanco.
    expect(screen.getAllByText("Falta").length).toBeGreaterThan(0);

    expect(
      screen.getByText(/no se digitan acá: sólo se comprueba/)
    ).toBeInTheDocument();
  });

  it("el ajuste suma sobre el esperado y recalcula la diferencia", async () => {
    // El ajuste se hace por servicio: elegir el motivo abre un Select de Radix
    // dentro del Drawer, que en jsdom cierra el drawer al seleccionar (en el
    // navegador funciona). La validación del motivo ya está cubierta en la
    // prueba del propio drawer.
    const target = (await billingService.listPeriod(CURRENT_PERIOD)).find(
      (r) => r.document !== null
    )!;
    const antes = target.expected;

    const ajustada = await billingService.adjust(target.id, {
      amount: 300000,
      reason: "Overtime",
      note: "8 h del cierre",
    });

    expect(ajustada.adjustment?.amount).toBe(300000);
    expect(ajustada.expected).toBe(antes + 300000);
    // Lo prefacturado no cambió: la diferencia se mueve con el esperado.
    expect(ajustada.difference).toBe((target.difference ?? 0) - 300000);
  });

  it("aprobar con diferencia exige nota y deja la prefactura de sólo lectura", async () => {
    renderDetail(await firstWithDocument());
    fireEvent.click(
      await screen.findByRole("button", { name: "Aprobar prefactura" })
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Aprobar" }));
    expect(
      await screen.findByText(
        "Escribe la nota que justifica aprobar con diferencia"
      )
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText("Nota de aprobación"), {
      target: { value: "Se descuenta en la prefactura del mes que viene" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Aprobar" }));

    expect(
      (await screen.findAllByText("Prefactura aprobada")).length
    ).toBeGreaterThan(0);
    // Sin acciones de línea ni de decisión: sólo lectura.
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Acciones de Carlos López" })
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole("button", { name: "Objetar con nota" })
    ).not.toBeInTheDocument();
    const stored = await billingService.get(await firstWithDocument());
    expect(stored.status).toBe("Approved");
    expect(stored.approvalNote).toContain("mes que viene");
  });

  it("una objetada espera la corregida y registrarla la devuelve a revisión", async () => {
    const objected = (await billingService.listPeriod(PREVIOUS_PERIOD)).find(
      (r) => r.status === "Objected"
    )!;
    renderDetail(objected.id);
    expect(await screen.findByText("Objetada")).toBeInTheDocument();
    expect(
      screen.getByText(/Facturaron a Camila completa/)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Registrar corregida" })
    );
    fireEvent.change(await screen.findByLabelText("Número de prefactura"), {
      target: { value: "QV-8872" },
    });
    fireEvent.change(screen.getByLabelText("Fecha de recepción"), {
      target: { value: `${PREVIOUS_PERIOD}-20` },
    });
    fireEvent.change(screen.getByLabelText("Valor total"), {
      target: { value: "7000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() =>
      expect(screen.getByText("Recibida")).toBeInTheDocument()
    );
    expect((await billingService.get(objected.id)).document?.number).toBe(
      "QV-8872"
    );
  });

  it("un id inexistente muestra el estado vacío con la vuelta al listado", async () => {
    renderDetail("no-existe");
    expect(
      await screen.findByText("No encontramos esa prefactura")
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Volver a Facturación" })
    );
    expect(
      await screen.findByRole("heading", { name: "Listado" })
    ).toBeInTheDocument();
  });

  it("el período del listado sigue al mes en curso, no a una fecha fija", async () => {
    renderList();
    await screen.findAllByText("En revisión");
    // El selector arranca en el mes corriente calculado, no en uno fijo.
    expect(
      screen.getByRole("combobox", { name: /Período/ }).textContent
    ).toContain(CURRENT_PERIOD.slice(0, 4));
  });
});
