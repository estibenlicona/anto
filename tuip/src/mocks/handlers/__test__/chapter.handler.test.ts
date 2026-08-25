import { describe, it, expect, beforeEach } from "vitest";
import { capacityOverviewService } from "@features/control-tower/services/capacityOverviewService";
import { squadService } from "@features/squads/services/squadService";
import { personService } from "@features/people/services/personService";
import { allocationService } from "@features/allocations/services/allocationService";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetPeopleMock } from "../people.handlers";

const PAGOS = "44444444-4444-4444-4444-444444444444";
const CAMILA = "pfffffff-ffff-ffff-ffff-ffffffffffff";

describe("GET /chapter/capacity-overview", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetPeopleMock();
  });

  it("es coherente con personas, células y asignaciones en memoria", async () => {
    const [overview, people, squads] = await Promise.all([
      capacityOverviewService.getOverview(),
      personService.list(1, 1000).then((r) => r.items),
      squadService.list(1, 100).then((r) => r.items),
    ]);
    expect(overview.peopleTotal).toBe(people.length);
    expect(overview.people).toHaveLength(people.length);
    expect(overview.squads).toHaveLength(squads.length);
    expect(overview.chapterFte).toBeCloseTo(
      people.reduce((acc, p) => acc + p.availableFte, 0),
      5
    );
    // Mismos números que el listado de Células.
    for (const s of squads) {
      const o = overview.squads.find((x) => x.id === s.id)!;
      expect(o.allocatedFte).toBeCloseTo(s.allocatedFte, 5);
      expect(o.teamAvailableFte).toBeCloseTo(s.peopleAvailableFte, 5);
      expect(o.memberCount).toBe(s.memberCount);
    }
    expect(overview.freeFte).toBeCloseTo(
      overview.chapterFte - overview.bauFte - overview.transformationFte,
      5
    );
    expect(overview.squadsWithoutTeam).toBe(
      squads.filter((s) => s.memberCount === 0).length
    );
  });

  it("marginPercentage: 100 sin célula, 100 − dedicación con célula", async () => {
    const overview = await capacityOverviewService.getOverview();
    const camila = overview.people.find((p) => p.id === CAMILA)!;
    expect(camila.allocation).toBeNull();
    expect(camila.marginPercentage).toBe(100);
    const maria = overview.people.find((p) => p.name === "María González")!;
    expect(maria.allocation?.dedicationPercentage).toBe(80);
    expect(maria.marginPercentage).toBe(20);
    expect(overview.people.filter((p) => !p.allocation)).toHaveLength(
      overview.peopleUnassigned
    );
  });

  it("refleja una asignación creada en la misma sesión", async () => {
    const before = await capacityOverviewService.getOverview();
    await allocationService.create(PAGOS, {
      personId: CAMILA,
      dedicationPercentage: 100,
      bauPercentage: 60,
      transformationPercentage: 40,
    });
    const after = await capacityOverviewService.getOverview();
    expect(after.peopleUnassigned).toBe(before.peopleUnassigned - 1);
    expect(after.squadsWithoutTeam).toBe(before.squadsWithoutTeam - 1);
    expect(after.people.find((p) => p.id === CAMILA)!.allocation?.squadId).toBe(
      PAGOS
    );
  });
});
