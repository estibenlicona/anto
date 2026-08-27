import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetBillingMock } from "../../../../mocks/handlers/billing.handlers";
import { resetPeopleMock } from "../../../../mocks/handlers/people.handlers";
import { resetAbsencesMock } from "../../../../mocks/handlers/absences.handlers";
import { resetAllocationsMock } from "../../../../mocks/handlers/allocations.handlers";
import {
  CURRENT_PERIOD,
  PREVIOUS_PERIOD,
} from "../../../../mocks/handlers/billing.seeds";
import { useBillingPeriod } from "../useBillingPeriod";
import { useBilling } from "../useBilling";
import {
  useBillingMutations,
  type BillingMutationResult,
} from "../useBillingMutations";
import {
  availablePeriods,
  billingAdapter,
  digitsOnly,
  formatDigits,
  money,
  shortDate,
  periodLabel,
  periodTitle,
  shiftPeriod,
  signedMoney,
} from "../../adapters/BillingAdapter";

describe("BillingAdapter", () => {
  it("formatea pesos, períodos y deriva estado y permisos de la fila", () => {
    expect(money(7900000)).toMatch(/7\.900\.000/);
    expect(signedMoney(500000)).toMatch(/^\+/);
    expect(signedMoney(-1200000)).toMatch(/1\.200\.000/);
    expect(periodLabel("2026-08")).toBe("agosto 2026");
    expect(periodTitle("2026-08")).toBe("Agosto 2026");
    // Cruza el año en los dos sentidos.
    expect(shiftPeriod("2026-01", -1)).toBe("2025-12");
    expect(shiftPeriod("2025-12", 1)).toBe("2026-01");
    expect(shortDate("2026-07-08T16:20:00Z")).toBe("8 jul");
    expect(shortDate("2026-11-23T00:00:00Z")).toBe("23 nov");
    expect(digitsOnly("$ 11.500.000")).toBe("11500000");
    expect(formatDigits("11500000")).toBe("11.500.000");
    expect(formatDigits("950")).toBe("950");
    expect(formatDigits("")).toBe("");
    expect(availablePeriods("2026-02", 3)).toEqual([
      "2026-02",
      "2026-01",
      "2025-12",
    ]);
    const row = billingAdapter.toRow({
      id: "pref-x",
      personId: "p1",
      personName: "Carlos López",
      position: "Arquitecto",
      squadName: "Backend Platform",
      providerId: "x",
      providerName: "GFT",
      period: "2026-08",
      status: "Pending",
      monthlyCost: 7900000,
      absenceDiscount: null,
      adjustment: null,
      expected: 7900000,
      document: null,
      prefactured: null,
      difference: null,
      objection: null,
      approvalNote: null,
      createdAtUtc: "2026-08-01T00:00:00Z",
      approvedAtUtc: null,
    });
    // Sin prefactura no hay nada que revisar, pero sí dónde registrarla.
    expect(row).toMatchObject({
      statusLabel: "Sin prefactura",
      prefacturedText: "—",
      differenceText: "—",
      noveltiesText: "—",
      // La célula congelada responde mientras no haya imputación: es mejor
      // que un guion, que haría pensar que no se sabe.
      costObjectText: "Backend Platform",
      missingImputation: 7,
      canRegisterPrefacture: true,
      canApprove: false,
      canObject: false,
    });
  });

  it("una imputación incompleta se cuenta, no se disimula", () => {
    const base = {
      id: "pref-x",
      personId: "p1",
      personName: "Carlos López",
      position: "Arquitecto",
      squadName: "Backend Platform",
      providerId: "x",
      providerName: "GFT",
      period: "2026-08",
      status: "Received" as const,
      monthlyCost: 7900000,
      absenceDiscount: null,
      adjustment: null,
      expected: 7900000,
      prefactured: 7900000,
      difference: 0,
      objection: null,
      approvalNote: null,
      createdAtUtc: "2026-08-01T00:00:00Z",
      approvedAtUtc: null,
    };

    const completa = billingAdapter.toRow({
      ...base,
      document: {
        number: "PF-1",
        receivedAt: "2026-08-05",
        amount: 7900000,
        currency: "COP" as const,
        imputation: {
          costObject: "Backend Platform",
          concept: "Servicios",
          accountName: "Servicios técnicos",
          accountNumber: "5135-05",
          costCenter: "CC-1001",
          purchaseOrder: "OC-1",
          paymentAccount: "Bancolombia 4567",
        },
      },
    });
    expect(completa.missingImputation).toBe(0);

    const sinOrden = billingAdapter.toRow({
      ...base,
      document: {
        number: "PF-1",
        receivedAt: "2026-08-05",
        amount: 7900000,
        currency: "COP" as const,
        imputation: {
          costObject: "Backend Platform",
          concept: "Servicios",
          accountName: "Servicios técnicos",
          accountNumber: "5135-05",
          costCenter: "CC-1001",
          purchaseOrder: null,
          paymentAccount: "Bancolombia 4567",
        },
      },
    });
    // Lo que falta se cuenta: es lo que permite ir a buscarlo.
    expect(sinOrden.missingImputation).toBe(1);
    // Y la célula imputada sale del documento, no de la congelada.
    expect(sinOrden.costObjectText).toBe("Backend Platform");
  });
});

describe("useBillingPeriod", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetBillingMock();
  });

  it("trae filas por persona y stats contando sólo las prefacturas que llegaron", async () => {
    const prev = renderHook(() => useBillingPeriod(PREVIOUS_PERIOD));
    await waitFor(() => expect(prev.result.current.loading).toBe(false));
    // La unidad es la persona: hay una fila por externo, no por proveedor.
    expect(prev.result.current.rows.length).toBeGreaterThan(0);
    expect(prev.result.current.stats.objectedCount).toBeGreaterThan(0);

    const cur = renderHook(() => useBillingPeriod(CURRENT_PERIOD));
    await waitFor(() => expect(cur.result.current.loading).toBe(false));
    expect(cur.result.current.stats.prefactureCount).toBeGreaterThan(0);
    expect(cur.result.current.stats.toReviewCount).toBeGreaterThan(0);
  });
});

describe("useBilling + useBillingMutations", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetBillingMock();
  });

  it("ajustar y aprobar devuelven la factura actualizada; 404 marca notFound", async () => {
    // La unidad es la persona: el id sale del período, no de un cierre.
    const period = renderHook(() => useBillingPeriod(CURRENT_PERIOD));
    await waitFor(() => expect(period.result.current.loading).toBe(false));
    const id = period.result.current.rows.find((r) => r.document !== null)!.id;

    const { result } = renderHook(() => useBilling(id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const m = renderHook(() => useBillingMutations());
    let outcome: BillingMutationResult | undefined;
    await act(async () => {
      outcome = await m.result.current.adjust(id, {
        amount: -300000,
        reason: "Other",
        note: "",
      });
    });
    expect(outcome).toMatchObject({ success: true });
    await act(async () => {
      outcome = await m.result.current.approve(id, "Se acepta la diferencia");
    });
    expect(outcome?.success && outcome.billing?.status).toBe("Approved");
    const missing = renderHook(() => useBilling("nope"));
    await waitFor(() => expect(missing.result.current.loading).toBe(false));
    expect(missing.result.current.notFound).toBe(true);
  });
});
