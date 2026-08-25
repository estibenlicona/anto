import { describe, it, expect, beforeEach } from "vitest";
import { billingService } from "@features/billing/services/billingService";
import { absenceService } from "@features/absences/services/absenceService";
import { resetBillingMock } from "../billing.handlers";
import { resetPeopleMock } from "../people.handlers";
import { resetAbsencesMock } from "../absences.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { CURRENT_PERIOD, GFT, PREVIOUS_PERIOD } from "../billing.seeds";

const CARLOS = "p3333333-3333-3333-3333-333333333333";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

/** El primer día hábil del período, para registrar ausencias de prueba. */
function firstBusinessDay(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return `${period}-${String(d.getDate()).padStart(2, "0")}`;
}

const doc = (over: Record<string, unknown> = {}) => ({
  number: "PF-9001",
  receivedAt: `${CURRENT_PERIOD}-05`,
  amount: 1_000_000,
  currency: "COP" as const,
  imputation: {
    costObject: "Backend Platform",
    concept: "Servicios profesionales",
    accountName: "Servicios técnicos",
    accountNumber: "5135-05",
    costCenter: "CC-1001",
    purchaseOrder: "OC-1",
    paymentAccount: "Bancolombia 4567",
  },
  ...over,
});

describe("mock de prefacturas", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetBillingMock();
  });

  it("lista el período con una prefactura por persona externa", async () => {
    const rows = await billingService.listPeriod(CURRENT_PERIOD);

    // La unidad es la persona: cada fila trae su proveedor, no al revés.
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.personId).toBeTruthy();
      expect(r.providerName).toBeTruthy();
      expect(r.period).toBe(CURRENT_PERIOD);
    }
    // Y una persona no aparece dos veces en el mismo período.
    const ids = rows.map((r) => r.personId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("dos personas del mismo proveedor son prefacturas independientes", async () => {
    // Es la razón por la que la unidad cambió: con una sola por proveedor no
    // se puede probar que cada persona lleva su propia imputación.
    const rows = await billingService.listPeriod(CURRENT_PERIOD);
    const gft = rows.filter((r) => r.providerId === GFT);

    expect(gft.length).toBeGreaterThan(1);
    expect(new Set(gft.map((r) => r.id)).size).toBe(gft.length);
    // Y están en células distintas.
    expect(new Set(gft.map((r) => r.squadName)).size).toBeGreaterThan(1);
  });

  it("el descuento se deriva de las ausencias aprobadas y no se digita", async () => {
    const antes = (await billingService.listPeriod(CURRENT_PERIOD)).find(
      (r) => r.personId === CARLOS
    )!;
    const esperadoAntes = antes.expected;

    const ausencia = await absenceService.create({
      personId: CARLOS,
      type: "Vacation",
      startDate: firstBusinessDay(CURRENT_PERIOD),
      endDate: firstBusinessDay(CURRENT_PERIOD),
    });
    await absenceService.approve(ausencia.id);

    const despues = (await billingService.listPeriod(CURRENT_PERIOD)).find(
      (r) => r.personId === CARLOS
    )!;
    expect(despues.absenceDiscount).not.toBeNull();
    expect(despues.expected).toBeLessThan(esperadoAntes);
  });

  it("genera el esperado sin duplicar y congela la tarifa", async () => {
    const futuro = "2031-03";
    const creadas = await billingService.generate(futuro);
    expect(creadas.length).toBeGreaterThan(0);

    const otraVez = await billingService.generate(futuro);
    expect(otraVez).toHaveLength(0);

    const rows = await billingService.listPeriod(futuro);
    expect(rows.every((r) => r.monthlyCost > 0)).toBe(true);
  });

  it("registra la prefactura: una por persona y período", async () => {
    const futuro = "2031-04";
    await billingService.generate(futuro);
    const target = (await billingService.listPeriod(futuro))[0];

    const registrada = await billingService.registerPrefacture(
      target.id,
      doc({ receivedAt: `${futuro}-05` })
    );
    expect(registrada.status).toBe("Received");
    expect(registrada.document?.number).toBe("PF-9001");
    expect(registrada.prefactured).toBe(1_000_000);
    expect(registrada.difference).toBe(1_000_000 - registrada.expected);

    // Una segunda para la misma persona y período se rechaza.
    expect(
      await status(() =>
        billingService.registerPrefacture(
          target.id,
          doc({ receivedAt: `${futuro}-06` })
        )
      )
    ).toBe(400);
  });

  it("la imputación puede llegar incompleta y viaja como null", async () => {
    const futuro = "2031-05";
    await billingService.generate(futuro);
    const target = (await billingService.listPeriod(futuro))[0];

    const registrada = await billingService.registerPrefacture(
      target.id,
      doc({
        receivedAt: `${futuro}-05`,
        imputation: {
          costObject: "Backend Platform",
          concept: "",
          accountName: null,
          accountNumber: null,
          costCenter: null,
          purchaseOrder: null,
          paymentAccount: null,
        },
      })
    );

    // Guardó igual, y lo que falta es null — no cadena vacía: es lo que
    // permite distinguir "falta" de "en blanco".
    expect(registrada.status).toBe("Received");
    expect(registrada.document?.imputation.purchaseOrder).toBeNull();
    expect(registrada.document?.imputation.concept).toBeNull();
    expect(registrada.document?.imputation.costObject).toBe("Backend Platform");
  });

  it("rechaza una moneda que no es COP", async () => {
    const futuro = "2031-06";
    await billingService.generate(futuro);
    const target = (await billingService.listPeriod(futuro))[0];

    // El esperado está en pesos: restarle otra moneda sin tasa da una
    // diferencia que parece válida y no lo es.
    expect(
      await status(() =>
        billingService.registerPrefacture(target.id, {
          ...doc({ receivedAt: `${futuro}-05` }),
          currency: "USD" as never,
        })
      )
    ).toBe(400);

    // Y no persistió nada.
    const releida = await billingService.get(target.id);
    expect(releida.document).toBeNull();
    expect(releida.status).toBe("Pending");
  });

  it("trabajar una prefactura recibida la pasa a revisión", async () => {
    const futuro = "2031-07";
    await billingService.generate(futuro);
    const target = (await billingService.listPeriod(futuro))[0];
    const recibida = await billingService.registerPrefacture(
      target.id,
      doc({ receivedAt: `${futuro}-05` })
    );
    expect(recibida.status).toBe("Received");

    const corregida = await billingService.setPrefactured(target.id, 900_000);
    expect(corregida.status).toBe("InReview");
    expect(corregida.prefactured).toBe(900_000);
    expect(corregida.difference).toBe(900_000 - corregida.expected);

    const ajustada = await billingService.adjust(target.id, {
      amount: 1_140_000,
      reason: "Overtime",
      note: "Horas extra",
    });
    expect(ajustada.adjustment?.amount).toBe(1_140_000);
    expect(ajustada.expected).toBe(corregida.expected + 1_140_000);

    // Un ajuste en cero no es un ajuste.
    expect(
      await status(() =>
        billingService.adjust(target.id, {
          amount: 0,
          reason: "Other",
          note: "",
        })
      )
    ).toBe(400);
  });

  it("aprobar con diferencia exige nota, y objetar exige motivo", async () => {
    const futuro = "2031-08";
    await billingService.generate(futuro);
    const target = (await billingService.listPeriod(futuro))[0];
    await billingService.registerPrefacture(
      target.id,
      doc({ receivedAt: `${futuro}-05` })
    );

    // Con diferencia y sin nota, no aprueba.
    expect(await status(() => billingService.approve(target.id))).toBe(400);

    const aprobada = await billingService.approve(target.id, "Se acepta");
    expect(aprobada.status).toBe("Approved");
    expect(aprobada.approvalNote).toBe("Se acepta");
    expect(aprobada.approvedAtUtc).not.toBeNull();

    // Una aprobada no se vuelve a aprobar ni se ajusta.
    expect(await status(() => billingService.approve(target.id, "otra"))).toBe(
      400
    );
    expect(
      await status(() =>
        billingService.adjust(target.id, {
          amount: 100,
          reason: "Other",
          note: "",
        })
      )
    ).toBe(400);
  });

  it("objetar traza el motivo y la corregida vuelve a recibida", async () => {
    const futuro = "2031-09";
    await billingService.generate(futuro);
    const target = (await billingService.listPeriod(futuro))[0];
    await billingService.registerPrefacture(
      target.id,
      doc({ receivedAt: `${futuro}-05` })
    );

    expect(await status(() => billingService.object(target.id, "  "))).toBe(400);

    const objetada = await billingService.object(
      target.id,
      "No descontaron la ausencia"
    );
    expect(objetada.status).toBe("Objected");
    expect(objetada.objection?.reason).toBe("No descontaron la ausencia");

    // La corregida la devuelve a recibida, y la objeción queda como historia.
    const corregida = await billingService.registerPrefacture(
      target.id,
      doc({ receivedAt: `${futuro}-09`, number: "PF-9002", amount: 950_000 })
    );
    expect(corregida.status).toBe("Received");
    expect(corregida.document?.number).toBe("PF-9002");
    expect(corregida.objection?.reason).toBe("No descontaron la ausencia");
  });

  it("una prefactura aprobada conserva sus cifras aunque cambien las ausencias", async () => {
    const aprobada = (await billingService.listPeriod(PREVIOUS_PERIOD)).find(
      (r) => r.status === "Approved"
    );
    if (!aprobada) return;

    const esperadoAlAprobar = aprobada.expected;
    const ausencia = await absenceService.create({
      personId: aprobada.personId,
      type: "Vacation",
      startDate: firstBusinessDay(PREVIOUS_PERIOD),
      endDate: firstBusinessDay(PREVIOUS_PERIOD),
    });
    await absenceService.approve(ausencia.id);

    const releida = await billingService.get(aprobada.id);
    expect(releida.expected).toBe(esperadoAlAprobar);
  });

  it("sin esperado generado no se puede registrar", async () => {
    // El id no existe porque nadie generó ese período.
    expect(
      await status(() =>
        billingService.registerPrefacture("pref-2031-10-xxxx", doc())
      )
    ).toBe(404);
  });

  it("un período mal formado se rechaza", async () => {
    expect(await status(() => billingService.listPeriod("marzo"))).toBe(400);
    expect(await status(() => billingService.generate("2031-13"))).toBe(400);
  });
});
