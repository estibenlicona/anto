import { describe, expect, it } from "vitest";
import {
  capacityOverviewAdapter,
  peopleWithMargin,
  squadsByNeed,
  unassignedPeople,
} from "../CapacityOverviewAdapter";
import type { CapacityOverviewDto } from "../../services/capacityOverviewService";

const alloc = (squadId: string, dedication: number) => ({
  id: "a-" + squadId,
  squadId,
  squadName: squadId,
  dedicationPercentage: dedication,
  bauPercentage: dedication,
  transformationPercentage: 0,
});

const person = (
  id: string,
  availableFte: number,
  allocation: ReturnType<typeof alloc> | null,
  marginPercentage: number
) => ({
  id,
  name: id,
  position: "",
  seniorityLabel: "",
  availableFte,
  allocation,
  marginPercentage,
});

const squad = (
  id: string,
  name: string,
  criticality: "Low" | "High" | "Critical",
  memberCount: number,
  allocatedFte: number,
  teamAvailableFte: number
) => ({
  id,
  name,
  criticality,
  memberCount,
  allocatedFte,
  teamAvailableFte,
  bauFte: allocatedFte,
  transformationFte: 0,
});

const dto: CapacityOverviewDto = {
  chapterFte: 4,
  bauFte: 1,
  transformationFte: 1,
  freeFte: 2,
  peopleTotal: 4,
  peopleUnassigned: 1,
  peoplePartial: 2,
  squadsAtCapacity: 1,
  squadsWithoutTeam: 1,
  people: [
    person("full", 1, alloc("s1", 100), 0),
    person("half", 1, alloc("s1", 50), 50),
    person("mostly", 0.8, alloc("s2", 20), 80),
    person("none", 1, null, 100),
  ],
  squads: [
    squad("s1", "Con margen", "Low", 2, 1.5, 2),
    squad("s2", "Al tope", "High", 1, 0.8, 0.8),
    squad("s3", "Sin equipo", "Critical", 0, 0, 0),
  ],
};

describe("capacityOverviewAdapter", () => {
  const overview = capacityOverviewAdapter.toEntity(dto);

  it("deriva margen en FTE, etiqueta de criticidad, libre, al tope y sin equipo", () => {
    expect(overview.people.find((p) => p.id === "mostly")!.marginFte).toBe(0.6);
    expect(overview.people.find((p) => p.id === "none")!.marginFte).toBe(1);
    expect(overview.squads.find((s) => s.id === "s2")!).toMatchObject({
      criticalityLabel: "Alta",
      freeFte: 0,
      atCapacity: true,
      withoutTeam: false,
    });
    expect(overview.squads.find((s) => s.id === "s3")!).toMatchObject({
      withoutTeam: true,
      atCapacity: false,
    });
    expect(overview.squads.find((s) => s.id === "s1")!.freeFte).toBe(0.5);
  });

  it("peopleWithMargin: sin célula primero, luego por margen descendente, sin los del 100 %", () => {
    expect(peopleWithMargin(overview.people).map((p) => p.id)).toEqual([
      "none",
      "mostly",
      "half",
    ]);
  });

  it("unassignedPeople: sólo sin asignación", () => {
    expect(unassignedPeople(overview.people).map((p) => p.id)).toEqual([
      "none",
    ]);
  });

  it("squadsByNeed: sin equipo, al tope, luego por menor libre", () => {
    expect(squadsByNeed(overview.squads).map((s) => s.id)).toEqual([
      "s3",
      "s2",
      "s1",
    ]);
  });
});
