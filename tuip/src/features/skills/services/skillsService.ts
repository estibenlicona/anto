import { httpClient } from "@shared/services/httpClient";

/**
 * Catálogo de habilidades: qué se mide, qué significa cada nivel y qué pide
 * cada rol. El backend todavía no lo conoce — el contrato lo fija el mock.
 *
 * La escala es la misma con la que la app ya representa seniority y stacks
 * (`STACK_LEVEL_LABELS`), no una escala propia: comparar una habilidad con
 * otra, y con el seniority de la persona, depende de que sea una sola.
 */

export type SkillGroup = "human" | "technical";

/** 1..4 — Principiante, Competente, Avanzado, Experto. */
export type SkillLevel = 1 | 2 | 3 | 4;

export const SKILL_LEVELS: SkillLevel[] = [1, 2, 3, 4];

export interface SkillLevelDto {
  level: SkillLevel;
  /**
   * Lista ordenada, de largo libre. Ni el contrato ni ninguna pantalla asumen
   * una cantidad: el chapter suele tener cinco por nivel, pero no siempre.
   */
  criteria: string[];
}

/**
 * Qué nivel exige un cargo en una habilidad. `level: null` es "sin definir",
 * que no es lo mismo que cero: un cargo sin nivel declarado no registra brecha.
 *
 * Por cargo y no por rol: lo que se le exige a alguien depende de a qué se
 * dedica, no de cómo participa en la aplicación.
 */
export interface PositionExpectationDto {
  position: string;
  level: SkillLevel | null;
}

export interface SkillDto {
  id: string;
  name: string;
  group: SkillGroup;
  description: string;
  /** Una habilidad desactivada no se ofrece en evaluaciones nuevas. */
  active: boolean;
  levels: SkillLevelDto[];
  expectations: PositionExpectationDto[];
}

export interface SkillsCatalogDto {
  /** Sube con cada publicación; una evaluación cerrada guarda con cuál se hizo. */
  version: number;
  /** Cargos ofrecidos, derivados de las personas registradas. */
  positions: string[];
  skills: SkillDto[];
}

export interface UpsertSkillRequest {
  name: string;
  group: SkillGroup;
  description: string;
}

const CATALOG_URL = "/skills-catalog";

export const skillsService = {
  get: async (): Promise<SkillsCatalogDto> => {
    const response = await httpClient.get<SkillsCatalogDto>(CATALOG_URL);
    return response.data;
  },

  create: async (request: UpsertSkillRequest): Promise<SkillDto> => {
    const response = await httpClient.post<SkillDto>(
      `${CATALOG_URL}/skills`,
      request
    );
    return response.data;
  },

  update: async (
    id: string,
    request: UpsertSkillRequest
  ): Promise<SkillDto> => {
    const response = await httpClient.put<SkillDto>(
      `${CATALOG_URL}/skills/${id}`,
      request
    );
    return response.data;
  },

  /** Reemplaza la lista completa del nivel: los criterios se editan en bloque. */
  setCriteria: async (
    id: string,
    level: SkillLevel,
    criteria: string[]
  ): Promise<SkillDto> => {
    const response = await httpClient.put<SkillDto>(
      `${CATALOG_URL}/skills/${id}/levels/${level}/criteria`,
      { criteria }
    );
    return response.data;
  },

  /** `level: null` retira la exigencia y deja el cargo sin definir. */
  setExpectation: async (
    id: string,
    position: string,
    level: SkillLevel | null
  ): Promise<SkillDto> => {
    const response = await httpClient.put<SkillDto>(
      `${CATALOG_URL}/skills/${id}/expectations`,
      { position, level }
    );
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${CATALOG_URL}/skills/${id}`);
  },

  /** Sale del camino de borrar cuando alguna evaluación ya usó la habilidad. */
  deactivate: async (id: string): Promise<SkillDto> => {
    const response = await httpClient.put<SkillDto>(
      `${CATALOG_URL}/skills/${id}/active`,
      { active: false }
    );
    return response.data;
  },

  activate: async (id: string): Promise<SkillDto> => {
    const response = await httpClient.put<SkillDto>(
      `${CATALOG_URL}/skills/${id}/active`,
      { active: true }
    );
    return response.data;
  },
};
