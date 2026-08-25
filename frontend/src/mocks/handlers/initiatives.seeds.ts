import type { InitiativeStatus } from "@features/initiatives/services/initiativeService";
import type {
  QuestionKind,
  TriageQuestion,
} from "@features/initiatives/services/evaluationModel";

export const BACKEND = "11111111-1111-1111-1111-111111111111";
export const CANALES = "22222222-2222-2222-2222-222222222222";
export const FRAUDE = "33333333-3333-3333-3333-333333333333";
export const PAGOS = "44444444-4444-4444-4444-444444444444";
export const DATOS = "55555555-5555-5555-5555-555555555555";

/**
 * Qué escala usa cada pregunta del pool. El pool de Admin no lo trae (es del
 * motor, no del mantenimiento del pool): el mock lo asigna por id y cualquier
 * pregunta que no esté acá se lee como evaluativa.
 */
export const QUALITATIVE_SCALE = [
  "Sin impacto",
  "Bajo",
  "Medio",
  "Alto",
  "Crítico",
];

export const QUESTION_KINDS: Record<
  string,
  { kind: QuestionKind; scale: string[] }
> = {
  N4: {
    kind: "Objective",
    scale: ["Sólo la célula", "1 área", "2 áreas", "3–4 áreas", "5 o más"],
  },
  F2: {
    kind: "Objective",
    scale: ["Ninguno", "1 canal", "2 canales", "3 canales", "4 o más"],
  },
  I1: {
    kind: "Objective",
    scale: ["Ninguno", "1–2", "3–5", "6–10", "Más de 10"],
  },
  I2: { kind: "Objective", scale: ["Ninguno", "1", "2", "3–4", "5 o más"] },
  I3: {
    kind: "Objective",
    scale: ["Ninguna", "1–2", "3–5", "6–10", "Más de 10"],
  },
  I4: {
    kind: "Objective",
    scale: ["Ninguno", "1 equipo", "2 equipos", "3 equipos", "4 o más"],
  },
};

/** Tamizaje del MVP v1: no es parametrizable desde Admin (fuera de alcance). */
export const TRIAGE: TriageQuestion[] = [
  {
    id: "T1",
    text: "¿Integra o modifica sistemas internos o terceros externos?",
    critical: false,
  },
  {
    id: "T2",
    text: "¿Procesa datos personales, financieros o sensibles, o está expuesta a internet?",
    critical: true,
  },
  {
    id: "T3",
    text: "¿Puede generar fraude, pérdida económica, impacto reputacional o sanción?",
    critical: true,
  },
  {
    id: "T4",
    text: "¿Introduce tecnología nueva o cambia arquitectura transversal o compartida?",
    critical: false,
  },
  {
    id: "T5",
    text: "¿Impacta una capacidad crítica (pagos, crédito, cartera, recaudo, originación)?",
    critical: false,
  },
  {
    id: "T6",
    text: "¿El requerimiento aún es ambiguo o requiere discovery funcional o técnico?",
    critical: false,
  },
];

/** Acción recomendada por talla: texto del mock, las bandas de Admin no lo tienen. */
export const BAND_ACTIONS: Record<string, string> = {
  XS: "Resolver con capacidad existente o célula ligera.",
  S: "Célula reducida y apoyo puntual de arquitectura y seguridad.",
  M: "Célula base y discovery corto para validar supuestos.",
  L: "Célula completa, arquitectura temprana y validación AppSec.",
  XL: "Evaluar dividir en frentes o células y hacer discovery formal.",
};

export interface InitiativeSeed {
  id: string;
  name: string;
  squadId: string;
  productOwner: string;
  targetMonths: number;
  status: InitiativeStatus;
  /** Respuestas de ejemplo; sin ellas la iniciativa queda sin evaluar. */
  answers?: { triage: boolean[]; byQuestion: Record<string, number> };
  createdAtUtc: string;
}

const QIDS = [
  "N1",
  "N2",
  "N3",
  "N4",
  "F1",
  "F2",
  "F3",
  "F4",
  "I1",
  "I2",
  "I3",
  "I4",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "O1",
  "O2",
  "O3",
  "O4",
  "D1",
  "D2",
  "D3",
  "D4",
];

function answersFrom(values: number[]): Record<string, number> {
  const out: Record<string, number> = {};
  QIDS.forEach((id, i) => {
    if (typeof values[i] === "number") out[id] = values[i];
  });
  return out;
}

// Perfiles del v1: pequeño, mediano y grande.
const SMALL = answersFrom([
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 2, 0,
  1, 1, 1, 1,
]);
const MEDIUM = answersFrom([
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 1, 2, 2, 1, 2, 2, 2, 1,
  2, 2, 1, 1,
]);
const LARGE = answersFrom([
  3, 3, 2, 2, 3, 2, 2, 3, 3, 3, 2, 2, 4, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 2, 4, 2,
  2, 3, 2, 2,
]);

/** Mismos ids y nombres que usan el backlog y las asignaciones. */
export const INITIATIVE_SEEDS: InitiativeSeed[] = [
  {
    id: "ini-kafka",
    name: "Kafka Migration",
    squadId: BACKEND,
    productOwner: "Paola Henao",
    targetMonths: 6,
    status: "Active",
    answers: {
      triage: [true, false, false, true, false, false],
      byQuestion: MEDIUM,
    },
    createdAtUtc: "2026-05-04T00:00:00Z",
  },
  {
    id: "ini-payments",
    name: "Payment Engine v2",
    squadId: BACKEND,
    productOwner: "Ana Restrepo",
    targetMonths: 9,
    // Evaluada y con talla, pero sin activar: Backend Platform ya tiene su
    // activa (Kafka Migration) y una célula sostiene una sola. Es el caso que
    // deja ver "Activar" deshabilitado con su motivo.
    status: "Evaluating",
    answers: {
      triage: [true, true, true, true, true, false],
      byQuestion: LARGE,
    },
    createdAtUtc: "2026-04-13T00:00:00Z",
  },
  {
    id: "ini-onboarding",
    name: "Onboarding App",
    squadId: CANALES,
    productOwner: "Diego Cardona",
    targetMonths: 4,
    status: "Active",
    answers: {
      triage: [false, false, false, false, false, false],
      byQuestion: SMALL,
    },
    createdAtUtc: "2026-06-01T00:00:00Z",
  },
  {
    id: "ini-fraud",
    name: "Fraud Scoring v3",
    squadId: FRAUDE,
    productOwner: "Ana Restrepo",
    targetMonths: 6,
    status: "Active",
    answers: {
      triage: [true, true, true, false, true, false],
      byQuestion: MEDIUM,
    },
    createdAtUtc: "2026-05-20T00:00:00Z",
  },
  {
    id: "ini-lakehouse",
    name: "Lakehouse",
    squadId: DATOS,
    productOwner: "Paola Henao",
    targetMonths: 12,
    status: "Closed",
    answers: {
      triage: [true, false, false, true, false, true],
      byQuestion: MEDIUM,
    },
    createdAtUtc: "2025-11-03T00:00:00Z",
  },
  {
    id: "ini-qr",
    name: "Pago con QR en App",
    squadId: CANALES,
    productOwner: "Diego Cardona",
    targetMonths: 6,
    status: "Evaluating",
    createdAtUtc: "2026-08-18T00:00:00Z",
  },
  {
    id: "ini-antifraude",
    name: "Motor antifraude de tarjetas",
    squadId: FRAUDE,
    productOwner: "Ana Restrepo",
    targetMonths: 12,
    status: "Evaluating",
    createdAtUtc: "2026-08-20T00:00:00Z",
  },
];
