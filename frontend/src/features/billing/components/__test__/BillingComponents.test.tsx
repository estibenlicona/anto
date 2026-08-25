import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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
});

describe("RegisterInvoiceDrawer", () => {
  const renderDrawer = (
    overrides: Partial<React.ComponentProps<typeof RegisterInvoiceDrawer>> = {}
  ) => {
    const onSubmit = vi.fn();
    render(
      <RegisterInvoiceDrawer
        open
        onOpenChange={vi.fn()}
        providerName="GFT"
        period="2026-07"
        expected={9800000}
        isCorrection={false}
        saving={false}
        serverError={null}
        onSubmit={onSubmit}
        {...overrides}
      />
    );
    return onSubmit;
  };

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
    expect(screen.getByText(/Difiere del esperado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(onSubmit).toHaveBeenCalledWith({
      number: "FE-2049",
      receivedAt: "2026-08-05",
      amount: 11300000,
      currency: "COP",
      imputation: {
        costObject: null,
        concept: null,
        accountName: null,
        accountNumber: null,
        costCenter: null,
        purchaseOrder: null,
        paymentAccount: null,
      },
    });
  });

  it("la corregida de una objetada se anuncia como tal", () => {
    renderDrawer({ isCorrection: true });
    expect(
      screen.getByText("Registrar prefactura corregida")
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
