import { describe, it, expect } from "vitest";
import {
  computeBalanceSignal,
  isActionableSignal,
  resolveSquadContext,
  type BalanceInput,
} from "../balanceSignal";

/**
 * Un colaborador tranquilo: 22 SP habituales, cumple como siempre, un
 * carry-over normal, nada de trabajo agregado y una sola iniciativa. Cada
 * prueba desvía sólo lo que quiere probar.
 */
const baseline: BalanceInput = {
  hasIdentity: true,
  hasSprint: true,
  hasSufficientHistory: true,

  committedPoints: 22,
  availableFte: 1.0,

  ownMedianPoints: 22,
  ownMedianPointsPerFte: 22,

  executionSealed: true,
  executionMissing: false,
  completionRate: 90,
  ownMedianCompletionRate: 90,

  carryOverRate: 10,
  ownMedianCarryOverRate: 10,

  unplannedRate: 5,

  concurrentInitiatives: 1,
  wip: 2,

  ownDeviationRate: 0,
  squadDeviationRate: null,
};

const evidenceOf = (
  result: ReturnType<typeof computeBalanceSignal>,
  id: string
) => result.evidences.find((e) => e.id === id)!;

describe("computeBalanceSignal · señales", () => {
  it("carga habitual: las seis evidencias en neutro", () => {
    const result = computeBalanceSignal(baseline);

    expect(result.signal).toBe("Usual");
    expect(result.overCount).toBe(0);
    expect(result.underCount).toBe(0);
    expect(result.evidences).toHaveLength(6);
    expect(result.evidences.every((e) => e.direction === "Neutral")).toBe(true);
  });

  it("una sola evidencia no basta: carry-over alto y todo lo demás en línea", () => {
    const result = computeBalanceSignal({
      ...baseline,
      carryOverRate: 25, // +15 pp sobre su histórico de 10
    });

    expect(evidenceOf(result, "carryOver").direction).toBe("Over");
    expect(result.overCount).toBe(1);
    // Sigue en carga habitual: ningún indicador individual decide la categoría.
    expect(result.signal).toBe("Usual");
  });

  it("una sola evidencia fuerte ya es accionable", () => {
    const result = computeBalanceSignal({
      ...baseline,
      carryOverRate: 40, // +30 pp: por encima del umbral fuerte de 25
    });

    expect(evidenceOf(result, "carryOver").strong).toBe(true);
    expect(result.overCount).toBe(1);
    expect(result.signal).toBe("PossibleOverload");
  });

  it("dos evidencias concordantes ya son accionables", () => {
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 28, // +27 % sobre 22
      availableFte: 1.0,
      // Sus 22 habituales los hacía con algo menos de disponibilidad, así que
      // la demanda por FTE apenas se mueve: lo que se desvió es la carga, no
      // el efecto de las ausencias, y esa evidencia queda neutra.
      ownMedianPointsPerFte: 24,
      completionRate: 70, // −20 pp sobre su 90 habitual
    });

    expect(evidenceOf(result, "demandVsOwnHistory").direction).toBe("Over");
    expect(evidenceOf(result, "completion").direction).toBe("Over");
    expect(result.overCount).toBe(2);
    expect(result.signal).toBe("PossibleOverload");
  });

  it("posible sobreasignación: cuatro evidencias en dirección de sobrecarga", () => {
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 28,
      carryOverRate: 25,
      unplannedRate: 36,
    });

    expect(result.overCount).toBe(4); // demanda, demanda/FTE, carry-over, no planificado
    expect(result.signal).toBe("PossibleOverload");
  });

  it("posible subasignación: demanda muy baja, cumple todo, una iniciativa", () => {
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 9, // −59 % sobre 22
      completionRate: 100,
    });

    expect(evidenceOf(result, "demandVsOwnHistory").direction).toBe("Under");
    expect(evidenceOf(result, "demandPerAvailableFte").direction).toBe("Under");
    expect(evidenceOf(result, "completion").direction).toBe("Under");
    expect(result.underCount).toBe(3);
    expect(result.signal).toBe("PossibleUnderload");
  });

  it("cumplir el 100 % con demanda normal no aporta a subasignación", () => {
    const result = computeBalanceSignal({ ...baseline, completionRate: 100 });

    expect(evidenceOf(result, "completion").direction).toBe("Neutral");
    expect(result.signal).toBe("Usual");
  });

  it("evidencias opuestas caen a carga habitual", () => {
    // Media jornada de disponibilidad: en SP absolutos recibió menos de lo
    // habitual, pero por FTE disponible bastante más, y encima le entró
    // trabajo no planificado. Las dos direcciones a la vez.
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 14, // −36 % sobre 22
      availableFte: 0.5, // 28 SP por FTE: +27 % sobre sus 22 habituales
      unplannedRate: 30, // otra hacia sobrecarga
    });

    expect(evidenceOf(result, "demandVsOwnHistory").direction).toBe("Under");
    expect(evidenceOf(result, "demandPerAvailableFte").direction).toBe("Over");
    expect(result.overCount).toBeGreaterThan(0);
    expect(result.underCount).toBeGreaterThan(0);
    // Dar una señal accionable a alguien cuyas evidencias se contradicen es
    // peor que no decir nada; la explicación muestra las dos direcciones.
    expect(result.signal).toBe("Usual");
  });

  it("ninguna entrada produce el estado intermedio retirado", () => {
    const casos: BalanceInput[] = [
      baseline,
      { ...baseline, carryOverRate: 25 },
      { ...baseline, carryOverRate: 40 },
      {
        ...baseline,
        committedPoints: 28,
        carryOverRate: 25,
        unplannedRate: 36,
      },
      { ...baseline, committedPoints: 9, completionRate: 100 },
      {
        ...baseline,
        committedPoints: 14,
        availableFte: 0.5,
        unplannedRate: 30,
      },
    ];
    const señales = casos.map((c) => computeBalanceSignal(c).signal);
    expect(señales as string[]).not.toContain("Review");
    expect(new Set(señales)).toEqual(
      new Set(["Usual", "PossibleOverload", "PossibleUnderload"])
    );
  });
});

