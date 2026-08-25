import { httpClient } from "@shared/services/httpClient";
import type { PagedResult } from "@shared/services/pagination";

export type Criticality = "Critical" | "High" | "Medium" | "Low";

/** Persona asignada a la célula — sólo lo necesario para dibujar su avatar. */
export interface SquadMemberSampleDto {
  id: string;
  name: string;
}

/**
 * La iniciativa activa de la célula: lo justo para leer de qué tamaño es el
 * trabajo que la ocupa.
 *
 * Sin `status`: sólo podría valer "Active", y un campo con un único valor
 * posible invita a filtrar otra vez río abajo. Y `talla` no es nullable porque
 * una iniciativa sólo se activa con evaluación guardada: la activa siempre
 * tiene talla.
 */
export interface SquadActiveInitiativeDto {
  id: string;
  name: string;
  talla: string;
}

export interface SquadDto {
  id: string;
  name: string;
  team: string;
  criticality: Criticality;
  description: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
  // Calculados por el backend desde las asignaciones vigentes de la célula.
  // Sólo lectura: no viajan en el alta ni en la edición. Hoy los sirve el
  // mock de MSW; el backend .NET real aún no los devuelve (brecha documentada
  // en el change redesign-squads-module), por eso el adapter los tolera
  // ausentes.
  memberCount: number;
  /** Hasta 3 personas, ordenadas por nombre, para los avatares de la fila. */
  members: SquadMemberSampleDto[];
  /** Σ dedicationPercentage / 100 */
  allocatedFte: number;
  /** Σ bauPercentage / 100 */
  bauFte: number;
  /** Σ transformationPercentage / 100 */
  transformationFte: number;
  /** Σ availableFte de las personas asignadas: contra qué se mide la ocupación de la fila. */
  peopleAvailableFte: number;
  /**
   * La iniciativa activa de la célula, o null si no tiene ninguna. Una célula
   * sostiene como mucho un trabajo a la vez —el backend lo hace cumplir al
   * activar—, así que el campo es uno o ninguno y no una lista: con una lista,
   * el día que se colara una segunda activa la vista elegiría una en silencio.
   *
   * Las iniciativas en evaluación no viajan acá: el listado responde por lo que
   * la célula ejecuta, no por lo que todavía se está dimensionando.
   */
  activeInitiative: SquadActiveInitiativeDto | null;
}

export interface CreateSquadRequest {
  name: string;
  team: string;
  criticality: Criticality;
  description?: string;
}

export type UpdateSquadRequest = CreateSquadRequest;

/** Resumen agregado sobre el total de células registradas (sin paginar ni filtrar). */
export interface SquadsStats {
  totalCount: number;
  withoutPeopleCount: number;
  /** Células con personas asignadas cuyo FTE asignado alcanza o supera el disponible de esas personas. */
  atCapacityCount: number;
  teamCount: number;
  allocatedFte: number;
  bauFte: number;
  transformationFte: number;
  /** Σ availableFte de las personas registradas: la capacidad que el chapter tiene para repartir. */
  chapterFte: number;
  /** Siempre los 4 niveles del catálogo, incluso con cero células. */
  byCriticality: { criticality: Criticality; count: number }[];
}

/** Resumen de las personas de una célula, calculado sobre todas sus asignaciones. */
export interface SquadTeamStats {
  memberCount: number;
  /** Todas las personas de la célula, por nombre, para los avatares. */
  members: SquadMemberSampleDto[];
  expertCount: number;
  beginnerCount: number;
  allocatedFte: number;
  bauFte: number;
  transformationFte: number;
  /** Σ availableFte de las personas de la célula. */
  peopleAvailableFte: number;
}

const SQUADS_URL = "/squads";
const SQUADS_STATS_URL = "/squads/stats";
const CRITICALITIES_URL = "/criticalities";

export const squadService = {
  list: async (
    page: number,
    pageSize: number,
    search?: string,
    criticalities?: Criticality[]
  ): Promise<PagedResult<SquadDto>> => {
    // Serializado a mano por el mismo motivo que personService: el default de
    // axios para arrays emite `criticality[]=`, y el backend bindea
    // `criticality=A&criticality=B`.
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    criticalities?.forEach((c) => params.append("criticality", c));
    const response = await httpClient.get<PagedResult<SquadDto>>(SQUADS_URL, {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<SquadDto> => {
    const response = await httpClient.get<SquadDto>(`${SQUADS_URL}/${id}`);
    return response.data;
  },

  getTeamStats: async (id: string): Promise<SquadTeamStats> => {
    const response = await httpClient.get<SquadTeamStats>(
      `${SQUADS_URL}/${id}/team-stats`
    );
    return response.data;
  },

  getStats: async (): Promise<SquadsStats> => {
    const response = await httpClient.get<SquadsStats>(SQUADS_STATS_URL);
    return response.data;
  },

  create: async (request: CreateSquadRequest): Promise<SquadDto> => {
    const response = await httpClient.post<SquadDto>(SQUADS_URL, request);
    return response.data;
  },

  update: async (
    id: string,
    request: UpdateSquadRequest
  ): Promise<SquadDto> => {
    const response = await httpClient.put<SquadDto>(
      `${SQUADS_URL}/${id}`,
      request
    );
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${SQUADS_URL}/${id}`);
  },

  getCriticalities: async (): Promise<Criticality[]> => {
    const response = await httpClient.get<Criticality[]>(CRITICALITIES_URL);
    return response.data;
  },
};
