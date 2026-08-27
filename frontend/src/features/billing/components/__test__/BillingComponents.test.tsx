import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BillingList } from "../BillingList";
import { AdjustLineDrawer } from "../AdjustLineDrawer";
import { RegisterInvoiceDrawer } from "../RegisterInvoiceDrawer";
import { BillingDecisionDialog } from "../BillingDecisionDialog";
import { billingAdapter } from "../../adapters/BillingAdapter";
import type {
  BillingStatus,
  PrefactureDto,
} from "../../services/billingService";

/**
 * Una prefactura de prueba. La unidad es la persona: ya no hay líneas dentro
 * de un cierre por proveedor.
 */
function prefacture(
  status: BillingStatus,
  overrides: Partial<PrefactureDto> = {}
): PrefactureDto {
  const monthlyCost = overrides.monthlyCost ?? 12000000;
  const absenceDiscount = overrides.absenceDiscount ?? null;
  const adjustment = overrides.adjustment ?? null;
  const expected =
    monthlyCost - (absenceDiscount?.amount ?? 0) + (adjustment?.amount ?? 0);
  const hasDocument = status !== "Pending";
  const prefactured = hasDocument
    ? (overrides.prefactured ?? monthlyCost)
    : null;
  return {
    id: `pref-${status}`,
    personId: `p-${status}`,
    personName: "Carlos López",
    position: "Backend Engineer",
    squadName: "Backend Platform",
    providerId: `prov-${status}`,
    providerName: "GFT",
    period: "2026-07",
    status,
    monthlyCost,
    absenceDiscount,
    adjustment,
    expected,
    document: hasDocument
      ? {
          number: "PF-2049",
          receivedAt: "2026-08-05",
          amount: prefactured ?? 0,
          currency: "COP",
          imputation: {
            costObject: "Backend Platform",
            concept: "Servicios profesionales",
            accountName: "Servicios técnicos",
            accountNumber: "5135-05",
            costCenter: "CC-1001",
            purchaseOrder: null,
            paymentAccount: "Bancolombia 4567",
          },
        }
      : null,
    prefactured,
    difference: prefactured === null ? null : prefactured - expected,
    objection: null,
    approvalNote: null,
    createdAtUtc: "2026-08-01T14:00:00Z",
    approvedAtUtc: null,
    ...overrides,
  };
}

function renderList(
  rows: PrefactureDto[],
  overrides: Partial<React.ComponentProps<typeof BillingList>> = {}
) {
  const handlers = {
    onOpen: vi.fn(),
    onRegisterInvoice: vi.fn(),
    onApprove: vi.fn(),
    onObject: vi.fn(),
    onRetry: vi.fn(),
    providers: [],
    selectedProviders: [],
    onProvidersChange: vi.fn(),
    search: "",
    onSearchChange: vi.fn(),
    page: 1,
    pageSize: 10,
    total: rows.length,
    totalPages: 1,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };
  render(
    <MemoryRouter>
      <BillingList
        rows={rows.map(billingAdapter.toRow)}
        loading={false}
        error={null}
        {...handlers}
        {...overrides}
      />
    </MemoryRouter>
  );
  return handlers;
}

