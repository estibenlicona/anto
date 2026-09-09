/**
 * El archivo de casos dorados es a mano, así que antes de que nadie lo use como
 * verdad hay que comprobar dos cosas distintas:
 *
 * 1. Que tenga la forma que declara su propio esquema.
 * 2. Que sus números cierren entre sí — que el `maxPoints` que dice sea la suma
 *    de los pesos que declara el modelo, que el `pct` salga de sus propios
 *    puntos, que los FTE del mix sumen el FTE total.
 *
 * Lo segundo no es el motor: acá se rehace la aritmética a partir del propio
 * archivo, sin importar `computeEvaluation`. Que el fixture sea coherente y que
 * el motor le dé la razón son dos afirmaciones separadas, y hacen falta las dos.
 */
import { describe, expect, it } from "vitest";
import {
  loadGoldenCases,
  loadGoldenSchema,
  unsupportedKeywords,
  validateAgainstSchema,
} from "./goldenCases";

const fixture = loadGoldenCases();
const schema = loadGoldenSchema();
const TOL = fixture.tolerance as number;

const round1 = (n: number) => Math.round(n * 10 + Number.EPSILON) / 10;
const round0 = (n: number) => Math.round(n + Number.EPSILON);

type Output = "Size" | "Effort" | "Risk" | "Mix";

const modelOf = (caso: { model: string }) => fixture.models[caso.model];
const activeQuestions = (model: any): any[] => model.questions.filter((q: any) => q.active);
const weightOf = (question: any, output: Output): number | undefined =>
  question.weights[output];

describe("los casos dorados tienen la forma que declara su esquema", () => {
  it("el esquema no usa palabras que el validador ignoraría", () => {
    expect([...unsupportedKeywords(schema)]).toEqual([]);
  });

  it("el archivo valida contra el esquema", () => {
    expect(validateAgainstSchema(fixture, schema)).toEqual([]);
  });

  it("cada caso apunta a un modelo declarado", () => {
    for (const caso of fixture.cases) {
      expect(fixture.models[caso.model], caso.name).toBeDefined();
    }
  });
});

describe("los modelos de los casos son configuraciones válidas", () => {
  const models = Object.entries(fixture.models) as [string, any][];

  it.each(models)("%s: las tallas son contiguas y cubren 0–100", (_name, model) => {
    const rules = model.tallaRules;
    expect(rules[0].minPct).toBe(0);
    expect(rules[rules.length - 1].maxPct).toBe(100);
    for (let i = 1; i < rules.length; i++) {
      expect(rules[i].minPct).toBe(rules[i - 1].maxPct);
    }
  });

  it.each(models)("%s: el esperado de cada talla está en su rango", (_name, model) => {
    for (const rule of model.tallaRules) {
      expect(rule.pmMin, rule.talla).toBeLessThanOrEqual(rule.pmExpected);
      expect(rule.pmExpected, rule.talla).toBeLessThanOrEqual(rule.pmMax);
    }
  });

  it.each(models)("%s: ninguna talla tiene el esperado en el punto medio", (_name, model) => {
    // Si lo tuviera, el caso dorado del parámetro propio no probaría nada.
    for (const rule of model.tallaRules) {
      expect((rule.pmMin + rule.pmMax) / 2, rule.talla).not.toBeCloseTo(rule.pmExpected, 6);
    }
  });

  it.each(models)("%s: cada columna del mix suma 100", (_name, model) => {
    for (const rule of model.tallaRules) {
      const total = model.mix.reduce(
        (sum: number, row: any) => sum + (row.byTalla[rule.talla] ?? 0),
        0
      );
      expect(total, rule.talla).toBe(100);
    }
  });

  it.each(models)("%s: cada modificador reparte y no agrega", (_name, model) => {
    for (const modifier of model.mixModifiers) {
      const total = modifier.adjustments.reduce(
        (sum: number, a: any) => sum + a.points,
        0
      );
      expect(total, modifier.code).toBe(0);
    }
  });

  it.each(models)("%s: los tramos de una cuantitativa cubren sin huecos", (_name, model) => {
    for (const question of model.questions.filter((q: any) => q.type === "Cuantitativa")) {
      const options = question.options;
      expect(options[options.length - 1].to, question.id).toBeNull();
      for (let i = 1; i < options.length; i++) {
        expect(options[i].from, `${question.id}[${i}]`).toBe(options[i - 1].to);
      }
    }
  });

  it.each(models)("%s: cada pregunta apunta a un driver declarado", (_name, model) => {
    const codes = new Set(model.drivers.map((d: any) => d.code));
    for (const question of model.questions) {
      expect(codes.has(question.driver), question.id).toBe(true);
    }
  });

  it.each(models)("%s: hay una pregunta que no aporta a tamaño y otra que pesa cero", (_name, model) => {
    // Las dos son necesarias: sin ellas, la distinción entre "no aporta" y
    // "pesa cero" no queda cubierta por ningún caso.
    const questions = activeQuestions(model);
    expect(questions.some((q: any) => q.weights.Size === undefined)).toBe(true);
    expect(questions.some((q: any) => q.weights.Size === 0)).toBe(true);
  });

  it.each(models)("%s: hay una pregunta que sólo pesa en riesgo", (_name, model) => {
    expect(
      activeQuestions(model).some(
        (q: any) =>
          q.weights.Risk !== undefined &&
          q.weights.Size === undefined &&
          q.weights.Effort === undefined
      )
    ).toBe(true);
  });
});

