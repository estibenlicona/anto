import { describe, it, expect } from "vitest";
import {
  absenceDaysInSprint,
  computeAvailableFte,
  pointsPerAvailableFte,
  sprintBusinessDays,
} from "../capacityFte";

const noDeductions = {
  holidays: 0,
  vacationDays: 0,
  absenceDays: 0,
  otherUnavailableDays: 0,
  hoursPerSprint: 80,
};

describe("computeAvailableFte", () => {
  it("descuenta festivo y ausencia: 10 días hábiles, −1 festivo, −1 ausencia → 0.80", () => {
    const result = computeAvailableFte({
      contractualFte: 1.0,
      businessDays: 10,
      holidays: 1,
      vacationDays: 0,
      absenceDays: 1,
      otherUnavailableDays: 0,
      hoursPerSprint: 80,
    });

    expect(result.availableFte).toBe(0.8);
    expect(result.contractualFte).toBe(1.0);
    // El desglose viaja siempre: el número nunca es opaco.
    expect(result.breakdown).toEqual({
      businessDays: 10,
      holidays: 1,
      vacationDays: 0,
      absenceDays: 1,
      otherUnavailableDays: 0,
    });
    // La misma capacidad en horas: 0.80 × 80, y lo que se fue en los dos días.
    expect(result.availableHours).toBe(64);
    expect(result.deductedHours).toBe(16);
  });

  it("las horas siguen al parámetro del sprint sin mover el FTE", () => {
    const input = {
      contractualFte: 1.0,
      businessDays: 10,
      holidays: 1,
      vacationDays: 0,
      absenceDays: 1,
      otherUnavailableDays: 0,
    };
    const con80 = computeAvailableFte({ ...input, hoursPerSprint: 80 });
    const con100 = computeAvailableFte({ ...input, hoursPerSprint: 100 });

    expect(con100.availableFte).toBe(con80.availableFte);
    expect(con100.availableHours).toBe(80);
    expect(con100.deductedHours).toBe(20);
  });

  it("sin descuentos no hay horas que restar", () => {
    const result = computeAvailableFte({
      contractualFte: 1.0,
      businessDays: 10,
      holidays: 0,
      vacationDays: 0,
      absenceDays: 0,
      otherUnavailableDays: 0,
      hoursPerSprint: 80,
    });

    expect(result.availableHours).toBe(80);
    expect(result.deductedHours).toBe(0);
  });

  it("cuenta media jornada de ausencia con dos decimales", () => {
    const result = computeAvailableFte({
      contractualFte: 1.0,
      businessDays: 10,
      holidays: 0,
      vacationDays: 0,
      absenceDays: 0.5,
      otherUnavailableDays: 0,
      hoursPerSprint: 80,
    });

    expect(result.availableFte).toBe(0.95);
  });

  it("un colaborador a tiempo parcial sin descuentos tiene su contrato entero", () => {
    const result = computeAvailableFte({
      contractualFte: 0.5,
      businessDays: 10,
      ...noDeductions,
    });

    // 0.50 sobre 0.50, no sobre 1.0: la pista es su propio contrato.
    expect(result.availableFte).toBe(0.5);
    expect(result.contractualFte).toBe(0.5);
  });

  it("escala el descuento por el contrato: medio tiempo con la mitad del sprint fuera", () => {
    const result = computeAvailableFte({
      contractualFte: 0.5,
      businessDays: 10,
      holidays: 0,
      vacationDays: 5,
      absenceDays: 0,
      otherUnavailableDays: 0,
      hoursPerSprint: 80,
    });

    expect(result.availableFte).toBe(0.25);
  });

  it("sin días hábiles la capacidad es cero, no infinito", () => {
    const result = computeAvailableFte({
      contractualFte: 1.0,
      businessDays: 0,
      ...noDeductions,
    });

    expect(result.availableFte).toBe(0);
  });

  it("acota a [0, contractual] cuando los descuentos se pasan o faltan", () => {
    const over = computeAvailableFte({
      contractualFte: 1.0,
      businessDays: 10,
      holidays: 4,
      vacationDays: 8,
      absenceDays: 2,
      otherUnavailableDays: 0,
      hoursPerSprint: 80,
    });
    expect(over.availableFte).toBe(0);

    const negativeDeduction = computeAvailableFte({
      contractualFte: 1.0,
      businessDays: 10,
      holidays: -3,
      vacationDays: 0,
      absenceDays: 0,
      otherUnavailableDays: 0,
      hoursPerSprint: 80,
    });
    expect(negativeDeduction.availableFte).toBe(1.0);
  });
});

describe("sprintBusinessDays", () => {
  it("cuenta sólo de lunes a viernes", () => {
    // 2026-08-17 lunes a 2026-08-28 viernes: dos semanas completas.
    expect(sprintBusinessDays("2026-08-17", "2026-08-28")).toBe(10);
  });

  it("devuelve 0 con fechas mal formadas", () => {
    expect(sprintBusinessDays("no-es-fecha", "2026-08-28")).toBe(0);
  });
});

describe("absenceDaysInSprint", () => {
  const sprintStart = new Date(2026, 7, 17); // lunes 17 ago
  const sprintEnd = new Date(2026, 7, 28); // viernes 28 ago

  it("cuenta los días hábiles de la ausencia que caen dentro del sprint", () => {
    const days = absenceDaysInSprint(
      { startDate: "2026-08-19", endDate: "2026-08-21" },
      sprintStart,
      sprintEnd
    );
    expect(days).toBe(3);
  });

  it("recorta una ausencia que empieza antes del sprint", () => {
    // Del 10 al 19 de agosto, pero el sprint arranca el 17: sólo 17, 18 y 19.
    const days = absenceDaysInSprint(
      { startDate: "2026-08-10", endDate: "2026-08-19" },
      sprintStart,
      sprintEnd
    );
    expect(days).toBe(3);
  });

  it("ignora la media jornada de un extremo que quedó fuera del sprint", () => {
    const days = absenceDaysInSprint(
      { startDate: "2026-08-10", endDate: "2026-08-19", startsHalfDay: true },
      sprintStart,
      sprintEnd
    );
    // El 10 no entra al sprint, así que su media jornada tampoco descuenta.
    expect(days).toBe(3);
  });

  it("respeta la media jornada de un extremo que sí cae dentro", () => {
    const days = absenceDaysInSprint(
      { startDate: "2026-08-19", endDate: "2026-08-21", endsHalfDay: true },
      sprintStart,
      sprintEnd
    );
    expect(days).toBe(2.5);
  });

  it("devuelve 0 cuando la ausencia no toca el sprint", () => {
    const days = absenceDaysInSprint(
      { startDate: "2026-09-07", endDate: "2026-09-11" },
      sprintStart,
      sprintEnd
    );
    expect(days).toBe(0);
  });
});

describe("pointsPerAvailableFte", () => {
  it("normaliza la demanda por la capacidad real", () => {
    // 28 SP con 0.8 FTE disponible pesan como 35 SP a jornada completa.
    expect(pointsPerAvailableFte(28, 0.8)).toBe(35);
  });

  it("es null sin capacidad: 28 SP sobre 0.0 FTE no es un número grande", () => {
    expect(pointsPerAvailableFte(28, 0)).toBeNull();
  });
});
