import { httpClient } from "@shared/services/httpClient";
import type { PagedResult } from "@shared/services/pagination";

// Escala de seniority propia de Tuya (4 niveles) — es la misma escala que
// antes se llamaba "nivel SFIA"; no existe una escalera de seniority
// separada, así que ambos campos se fusionaron en uno solo.
export type Seniority = number;
export type Modality = "Remote" | "Hybrid" | "OnSite";

/**
 * Cómo participa una persona en la aplicación. Es un catálogo cerrado, no
 * texto libre: mientras fue texto se llenó con el cargo —el mismo valor en
 * los dos campos— y el sistema se quedó sin forma de saber quién es líder
 * técnico.
 *
 * En el contrato van en inglés y en pantalla en español: lo que se lee y lo
 * que se programa son dos vocabularios, y el mapa vive en un solo lugar (el
 * catálogo que sirve el backend).
 *
 * No confundir con el **cargo** (`position`), que dice a qué se dedica la
 * persona y es el que fija el nivel que se le exige en cada habilidad.
 */
export type PersonRole =
  | "Administrator"
  | "TechnicalLead"
  | "ExpertiseLead"
  | "ProductOwner"
  | "Contributor";

export interface RoleOption {
  value: PersonRole;
  label: string;
}

/** Una persona ofrecida como líder técnico: sólo lo que el selector muestra. */
export interface TechnicalLeadOption {
  id: string;
  name: string;
}

/** Nivel por stack: la misma escala Tuya del seniority (1 Principiante … 4 Experto). */
export interface PersonStackDto {
  name: string;
  level: Seniority;
  isPrimary: boolean;
}

export interface PersonDto {
  id: string;
  name: string;
  documentId: string;
  entraObjectId: string;
  userPrincipalName: string;
  position: string;
  role: PersonRole;
  /**
   * Quién la acompaña técnicamente. Es informativo: no decide qué ve nadie
   * —eso lo decide el chapter, ver `chapterId`— y por eso una persona puede
   * no tener ninguno.
   */
  technicalLeadId: string | null;
  technicalLeadName: string | null;
  /**
   * De cuántas personas figura como líder técnico. Lo calcula el servidor y
   * es sólo de lectura: es lo que la edición necesita para poder avisar a
   * cuántas afecta antes de quitarle el rol.
   */
  technicalLeadOfCount: number;
  seniority: Seniority;
  seniorityLabel: string;
  modality: Modality;
  availableFte: number;
  monthlyCost: number;
  startDate: string;
  chapterId: string | null;
  providerId: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  /**
   * Porcentaje del FTE disponible que las asignaciones de la persona ocupan
   * (0–100, y por encima de 100 cuando está sobreasignada). Lo calcula el
   * backend desde las asignaciones: es sólo de lectura y no viaja en los
   * requests de alta ni de edición.
   */
  utilization: number;
  /** Stacks que domina, del catálogo del chapter; a lo sumo uno es el principal. Se editan por su sub-recurso. */
  stacks: PersonStackDto[];
}

export interface CreatePersonRequest {
  name: string;
  documentId: string;
  entraObjectId: string;
  userPrincipalName: string;
  position: string;
  role: PersonRole;
  technicalLeadId: string | null;
  seniority: Seniority;
  modality: Modality;
  availableFte: number;
  monthlyCost: number;
  startDate: string;
}

export type UpdatePersonRequest = CreatePersonRequest;

export interface SeniorityOption {
  value: number;
  label: string;
}

export interface CompanyDto {
  id: string;
  name: string;
}

export interface PeopleStats {
  activeCount: number;
  fteAvailable: number;
  fteTarget: number;
  bySeniority: { seniority: number; label: string; count: number }[];
  /** Primeras personas (por nombre) para mostrar como avatares — no es el listado completo. */
  sample: { id: string; name: string }[];
  /** Cobertura por stack sobre todas las personas: cuántos distintos y cuáles tiene una sola persona. */
  stackCoverage: { distinct: number; atRisk: string[] };
}

