import type {
  CapacityOverviewDto,
  OverviewPersonDto,
  OverviewSquadDto,
} from "../services/capacityOverviewService";
import { CRITICALITY_LABELS } from "@features/squads/adapters/SquadAdapter";

export interface OverviewPerson extends OverviewPersonDto {
  /** Margen en FTE: availableFte × marginPercentage / 100. */
  marginFte: number;
}

export interface OverviewSquad extends OverviewSquadDto {
  criticalityLabel: string;
  freeFte: number;
  atCapacity: boolean;
  withoutTeam: boolean;
}

export interface CapacityOverview {
  chapterFte: number;
  bauFte: number;
  transformationFte: number;
  freeFte: number;
  peopleTotal: number;
  peopleUnassigned: number;
  peoplePartial: number;
  squadsAtCapacity: number;
  squadsWithoutTeam: number;
  people: OverviewPerson[];
  squads: OverviewSquad[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const capacityOverviewAdapter = {
  toEntity: (dto: CapacityOverviewDto): CapacityOverview => ({
    ...dto,
    people: dto.people.map((p) => ({
      ...p,
      marginFte: round1((p.availableFte * p.marginPercentage) / 100),
    })),
    squads: dto.squads.map((s) => ({
      ...s,
      criticalityLabel: CRITICALITY_LABELS[s.criticality] ?? s.criticality,
      freeFte: round1(Math.max(s.teamAvailableFte - s.allocatedFte, 0)),
      atCapacity: s.memberCount > 0 && s.allocatedFte >= s.teamAvailableFte,
      withoutTeam: s.memberCount === 0,
    })),
  }),
};

/** Sin célula primero; después por margen descendente. Las personas al 100 % no entran. */
export function peopleWithMargin(people: OverviewPerson[]): OverviewPerson[] {
  return people
    .filter((p) => p.marginPercentage > 0)
    .sort((a, b) => {
      if (!a.allocation !== !b.allocation) return a.allocation ? 1 : -1;
      return b.marginFte - a.marginFte || a.name.localeCompare(b.name);
    });
}

export function unassignedPeople(people: OverviewPerson[]): OverviewPerson[] {
  return people.filter((p) => !p.allocation);
}

/** Sin equipo, luego al tope, luego por menor FTE libre. */
export function squadsByNeed(squads: OverviewSquad[]): OverviewSquad[] {
  const rank = (s: OverviewSquad) => (s.withoutTeam ? 0 : s.atCapacity ? 1 : 2);
  return [...squads].sort(
    (a, b) =>
      rank(a) - rank(b) || a.freeFte - b.freeFte || a.name.localeCompare(b.name)
  );
}
