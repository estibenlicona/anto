import { httpClient } from "@shared/services/httpClient";
import type { Criticality } from "@features/squads/services/squadService";

export interface OverviewAllocationDto {
  id: string;
  squadId: string;
  squadName: string;
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
}

export interface OverviewPersonDto {
  id: string;
  name: string;
  position: string;
  seniorityLabel: string;
  availableFte: number;
  /** Su única asignación, o ninguna. */
  allocation: OverviewAllocationDto | null;
  /** 100 sin célula; 100 − dedicación con célula. */
  marginPercentage: number;
}

export interface OverviewSquadDto {
  id: string;
  name: string;
  criticality: Criticality;
  memberCount: number;
  allocatedFte: number;
  teamAvailableFte: number;
  bauFte: number;
  transformationFte: number;
}

/**
 * Resumen de capacidad del chapter para la Torre de control. Una sola llamada:
 * la pantalla necesita los tres bloques a la vez y el drawer de reasignación
 * reutiliza `squads` para el destino y el "Así queda". Hoy lo sirve el mock;
 * el backend real queda como brecha documentada (add-control-tower-reassignment).
 */
export interface CapacityOverviewDto {
  chapterFte: number;
  bauFte: number;
  transformationFte: number;
  freeFte: number;
  peopleTotal: number;
  peopleUnassigned: number;
  peoplePartial: number;
  squadsAtCapacity: number;
  squadsWithoutTeam: number;
  people: OverviewPersonDto[];
  squads: OverviewSquadDto[];
}

const OVERVIEW_URL = "/chapter/capacity-overview";

export const capacityOverviewService = {
  getOverview: async (): Promise<CapacityOverviewDto> => {
    const response = await httpClient.get<CapacityOverviewDto>(OVERVIEW_URL);
    return response.data;
  },
};
