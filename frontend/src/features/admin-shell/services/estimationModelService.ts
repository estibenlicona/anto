import { httpClient } from "@shared/services/httpClient";
import type {
  EstimationModelVersion,
  EstimationOutput,
  EstimationQuestionType,
} from "@features/initiatives/services/evaluationModel";

/**
 * El modelo de estimación y sus versiones. Los tipos del **contenido** de una
 * versión viven en `evaluationModel.ts` junto al motor que los consume: son los
 * mismos que el motor lee, y tenerlos dos veces sería tener dos contratos.
 * Acá viven los de la administración —lista, validación, diferencias,
 * historial— y las escrituras por sección.
 */

/** Una versión no se edita fuera de `Borrador`. El estado es lo que decide. */
export type ModelVersionStatus = "Borrador" | "Vigente" | "Archivada";

export interface ModelVersionListItem {
  id: string;
  number: number;
  status: ModelVersionStatus;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  changeNote: string | null;
  /**
   * Cuántas estimaciones calculó. Es lo que convierte una fila en una decisión:
   * una versión que ya calculó no se toca, se copia.
   */
  estimationsCount: number;
}

export interface EstimationModelListItem {
  id: string;
  name: string;
  phase: string;
  /** De la más nueva a la más vieja. */
  versions: ModelVersionListItem[];
}

/** `impedimento` bloquea la publicación; `advertencia` no. */
export type ModelCheckStatus = "pasa" | "advertencia" | "impedimento";

export interface ModelValidationCheck {
  code: string;
  title: string;
  status: ModelCheckStatus;
  /** Qué falta. Nulo cuando el chequeo pasa. */
  missing: string | null;
  /** A qué sección del editor lleva la acción de arreglarlo. */
  section: ModelEditorSection;
}

export interface ModelValidationReport {
  checks: ModelValidationCheck[];
  impedimentCount: number;
  warningCount: number;
  canPublish: boolean;
}

export type ModelDiffKind = "agregado" | "quitado" | "cambiado";

export interface ModelVersionDiffEntry {
  section: ModelEditorSection;
  item: string;
  kind: ModelDiffKind;
  before: string | null;
  after: string | null;
}

export interface ModelVersionDiff {
  fromVersion: number | null;
  toVersion: number;
  entries: ModelVersionDiffEntry[];
}

export interface ModelChangeEntry {
  occurredAtUtc: string;
  /**
   * Quién dijo ser, no quién fue: la interfaz de programación todavía no valida
   * el token de quien llama, así que la firma es declarativa. La pantalla lo
   * dice.
   */
  author: string;
  section: string;
  summary: string;
}

/** Las secciones del editor. Son también las rutas y las claves del historial. */
export const MODEL_EDITOR_SECTIONS = [
  "dimensiones",
  "drivers",
  "tallas",
  "mix",
  "publicar",
] as const;

export type ModelEditorSection = (typeof MODEL_EDITOR_SECTIONS)[number];

// ── Cuerpos de escritura ─────────────────────────────────────────────────────

export interface ModelDimensionInput {
  code: string;
  name: string;
  order: number;
  active: boolean;
}

export interface QuestionOptionInput {
  label: string;
  score: number;
  from?: number | null;
  to?: number | null;
}

export interface ModelQuestionInput {
  code: string;
  dimensionCode: string;
  texto: string;
  type: EstimationQuestionType;
  unit?: string | null;
  driverCode: string;
  active: boolean;
  options: QuestionOptionInput[];
}

export interface TriageQuestionInput {
  code: string;
  texto: string;
  critical: boolean;
}

export interface SaveDimensionsRequest {
  author: string;
  dimensions: ModelDimensionInput[];
  questions: ModelQuestionInput[];
  triage: TriageQuestionInput[];
}

export interface ModelDriverInput {
  code: string;
  description: string;
  outputs: EstimationOutput[];
}

/**
 * La fila de pesos de una pregunta. Una salida **ausente** del objeto es "no
 * aporta", que no es lo mismo que un peso de cero: se manda o no se manda la
 * clave, y esa ausencia es el dato.
 */
export interface QuestionWeightsInput {
  questionCode: string;
  weights: Partial<Record<EstimationOutput, number>>;
}

export interface SaveDriversRequest {
  author: string;
  drivers: ModelDriverInput[];
  weights: QuestionWeightsInput[];
}

export interface TallaRuleInput {
  talla: string;
  pmMin: number;
  pmExpected: number;
  pmMax: number;
  lectura: string;
  action: string;
}

export interface RiskBandInput {
  level: string;
  maxPct: number;
}

export interface SaveTallaRulesRequest {
  author: string;
  boundaries: number[];
  rules: TallaRuleInput[];
  riskBands: RiskBandInput[];
}

