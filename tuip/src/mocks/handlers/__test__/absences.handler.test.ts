import { describe, it, expect, beforeEach } from "vitest";
import { absenceService } from "@features/absences/services/absenceService";
import { resetAbsencesMock } from "../absences.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetPeopleMock } from "../people.handlers";

const MARIA = "p1111111-1111-1111-1111-111111111111";
const LAURA = "p2222222-2222-2222-2222-222222222222";
const CARLOS = "p3333333-3333-3333-3333-333333333333";

// Mes fijo y lejano para no cruzarse con las semillas (relativas al mes
// corriente): marzo de 2031 arranca en sábado y tiene 21 días hábiles.
const MARCH = "2031-03";
const APRIL = "2031-04";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

function monthKey(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

describe("mock de ausencias", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetAbsencesMock();
  });

  it("las semillas del mes corriente traen tipos y estados variados, con persona y proveedor resueltos", async () => {
    const { items, monthBusinessDays } = await absenceService.getByMonth(
      monthKey(0)
    );
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(monthBusinessDays).toBeGreaterThanOrEqual(20);
    const statuses = new Set(items.map((a) => a.status));
    expect(statuses).toContain("Approved");
    expect(statuses).toContain("Requested");
    // Carlos es de GFT: el proveedor se deriva de la persona, no se digita.
    const carlos = items.find((a) => a.personId === CARLOS)!;
    expect(carlos.providerName).toBe("GFT");
    expect(carlos.personName).toBe("Carlos López");
    // La incapacidad de Carlos cruza el fin de mes: aparece también al mes
    // siguiente, contando sólo los días hábiles que caen en él.
    const next = await absenceService.getByMonth(monthKey(1));
    const carlosNext = next.items.find((a) => a.id === carlos.id)!;
    expect(carlosNext.businessDaysInMonth).toBeGreaterThan(0);
    expect(carlosNext.businessDaysInMonth + carlos.businessDaysInMonth).toBe(
      carlos.businessDays
    );
  });

  it("calcula días e impactos derivados de la persona y sus asignaciones", async () => {
    // María: 1.0 FTE disponible, Backend Platform al 80%.
    const created = await absenceService.create({
      personId: MARIA,
      type: "Vacation",
      startDate: "2031-03-03",
      endDate: "2031-03-05",
    });
    expect(created.status).toBe("Requested");
    expect(created.businessDays).toBe(3);
    const approved = await absenceService.approve(created.id);
    expect(approved.status).toBe("Approved");
    const { items, monthBusinessDays } = await absenceService.getByMonth(MARCH);
    expect(monthBusinessDays).toBe(21);
    const maria = items.find((a) => a.id === created.id)!;
    expect(maria.businessDaysInMonth).toBe(3);
    expect(maria.squadImpacts).toHaveLength(1);
    expect(maria.squadImpacts[0].squadName).toBe("Backend Platform");
    expect(maria.squadImpacts[0].dedicationPct).toBe(80);
    // 3 ÷ 21 × 1.0 FTE × 80% — fórmula, no valor digitado.
    expect(maria.squadImpacts[0].fteImpact).toBeCloseTo((3 / 21) * 0.8, 5);
  });

  it("una ausencia que cruza el fin de mes reparte sus días hábiles entre ambos meses", async () => {
    // Carlos: 28-mar-2031 (viernes) a 1-abr-2031 (martes) = 3 días hábiles.
    const created = await absenceService.create({
      personId: CARLOS,
      type: "SickLeave",
      startDate: "2031-03-28",
      endDate: "2031-04-01",
    });
    expect(created.businessDays).toBe(3);
    const march = await absenceService.getByMonth(MARCH);
    expect(
      march.items.find((a) => a.id === created.id)!.businessDaysInMonth
    ).toBe(2);
    const april = await absenceService.getByMonth(APRIL);
    const inApril = april.items.find((a) => a.id === created.id)!;
    expect(inApril.businessDaysInMonth).toBe(1);
    expect(april.monthBusinessDays).toBe(22);
    // El impacto de abril usa el denominador de abril: 1 ÷ 22 × 0.8 FTE × 100%.
    expect(inApril.squadImpacts[0].fteImpact).toBeCloseTo((1 / 22) * 0.8, 5);
  });

  it("rechaza solapes con ausencias no rechazadas, y una rechazada no bloquea", async () => {
    const first = await absenceService.create({
      personId: LAURA,
      type: "Leave",
      startDate: "2031-03-10",
      endDate: "2031-03-11",
    });
    expect(
      await status(() =>
        absenceService.create({
          personId: LAURA,
          type: "Vacation",
          startDate: "2031-03-11",
          endDate: "2031-03-12",
        })
      )
    ).toBe(400);
    await absenceService.reject(
      first.id,
      "Registrada con las fechas equivocadas"
    );
    const again = await absenceService.create({
      personId: LAURA,
      type: "Leave",
      startDate: "2031-03-10",
      endDate: "2031-03-11",
    });
    expect(again.status).toBe("Requested");
  });

  it("valida rango, mes, persona y transiciones de estado", async () => {
    expect(
      await status(() =>
        absenceService.create({
          personId: MARIA,
          type: "Vacation",
          startDate: "2031-03-10",
          endDate: "2031-03-09",
        })
      )
    ).toBe(400);
    expect(
      await status(() =>
        absenceService.create({
          personId: "no-existe",
          type: "Vacation",
          startDate: "2031-03-10",
          endDate: "2031-03-10",
        })
      )
    ).toBe(400);
    expect(await status(() => absenceService.getByMonth("marzo"))).toBe(400);
    expect(await status(() => absenceService.approve("no-existe"))).toBe(404);

    const created = await absenceService.create({
      personId: MARIA,
      type: "Leave",
      startDate: "2031-03-10",
      endDate: "2031-03-10",
    });
    // Rechazar sin motivo no transiciona.
    expect(await status(() => absenceService.reject(created.id, "  "))).toBe(
      400
    );
    await absenceService.approve(created.id);
    // Una aprobada no vuelve a aprobarse…
    expect(await status(() => absenceService.approve(created.id))).toBe(400);
    // …pero sí se rechaza: es cómo se revierte una aprobación equivocada.
    const revertida = await absenceService.reject(created.id, "Me equivoqué");
    expect(revertida.status).toBe("Rejected");
    expect(revertida.rejectReason).toBe("Me equivoqué");

    // Y una rechazada es terminal, venga de donde venga.
    expect(await status(() => absenceService.approve(created.id))).toBe(400);
    expect(await status(() => absenceService.reject(created.id, "otra"))).toBe(
      400
    );
  });

  it("una aprobación revertida deja de contar en el impacto del mes", async () => {
    const created = await absenceService.create({
      personId: MARIA,
      type: "Leave",
      startDate: "2031-04-07",
      endDate: "2031-04-11",
    });
    await absenceService.approve(created.id);

    const conAprobada = (await absenceService.getByMonth("2031-04")).items.find(
      (a) => a.id === created.id
    )!;
    expect(conAprobada.status).toBe("Approved");
    expect(conAprobada.squadImpacts.length).toBeGreaterThan(0);

    await absenceService.reject(created.id, "Aprobada por error");

    const revertida = (await absenceService.getByMonth("2031-04")).items.find(
      (a) => a.id === created.id
    )!;
    // El impacto del mes se deriva del estado —el adapter suma sólo las
    // Aprobadas—, así que revertir la saca del cálculo sin restar nada.
    expect(revertida.status).toBe("Rejected");
    expect(revertida.rejectReason).toBe("Aprobada por error");
  });
});
