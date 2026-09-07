import { describe, it, expect } from "vitest";
import {
  buildReference,
  median,
  sealedSprints,
  type HistorySprint,
} from "../history";

/** Un sprint cerrado y sellado con los SP dados. */
const sealed = (committedPoints: number): HistorySprint => ({
  committedPoints,
  snapshotStatus: "Sealed",
  isCurrent: false,
});

const missing = (committedPoints: number): HistorySprint => ({
  committedPoints,
  snapshotStatus: "Missing",
  isCurrent: false,
});

const current = (committedPoints: number): HistorySprint => ({
  committedPoints,
  snapshotStatus: "Provisional",
  isCurrent: true,
});

describe("median", () => {
  it("toma el central en longitud impar", () => {
    expect(median([20, 22, 30])).toBe(22);
  });

  it("promedia los dos centrales en longitud par", () => {
    expect(median([20, 22, 24, 30])).toBe(23);
  });

  it("no se deja arrastrar por un atípico como haría el promedio", () => {
    // Promedio = 26.4; la mediana se queda en 22, que es lo habitual.
    expect(median([21, 22, 22, 23, 44])).toBe(22);
  });

  it("es null sin valores", () => {
    expect(median([])).toBeNull();
  });
});

describe("sealedSprints", () => {
  it("deja fuera el sprint en curso y los que no se sellaron", () => {
    const sprints = [sealed(20), missing(99), sealed(22), current(28)];
    expect(sealedSprints(sprints, 6).map((s) => s.committedPoints)).toEqual([
      20, 22,
    ]);
  });

  it("se queda con los últimos de la ventana", () => {
    const sprints = [sealed(1), sealed(2), sealed(3), sealed(4), sealed(5)];
    expect(sealedSprints(sprints, 3).map((s) => s.committedPoints)).toEqual([
      3, 4, 5,
    ]);
  });
});

describe("buildReference", () => {
  const base = {
    windowSprints: 6,
    minSprints: 3,
    squadSprints: null,
    squadCurrentPoints: null,
  };

  it("da la mediana propia y la desviación del sprint actual", () => {
    const reference = buildReference({
      ...base,
      sprints: [sealed(20), sealed(22), sealed(24), sealed(22), current(28)],
      currentPoints: 28,
    });

    expect(reference.ownMedian).toBe(22);
    expect(reference.sealedSprintCount).toBe(4);
    expect(reference.sufficient).toBe(true);
    expect(reference.ownDeviationPoints).toBe(6);
    expect(reference.ownDeviationRate).toBe(27.3);
  });

  it("un sprint sin snapshot no entra en la mediana y baja el conteo", () => {
    const withMissing = buildReference({
      ...base,
      sprints: [sealed(20), missing(2), sealed(22), sealed(24), current(28)],
      currentPoints: 28,
    });

    expect(withMissing.sealedSprintCount).toBe(3);
    // Si el 2 hubiera entrado, la mediana caería a 21.
    expect(withMissing.ownMedian).toBe(22);
  });

  it("marca el histórico insuficiente por debajo del mínimo", () => {
    const reference = buildReference({
      ...base,
      sprints: [sealed(20), sealed(22), current(28)],
      currentPoints: 28,
    });

    expect(reference.sealedSprintCount).toBe(2);
    expect(reference.sufficient).toBe(false);
  });

  it("sin célula no hay mediana de célula, pero sí la propia", () => {
    const reference = buildReference({
      ...base,
      sprints: [sealed(20), sealed(22), sealed(24), current(28)],
      currentPoints: 28,
    });

    expect(reference.squadMedian).toBeNull();
    expect(reference.squadDeviationRate).toBeNull();
    // El colaborador sin célula sigue siendo evaluable.
    expect(reference.ownMedian).toBe(22);
    expect(reference.sufficient).toBe(true);
  });

  it("distingue un colaborador bajo en célula normal de uno en célula baja", () => {
    const ownSprints = [sealed(20), sealed(20), sealed(20), current(9)];

    const squadNormal = buildReference({
      ...base,
      sprints: ownSprints,
      currentPoints: 9,
      squadSprints: [sealed(22), sealed(22), sealed(22), current(22)],
      squadCurrentPoints: 22,
    });
    expect(squadNormal.ownDeviationRate).toBe(-55);
    expect(squadNormal.squadDeviationRate).toBe(0);

    const squadAlsoLow = buildReference({
      ...base,
      sprints: ownSprints,
      currentPoints: 9,
      squadSprints: [sealed(22), sealed(22), sealed(22), current(9)],
      squadCurrentPoints: 9,
    });
    expect(squadAlsoLow.ownDeviationRate).toBe(-55);
    // La célula cayó igual: el problema es del equipo, no de la persona.
    expect(squadAlsoLow.squadDeviationRate).toBe(-59.1);
  });

  it("no divide por cero cuando el histórico es 0 SP", () => {
    const reference = buildReference({
      ...base,
      sprints: [sealed(0), sealed(0), sealed(0), current(5)],
      currentPoints: 5,
    });

    expect(reference.ownMedian).toBe(0);
    expect(reference.ownDeviationRate).toBeNull();
  });
});
