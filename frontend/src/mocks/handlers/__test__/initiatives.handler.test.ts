import { describe, it, expect, beforeEach } from "vitest";
import { initiativeService } from "@features/initiatives/services/initiativeService";
import { computeEvaluation } from "@features/initiatives/services/evaluationModel";
import { questionPoolService } from "@features/admin-shell/services/questionPoolService";
import { tallaBandsService } from "@features/admin-shell/services/tallaBandsService";
import { backlogService } from "@features/backlog/services/backlogService";
import { resetInitiativesMock } from "../initiatives.handlers";
import { resetQuestionPoolMock } from "../question-pool.handlers";
import { resetTallaBandsMock } from "../talla-bands.handlers";
import { BACKEND, CANALES } from "../initiatives.seeds";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

const QIDS = [
  "N1",
  "N2",
  "N3",
  "N4",
  "F1",
  "F2",
  "F3",
  "F4",
  "I1",
  "I2",
  "I3",
  "I4",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "O1",
  "O2",
  "O3",
  "O4",
  "D1",
  "D2",
  "D3",
  "D4",
];
const full = (value: number) =>
  Object.fromEntries(QIDS.map((id) => [id, value])) as Record<string, number>;

describe("mock de iniciativas", () => {
  beforeEach(() => {
    resetInitiativesMock();
    resetQuestionPoolMock();
    resetTallaBandsMock();
  });

  it("lista con filtros por estado y talla, y sirve stats", async () => {
    const all = await initiativeService.list(1, 50);
    expect(all.totalCount).toBe(7);
    const active = await initiativeService.list(1, 50, { status: ["Active"] });
    expect(active.items.every((i) => i.status === "Active")).toBe(true);
    const talla = active.items[0].evaluation?.talla ?? "";
    const byTalla = await initiativeService.list(1, 50, { talla: [talla] });
    expect(byTalla.items.every((i) => i.evaluation?.talla === talla)).toBe(
      true
    );
    expect(byTalla.totalCount).toBeLessThan(all.totalCount);
    const stats = await initiativeService.getStats();
    expect(stats.unevaluated).toBe(2);
    expect(stats.active).toBe(3);
    expect(stats.activeByTalla.map((t) => t.talla)).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
    ]);
    expect(stats.activeByTalla.reduce((a, t) => a + t.count, 0)).toBe(3);
    const demand = active.items.reduce(
      (a, i) => a + (i.evaluation?.fteExpected ?? 0),
      0
    );
    expect(stats.fteDemand).toBeCloseTo(demand, 1);
  });

  it("crea en evaluación sin talla; editar el plazo recalcula el FTE sin cambiar la talla", async () => {
    const created = await initiativeService.create({
      name: "Nueva",
      squadId: CANALES,
      productOwner: "PO",
      targetMonths: 6,
    });
    expect(created).toMatchObject({
      status: "Evaluating",
      evaluation: null,
      squadName: "Canales Digitales",
    });
    expect(
      await status(() =>
        initiativeService.create({
          name: "",
          squadId: CANALES,
          productOwner: "PO",
          targetMonths: 6,
        })
      )
    ).toBe(400);
    const kafka = await initiativeService.get("ini-kafka");
    const edited = await initiativeService.update("ini-kafka", {
      name: kafka.name,
      squadId: kafka.squadId,
      productOwner: kafka.productOwner,
      targetMonths: 3,
    });
    expect(edited.evaluation?.talla).toBe(kafka.evaluation?.talla);
    expect(edited.evaluation?.fteExpected).toBeCloseTo(
      (kafka.evaluation?.fteExpected ?? 0) * 2
    );
  });

  it("estado: activar exige evaluación y cerrar exige activa", async () => {
    expect(
      await status(() => initiativeService.setStatus("ini-qr", "Active"))
    ).toBe(400);
    expect(
      await status(() => initiativeService.setStatus("ini-qr", "Closed"))
    ).toBe(400);
    expect(
      (await initiativeService.setStatus("ini-kafka", "Closed")).status
    ).toBe("Closed");
    expect(
      await status(() => initiativeService.setStatus("nope", "Active"))
    ).toBe(404);
  });

  it("estado: rechaza activar una segunda iniciativa en la misma célula", async () => {
    // ini-payments está evaluada y su célula (Backend) ya tiene activa a
    // ini-kafka: una célula sostiene un solo trabajo a la vez.
    expect(
      await status(() => initiativeService.setStatus("ini-payments", "Active"))
    ).toBe(400);

    const backend = await initiativeService.list(1, 50, { squadId: [BACKEND] });
    expect(
      backend.items.filter((i) => i.status === "Active").map((i) => i.id)
    ).toEqual(["ini-kafka"]);

    // Y con la activa cerrada, la que esperaba sí entra.
    await initiativeService.setStatus("ini-kafka", "Closed");
    expect(
      (await initiativeService.setStatus("ini-payments", "Active")).status
    ).toBe("Active");
  });

  it("estado: reactivar la que ya está activa no choca consigo misma", async () => {
    expect(
      (await initiativeService.setStatus("ini-kafka", "Active")).status
    ).toBe("Active");
  });

  it("squadHasOtherActive se resuelve sobre todas, no sobre la página ni el filtro", async () => {
    // Página de a una y filtrada por estado: la activa de Backend queda fuera
    // de lo que se ve, y aun así la que espera sabe que la célula está ocupada.
    const evaluando = await initiativeService.list(1, 1, {
      squadId: [BACKEND],
      status: ["Evaluating"],
    });
    expect(evaluando.items.map((i) => i.id)).toEqual(["ini-payments"]);
    expect(evaluando.items[0].squadHasOtherActive).toBe(true);

    // La activa misma no se cuenta a sí misma.
    const activa = await initiativeService.list(1, 50, {
      squadId: [BACKEND],
      status: ["Active"],
    });
    expect(activa.items[0].squadHasOtherActive).toBe(false);

    // Y una célula sin activa deja libres a las suyas.
    const qr = (await initiativeService.get("ini-qr")).squadHasOtherActive;
    expect(qr).toBe(true); // Canales tiene activa a ini-onboarding
    await initiativeService.setStatus("ini-onboarding", "Closed");
    expect((await initiativeService.get("ini-qr")).squadHasOtherActive).toBe(
      false
    );
  });

  it("guardar la evaluación calcula con el modelo vigente y persiste", async () => {
    const model = await initiativeService.getEvaluationModel();
    expect(model.questions).toHaveLength(30);
    expect(model.questions.find((q) => q.id === "I1")).toMatchObject({
      kind: "Objective",
    });
    expect(model.questions.find((q) => q.id === "N1")).toMatchObject({
      kind: "Evaluative",
      scale: ["Sin impacto", "Bajo", "Medio", "Alto", "Crítico"],
    });
    expect(model.bands.map((b) => b.maxPct)).toEqual([20, 40, 60, 80, 100]);
    const input = {
      triage: [true, true, false, false, false, false],
      answers: full(3),
      targetMonths: 6,
    };
    const saved = await initiativeService.saveEvaluation("ini-qr", input);
    const expected = computeEvaluation(model, input);
    expect(saved.evaluation).toMatchObject({
      talla: expected.talla,
      pct: expected.pct,
      triageVerdict: "Required",
    });
    expect((await initiativeService.get("ini-qr")).evaluation?.talla).toBe(
      expected.talla
    );
    expect(
      await status(() =>
        initiativeService.saveEvaluation("ini-qr", {
          ...input,
          answers: { ZZ: 1 },
        })
      )
    ).toBe(400);
    expect(
      await status(() =>
        initiativeService.saveEvaluation("ini-qr", {
          ...input,
          answers: { N1: 9 },
        })
      )
    ).toBe(400);
    expect(
      await status(() => initiativeService.saveEvaluation("nope", input))
    ).toBe(404);
  });

  it("el modelo sigue a los parámetros de Admin", async () => {
    const pool = await questionPoolService.getPool();
    await questionPoolService.savePool(
      pool.map((q) => (q.id === "N1" ? { ...q, peso: 9 } : q))
    );
    const bands = await tallaBandsService.getBands();
    await tallaBandsService.saveBands({
      ...bands,
      boundaries: [10, 40, 60, 80],
    });
    const model = await initiativeService.getEvaluationModel();
    expect(model.questions.find((q) => q.id === "N1")?.weight).toBe(9);
    expect(model.bands[0].maxPct).toBe(10);
  });

  it("el catálogo del backlog sale del mismo mock", async () => {
    await initiativeService.create({
      name: "Nueva del lead",
      squadId: CANALES,
      productOwner: "PO",
      targetMonths: 6,
    });
    const catalogs = await backlogService.getCatalogs();
    expect(
      catalogs.initiatives.some(
        (i) => i.id === "ini-kafka" && i.name === "Kafka Migration"
      )
    ).toBe(true);
    expect(catalogs.initiatives.some((i) => i.name === "Nueva del lead")).toBe(
      true
    );
  });
});
