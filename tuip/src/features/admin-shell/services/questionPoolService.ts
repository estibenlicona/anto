import { httpClient } from "@shared/services/httpClient";

/**
 * Una pregunta del pool de scoring: su código estable, la dimensión a la que
 * pertenece, su texto y su peso.
 *
 * `id` existe aparte del texto porque el texto es justamente lo que se edita:
 * si la fila se identificara por él, reformular una pregunta sería
 * indistinguible de borrarla y crear otra.
 */
export interface QuestionPoolRow {
  id: string;
  dimension: string;
  texto: string;
  peso: number;
}

/**
 * Lista plana, no agrupada por dimensión. Un payload anidado obligaría a
 * mantener sincronizados el orden de las dimensiones y el de sus grupos; acá
 * cada fila lleva su dimensión, y el agrupamiento se hace donde ya hace falta
 * para pintar la tabla resumen.
 */
export type QuestionPool = QuestionPoolRow[];

/**
 * Las siete dimensiones del modelo de scoring, en su orden de referencia. Son
 * el eje estructural del modelo, no un dato editable por pregunta — no se
 * crean, no se borran, no se renombran desde esta pantalla.
 */
export const QUESTION_DIMENSIONS = [
  "Negocio y cliente",
  "Alcance funcional",
  "Integraciones",
  "Datos, seguridad y cumplimiento",
  "Tecnología y arquitectura",
  "Operación y soporte",
  "Incertidumbre y dependencias",
] as const;

/**
 * Escala cualitativa de 5 niveles (0 a 4) con la que se califica cada
 * pregunta. Es una constante del modelo de scoring, no un valor que esta
 * pantalla proponga hacer editable.
 */
export const QUESTION_SCORE_MAX = 4;

export interface DimensionSummaryRow {
  dimension: string;
  preguntas: number;
  pesoTotal: number;
  maxPuntos: number;
}

/**
 * Cantidad de preguntas, peso total y máximo de puntos por dimensión,
 * derivados del pool — no un dato guardado aparte, por la misma razón que
 * `bandRange` deriva el rango de una banda en vez de persistirlo.
 */
export function dimensionSummary(pool: QuestionPool): DimensionSummaryRow[] {
  return QUESTION_DIMENSIONS.map((dimension) => {
    const preguntas = pool.filter((row) => row.dimension === dimension);
    const pesoTotal = preguntas.reduce((sum, row) => sum + row.peso, 0);
    return {
      dimension,
      preguntas: preguntas.length,
      pesoTotal,
      maxPuntos: pesoTotal * QUESTION_SCORE_MAX,
    };
  });
}

const QUESTION_POOL_URL = "/admin/question-pool";

export const questionPoolService = {
  getPool: async (): Promise<QuestionPool> => {
    const response = await httpClient.get<QuestionPool>(QUESTION_POOL_URL);
    return response.data;
  },

  savePool: async (pool: QuestionPool): Promise<QuestionPool> => {
    const response = await httpClient.put<QuestionPool>(
      QUESTION_POOL_URL,
      pool
    );
    return response.data;
  },
};