const PEOPLE_URL = "/people";
const PEOPLE_STATS_URL = "/people/stats";
const SENIORITIES_URL = "/catalogs/seniorities";
const ROLES_URL = "/catalogs/roles";
const TECHNICAL_LEADS_URL = "/people/technical-leads";
const EXPERTISE_LINE_URL = "/people/:id/expertise-line";
const MODALITIES_URL = "/catalogs/modalities";
const COMPANIES_URL = "/companies";
const STACKS_URL = "/people/stacks";

export const personService = {
  list: async (
    page: number,
    pageSize: number,
    search?: string,
    seniorities?: Seniority[],
    stacks?: string[]
  ): Promise<PagedResult<PersonDto>> => {
    // Serializado a mano: el default de axios para arrays emite `seniority[]=`,
    // pero el mock y el backend real esperan la clave repetida sin corchetes
    // (`seniority=A&seniority=B`), que es como ASP.NET bindea `int[]?`.
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    seniorities?.forEach((s) => params.append("seniority", String(s)));
    stacks?.forEach((s) => params.append("stack", s));

    const response = await httpClient.get<PagedResult<PersonDto>>(PEOPLE_URL, {
      params,
    });
    return response.data;
  },

  create: async (request: CreatePersonRequest): Promise<PersonDto> => {
    const response = await httpClient.post<PersonDto>(PEOPLE_URL, request);
    return response.data;
  },

  update: async (
    id: string,
    request: UpdatePersonRequest
  ): Promise<PersonDto> => {
    const response = await httpClient.put<PersonDto>(
      `${PEOPLE_URL}/${id}`,
      request
    );
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${PEOPLE_URL}/${id}`);
  },

  // Refleja PUT /people/{id}/provider/{providerId} (AssignToProviderAsync) —
  // el backend real no acepta providerId en el alta/edición, lo asigna aparte.
  assignProvider: async (id: string, providerId: string): Promise<void> => {
    await httpClient.put(`${PEOPLE_URL}/${id}/provider/${providerId}`);
  },

  getRoles: async (): Promise<RoleOption[]> => {
    const response = await httpClient.get<RoleOption[]>(ROLES_URL);
    return response.data;
  },

  /** Las personas que pueden ser líder técnico: las que tienen ese rol. */
  getTechnicalLeads: async (): Promise<TechnicalLeadOption[]> => {
    const response =
      await httpClient.get<TechnicalLeadOption[]>(TECHNICAL_LEADS_URL);
    return response.data;
  },

  /**
   * La línea de expertise de una persona. El formulario la muestra sin
   * editarla: se cambia desde el módulo de Líneas, que es donde se ve el
   * reparto completo.
   */
  getExpertiseLine: async (
    id: string
  ): Promise<{ id: string; name: string } | null> => {
    const response = await httpClient.get<{ id: string; name: string } | null>(
      EXPERTISE_LINE_URL.replace(":id", id)
    );
    return response.data;
  },

  getSeniorities: async (): Promise<SeniorityOption[]> => {
    const response = await httpClient.get<SeniorityOption[]>(SENIORITIES_URL);
    return response.data;
  },

  getModalities: async (): Promise<Modality[]> => {
    const response = await httpClient.get<Modality[]>(MODALITIES_URL);
    return response.data;
  },

  getCompanies: async (): Promise<CompanyDto[]> => {
    const response = await httpClient.get<CompanyDto[]>(COMPANIES_URL);
    return response.data;
  },

  getStackCatalog: async (): Promise<string[]> => {
    const response = await httpClient.get<string[]>(STACKS_URL);
    return response.data;
  },

  replaceStacks: async (
    personId: string,
    stacks: PersonStackDto[]
  ): Promise<PersonDto> => {
    const response = await httpClient.put<PersonDto>(
      `${PEOPLE_URL}/${personId}/stacks`,
      { stacks }
    );
    return response.data;
  },

  getStats: async (): Promise<PeopleStats> => {
    const response = await httpClient.get<PeopleStats>(PEOPLE_STATS_URL);
    return response.data;
  },
};