describe("el conjunto de casos cubre lo que dice cubrir", () => {
  it("cubre los tres tipos de pregunta", () => {
    const types = new Set(
      Object.values(fixture.models).flatMap((m: any) =>
        m.questions.map((q: any) => q.type)
      )
    );
    expect([...types].sort()).toEqual(["Binaria", "Cuantitativa", "Evaluativa"]);
  });

  it("cubre los cuatro plazos", () => {
    const months = new Set<number>(
      fixture.cases.map((c: any) => c.input.targetMonths as number)
    );
    expect([...months].sort((a, b) => a - b)).toEqual([3, 6, 9, 12]);
  });

  it("cubre los tres veredictos del tamizaje", () => {
    const verdicts = new Set(fixture.cases.map((c: any) => c.expected.triageVerdict));
    expect([...verdicts].sort()).toEqual(["FastTrack", "Recommended", "Required"]);
  });

  it("cubre un modificador de mix disparado", () => {
    expect(
      fixture.cases.some((c: any) => c.expected.mixModifiersApplied.length > 0)
    ).toBe(true);
  });
});

// Un bucle y no describe.each: la tupla de each pierde el tipo al mapear, y lo
// que importa acá es que cada caso tenga su propio bloque con su nombre.
for (const caso of fixture.cases as any[]) {
  describe(`los números de «${caso.name}» cierran entre sí`, () => {
    const model = modelOf(caso);
    const questions = activeQuestions(model);
    const months = caso.input.targetMonths;
    const expected = caso.expected;

    /** El puntaje normalizado de una respuesta, según el modelo del caso. */
    const scoreOf = (question: any): number => {
      const answer = caso.input.answers[question.id];
      if (!answer) return 0;
      if (answer.option !== undefined) return question.options[answer.option].score;
      const n = answer.number;
      const index = question.options.findIndex(
        (o: any, i: number) =>
          (i === 0 ? n >= o.from : n > o.from) && (o.to === null || n <= o.to)
      );
      expect(index, `${question.id}: ${n} sin tramo`).toBeGreaterThanOrEqual(0);
      return question.options[index].score;
    };

    it.each([["size", "Size"], ["effort", "Effort"], ["risk", "Risk"]] as const)(
      "%s sale de los pesos que declara el modelo",
      (key, output) => {
        const contributing = questions.filter(
          (q: any) => weightOf(q, output as Output) !== undefined
        );
        const maxPoints = contributing.reduce(
          (sum: number, q: any) => sum + weightOf(q, output as Output)!,
          0
        );
        const points = contributing.reduce(
          (sum: number, q: any) => sum + weightOf(q, output as Output)! * scoreOf(q),
          0
        );

        expect(expected[key].contributes).toEqual(contributing.map((q: any) => q.id));
        expect(expected[key].maxPoints).toBeCloseTo(maxPoints, 9);
        expect(expected[key].points).toBeCloseTo(points, 9);
        expect(expected[key].pct).toBeCloseTo(
          maxPoints > 0 ? round1((points / maxPoints) * 100) : 0,
          9
        );
      }
    );

    it("la talla es la banda que contiene el puntaje de tamaño", () => {
      const rule =
        model.tallaRules.find((r: any) => expected.size.pct <= r.maxPct) ??
        model.tallaRules[model.tallaRules.length - 1];
      expect(expected.talla).toBe(rule.talla);
      expect(expected.pmMin).toBe(rule.pmMin);
      expect(expected.pmMax).toBe(rule.pmMax);
    });

    it("el persona-mes esperado interpola sobre el parámetro de la banda", () => {
      const rule = model.tallaRules.find((r: any) => r.talla === expected.talla);
      const pct = expected.effort.pct;
      const pm =
        pct <= 50
          ? rule.pmMin + (rule.pmExpected - rule.pmMin) * (pct / 50)
          : rule.pmExpected + (rule.pmMax - rule.pmExpected) * ((pct - 50) / 50);
      expect(expected.pmExpected).toBeCloseTo(round1(pm), 9);
    });

    it("el nivel de riesgo es la banda que contiene su puntaje", () => {
      const band =
        model.riskBands.find((b: any) => expected.risk.pct <= b.maxPct) ??
        model.riskBands[model.riskBands.length - 1];
      expect(expected.risk.level).toBe(band.level);
    });

    it("los FTE son el persona-mes dividido por el plazo", () => {
      expect(expected.fteMin).toBeCloseTo(expected.pmMin / months, 6);
      expect(expected.fteExpected).toBeCloseTo(expected.pmExpected / months, 6);
      expect(expected.fteMax).toBeCloseTo(expected.pmMax / months, 6);
    });

    it("el mix suma 100 y sus FTE suman el FTE esperado", () => {
      const totalPct = expected.mix.reduce((s: number, m: any) => s + m.pct, 0);
      const totalFte = expected.mix.reduce((s: number, m: any) => s + m.fte, 0);
      expect(totalPct).toBe(100);
      expect(totalFte).toBeCloseTo(expected.fteExpected, 6);
      for (const row of expected.mix) {
        expect(row.fte, row.capability).toBeCloseTo(
          (row.pct / 100) * expected.fteExpected,
          6
        );
      }
    });

    it("el mix parte del base y sólo lo mueven los modificadores aplicados", () => {
      const base = new Map<string, number>(
        model.mix.map((m: any) => [m.capability, m.byTalla[expected.talla] ?? 0])
      );
      for (const code of expected.mixModifiersApplied) {
        const modifier = model.mixModifiers.find((m: any) => m.code === code);
        expect(modifier, code).toBeDefined();
        expect(modifier.tallas).toContain(expected.talla);
        for (const adjustment of modifier.adjustments) {
          base.set(
            adjustment.capability,
            (base.get(adjustment.capability) ?? 0) + adjustment.points
          );
        }
      }
      for (const row of expected.mix) {
        expect(row.pct, row.capability).toBe(base.get(row.capability));
      }
    });

    it("las dimensiones reparten el puntaje de tamaño", () => {
      const totalMax = expected.size.maxPoints;
      let sumMax = 0;
      for (const dimension of model.dimensions.filter((d: any) => d.active)) {
        const own = questions.filter((q: any) => q.dimension === dimension.code);
        const contributing = own.filter((q: any) => q.weights.Size !== undefined);
        const maxPoints = contributing.reduce(
          (s: number, q: any) => s + q.weights.Size,
          0
        );
        const points = contributing.reduce(
          (s: number, q: any) => s + q.weights.Size * scoreOf(q),
          0
        );
        const row = expected.dimensions.find(
          (d: any) => d.dimension === dimension.code
        );
        expect(row, dimension.code).toBeDefined();
        expect(row.total).toBe(own.length);
        expect(row.answered).toBe(
          own.filter((q: any) => caso.input.answers[q.id] !== undefined).length
        );
        expect(row.maxPoints).toBeCloseTo(maxPoints, 9);
        expect(row.points).toBeCloseTo(points, 9);
        expect(row.pct).toBe(maxPoints > 0 ? round0((points / maxPoints) * 100) : 0);
        expect(row.weightPct).toBe(
          totalMax > 0 ? round0((maxPoints / totalMax) * 100) : 0
        );
        sumMax += maxPoints;
      }
      expect(sumMax).toBeCloseTo(totalMax, 9);
    });

    it("los conteos coinciden con la entrada", () => {
      expect(expected.answered).toBe(Object.keys(caso.input.answers).length);
      expect(expected.totalQuestions).toBe(questions.length);
      expect(expected.triageYes).toBe(caso.input.triage.filter(Boolean).length);
    });

    it("el veredicto del tamizaje sale de las críticas y de la cuenta de síes", () => {
      const critical = model.triage.some(
        (t: any, i: number) => t.critical && caso.input.triage[i]
      );
      const yes = expected.triageYes;
      const verdict =
        critical || yes >= 3 ? "Required" : yes >= 1 ? "Recommended" : "FastTrack";
      expect(expected.triageVerdict).toBe(verdict);
    });

    it("la derivación declarada coincide con el modelo", () => {
      for (const derivation of expected.derivations ?? []) {
        const question = questions.find((q: any) => q.id === derivation.questionId);
        expect(question, derivation.questionId).toBeDefined();
        expect(derivation.driver).toBe(question.driver);
        expect(derivation.weights).toEqual(question.weights);
        expect(derivation.score).toBeCloseTo(scoreOf(question), 9);
        const option = question.options.find(
          (o: any) => o.label === derivation.optionLabel
        );
        expect(option, derivation.optionLabel).toBeDefined();
        expect(option.score).toBeCloseTo(derivation.score, 9);
      }
    });

    it("la tolerancia declarada es suficiente para los FTE", () => {
      expect(TOL).toBeGreaterThan(0);
      expect(TOL).toBeLessThanOrEqual(1e-4);
    });
  });
}
