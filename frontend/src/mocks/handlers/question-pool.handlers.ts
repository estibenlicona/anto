import { http, HttpResponse } from "msw";
import {
  QUESTION_DIMENSIONS,
  type QuestionPool,
  type QuestionPoolRow,
} from "@features/admin-shell/services/questionPoolService";

const QUESTION_POOL_URL = "/admin/question-pool";

/**
 * Las 30 preguntas del modelo de referencia, tal cual están en
 * `context/mvps/plataforma_dimensionamiento_v7_unificado.html` (array
 * `QUESTIONS`, con `DIMS` mapeando cada índice de dimensión a su nombre). El
 * campo `tipo` del array de origen no se trae: es del motor de scoring que
 * esta pantalla no construye, sólo mantiene el pool.
 */
const defaultPool: QuestionPool = [
  {
    id: "N1",
    dimension: "Negocio y cliente",
    texto:
      "¿Impacta directamente clientes, comercios aliados o canales digitales?",
    peso: 2,
  },
  {
    id: "N2",
    dimension: "Negocio y cliente",
    texto:
      "¿Soporta una capacidad crítica del negocio (originación, pagos, tarjetas, crédito, cartera o recaudo)?",
    peso: 3,
  },
  {
    id: "N3",
    dimension: "Negocio y cliente",
    texto:
      "¿Tiene fecha comprometida por negocio, campaña, aliado, regulador o auditoría?",
    peso: 2,
  },
  {
    id: "N4",
    dimension: "Negocio y cliente",
    texto: "¿Cuántas áreas de negocio u operación deben coordinarse?",
    peso: 1,
  },
  {
    id: "F1",
    dimension: "Alcance funcional",
    texto: "¿Crea una capacidad nueva y no solo modifica una existente?",
    peso: 3,
  },
  {
    id: "F2",
    dimension: "Alcance funcional",
    texto:
      "¿Cuántos canales o frontales impacta (App, web, portal, contact center, backoffice)?",
    peso: 2,
  },
  {
    id: "F3",
    dimension: "Alcance funcional",
    texto:
      "¿Incluye reglas de negocio complejas, parametrización o flujos de aprobación?",
    peso: 2,
  },
  {
    id: "F4",
    dimension: "Alcance funcional",
    texto:
      "¿Requiere trazabilidad, reversos, conciliación o auditoría funcional?",
    peso: 3,
  },
  {
    id: "I1",
    dimension: "Integraciones",
    texto: "¿Cuántos sistemas internos deben integrarse o modificarse?",
    peso: 3,
  },
  {
    id: "I2",
    dimension: "Integraciones",
    texto:
      "¿Cuántos terceros externos involucra (aliados, bureaus, pasarelas, core, antifraude)?",
    peso: 3,
  },
  {
    id: "I3",
    dimension: "Integraciones",
    texto:
      "¿Cuántas APIs o integraciones nuevas/cambios requiere (APIM, eventos, mensajería)?",
    peso: 2,
  },
  {
    id: "I4",
    dimension: "Integraciones",
    texto: "¿De cuántos equipos externos a la célula depende?",
    peso: 2,
  },
  {
    id: "S1",
    dimension: "Datos, seguridad y cumplimiento",
    texto:
      "¿Procesa datos personales, financieros, transaccionales o sensibles?",
    peso: 3,
  },
  {
    id: "S2",
    dimension: "Datos, seguridad y cumplimiento",
    texto: "¿Está expuesta a internet o a canales de cliente/aliado?",
    peso: 3,
  },
  {
    id: "S3",
    dimension: "Datos, seguridad y cumplimiento",
    texto:
      "¿Requiere controles de identidad, autorización, roles, MFA o segregación?",
    peso: 2,
  },
  {
    id: "S4",
    dimension: "Datos, seguridad y cumplimiento",
    texto:
      "¿Puede generar impacto de fraude, pérdida económica, reputacional o sanción?",
    peso: 3,
  },
  {
    id: "S5",
    dimension: "Datos, seguridad y cumplimiento",
    texto:
      "¿Requiere evidencia para auditoría, cumplimiento o trazabilidad regulatoria?",
    peso: 2,
  },
  {
    id: "T1",
    dimension: "Tecnología y arquitectura",
    texto: "¿Introduce tecnología, patrón o componente nuevo para TI?",
    peso: 3,
  },
  {
    id: "T2",
    dimension: "Tecnología y arquitectura",
    texto:
      "¿Modifica arquitectura transversal, APIs comunes, plataforma o capacidades compartidas?",
    peso: 3,
  },
  {
    id: "T3",
    dimension: "Tecnología y arquitectura",
    texto:
      "¿Exige alta disponibilidad, resiliencia, performance o escalabilidad relevante?",
    peso: 3,
  },
  {
    id: "T4",
    dimension: "Tecnología y arquitectura",
    texto:
      "¿Requiere diseño de datos complejo, migración, sincronización o consistencia?",
    peso: 2,
  },
  {
    id: "T5",
    dimension: "Tecnología y arquitectura",
    texto:
      "¿Requiere automatización CI/CD, cloud, Kubernetes, APIM, colas o IaC?",
    peso: 2,
  },
  {
    id: "O1",
    dimension: "Operación y soporte",
    texto: "¿Impacta operación 7x24, mesa de servicio, backoffice o soporte?",
    peso: 2,
  },
  {
    id: "O2",
    dimension: "Operación y soporte",
    texto:
      "¿Requiere observabilidad, alertas, métricas, SLI/SLO o trazabilidad técnica nueva?",
    peso: 2,
  },
  {
    id: "O3",
    dimension: "Operación y soporte",
    texto:
      "¿Un error en producción afecta continuidad, recaudo, pagos, crédito o atención?",
    peso: 3,
  },
  {
    id: "O4",
    dimension: "Operación y soporte",
    texto:
      "¿Requiere despliegue gradual, rollback, feature flags o migración controlada?",
    peso: 2,
  },
  {
    id: "D1",
    dimension: "Incertidumbre y dependencias",
    texto:
      "¿El requerimiento aún es ambiguo o requiere discovery funcional/técnico?",
    peso: 2,
  },
  {
    id: "D2",
    dimension: "Incertidumbre y dependencias",
    texto:
      "¿Hay dependencias con proveedores, áreas internas o decisiones no confirmadas?",
    peso: 2,
  },
  {
    id: "D3",
    dimension: "Incertidumbre y dependencias",
    texto: "¿Cambia procesos, roles operativos o requiere gestión del cambio?",
    peso: 1,
  },
  {
    id: "D4",
    dimension: "Incertidumbre y dependencias",
    texto:
      "¿Hay restricciones fuertes de tiempo, capacidad o coexistencia con otros proyectos?",
    peso: 2,
  },
];

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
