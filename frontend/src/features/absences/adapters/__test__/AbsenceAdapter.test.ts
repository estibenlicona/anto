import { describe, expect, it } from "vitest";
import type { AbsenceDto } from "../../services/absenceService";
import {
  absenceAdapter,
  currentMonthKey,
  formatRange,
  monthLabel,
  shiftMonth,
} from "../AbsenceAdapter";

function dto(overrides: Partial<AbsenceDto>): AbsenceDto {
  return {
    id: "ab1",
    personId: "p1",
    personName: "María González",
    providerName: null,
    type: "Vacation",
    startDate: "2026-07-06",
    endDate: "2026-07-08",
    startsHalfDay: false,
    endsHalfDay: false,
    businessDays: 3,
    status: "Approved",
    rejectReason: null,
    businessDaysInMonth: 3,
    squadImpacts: [
      {
        squadId: "s1",
        squadName: "Backend Platform",
        dedicationPct: 80,
        fteImpact: 0.1,
      },
    ],
    ...overrides,
  };
}

describe("AbsenceAdapter", () => {
  it("traduce tipo, estado y origen, y arma el rango como el diseño", () => {
    const month = absenceAdapter.toMonth({
      month: "2026-07",
      monthBusinessDays: 23,
      items: [
        dto({}),
        dto({
          id: "ab2",
          providerName: "GFT",
          type: "SickLeave",
          status: "Requested",
          startDate: "2026-07-21",
          endDate: "2026-07-21",
          startsHalfDay: false,
          endsHalfDay: false,
        }),
      ],
    });
    expect(month.monthTitle).toBe("Julio 2026");
    const [maria, gft] = month.items;
    expect(maria.typeLabel).toBe("Vacaciones");
    expect(maria.statusLabel).toBe("Aprobada");
    expect(maria.statusVariant).toBe("success");
    expect(maria.originLabel).toBe("Planta");
    expect(maria.rangeLabel).toBe("6 – 8 jul");
    expect(maria.initials).toBe("MG");
    expect(gft.typeLabel).toBe("Incapacidad");
    expect(gft.originLabel).toBe("GFT");
    expect(gft.rangeLabel).toBe("21 jul");
    expect(gft.statusVariant).toBe("warning");
  });

  it("un rango que cruza de mes se lee con ambos meses", () => {
    expect(formatRange("2026-08-28", "2026-09-01")).toBe("28 ago – 1 sep");
  });

  it("la célula principal es la de mayor dedicación, con empate alfabético", () => {
    const split = dto({
      squadImpacts: [
        {
          squadId: "s2",
          squadName: "Datos",
          dedicationPct: 40,
          fteImpact: 0.04,
        },
        {
          squadId: "s1",
          squadName: "Backend Platform",
          dedicationPct: 60,
          fteImpact: 0.06,
        },
      ],
    });
    const month = absenceAdapter.toMonth({
      month: "2026-07",
      monthBusinessDays: 23,
      items: [split],
    });
    expect(month.items[0].mainSquadName).toBe("Backend Platform");
    // El impacto de la fila es el total repartido.
    expect(month.items[0].monthFteImpact).toBeCloseTo(0.1, 5);
  });

  it("las lecturas del mes cuentan sólo lo que corresponde", () => {
    const month = absenceAdapter.toMonth({
      month: "2026-07",
      monthBusinessDays: 23,
      items: [
        dto({}),
        dto({
          id: "ab2",
          status: "Approved",
          businessDaysInMonth: 5,
          squadImpacts: [
            {
              squadId: "s4",
              squadName: "Pagos Instantáneos",
              dedicationPct: 100,
              fteImpact: 0.23,
            },
          ],
        }),
        dto({ id: "ab3", status: "Requested", businessDaysInMonth: 1 }),
        dto({ id: "ab4", status: "Rejected", businessDaysInMonth: 2 }),
      ],
    });
    expect(month.totalCount).toBe(4);
    expect(month.totalBusinessDaysInMonth).toBe(11);
    // Sólo las aprobadas suman impacto; la solicitada y la rechazada no.
    expect(month.approvedFteImpact).toBeCloseTo(0.33, 5);
    expect(month.mostAffectedSquadName).toBe("Pagos Instantáneos");
    expect(month.pendingCount).toBe(1);
  });

  it("sin nada aprobado no hay célula más afectada", () => {
    const month = absenceAdapter.toMonth({
      month: "2026-07",
      monthBusinessDays: 23,
      items: [dto({ status: "Requested" })],
    });
    expect(month.mostAffectedSquadName).toBeNull();
    expect(month.approvedFteImpact).toBe(0);
  });

  it("navega meses cruzando el año", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(monthLabel("2025-12")).toBe("Diciembre 2025");
    expect(currentMonthKey(new Date(2026, 7, 23))).toBe("2026-08");
  });
});
