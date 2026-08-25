import { describe, it, expect, beforeEach } from "vitest";
import { squadService } from "@features/squads/services/squadService";
import { allocationService } from "@features/allocations/services/allocationService";
import { personService } from "@features/people/services/personService";
import { initiativeService } from "@features/initiatives/services/initiativeService";
import { resetSquadsMock } from "../squads.handlers";
import { resetInitiativesMock } from "../initiatives.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetPeopleMock } from "../people.handlers";

const BACKEND = "11111111-1111-1111-1111-111111111111";
const CANALES = "22222222-2222-2222-2222-222222222222";
const DATOS = "55555555-5555-5555-5555-555555555555";
const PAGOS = "44444444-4444-4444-4444-444444444444";

/**
 * Como en peopleStats.handler.test.ts, lo esperado se deriva de los otros
 * endpoints en vez de fijar los números de la semilla: lo que se verifica es
 * que el handler de células cruce bien con asignaciones y personas, no cuántas
 * filas de ejemplo hay cargadas.
 */
async function fetchAllSquads() {
  return (await squadService.list(1, 1000)).items;
}

async function fetchAllocationsOf(squadId: string) {
  return (await allocationService.listBySquad(squadId, 1, 1000)).items;
}

describe("GET /squads (campos calculados y filtros)", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("deriva equipo y capacidad de las asignaciones de cada célula", async () => {
    const squads = await fetchAllSquads();
    const backend = squads.find((s) => s.id === BACKEND)!;
    const own = await fetchAllocationsOf(BACKEND);
    const sum = (pick: (a: (typeof own)[number]) => number) =>
      own.reduce((acc, a) => acc + pick(a), 0) / 100;

    expect(backend.memberCount).toBe(own.length);
    expect(backend.allocatedFte).toBeCloseTo(
      sum((a) => a.dedicationPercentage),
      5
    );
    expect(backend.bauFte).toBeCloseTo(
      sum((a) => a.bauPercentage),
      5
    );
    expect(backend.transformationFte).toBeCloseTo(
      sum((a) => a.transformationPercentage),
      5
    );
  });

  it("recorta la muestra de miembros a 3, ordenados por nombre", async () => {
    const squads = await fetchAllSquads();
    const backend = squads.find((s) => s.id === BACKEND)!;
    expect(backend.memberCount).toBeGreaterThan(3);
    expect(backend.members).toHaveLength(3);
    const names = backend.members.map((m) => m.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("devuelve ceros y sin miembros para una célula sin asignaciones", async () => {
    const squads = await fetchAllSquads();
    const pagos = squads.find((s) => s.id === PAGOS)!;
    expect(pagos).toMatchObject({
      memberCount: 0,
      members: [],
      allocatedFte: 0,
      bauFte: 0,
      transformationFte: 0,
    });
  });

  it("refleja una asignación creada y quitada en la misma sesión", async () => {
    const before = (await fetchAllSquads()).find((s) => s.id === PAGOS)!;
    expect(before.memberCount).toBe(0);

    // Camila Restrepo (f) no tiene célula en las semillas.
    const created = await allocationService.create(PAGOS, {
      personId: "pfffffff-ffff-ffff-ffff-ffffffffffff",
      dedicationPercentage: 50,
      bauPercentage: 20,
      transformationPercentage: 30,
    });
    const during = (await fetchAllSquads()).find((s) => s.id === PAGOS)!;
    expect(during.memberCount).toBe(1);
    expect(during.allocatedFte).toBeCloseTo(0.5, 5);
    expect(during.bauFte).toBeCloseTo(0.2, 5);
    expect(during.transformationFte).toBeCloseTo(0.3, 5);
    expect(during.members[0]).toEqual({
      id: "pfffffff-ffff-ffff-ffff-ffffffffffff",
      name: "Camila Restrepo",
    });

    await allocationService.remove(created.id);
    const after = (await fetchAllSquads()).find((s) => s.id === PAGOS)!;
    expect(after.memberCount).toBe(0);
    expect(after.allocatedFte).toBe(0);
  });

  it("una célula recién creada sale con los campos calculados en cero", async () => {
    const created = await squadService.create({
      name: "Nueva",
      team: "Tribu",
      criticality: "Low",
    });
    expect(created).toMatchObject({
      memberCount: 0,
      members: [],
      allocatedFte: 0,
    });
  });

  it("devuelve la iniciativa activa de cada célula, con su talla", async () => {
    resetInitiativesMock();
    const squads = await fetchAllSquads();

    // Canales tiene una activa evaluada y otra en evaluación: sale sólo la activa.
    const canales = squads.find((s) => s.id === CANALES)!;
    expect(canales.activeInitiative).toMatchObject({ name: "Onboarding App" });
    expect(canales.activeInitiative!.talla).toBeTruthy();
  });

  it("no cuenta como activa una iniciativa en evaluación ni una cerrada", async () => {
    resetInitiativesMock();
    const squads = await fetchAllSquads();

    // Datos tiene una sola iniciativa y está cerrada.
    expect(squads.find((s) => s.id === DATOS)!.activeInitiative).toBeNull();

    // La célula sin ninguna iniciativa se lee igual que la que sólo tiene
    // cerradas: null, una sola forma del caso "no está ejecutando nada".
    expect(squads.find((s) => s.id === PAGOS)!.activeInitiative).toBeNull();
  });

  it("refleja en la célula una iniciativa cerrada en la misma sesión", async () => {
    resetInitiativesMock();
    const antes = (await fetchAllSquads()).find((s) => s.id === BACKEND)!;
    expect(antes.activeInitiative).not.toBeNull();

    await initiativeService.setStatus(antes.activeInitiative!.id, "Closed");

    const despues = (await fetchAllSquads()).find((s) => s.id === BACKEND)!;
    expect(despues.activeInitiative).toBeNull();
    resetInitiativesMock();
  });

  it("persiste y devuelve la agrupación en team, en el alta y en la edición", async () => {
    const creada = await squadService.create({
      name: "Contrato",
      team: "Ecosistema Digital",
      criticality: "Low",
    });
    expect(creada.team).toBe("Ecosistema Digital");

    const editada = await squadService.update(creada.id, {
      name: "Contrato",
      team: "Medios de Pago",
      criticality: "Low",
    });
    expect(editada.team).toBe("Medios de Pago");

    const releida = await squadService.getById(creada.id);
    expect(releida.team).toBe("Medios de Pago");
  });

  it("rechaza un cuerpo que mande la agrupación en tribe", async () => {
    // El nombre viejo del campo no es un alias: para el handler es una célula
    // sin agrupación, y falla la validación de obligatorio en vez de guardarla
    // a medias.
    await expect(
      squadService.create({
        name: "Con el nombre viejo",
        tribe: "Ecosistema Digital",
        criticality: "Low",
      } as unknown as Parameters<typeof squadService.create>[0])
    ).rejects.toBeDefined();
  });

  it("busca por nombre o tribu sin distinguir mayúsculas", async () => {
    const byName = await squadService.list(1, 100, "BACKEND");
    expect(byName.items.map((s) => s.name)).toEqual(["Backend Platform"]);

    const byTeam = await squadService.list(1, 100, "ecosistema");
    expect(byTeam.totalCount).toBe(2);
    expect(byTeam.items.every((s) => s.team === "Ecosistema Digital")).toBe(
      true
    );
  });

  it("filtra por una o más criticidades y pagina sobre el subconjunto", async () => {
    const all = await fetchAllSquads();
    const expected = all.filter((s) =>
      ["Critical", "Low"].includes(s.criticality)
    ).length;
    const result = await squadService.list(1, 100, undefined, [
      "Critical",
      "Low",
    ]);
    expect(result.totalCount).toBe(expected);
    expect(
      result.items.every((s) => ["Critical", "Low"].includes(s.criticality))
    ).toBe(true);
  });
});

describe("GET /squads/stats", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("agrega total, sin equipo y tribus sobre todas las células", async () => {
    const [stats, squads] = await Promise.all([
      squadService.getStats(),
      fetchAllSquads(),
    ]);
    expect(stats.totalCount).toBe(squads.length);
    expect(stats.withoutPeopleCount).toBe(
      squads.filter((s) => s.memberCount === 0).length
    );
    expect(stats.teamCount).toBe(new Set(squads.map((s) => s.team)).size);
    // Al tope: con equipo y asignado ≥ disponible; una sin equipo no cuenta.
    expect(stats.atCapacityCount).toBe(
      squads.filter(
        (s) => s.memberCount > 0 && s.allocatedFte >= s.peopleAvailableFte
      ).length
    );
    expect(stats.atCapacityCount).toBeGreaterThan(0);
  });

  it("suma el FTE asignado con su desglose y toma el FTE del chapter de las personas", async () => {
    const [stats, squads, people] = await Promise.all([
      squadService.getStats(),
      fetchAllSquads(),
      personService.list(1, 1000).then((r) => r.items),
    ]);
    const total = (pick: (s: (typeof squads)[number]) => number) =>
      squads.reduce((acc, s) => acc + pick(s), 0);
    expect(stats.allocatedFte).toBeCloseTo(
      total((s) => s.allocatedFte),
      5
    );
    expect(stats.bauFte).toBeCloseTo(
      total((s) => s.bauFte),
      5
    );
    expect(stats.transformationFte).toBeCloseTo(
      total((s) => s.transformationFte),
      5
    );
    expect(stats.chapterFte).toBeCloseTo(
      people.reduce((acc, p) => acc + p.availableFte, 0),
      5
    );
  });

  it("incluye los 4 niveles de criticidad, en orden, incluso con cero", async () => {
    // Deja solo células Critical para forzar ceros en los otros niveles.
    const squads = await fetchAllSquads();
    await Promise.all(
      squads
        .filter((s) => s.criticality !== "Critical")
        .map((s) => squadService.remove(s.id))
    );
    const stats = await squadService.getStats();
    expect(stats.byCriticality.map((e) => e.criticality)).toEqual([
      "Critical",
      "High",
      "Medium",
      "Low",
    ]);
    expect(stats.byCriticality.map((e) => e.count)).toEqual([
      squads.filter((s) => s.criticality === "Critical").length,
      0,
      0,
      0,
    ]);
  });

  it("chapterFte es 0 cuando no hay personas registradas", async () => {
    const people = (await personService.list(1, 1000)).items;
    await Promise.all(people.map((p) => personService.remove(p.id)));

    const stats = await squadService.getStats();
    expect(stats.chapterFte).toBe(0);
  });
});
