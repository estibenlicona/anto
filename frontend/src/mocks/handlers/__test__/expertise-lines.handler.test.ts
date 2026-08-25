import { describe, it, expect, beforeEach } from "vitest";
import { expertiseLinesService } from "@features/expertise-lines/services/expertiseLinesService";
import { capacityOverviewService } from "@features/control-tower/services/capacityOverviewService";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetExpertiseLinesMock } from "../expertise-lines.handlers";
import { resetPeopleMock } from "../people.handlers";

const BACKEND = "e1111111-1111-1111-1111-111111111111";
const QA = "e2222222-2222-2222-2222-222222222222";
const FRONTEND = "e3333333-3333-3333-3333-333333333333";
const AS400 = "e6666666-6666-6666-6666-666666666666";

const MARIA = "p1111111-1111-1111-1111-111111111111";
const LAURA = "p2222222-2222-2222-2222-222222222222";
const CARLOS = "p3333333-3333-3333-3333-333333333333";
/** Valentina Ospina — sembrada sin línea a propósito. */
const VALENTINA = "pddddddd-dddd-dddd-dddd-dddddddddddd";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

beforeEach(() => {
  resetPeopleMock();
  resetAllocationsMock();
  resetExpertiseLinesMock();
});

describe("mock de líneas de expertise", () => {
  it("lista las líneas con su estado, su lead y su gente", async () => {
    const lines = await expertiseLinesService.list();

    const backend = lines.find((l) => l.id === BACKEND)!;
    expect(backend.status).toBe("Active");
    expect(backend.lead?.id).toBe(MARIA);
    expect(backend.peopleCount).toBeGreaterThan(0);

    // La sembrada sin lead, que es la que la pantalla marca como incompleta.
    expect(lines.find((l) => l.id === FRONTEND)!.lead).toBeNull();
    // La archivada sigue en el listado, y vacía.
    const as400 = lines.find((l) => l.id === AS400)!;
    expect(as400.status).toBe("Archived");
    expect(as400.peopleCount).toBe(0);
  });

  it("el FTE de la línea coincide con el que la Torre calcula sobre esa misma gente", async () => {
    const detail = await expertiseLinesService.get(BACKEND);
    const overview = await capacityOverviewService.getOverview();

    const ids = new Set(detail.people.map((p) => p.id));
    const fromOverview = overview.people.filter((p) => ids.has(p.id));

    const available =
      Math.round(
        fromOverview.reduce((acc, p) => acc + p.availableFte, 0) * 10
      ) / 10;
    const allocated =
      Math.round(
        fromOverview.reduce(
          (acc, p) => acc + (p.allocation?.dedicationPercentage ?? 0) / 100,
          0
        ) * 10
      ) / 10;

    expect(detail.capacity.availableFte).toBe(available);
    expect(detail.capacity.allocatedFte).toBe(allocated);
  });

  it("una línea vacía no divide por cero", async () => {
    const detail = await expertiseLinesService.get(AS400);

    expect(detail.people).toEqual([]);
    expect(detail.capacity).toMatchObject({
      peopleCount: 0,
      availableFte: 0,
      allocatedFte: 0,
      freeFte: 0,
      unallocatedPercentage: 0,
    });
  });

  it("rechaza el nombre repetido entre activas y el código repetido incluso archivado", async () => {
    expect(
      await status(() =>
        expertiseLinesService.create({
          name: "Backend",
          code: "NEW",
          description: null,
        })
      )
    ).toBe(409);

    // AS-400 está archivada, pero su código no se libera.
    expect(
      await status(() =>
        expertiseLinesService.create({
          name: "Core legado",
          code: "AS400",
          description: null,
        })
      )
    ).toBe(409);
  });

  it("normaliza el código a mayúsculas y valida los obligatorios", async () => {
    const created = await expertiseLinesService.create({
      name: "Mobile",
      code: "mob",
      description: null,
    });
    expect(created.code).toBe("MOB");
    expect(created.status).toBe("Active");
    expect(created.lead).toBeNull();

    expect(
      await status(() =>
        expertiseLinesService.create({ name: "", code: "X", description: null })
      )
    ).toBe(400);
  });

  it("designar lead incorpora a la persona y rechaza a quien ya lidera otra", async () => {
    // Valentina no tiene línea: designarla la trae a Frontend.
    const detail = await expertiseLinesService.setLead(FRONTEND, VALENTINA);
    expect(detail.lead?.id).toBe(VALENTINA);
    expect(detail.people.some((p) => p.id === VALENTINA && p.isLead)).toBe(
      true
    );

    // Laura lidera QA: no puede liderar también Frontend.
    expect(
      await status(() => expertiseLinesService.setLead(FRONTEND, LAURA))
    ).toBe(409);
    expect((await expertiseLinesService.get(QA)).lead?.id).toBe(LAURA);
  });

  it("quitar el lead deja a la persona en la línea", async () => {
    const detail = await expertiseLinesService.setLead(QA, null);

    expect(detail.lead).toBeNull();
    expect(detail.people.some((p) => p.id === LAURA)).toBe(true);
  });

  it("mover a alguien de línea no toca su asignación a células", async () => {
    const allocationOfCarlos = async () =>
      (await capacityOverviewService.getOverview()).people.find(
        (p) => p.id === CARLOS
      )?.allocation;
    const before = await allocationOfCarlos();

    await expertiseLinesService.addPeople(QA, [CARLOS]);

    const qa = await expertiseLinesService.get(QA);
    const backend = await expertiseLinesService.get(BACKEND);
    expect(qa.people.some((p) => p.id === CARLOS)).toBe(true);
    expect(backend.people.some((p) => p.id === CARLOS)).toBe(false);

    expect(await allocationOfCarlos()).toEqual(before);
  });

  it("no deja quitar de la línea a quien la lidera", async () => {
    expect(
      await status(() => expertiseLinesService.removePerson(QA, LAURA))
    ).toBe(409);
    expect(
      (await expertiseLinesService.get(QA)).people.some((p) => p.id === LAURA)
    ).toBe(true);
  });

  it("archiva sólo una línea vacía, y la reactiva sin gente ni lead", async () => {
    expect(await status(() => expertiseLinesService.archive(QA))).toBe(409);

    const reactivated = await expertiseLinesService.reactivate(AS400);
    expect(reactivated.status).toBe("Active");

    const archived = await expertiseLinesService.archive(AS400);
    expect(archived.status).toBe("Archived");
    expect(archived.peopleCount).toBe(0);
    expect(archived.lead).toBeNull();
  });

  it("una línea archivada no recibe personas", async () => {
    expect(
      await status(() => expertiseLinesService.addPeople(AS400, [VALENTINA]))
    ).toBe(409);
  });

  it("el padrón dice la línea de cada persona, y `null` para quien no tiene", async () => {
    const before = await expertiseLinesService.roster();
    const withoutLine = before.filter((p) => p.line === null);

    expect(withoutLine.length).toBeGreaterThanOrEqual(2);
    expect(withoutLine.some((p) => p.id === VALENTINA)).toBe(true);
    expect(before.find((p) => p.id === LAURA)?.line).toMatchObject({
      id: QA,
      name: "QA",
    });

    await expertiseLinesService.addPeople(FRONTEND, [VALENTINA]);

    const after = await expertiseLinesService.roster();
    expect(after.find((p) => p.id === VALENTINA)?.line?.id).toBe(FRONTEND);
    expect(after.filter((p) => p.line === null)).toHaveLength(
      withoutLine.length - 1
    );
  });

  it("responde 404 sobre una línea que no existe", async () => {
    const ghost = "e0000000-0000-0000-0000-000000000000";

    expect(await status(() => expertiseLinesService.get(ghost))).toBe(404);
    expect(await status(() => expertiseLinesService.archive(ghost))).toBe(404);
    expect(
      await status(() => expertiseLinesService.addPeople(ghost, [VALENTINA]))
    ).toBe(404);
  });
});
