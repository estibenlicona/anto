import { describe, expect, it } from "vitest";
import { computeEvaluation, type EvaluationModel } from "../evaluationModel";

const scale = ["0", "1", "2", "3", "4"];
const model: EvaluationModel = {
  dimensions: ["A", "B"],
  questions: [
    {
      id: "A1",
      dimension: "A",
      text: "a1",
      weight: 3,
      kind: "Evaluative",
      scale,
    },
    {
      id: "A2",
      dimension: "A",
      text: "a2",
      weight: 1,
      kind: "Objective",
      scale,
    },
    {
      id: "B1",
      dimension: "B",
      text: "b1",
      weight: 2,
      kind: "Evaluative",
      scale,
    },
  ],
  triage: [
    { id: "T1", text: "t1", critical: false },
    { id: "T2", text: "t2", critical: true },
  ],
  bands: [
    {
      talla: "XS",
      minPct: 0,
      maxPct: 20,
      pmMin: 1,
      pmMax: 3,
      lectura: "xs",
      action: "",
    },
    {
      talla: "S",
      minPct: 21,
      maxPct: 40,
      pmMin: 3,
      pmMax: 8,
      lectura: "s",
      action: "",
    },
    {
      talla: "M",
      minPct: 41,
      maxPct: 100,
      pmMin: 8,
      pmMax: 16,
      lectura: "m",
      action: "",
    },
  ],
  mix: [
    { capability: "Backend", byTalla: { XS: 1, S: 2, M: 3 } },
    { capability: "QA", byTalla: { XS: 0, S: 1, M: 1 } },
  ],
};

describe("computeEvaluation", () => {
  it("sin respuestas: 0%, talla más baja, nada respondido, vía rápida", () => {
    const r = computeEvaluation(model, {
      triage: [false, false],
      answers: {},
      targetMonths: 6,
    });
    expect(r.pct).toBe(0);
    expect(r.talla).toBe("XS");
    expect(r.answered).toBe(0);
    expect(r.maxPoints).toBe(24);
    expect(r.triageVerdict).toBe("FastTrack");
    expect(r.mix).toEqual([
      {
        capability: "Backend",
        people: 1,
        compositionPct: 100,
        fte: (1 + 3) / 2 / 6,
      },
    ]);
  });

  it("puntaje ponderado, por dimensión y frontera de banda", () => {
    // A1 = 4·3 = 12 de 24 → 50% → M (41–100)
    const r = computeEvaluation(model, {
      triage: [],
      answers: { A1: 4, A2: 0 },
      targetMonths: 6,
    });
    expect(r.points).toBe(12);
    expect(r.pct).toBe(50);
    expect(r.talla).toBe("M");
    expect(r.dimensions[0]).toMatchObject({
      answered: 2,
      total: 2,
      pct: 75,
      weightPct: 67,
    });
    expect(r.dimensions[1]).toMatchObject({
      answered: 0,
      total: 1,
      pct: 0,
      weightPct: 33,
    });
    // 4/24 = 16,7% → XS; la frontera pertenece a la banda de abajo
    const edge = computeEvaluation(model, {
      triage: [],
      answers: { A1: 1, A2: 1 },
      targetMonths: 6,
    });
    expect(edge.talla).toBe("XS");
  });

  it("el plazo cambia el FTE y nunca la talla", () => {
    const six = computeEvaluation(model, {
      triage: [],
      answers: { A1: 4 },
      targetMonths: 6,
    });
    const three = computeEvaluation(model, {
      triage: [],
      answers: { A1: 4 },
      targetMonths: 3,
    });
    expect(three.talla).toBe(six.talla);
    expect(three.fteExpected).toBeCloseTo(six.fteExpected * 2);
    expect(six.fteMin).toBe(8 / 6);
    expect(six.fteMax).toBe(16 / 6);
  });

  it("el mix reparte el FTE por personas y suma el esperado", () => {
    const r = computeEvaluation(model, {
      triage: [],
      answers: { A1: 4 },
      targetMonths: 6,
    });
    expect(r.mix.map((m) => m.compositionPct)).toEqual([75, 25]);
    expect(r.mix.reduce((a, m) => a + m.fte, 0)).toBeCloseTo(r.fteExpected);
  });

  it("tamizaje: una crítica obliga; un sí recomienda", () => {
    expect(
      computeEvaluation(model, {
        triage: [true, false],
        answers: {},
        targetMonths: 6,
      }).triageVerdict
    ).toBe("Recommended");
    expect(
      computeEvaluation(model, {
        triage: [false, true],
        answers: {},
        targetMonths: 6,
      }).triageVerdict
    ).toBe("Required");
  });
});
