import { describe, it, expect, beforeEach } from "vitest";
import { personService } from "@features/people/services/personService";
import { resetPeopleMock } from "../people.handlers";

/**
 * Estas comprobaciones derivan lo esperado del listado en vez de fijar los
 * números de la semilla. Antes los fijaban, y agregar personas al mock las
 * rompió a todas sin que nada estuviera mal: lo que verifican es que el
 * resumen agregue bien, no cuánta gente hay cargada de ejemplo.
 */
async function fetchAllPeople() {
  const result = await personService.list(1, 1000);
  return result.items;
}

describe("GET /people/stats", () => {
  beforeEach(() => {
    resetPeopleMock();
  });

  it("counts every person in memory as activeCount", async () => {
    const [stats, people] = await Promise.all([
      personService.getStats(),
      fetchAllPeople(),
    ]);
    expect(people.length).toBeGreaterThan(0);
    expect(stats.activeCount).toBe(people.length);
  });

  it("sums availableFte across all people", async () => {
    const [stats, people] = await Promise.all([
      personService.getStats(),
      fetchAllPeople(),
    ]);
    const expected = people.reduce((sum, p) => sum + p.availableFte, 0);
    expect(stats.fteAvailable).toBeCloseTo(expected, 5);
  });

  it("counts people per seniority value, including zero for unused ones", async () => {
    const [stats, people] = await Promise.all([
      personService.getStats(),
      fetchAllPeople(),
    ]);

    // Los 4 niveles del catálogo siempre están presentes, tenga o no gente
    // cada uno — es la parte que evita que un nivel vacío desaparezca del
    // resumen en vez de mostrarse en cero.
    expect(stats.bySeniority.map((s) => s.seniority).sort()).toEqual([
      1, 2, 3, 4,
    ]);

    for (const entry of stats.bySeniority) {
      const expected = people.filter(
        (p) => p.seniority === entry.seniority
      ).length;
      expect(entry.count).toBe(expected);
    }
  });

  it("reflects create/delete changes made during the session", async () => {
    const before = (await personService.getStats()).activeCount;

    const created = await personService.create({
      name: "Nueva Persona",
      documentId: "999",
      entraObjectId: "",
      userPrincipalName: "nueva@tuya.com",
      position: "QA",
      role: "Contributor",
      technicalLeadId: null,
      seniority: 1,
      modality: "Remote",
      availableFte: 0.5,
      monthlyCost: 4000000,
      startDate: "2026-01-01",
    });

    expect((await personService.getStats()).activeCount).toBe(before + 1);

    await personService.remove(created.id);
    expect((await personService.getStats()).activeCount).toBe(before);
  });
});