describe("BillingList", () => {
  it("muestra una fila por persona, con su proveedor y su célula", () => {
    const conDiferencia = prefacture("InReview", {
      personName: "Carlos López",
      absenceDiscount: { businessDays: 3, amount: 1500000 },
      prefactured: 12000000,
    });
    renderList([
      conDiferencia,
      prefacture("Pending", {
        id: "pref-otra",
        personName: "Paula Ramírez",
        squadName: "Plataforma de Datos",
      }),
    ]);

    // La fila es la persona; el proveedor y la célula son datos suyos.
    const carlos = screen.getByText("Carlos López").closest("tr")!;
    expect(within(carlos).getByText("GFT")).toBeInTheDocument();
    expect(within(carlos).getByText("Backend Platform")).toBeInTheDocument();
    expect(screen.getByText("En revisión")).toBeInTheDocument();
    expect(screen.getByText("Sin prefactura")).toBeInTheDocument();

    // La diferencia por el descuento no aplicado se ve con signo.
    expect(within(carlos).getByText(/^\+/)).toBeInTheDocument();
    expect(within(carlos).getByText("3 días ausencia")).toBeInTheDocument();

    // Dos personas del mismo proveedor no comparten célula.
    const paula = screen.getByText("Paula Ramírez").closest("tr")!;
    expect(within(paula).getByText("Plataforma de Datos")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Carlos López" })).toHaveAttribute(
      "href",
      "/app/lead/facturacion/pref-InReview"
    );
  });

  it("el menú ofrece sólo las acciones que el estado permite", async () => {
    const handlers = renderList([
      prefacture("InReview", { personName: "Carlos López" }),
      prefacture("Pending", { id: "pref-otra", personName: "Paula Ramírez" }),
    ]);
    const inReview = screen.getByText("Carlos López").closest("tr")!;
    fireEvent.pointerDown(
      within(inReview).getByRole("button", { name: "Más acciones" })
    );
    // Con factura ya registrada no se vuelve a registrar.
    expect(
      await screen.findByRole("menuitem", { name: "Registrar prefactura" })
    ).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(screen.getByRole("menuitem", { name: "Objetar" }));
    expect(handlers.onObject).toHaveBeenCalledTimes(1);
    expect(handlers.onObject.mock.calls[0][0].providerName).toBe("GFT");
  });

  it("sin proveedores con externos muestra el estado vacío; el error ofrece reintentar", () => {
    const empty = renderList([]);
    expect(screen.getByText("No hay personas externas")).toBeInTheDocument();
    expect(empty.onRetry).not.toHaveBeenCalled();

    const failed = renderList([], { error: "Se cayó la red" });
    expect(screen.getByText("Se cayó la red")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(failed.onRetry).toHaveBeenCalledTimes(1);
  });

  it("sin filas con búsqueda o filtro activos invita a ajustarlos, no a asignar proveedor", () => {
    const searched = renderList([], { search: "zzz" });
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(
      screen.queryByText("No hay personas externas")
    ).not.toBeInTheDocument();
    // La barra sigue montada con lo escrito.
    expect(screen.getByRole("searchbox")).toHaveValue("zzz");
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zz" },
    });
    expect(searched.onSearchChange).toHaveBeenCalledWith("zz");
  });

  it("con filas muestra la paginación en el pie; sin filas, no", () => {
    renderList([], {});
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    cleanup();
    renderList([prefacture("InReview", { personName: "Carlos López" })], {
      total: 1,
    });
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
  });

  // El filtro es un slot de la tabla: con más de un proveedor se queda
  // montado mientras carga o falla, y el estado se lee bajo las cabeceras.
  it("con error mantiene el filtro de proveedor y muestra el error bajo las cabeceras", () => {
    renderList([], {
      error: "Se cayó la red",
      providers: ["Globant", "Endava"],
    });
    expect(
      screen.getByRole("button", { name: /Proveedor/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Persona" })
    ).toBeInTheDocument();
    expect(screen.getByText("Se cayó la red")).toBeInTheDocument();
  });
});

describe("RegisterInvoiceDrawer", () => {
  // Tarifa 12.000.000 − 3 días de ausencia 1.500.000 = esperado 10.500.000.
  const pending = () =>
    prefacture("Pending", {
      absenceDiscount: { businessDays: 3, amount: 1500000 },
    });

  const renderDrawer = (
    billing: PrefactureDto = pending(),
    overrides: Partial<React.ComponentProps<typeof RegisterInvoiceDrawer>> = {}
  ) => {
    const onSubmit = vi.fn();
    render(
      <RegisterInvoiceDrawer
        open
        onOpenChange={vi.fn()}
        billing={billing}
        saving={false}
        serverError={null}
        onSubmit={onSubmit}
        {...overrides}
      />
    );
    return onSubmit;
  };

  it("nombra a la persona, el proveedor y el mes, y desglosa el esperado", () => {
    renderDrawer();
    expect(
      screen.getByText("Carlos López · GFT · julio 2026")
    ).toBeInTheDocument();
    expect(screen.getByText("Esperado del período")).toBeInTheDocument();
    expect(screen.getByText(/Tarifa \$\s?12\.000\.000/)).toBeInTheDocument();
    expect(
      screen.getByText(/3 días de ausencia \$\s?1\.500\.000/)
    ).toBeInTheDocument();
    // Sin valor todavía, no hay lectura de diferencia.
    expect(screen.queryByText(/Difiere en/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Sin diferencia contra lo esperado")
    ).not.toBeInTheDocument();
  });

  it("exige número, fecha y monto antes de registrar", () => {
    const onSubmit = renderDrawer();
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Escribe el número")).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona la fecha de recepción")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escribe el valor de la prefactura")
    ).toBeInTheDocument();
  });

  it("avisa cuando el monto difiere de lo esperado, y registra igual", () => {
    const onSubmit = renderDrawer();
    fireEvent.change(screen.getByLabelText("Número de prefactura"), {
      target: { value: "FE-2049" },
    });
    fireEvent.change(screen.getByLabelText("Fecha de recepción"), {
      target: { value: "2026-08-05" },
    });
    fireEvent.change(screen.getByLabelText("Valor total"), {
      target: { value: "11300000" },
    });
    // Se muestra con puntos de miles y se compara contra 10.500.000.
    expect(screen.getByLabelText("Valor total")).toHaveValue("11.300.000");
    expect(screen.getByText(/Difiere en \+\$\s?800\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Se registra igual/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(onSubmit).toHaveBeenCalledWith({
      number: "FE-2049",
      receivedAt: "2026-08-05",
      amount: 11300000,
      currency: "COP",
      imputation: {
        // La célula de la persona llega prellenada; el concepto es sólo
        // placeholder y viaja vacío.
        costObject: "Backend Platform",
        concept: null,
        accountName: null,
        accountNumber: null,
        costCenter: null,
        purchaseOrder: null,
        paymentAccount: null,
      },
    });
  });

  it("'Usar el esperado' llena el valor y lo deja sin diferencia; pegar texto deja sólo dígitos", () => {
    renderDrawer();
    fireEvent.click(screen.getByRole("button", { name: "Usar el esperado" }));
    expect(screen.getByLabelText("Valor total")).toHaveValue("10.500.000");
    expect(
      screen.getByText("Sin diferencia contra lo esperado")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Valor total"), {
      target: { value: "$ 11.500.000" },
    });
    expect(screen.getByLabelText("Valor total")).toHaveValue("11.500.000");
  });

  it("permite adjuntar el PDF y quitarlo, sin que cambie lo que se envía", () => {
    const onSubmit = renderDrawer();
    // FileInput de tuip: zona de arrastre sobre un input real, sólo PDF.
    const input = screen.getByLabelText("Cargar PDF");
    expect(input).toHaveAttribute("accept", "application/pdf");

    const file = new File(["%PDF-1.7"], "prefactura-agosto.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText("prefactura-agosto.pdf")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Quitar archivo" }));
    expect(screen.queryByText("prefactura-agosto.pdf")).not.toBeInTheDocument();

    // El PDF no viaja en la petición: el registro sigue siendo el de siempre.
    fireEvent.change(screen.getByLabelText("Número de prefactura"), {
      target: { value: "FE-2049" },
    });
    fireEvent.change(screen.getByLabelText("Fecha de recepción"), {
      target: { value: "2026-08-05" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Usar el esperado" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(Object.keys(onSubmit.mock.calls[0][0])).toEqual([
      "number",
      "receivedAt",
      "amount",
      "currency",
      "imputation",
    ]);
  });

  it("los datos de prefactura se anuncian opcionales, sin texto explicativo, y parten de lo que se sabe de la persona", () => {
    renderDrawer();
    expect(screen.getByText("Datos de prefactura")).toBeInTheDocument();
    expect(screen.getByText("Opcional")).toBeInTheDocument();
    expect(
      screen.queryByText(/Suele llegar después que el documento/)
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Célula o CoE")).toHaveValue(
      "Backend Platform"
    );
    expect(screen.getByLabelText("Concepto")).toHaveValue("");
    expect(screen.getByLabelText("Concepto")).toHaveAttribute(
      "placeholder",
      "Ej. Servicios profesionales"
    );
    // Sin célula asignada, el campo abre vacío.
    cleanup();
    renderDrawer(prefacture("Pending", { squadName: null }));
    expect(screen.getByLabelText("Célula o CoE")).toHaveValue("");
  });

  it("la corregida muestra la objeción, hereda la imputación y lo dice en el botón", () => {
    renderDrawer(
      prefacture("Objected", {
        objection: {
          reason: "No descontaron la incapacidad de Carlos",
          objectedAtUtc: "2026-07-08T16:20:00Z",
        },
      })
    );
    expect(
      screen.getByText("Registrar prefactura corregida")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/vuelve a revisión con las cifras nuevas/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Objetada el 8 jul · PF-2049 por \$\s?12\.000\.000/)
    ).toBeInTheDocument();
    expect(
      screen.getByText("«No descontaron la incapacidad de Carlos»")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Cuenta contable")).toHaveValue(
      "Servicios técnicos"
    );
    expect(screen.getByLabelText("Cuenta destinada al pago")).toHaveValue(
      "Bancolombia 4567"
    );
    expect(screen.getByLabelText("Orden de compra")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Registrar corregida" })
    ).toBeInTheDocument();
  });
});

