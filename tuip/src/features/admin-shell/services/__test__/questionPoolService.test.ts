import { describe, it, expect, beforeEach } from "vitest";
import {
  QUESTION_DIMENSIONS,
  dimensionSummary,
  questionPoolService,
  type QuestionPool,
} from "../questionPoolService";
import { resetQuestionPoolMock } from "../../../../mocks/handlers/question-pool.handlers";

describe("dimensionSummary", () => {
  const pool: QuestionPool = [
    { id: "N1", dimension: "Negocio y cliente", texto: "a", peso: 2 },
    { id: "N2", dimension: "Negocio y cliente", texto: "b", peso: 3 },
    { id: "F1", dimension: "Alcance funcional", texto: "c", peso: 1 },
  ];

  it("counts, sums weights and derives max points per dimension", () => {
    const summary = dimensionSummary(pool);
    const negocio = summary.find(
      (row) => row.dimension === "Negocio y cliente"
    );
    expect(negocio).toEqual({
      dimension: "Negocio y cliente",
      preguntas: 2,
      pesoTotal: 5,
      maxPuntos: 20, // pesoTotal * QUESTION_SCORE_MAX (4)
    });
  });

  it("covers every dimension in the reference order, even without questions", () => {
    const summary = dimensionSummary(pool);
    expect(summary.map((row) => row.dimension)).toEqual([
      ...QUESTION_DIMENSIONS,
    ]);
    // Ninguna pregunta pertenece a las últimas cinco dimensiones en este caso.
    const integraciones = summary.find(
      (row) => row.dimension === "Integraciones"
    );
    expect(integraciones).toEqual({
      dimension: "Integraciones",
      preguntas: 0,
      pesoTotal: 0,
      maxPuntos: 0,
    });
  });
});

describe("questionPoolService against the mock", () => {
  beforeEach(() => {
    resetQuestionPoolMock();
  });

  it("loads the 30 seeded questions across the 7 dimensions", async () => {
    const pool = await questionPoolService.getPool();
    expect(pool).toHaveLength(30);
    const summary = dimensionSummary(pool);
    expect(summary).toHaveLength(7);
    // Contra el modelo de referencia: 30 preguntas, peso total 70.
    expect(summary.reduce((sum, row) => sum + row.preguntas, 0)).toBe(30);
    expect(summary.reduce((sum, row) => sum + row.pesoTotal, 0)).toBe(70);
  });

  it("persists a save so the next load reflects it", async () => {
    const pool = await questionPoolService.getPool();
    await questionPoolService.savePool([
      { ...pool[0], peso: 5 },
      ...pool.slice(1),
    ]);

    const reloaded = await questionPoolService.getPool();
    expect(reloaded[0].peso).toBe(5);
  });

  it("rejects an empty question text", async () => {
    const pool = await questionPoolService.getPool();

    await expect(
      questionPoolService.savePool([
        { ...pool[0], texto: "  " },
        ...pool.slice(1),
      ])
    ).rejects.toBeDefined();

    const reloaded = await questionPoolService.getPool();
    expect(reloaded[0].texto).toBe(pool[0].texto);
  });

  it("rejects a weight that is not a positive integer", async () => {
    const pool = await questionPoolService.getPool();

    await expect(
      questionPoolService.savePool([{ ...pool[0], peso: 0 }, ...pool.slice(1)])
    ).rejects.toBeDefined();

    const reloaded = await questionPoolService.getPool();
    expect(reloaded[0].peso).toBe(pool[0].peso);
  });

  it("rejects a fractional weight", async () => {
    const pool = await questionPoolService.getPool();

    await expect(
      questionPoolService.savePool([
        { ...pool[0], peso: 1.5 },
        ...pool.slice(1),
      ] as QuestionPool)
    ).rejects.toBeDefined();
  });

  it("rejects a dimension outside the reference list", async () => {
    const pool = await questionPoolService.getPool();

    await expect(
      questionPoolService.savePool([
        { ...pool[0], dimension: "Dimensión inventada" },
        ...pool.slice(1),
      ])
    ).rejects.toBeDefined();

    const reloaded = await questionPoolService.getPool();
    expect(reloaded[0].dimension).toBe(pool[0].dimension);
  });
});
