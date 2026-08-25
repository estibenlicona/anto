import { describe, expect, it } from "vitest";
import {
  clampRange,
  computeSquadImpacts,
  countBusinessDays,
  monthBounds,
  parseIsoDate,
} from "../businessDays";

describe("businessDays", () => {
  it("cuenta días hábiles de lunes a viernes, extremos incluidos", () => {
    // 6-jul-2026 es lunes; 6 al 8 = lun-mié.
    expect(
      countBusinessDays(
        parseIsoDate("2026-07-06")!,
        parseIsoDate("2026-07-08")!
      )
    ).toBe(3);
    // Viernes a lunes: el fin de semana no cuenta.
    expect(
      countBusinessDays(
        parseIsoDate("2026-07-03")!,
        parseIsoDate("2026-07-06")!
      )
    ).toBe(2);
    // Un sábado solo: cero.
    expect(
      countBusinessDays(
        parseIsoDate("2026-07-04")!,
        parseIsoDate("2026-07-04")!
      )
    ).toBe(0);
  });

  it("rechaza fechas y meses mal formados, incluidas las que ruedan", () => {
    expect(parseIsoDate("2026-02-31")).toBeNull();
    expect(parseIsoDate("31/07/2026")).toBeNull();
    expect(monthBounds("julio")).toBeNull();
    expect(monthBounds("2026-13")).toBeNull();
  });

  it("julio 2026 tiene 23 días hábiles", () => {
    const bounds = monthBounds("2026-07")!;
    expect(countBusinessDays(bounds.start, bounds.end)).toBe(23);
  });

  it("la intersección de rangos devuelve null cuando no se tocan", () => {
    const july = monthBounds("2026-07")!;
    expect(
      clampRange(
        parseIsoDate("2026-08-03")!,
        parseIsoDate("2026-08-05")!,
        july.start,
        july.end
      )
    ).toBeNull();
    const crossing = clampRange(
      parseIsoDate("2026-06-29")!,
      parseIsoDate("2026-07-02")!,
      july.start,
      july.end
    )!;
    expect(crossing.start.getDate()).toBe(1);
    expect(crossing.end.getDate()).toBe(2);
  });

  it("reparte el impacto entre células según la dedicación (escenario 60/40)", () => {
    // 3 de 23 días hábiles, 1.0 FTE disponible, dedicación 60/40.
    const impacts = computeSquadImpacts(3, 23, 1, [
      { squadId: "s1", squadName: "Backend", dedicationPercentage: 60 },
      { squadId: "s2", squadName: "Datos", dedicationPercentage: 40 },
    ]);
    expect(impacts[0].fteImpact).toBeCloseTo((3 / 23) * 0.6, 5);
    expect(impacts[1].fteImpact).toBeCloseTo((3 / 23) * 0.4, 5);
    // El total repartido es el impacto de la persona completa a su dedicación.
    expect(impacts[0].fteImpact + impacts[1].fteImpact).toBeCloseTo(
      (3 / 23) * 1,
      5
    );
  });

  it("sin días en el mes el impacto es cero pero el reparto conserva las células", () => {
    const impacts = computeSquadImpacts(0, 23, 1, [
      { squadId: "s1", squadName: "Backend", dedicationPercentage: 80 },
    ]);
    expect(impacts).toHaveLength(1);
    expect(impacts[0].fteImpact).toBe(0);
  });
});