describe("BillingDecisionDialog", () => {
  const renderDialog = (
    dto: PrefactureDto,
    decision: "Approved" | "Objected"
  ) => {
    const onConfirm = vi.fn();
    render(
      <BillingDecisionDialog
        open
        onOpenChange={vi.fn()}
        billing={dto}
        decision={decision}
        busy={false}
        serverError={null}
        onConfirm={onConfirm}
      />
    );
    return onConfirm;
  };

  it("aprobar sin diferencia confirma sin pedir nota", () => {
    const conforme = prefacture("InReview", { prefactured: 12000000 });
    const onConfirm = renderDialog(conforme, "Approved");
    expect(
      screen.queryByLabelText("Nota de aprobación")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    expect(onConfirm).toHaveBeenCalledWith("");
  });

  it("aprobar con diferencia exige la nota que la justifica", () => {
    const conDiferencia = prefacture("InReview", {
      absenceDiscount: { businessDays: 3, amount: 1500000 },
      prefactured: 12000000,
    });
    const onConfirm = renderDialog(conDiferencia, "Approved");
    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByText("Escribe la nota que justifica aprobar con diferencia")
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nota de aprobación"), {
      target: { value: "Se acepta y se descuenta el mes que viene" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));
    expect(onConfirm).toHaveBeenCalledWith(
      "Se acepta y se descuenta el mes que viene"
    );
  });

  it("objetar siempre exige motivo", () => {
    const onConfirm = renderDialog(prefacture("Received"), "Objected");
    fireEvent.click(screen.getByRole("button", { name: "Objetar" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByText("Escribe el motivo de la objeción")
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Motivo de la objeción"), {
      target: { value: "No aplicaron el descuento de Carlos" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Objetar" }));
    expect(onConfirm).toHaveBeenCalledWith(
      "No aplicaron el descuento de Carlos"
    );
  });
});

describe("AdjustLineDrawer", () => {
  const renderDrawer = (target: PrefactureDto | null) => {
    const onSubmit = vi.fn();
    render(
      <AdjustLineDrawer
        open
        onOpenChange={vi.fn()}
        line={target}
        saving={false}
        serverError={null}
        onSubmit={onSubmit}
      />
    );
    return onSubmit;
  };

  it("exige monto entero distinto de cero y motivo antes de guardar", () => {
    const onSubmit = renderDrawer(
      prefacture("InReview", { personName: "Camila Restrepo" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Ingresa un monto entero en pesos")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona el motivo del ajuste")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Monto/), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("El ajuste no puede ser cero; un negativo descuenta")
    ).toBeInTheDocument();
  });

  it("el descuento por ausencias ya está en la base y no se edita acá", () => {
    const target = prefacture("InReview", {
      personName: "Camila Restrepo",
      monthlyCost: 9000000,
      absenceDiscount: { businessDays: 4, amount: 1200000 },
      adjustment: {
        amount: 500000,
        reason: "Overtime",
        note: "8 h del cierre.",
      },
    });
    const onSubmit = renderDrawer(target);
    expect(screen.getByText("Ajustar a Camila Restrepo")).toBeInTheDocument();
    expect(
      screen.getByText(/Ya descuenta .* por ausencias aprobadas/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Monto/)).toHaveValue(500000);
    // 9.000.000 − 1.200.000 + 500.000: la base descuenta las ausencias.
    expect(screen.getByText(/8\.300\.000/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Monto/), {
      target: { value: "600000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }));
    expect(onSubmit).toHaveBeenCalledWith({
      amount: "600000",
      reason: "Overtime",
      note: "8 h del cierre.",
    });
  });
});
