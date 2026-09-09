/**
 * El runner de los casos dorados del lado del cliente. Su gemelo del backend es
 * `EstimationGoldenCasesTests.cs`: los dos leen
 * `fixtures/estimation-model/casos-dorados.json`, y mientras los dos estén
 * verdes las dos implementaciones del motor coinciden.
 *
 * Si este archivo deja de correr, nada avisa que los motores divergieron.
 */
import { describe, expect, it } from "vitest";
import {
  computeEstimation,
  type EstimationInput,
  type EstimationModelVersion,
  type EstimationOutput,
  type OutputScore,
} from "../evaluationModel";
import { loadGoldenCases } from "./goldenCases";

const fixture = loadGoldenCases();
const TOL = fixture.tolerance as number;

interface GoldenCase {
  name: string;
  why: string;
  model: string;
  input: EstimationInput;
  expected: Record<string, any>;
}

const cases = fixture.cases as GoldenCase[];

const closeTo = (label: string, actual: number, expected: number) => {
  expect(
    Math.abs(actual - expected) <= TOL,
    `${label}: esperaba ${expected}, llegó ${actual} (tolerancia ${TOL})`
  ).toBe(true);
};

const assertOutput = (
  label: string,
  actual: OutputScore,
  expected: Record<string, unknown>
) => {
  expect(actual.points, `${label}: puntos`).toBe(expected.points);
  expect(actual.maxPoints, `${label}: máximo`).toBe(expected.maxPoints);
  expect(actual.pct, `${label}: porcentaje`).toBe(expected.pct);
  // Las preguntas que aportan a la salida: una que "no aporta" no está en la
  // lista, una que pesa cero sí. Numéricamente da igual; acá no.
  expect(actual.contributes, `${label}: aportan`).toEqual(expected.contributes);
};

it("el fixture trae al menos ocho casos", () => {
  expect(cases.length).toBeGreaterThanOrEqual(8);
});

describe.each(cases.map((c) => [c.name, c] as const))(
  "el motor reproduce «%s»",
  (_name, caso) => {
    const version = fixture.models[caso.model] as EstimationModelVersion;
    const expected = caso.expected;
    const actual = () => computeEstimation(version, caso.input);

    it("las tres salidas", () => {
      const result = actual();
      assertOutput("tamaño", result.size, expected.size);
      assertOutput("esfuerzo", result.effort, expected.effort);
      assertOutput("riesgo", result.risk, expected.risk);
      expect(result.risk.level).toBe(expected.risk.level);
    });

    it("la talla y el esfuerzo en persona-mes", () => {
      const result = actual();
      expect(result.talla).toBe(expected.talla);
      expect(result.pmMin).toBe(expected.pmMin);
      expect(result.pmExpected).toBe(expected.pmExpected);
      expect(result.pmMax).toBe(expected.pmMax);
    });

    it("los FTE", () => {
      const result = actual();
      closeTo("fteMin", result.fteMin, expected.fteMin);
      closeTo("fteExpected", result.fteExpected, expected.fteExpected);
      closeTo("fteMax", result.fteMax, expected.fteMax);
    });

    it("el desglose por dimensión", () => {
      expect(actual().dimensions).toEqual(expected.dimensions);
    });

    it("el mix y sus modificadores", () => {
      const result = actual();
      expect(result.mixModifiersApplied).toEqual(expected.mixModifiersApplied);
      expect(result.mix.map((m) => m.capability)).toEqual(
        expected.mix.map((m: { capability: string }) => m.capability)
      );
      result.mix.forEach((row, i) => {
        expect(row.pct, row.capability).toBe(expected.mix[i].pct);
        closeTo(`fte de ${row.capability}`, row.fte, expected.mix[i].fte);
      });
      // La suma de las porciones tiene que dar el total: es la propiedad que se
      // rompe apenas alguien redondee el FTE por perfil.
      closeTo(
        "suma del mix",
        result.mix.reduce((sum, m) => sum + m.fte, 0),
        expected.fteExpected
      );
    });

    it("los conteos y el tamizaje", () => {
      const result = actual();
      expect(result.answered).toBe(expected.answered);
      expect(result.totalQuestions).toBe(expected.totalQuestions);
      expect(result.triageYes).toBe(expected.triageYes);
      expect(result.triageVerdict).toBe(expected.triageVerdict);
    });

    it("la derivación de cada respuesta", () => {
      const result = actual();
      for (const derivation of (expected.derivations ?? []) as {
        questionId: string;
        raw: string;
        optionLabel: string;
        score: number;
        driver: string;
        weights: Partial<Record<EstimationOutput, number>>;
      }[]) {
        const got = result.derivations.find(
          (d) => d.questionId === derivation.questionId
        );
        expect(got, derivation.questionId).toBeDefined();
        expect(got!.raw).toBe(derivation.raw);
        expect(got!.optionLabel).toBe(derivation.optionLabel);
        expect(got!.score).toBe(derivation.score);
        expect(got!.driver).toBe(derivation.driver);
        expect(got!.weights).toEqual(derivation.weights);
      }
    });
  }
);