describe("computeBalanceSignal · contexto de célula", () => {
  it("la célula que se comporta igual se anota, pero no atenúa la señal", () => {
    const alone = computeBalanceSignal({
      ...baseline,
      committedPoints: 9,
      completionRate: 100,
      ownDeviationRate: -59,
      squadDeviationRate: null,
    });
    expect(alone.signal).toBe("PossibleUnderload");
    expect(alone.underCount).toBe(3);

    const withSquad = computeBalanceSignal({
      ...baseline,
      committedPoints: 9,
      completionRate: 100,
      ownDeviationRate: -59,
      squadDeviationRate: -59, // la célula entera cayó igual
    });

    expect(withSquad.squadContext).toBe("SameDirection");
    // Ni el conteo ni la señal se mueven: una célula entera desviada sigue
    // siendo algo que el Líder de Expertise tiene que ver.
    expect(withSquad.underCount).toBe(3);
    expect(withSquad.signal).toBe("PossibleUnderload");
  });

  it("una célula que se desvía en otra dirección tampoco cambia nada", () => {
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 9,
      completionRate: 100,
      ownDeviationRate: -59,
      squadDeviationRate: 12,
    });

    expect(result.squadContext).toBe("Different");
    expect(result.underCount).toBe(3);
    expect(result.signal).toBe("PossibleUnderload");
  });

  it("resolveSquadContext distingue los tres casos", () => {
    expect(resolveSquadContext(-55, -59)).toBe("SameDirection");
    expect(resolveSquadContext(-55, -20)).toBe("Different");
    expect(resolveSquadContext(-55, 5)).toBe("Different");
    expect(resolveSquadContext(-55, null)).toBe("NoSquad");
  });
});

