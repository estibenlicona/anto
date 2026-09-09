import { http, HttpResponse } from "msw";
import {
  QUESTION_DIMENSIONS,
  type QuestionPool,
  type QuestionPoolRow,
} from "@features/admin-shell/services/questionPoolService";

import { POOL_QUESTIONS } from "./model-versions.seeds";

const QUESTION_POOL_URL = "/admin/question-pool";

/**
 * Las 30 preguntas del modelo de referencia, tal cual están en
 * `context/mvps/plataforma_dimensionamiento_v7_unificado.html` (array
 * `QUESTIONS`, con `DIMS` mapeando cada índice de dimensión a su nombre). El
 * campo `tipo` del array de origen no se trae: es del motor de scoring que
 * esta pantalla no construye, sólo mantiene el pool.
 */
const defaultPool: QuestionPool = POOL_QUESTIONS.map((q) => ({ ...q }));

function clone(pool: QuestionPool): QuestionPool {
  return pool.map((row) => ({ ...row }));
}

let questionPool: QuestionPool = clone(defaultPool);

/** Lectura de sólo consulta para otros handlers (el modelo de evaluación se arma desde acá). */
export function getQuestionPoolSnapshot(): QuestionPool {
  return clone(questionPool);
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan el guardado. */
export function resetQuestionPoolMock() {
  questionPool = clone(defaultPool);
}

function isValidRow(value: unknown): value is QuestionPoolRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<QuestionPoolRow>;
  if (typeof row.id !== "string" || row.id.length === 0) return false;
  if (typeof row.texto !== "string" || row.texto.trim().length === 0)
    return false;
  if (
    typeof row.dimension !== "string" ||
    !(QUESTION_DIMENSIONS as readonly string[]).includes(row.dimension)
  )
    return false;
  return (
    typeof row.peso === "number" && Number.isInteger(row.peso) && row.peso >= 1
  );
}

/**
 * El hook ya valida al editar, pero acá se valida igual: este handler recibe
 * un cuerpo arbitrario por HTTP, donde nada garantiza de dónde vino.
 */
function isValidPool(value: unknown): value is QuestionPool {
  return Array.isArray(value) && value.every(isValidRow);
}

export const questionPoolHandlers = [
  http.get(QUESTION_POOL_URL, () => {
    return HttpResponse.json(questionPool);
  }),

  http.put(QUESTION_POOL_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidPool(body)) {
      return HttpResponse.json(
        { message: "Pool de preguntas inválido" },
        { status: 400 }
      );
    }
    questionPool = clone(body);
    return HttpResponse.json(questionPool);
  }),
];