export interface MixRowInput {
  key: string;
  capacidad: string;
  porTalla: Record<string, number>;
}

export interface MixModifierInput {
  code: string;
  driverCode: string;
  operator: "gte" | "lte";
  threshold: number;
  tallas: string[];
  adjustments: { capabilityKey: string; points: number }[];
}

export interface SaveMixRequest {
  author: string;
  mix: MixRowInput[];
  modifiers: MixModifierInput[];
}

export interface CreateModelVersionRequest {
  author: string;
  sourceVersion: number;
}

export interface CreateModelVersionResponse {
  number: number;
  status: ModelVersionStatus;
}

export interface PublishModelVersionRequest {
  author: string;
  effectiveFrom: string;
  note: string;
}

/**
 * Lo que devuelve intentar publicar. `published` en falso llega con 422 y el
 * informe: el cliente necesita la lista para llevar a arreglar cada
 * impedimento, no sólo el rechazo.
 */
export interface PublishOutcome {
  published: boolean;
  report: ModelValidationReport;
}

const MODELS_URL = "/admin/modelos";

const versionUrl = (modelId: string, version: number) =>
  `${MODELS_URL}/${modelId}/versiones/${version}`;

export const estimationModelService = {
  getModels: async (): Promise<EstimationModelListItem[]> => {
    const response = await httpClient.get<EstimationModelListItem[]>(MODELS_URL);
    return response.data;
  },

  getVersion: async (
    modelId: string,
    version: number
  ): Promise<EstimationModelVersion> => {
    const response = await httpClient.get<EstimationModelVersion>(
      versionUrl(modelId, version)
    );
    return response.data;
  },

  getValidation: async (
    modelId: string,
    version: number
  ): Promise<ModelValidationReport> => {
    const response = await httpClient.get<ModelValidationReport>(
      `${versionUrl(modelId, version)}/validacion`
    );
    return response.data;
  },

  getDiff: async (
    modelId: string,
    version: number
  ): Promise<ModelVersionDiff> => {
    const response = await httpClient.get<ModelVersionDiff>(
      `${versionUrl(modelId, version)}/diferencias`
    );
    return response.data;
  },

  getHistory: async (
    modelId: string,
    version: number
  ): Promise<ModelChangeEntry[]> => {
    const response = await httpClient.get<ModelChangeEntry[]>(
      `${versionUrl(modelId, version)}/historial`
    );
    return response.data;
  },

  createVersion: async (
    modelId: string,
    request: CreateModelVersionRequest
  ): Promise<CreateModelVersionResponse> => {
    const response = await httpClient.post<CreateModelVersionResponse>(
      `${MODELS_URL}/${modelId}/versiones`,
      request
    );
    return response.data;
  },

  saveDimensions: async (
    modelId: string,
    version: number,
    request: SaveDimensionsRequest
  ): Promise<ModelValidationReport> => {
    const response = await httpClient.put<ModelValidationReport>(
      `${versionUrl(modelId, version)}/dimensiones`,
      request
    );
    return response.data;
  },

  saveDrivers: async (
    modelId: string,
    version: number,
    request: SaveDriversRequest
  ): Promise<ModelValidationReport> => {
    const response = await httpClient.put<ModelValidationReport>(
      `${versionUrl(modelId, version)}/drivers`,
      request
    );
    return response.data;
  },

  saveTallaRules: async (
    modelId: string,
    version: number,
    request: SaveTallaRulesRequest
  ): Promise<ModelValidationReport> => {
    const response = await httpClient.put<ModelValidationReport>(
      `${versionUrl(modelId, version)}/tallas`,
      request
    );
    return response.data;
  },

  saveMix: async (
    modelId: string,
    version: number,
    request: SaveMixRequest
  ): Promise<ModelValidationReport> => {
    const response = await httpClient.put<ModelValidationReport>(
      `${versionUrl(modelId, version)}/mix`,
      request
    );
    return response.data;
  },

  /**
   * Publica. Un 422 no es un fallo de red ni un error del cuerpo: es la
   * validación diciendo que esta configuración no se publica, y viene con la
   * lista. Se devuelve como resultado y no como excepción para que la pantalla
   * pueda pintarla sin envolver la llamada en un try.
   */
  publish: async (
    modelId: string,
    version: number,
    request: PublishModelVersionRequest
  ): Promise<PublishOutcome> => {
    const response = await httpClient.post<ModelValidationReport>(
      `${versionUrl(modelId, version)}/publicacion`,
      request,
      { validateStatus: (status) => status === 200 || status === 422 }
    );

    return { published: response.status === 200, report: response.data };
  },
};
