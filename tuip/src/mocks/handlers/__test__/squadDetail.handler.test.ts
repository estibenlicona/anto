import { describe, it, expect, beforeEach } from "vitest";
import { squadService } from "@features/squads/services/squadService";
import { allocationService } from "@features/allocations/services/allocationService";
import { personService } from "@features/people/services/personService";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetPeopleMock } from "../people.handlers";

const BACKEND = "11111111-1111-1111-1111-111111111111";
const PAGOS = "44444444-4444-4444-4444-444444444444";
const PAULA = "pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const MARIA = "p1111111-1111-1111-1111-111111111111";

describe("GET /squads/:id", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("devuelve la célula con sus campos calculados", async () => {
    const squad = await squadService.getById(BACKEND);
    expect(squad.name).toBe("Backend Platform");
    expect(squad.memberCount).toBeGreaterThan(0);
    expect(squad.members.length).toBeLessThanOrEqual(3);
  });

  it("responde 404 para un id desconocido", async () => {
    await expect(squadService.getById("no-existe")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("GET /squads/:id/team-stats", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("deriva conteos, expertos/principiantes y FTE del equipo", async () => {
    const [stats, allocations, people] = await Promise.all([
      squadService.getTeamStats(BACKEND),
      allocationService.listBySquad(BACKEND, 1, 1000).then((r) => r.items),
      personService.list(1, 1000).then((r) => r.items),
    ]);
    const members = allocations.map((a) =>
      people.find((p) => p.id === a.personId)!
    );
    const sum = (pick: (a: (typeof allocations)[number]) => number) =>
      allocations.reduce((acc, a) => acc + pick(a), 0) / 100;

    expect(stats.memberCount).toBe(allocations.length);
    expect(stats.members).toHaveLength(allocations.length);
    expect(stats.expertCount).toBe(
      members.filter((p) => p.seniority === 4).length
    );
    expect(stats.beginnerCount).toBe(
      members.filter((p) => p.seniority === 1).length
    );
    expect(stats.allocatedFte).toBeCloseTo(
      sum((a) => a.dedicationPercentage),
      5
    );
    expect(stats.bauFte).toBeCloseTo(
      sum((a) => a.bauPercentage),
      5
    );
    expect(stats.transformationFte).toBeCloseTo(
      sum((a) => a.transformationPercentage),
      5
    );
    expect(stats.peopleAvailableFte).toBeCloseTo(
      members.reduce((acc, p) => acc + p.availableFte, 0),
      5
    );
  });

  it("una célula sin equipo devuelve ceros", async () => {
    const stats = await squadService.getTeamStats(PAGOS);
    expect(stats).toEqual({
      memberCount: 0,
      members: [],
      expertCount: 0,
      beginnerCount: 0,
      allocatedFte: 0,
      bauFte: 0,
      transformationFte: 0,
      peopleAvailableFte: 0,
    });
  });

  it("responde 404 para un id desconocido", async () => {
    await expect(squadService.getTeamStats("no-existe")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});

describe("GET /squads/:id/allocations (campos de persona y filtros)", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("completa cada asignación con cargo, modalidad y seniority de la persona", async () => {
    const { items } = await allocationService.listBySquad(BACKEND, 1, 100);
    const maria = items.find((a) => a.personId === MARIA)!;
    expect(maria).toMatchObject({
      personName: "María González",
      personPosition: "Backend Dev",
      personModality: "Hybrid",
      personSeniority: 3,
      personSeniorityLabel: "Avanzado",
    });
  });

  it("el margen es 100 − dedicación: una persona tiene una sola célula", async () => {
    const { items } = await allocationService.listBySquad(BACKEND, 1, 100);
    const maria = items.find((a) => a.personId === MARIA)!;
    expect(maria.personAvailablePercentage).toBe(20);
    expect(items.some((a) => a.personId === PAULA)).toBe(false);
  });

  it("las semillas no tienen a nadie en dos células", async () => {
    const all = await squadService.list(1, 100);
    const seen = new Set<string>();
    for (const s of all.items) {
      const { items } = await allocationService.listBySquad(s.id, 1, 100);
      for (const a of items) {
        expect(seen.has(a.personId)).toBe(false);
        seen.add(a.personId);
      }
    }
  });

  it("rechaza con 400 una asignación para una persona que ya está en otra célula", async () => {
    await expect(
      allocationService.create(PAGOS, {
        personId: MARIA,
        dedicationPercentage: 20,
        bauPercentage: 10,
        transformationPercentage: 10,
      })
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it("busca por nombre o cargo y filtra por seniority", async () => {
    const byName = await allocationService.listBySquad(
      BACKEND,
      1,
      100,
      "maría"
    );
    expect(byName.items.map((a) => a.personName)).toEqual(["María González"]);

    const byPosition = await allocationService.listBySquad(
      BACKEND,
      1,
      100,
      "arquitecto"
    );
    expect(byPosition.items.map((a) => a.personName)).toEqual(["Carlos López"]);

    const experts = await allocationService.listBySquad(
      BACKEND,
      1,
      100,
      undefined,
      [4]
    );
    expect(experts.totalCount).toBe(1);
    expect(experts.items.every((a) => a.personSeniority === 4)).toBe(true);
  });

  it("el alta sale con los campos de persona ya completos", async () => {
    // Camila Restrepo (f) no tiene célula en las semillas.
    const created = await allocationService.create(PAGOS, {
      personId: "pfffffff-ffff-ffff-ffff-ffffffffffff",
      dedicationPercentage: 20,
      bauPercentage: 10,
      transformationPercentage: 10,
    });
    expect(created.personPosition).toBe("Product Owner");
    expect(created.personAvailablePercentage).toBe(80);
  });
});

describe("GET /squads — peopleAvailableFte por célula", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("es la suma del availableFte de las personas asignadas, y 0 sin equipo", async () => {
    const [{ items: squads }, { items: allocations }, { items: people }] =
      await Promise.all([
        squadService.list(1, 100),
        allocationService.listBySquad(BACKEND, 1, 100),
        personService.list(1, 1000),
      ]);
    const backend = squads.find((s) => s.id === BACKEND)!;
    const expected = allocations.reduce(
      (acc, a) =>
        acc + (people.find((p) => p.id === a.personId)?.availableFte ?? 0),
      0
    );
    expect(backend.peopleAvailableFte).toBeCloseTo(expected, 5);
    expect(squads.find((s) => s.id === PAGOS)!.peopleAvailableFte).toBe(0);
  });
});
