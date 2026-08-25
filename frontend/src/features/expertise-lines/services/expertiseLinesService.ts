import { httpClient } from "@shared/services/httpClient";

/**
 * Líneas de expertise: el maestro de a qué disciplina pertenece cada persona,
 * transversalmente a las células. El backend todavía no lo conoce — el contrato
 * lo fija el mock.
 *
 * **Sobre el nombre.** La UI dice "línea de expertise" porque así la nombra el
 * modelo de negocio. El código que ya existe dice `chapter` (`Person.chapterId`,
 * `chapter.handlers`, el rol `chapter-lead`) y no se renombró: es lo mismo. Esta
 * feature usa el nombre del negocio y convive con el otro; si algún día se
 * unifica, se unifica en un change propio.
 *
 * Una persona pertenece a lo sumo a una línea. Quién pertenece a qué línea lo
 * decide este recurso y nadie más: el alta y la edición de persona no lo tocan.
 */

export type ExpertiseLineStatus = "Active" | "Archived";

/** Quién lidera la línea. Siempre pertenece a la línea que lidera. */
export interface LineLeadDto {
  id: string;
  name: string;
}

export interface ExpertiseLineDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: ExpertiseLineStatus;
  lead: LineLeadDto | null;
  peopleCount: number;
  /** Σ del FTE disponible de sus personas. */
  availableFte: number;
}

/** La asignación a célula de una persona, para mostrarla junto a ella. */
export interface LinePersonAllocationDto {
  squadId: string;
  squadName: string;
  dedicationPercentage: number;
}

export interface LinePersonDto {
  id: string;
  name: string;
  position: string;
  seniority: number;
  seniorityLabel: string;
  availableFte: number;
  isLead: boolean;
  allocation: LinePersonAllocationDto | null;
}

/**
 * El resumen que hace comparable una línea con otra.
 *
 * Ojo con `allocatedFte`: se calcula con el mismo criterio que la Torre de
 * control (Σ dedicación / 100, sin mirar el FTE disponible de cada persona), y
 * por eso puede superar a `availableFte`. `freeFte` está acotado en cero.
 */
export interface LineCapacityDto {
  peopleCount: number;
  availableFte: number;
  allocatedFte: number;
  freeFte: number;
  unallocatedPercentage: number;
}

export interface ExpertiseLineDetailDto extends ExpertiseLineDto {
  people: LinePersonDto[];
  capacity: LineCapacityDto;
}

/**
 * Una persona del padrón, con la línea a la que pertenece hoy o `null`.
 *
 * Es una sola lectura porque sirve a dos preguntas que la pantalla hace a la
 * vez: quién está sin línea, y a quién se puede asignar sabiendo de qué línea
 * saldría. Separarlas obligaría a pedir el detalle de cada línea sólo para
 * armar un selector.
 */
export interface RosterPersonDto {
  id: string;
  name: string;
  position: string;
  seniority: number;
  seniorityLabel: string;
  availableFte: number;
  line: { id: string; name: string } | null;
}

export interface UpsertExpertiseLineRequest {
  name: string;
  code: string;
  description: string | null;
}

export const EXPERTISE_LINE_LIMITS = {
  name: 100,
  code: 10,
  description: 200,
} as const;

const LINES_URL = "/expertise-lines";

export const expertiseLinesService = {
  list: async (): Promise<ExpertiseLineDto[]> => {
    const response = await httpClient.get<ExpertiseLineDto[]>(LINES_URL);
    return response.data;
  },

  get: async (id: string): Promise<ExpertiseLineDetailDto> => {
    const response = await httpClient.get<ExpertiseLineDetailDto>(
      `${LINES_URL}/${id}`
    );
    return response.data;
  },

  create: async (
    request: UpsertExpertiseLineRequest
  ): Promise<ExpertiseLineDto> => {
    const response = await httpClient.post<ExpertiseLineDto>(
      LINES_URL,
      request
    );
    return response.data;
  },

  update: async (
    id: string,
    request: UpsertExpertiseLineRequest
  ): Promise<ExpertiseLineDto> => {
    const response = await httpClient.put<ExpertiseLineDto>(
      `${LINES_URL}/${id}`,
      request
    );
    return response.data;
  },

  /**
   * Designa o retira el lead. Designar incorpora a la persona a la línea si
   * estaba en otra o sin línea: un lead que no pertenece a su línea no cuenta
   * en su capacidad y la línea mentiría sobre a quién agrupa.
   */
  setLead: async (
    id: string,
    personId: string | null
  ): Promise<ExpertiseLineDetailDto> => {
    const response = await httpClient.put<ExpertiseLineDetailDto>(
      `${LINES_URL}/${id}/lead`,
      { personId }
    );
    return response.data;
  },

  /** Incorpora personas, sacándolas de la línea que tuvieran. No toca sus células. */
  addPeople: async (
    id: string,
    personIds: string[]
  ): Promise<ExpertiseLineDetailDto> => {
    const response = await httpClient.post<ExpertiseLineDetailDto>(
      `${LINES_URL}/${id}/people`,
      { personIds }
    );
    return response.data;
  },

  removePerson: async (
    id: string,
    personId: string
  ): Promise<ExpertiseLineDetailDto> => {
    const response = await httpClient.delete<ExpertiseLineDetailDto>(
      `${LINES_URL}/${id}/people/${personId}`
    );
    return response.data;
  },

  /** Sólo sobre una línea sin personas. */
  archive: async (id: string): Promise<ExpertiseLineDto> => {
    const response = await httpClient.post<ExpertiseLineDto>(
      `${LINES_URL}/${id}/archive`,
      {}
    );
    return response.data;
  },

  reactivate: async (id: string): Promise<ExpertiseLineDto> => {
    const response = await httpClient.post<ExpertiseLineDto>(
      `${LINES_URL}/${id}/reactivate`,
      {}
    );
    return response.data;
  },

  /** Todas las personas registradas con su línea actual, o `null`. */
  roster: async (): Promise<RosterPersonDto[]> => {
    const response = await httpClient.get<RosterPersonDto[]>(
      `${LINES_URL}/people`
    );
    return response.data;
  },
};
