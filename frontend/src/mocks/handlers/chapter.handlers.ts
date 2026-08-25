import { http, HttpResponse } from "msw";
import type {
  CapacityOverviewDto,
  OverviewPersonDto,
  OverviewSquadDto,
} from "@features/control-tower/services/capacityOverviewService";
// Lectura en un solo sentido de los tres mocks (ver squads.handlers.ts): la
// Torre de control es la única pantalla que cruza personas, células y
// asignaciones a la vez.
import { availableFteOf, freeFteOf, fteOfPercentages, round1 } from "./fte";
import { vistaDe } from "./scope";
import { getSquadsSnapshot } from "./squads.handlers";

const OVERVIEW_URL = "/chapter/capacity-overview";

export function computeCapacityOverview(request: Request): CapacityOverviewDto {
  // Personas y asignaciones acotadas juntas — ver scope.ts. Acotar sólo las
  // personas dejaría la dedicación de gente de otro chapter sumando al BAU
  // mientras su FTE disponible no suma, y el FTE libre daría negativo.
  const { people, allocations } = vistaDe(request);
  const squads = getSquadsSnapshot();

  const overviewPeople: OverviewPersonDto[] = people.map((p) => {
    // Una persona tiene una sola asignación (el POST rechaza la segunda).
    const a = allocations.find((x) => x.personId === p.id);
    return {
      id: p.id,
      name: p.name,
      position: p.position,
      seniorityLabel: p.seniorityLabel,
      availableFte: p.availableFte,
      allocation: a
        ? {
            id: a.id,
            squadId: a.squadId,
            squadName: a.squadName,
            dedicationPercentage: a.dedicationPercentage,
            bauPercentage: a.bauPercentage,
            transformationPercentage: a.transformationPercentage,
          }
        : null,
      marginPercentage: a ? Math.max(0, 100 - a.dedicationPercentage) : 100,
    };
  });

  const overviewSquads: OverviewSquadDto[] = squads.map((s) => {
    const own = allocations.filter((a) => a.squadId === s.id);
    // Mismo cálculo que squads.handlers y que Líneas de expertise: la fórmula
    // vive en ./fte para que las tres pantallas no puedan discrepar.
    const sum = (pick: (a: (typeof own)[number]) => number) =>
      fteOfPercentages(own.map(pick));
    return {
      id: s.id,
      name: s.name,
      criticality: s.criticality,
      memberCount: own.length,
      allocatedFte: sum((a) => a.dedicationPercentage),
      bauFte: sum((a) => a.bauPercentage),
      transformationFte: sum((a) => a.transformationPercentage),
      teamAvailableFte: availableFteOf(
        own.map((a) => ({
          availableFte:
            people.find((p) => p.id === a.personId)?.availableFte ?? 0,
        }))
      ),
    };
  });

  const chapterFte = availableFteOf(people);
  const bauFte = round1(overviewSquads.reduce((acc, s) => acc + s.bauFte, 0));
  const transformationFte = round1(
    overviewSquads.reduce((acc, s) => acc + s.transformationFte, 0)
  );

  return {
    chapterFte,
    bauFte,
    transformationFte,
    freeFte: freeFteOf(chapterFte, round1(bauFte + transformationFte)),
    peopleTotal: people.length,
    peopleUnassigned: overviewPeople.filter((p) => !p.allocation).length,
    peoplePartial: overviewPeople.filter(
      (p) => p.allocation && p.allocation.dedicationPercentage < 100
    ).length,
    squadsAtCapacity: overviewSquads.filter(
      (s) => s.memberCount > 0 && s.allocatedFte >= s.teamAvailableFte
    ).length,
    squadsWithoutTeam: overviewSquads.filter((s) => s.memberCount === 0).length,
    people: overviewPeople,
    squads: overviewSquads,
  };
}

export const chapterHandlers = [
  http.get(OVERVIEW_URL, ({ request }) =>
    HttpResponse.json(computeCapacityOverview(request))
  ),
];