describe("computeBalanceSignal · no evaluable", () => {
  it("sin identidad", () => {
    const result = computeBalanceSignal({ ...baseline, hasIdentity: false });
    expect(result.signal).toBe("NotEvaluable");
    expect(result.notEvaluableReason).toBe("NoIdentity");
  });

  it("sin sprint", () => {
    const result = computeBalanceSignal({ ...baseline, hasSprint: false });
    expect(result.signal).toBe("NotEvaluable");
    expect(result.notEvaluableReason).toBe("NoSprint");
  });

  it("sprint cerrado sin snapshot: no se evalúa aunque su demanda se vea", () => {
    const result = computeBalanceSignal({
      ...baseline,
      executionSealed: false,
      executionMissing: true,
      completionRate: null,
      carryOverRate: null,
    });
    expect(result.signal).toBe("NotEvaluable");
    expect(result.notEvaluableReason).toBe("MissingSnapshot");
  });

  it("histórico insuficiente", () => {
    const result = computeBalanceSignal({
      ...baseline,
      hasSufficientHistory: false,
    });
    expect(result.signal).toBe("NotEvaluable");
    expect(result.notEvaluableReason).toBe("InsufficientHistory");
    // Las evidencias viajan igual, para mostrar qué sí se pudo mirar.
    expect(result.evidences).toHaveLength(6);
  });

  it("un colaborador sin célula sigue siendo evaluable", () => {
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 28,
      carryOverRate: 25,
      unplannedRate: 36,
      squadDeviationRate: null, // sin célula: sólo pierde el contexto
    });

    expect(result.signal).toBe("PossibleOverload");
    expect(result.squadContext).toBe("NoSquad");
    expect(result.notEvaluableReason).toBeNull();
  });
});

describe("computeBalanceSignal · sprint en curso", () => {
  it("sin sellar, la caída de cumplimiento y el carry-over no se evalúan", () => {
    // A mitad de sprint todo el mundo va por debajo de su cumplimiento
    // habitual: eso es "todavía no", no "no se pudo".
    const result = computeBalanceSignal({
      ...baseline,
      executionSealed: false,
      completionRate: 40,
      carryOverRate: 45,
    });

    expect(evidenceOf(result, "completion").direction).toBe("Unknown");
    expect(evidenceOf(result, "carryOver").direction).toBe("Unknown");
    expect(result.overCount).toBe(0);
    expect(result.signal).toBe("Usual");
  });

  it("sin sellar, haber cerrado ya todo lo comprometido sí cuenta", () => {
    const result = computeBalanceSignal({
      ...baseline,
      executionSealed: false,
      committedPoints: 9, // demanda muy por debajo
      ownMedianPointsPerFte: 22,
      completionRate: 100, // y ya no le queda nada por hacer
      carryOverRate: 0,
    });

    expect(evidenceOf(result, "completion").direction).toBe("Under");
    expect(evidenceOf(result, "carryOver").direction).toBe("Unknown");
    expect(result.underCount).toBe(3);
    expect(result.signal).toBe("PossibleUnderload");
  });
});

describe("computeBalanceSignal · evidencias no evaluadas", () => {
  it("no cuentan en ninguna dirección, pero se reportan", () => {
    const result = computeBalanceSignal({
      ...baseline,
      completionRate: null, // sprint sin sellar
      carryOverRate: null,
      unplannedRate: null,
      wip: null,
      concurrentInitiatives: null,
    });

    expect(evidenceOf(result, "completion").direction).toBe("Unknown");
    expect(evidenceOf(result, "carryOver").direction).toBe("Unknown");
    expect(evidenceOf(result, "multitasking").direction).toBe("Unknown");
    expect(result.overCount).toBe(0);
    expect(result.underCount).toBe(0);
    expect(result.signal).toBe("Usual");
    // Se muestran las seis igual: se ve qué no se pudo mirar.
    expect(result.evidences).toHaveLength(6);
  });

  it("la demanda por FTE separa la ausencia de la carga", () => {
    // Una semana fuera: 13 SP con 0.6 FTE es su ritmo de siempre.
    const result = computeBalanceSignal({
      ...baseline,
      committedPoints: 13,
      availableFte: 0.6,
      ownMedianPointsPerFte: 22,
    });

    expect(evidenceOf(result, "demandVsOwnHistory").direction).toBe("Under");
    expect(evidenceOf(result, "demandPerAvailableFte").direction).toBe(
      "Neutral"
    );
    expect(result.underCount).toBe(1);
    expect(result.signal).toBe("Usual");
  });
});

describe("isActionableSignal", () => {
  it("sólo las dos señales fuertes cuentan para el badge", () => {
    expect(isActionableSignal("PossibleOverload")).toBe(true);
    expect(isActionableSignal("PossibleUnderload")).toBe(true);
    expect(isActionableSignal("Usual")).toBe(false);
    expect(isActionableSignal("NotEvaluable")).toBe(false);
  });
});
