import type {
  EstimationModelVersion,
  ModelDimension,
  ModelDriver,
  ModelQuestion,
  MixRow,
  MixModifier,
  TallaRule,
} from "@features/initiatives/services/evaluationModel";
import type {
  EstimationModelListItem,
  ModelVersionStatus,
} from "@features/admin-shell/services/estimationModelService";
import { QUALITATIVE_SCALE, QUESTION_KINDS, TRIAGE } from "./initiatives.seeds";

/**
 * El modelo de estimación versionado del mock, armado con las mismas reglas que
 * usa la migración del backend (`LegacyModelConversion`): las 30 preguntas del
 * modelo de referencia, un driver por dimensión, el mix convertido de personas
 * a porcentaje, y el esperado de cada talla en el punto medio de su rango.
 *
 * Se siembran tres versiones para que la pantalla muestre los tres estados sin
 * que nadie tenga que crear nada: la 1 archivada, la 2 vigente y la 3 en
 * borrador. La 2 es la que arregla lo único que la 1 no pasaba —darle peso de
 * riesgo a las preguntas de incertidumbre—, igual que la semilla de desarrollo
 * del backend.
 */

export const MODEL_ID = "MOD-F1";

/** Una pregunta del pool de referencia: id, dimensión, texto y peso. */
export interface PoolQuestionSeed {
  id: string;
  dimension: string;
  texto: string;
  peso: number;
}

export const POOL_QUESTIONS: PoolQuestionSeed[] = [
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

/**
 * Un código corto y estable por dimensión. Las dimensiones dejaron de ser un
 * conjunto cerrado en el código: necesitan un identificador que no sea su
 * nombre, porque el nombre es lo que se va a poder editar.
 */
const DIMENSION_CODES: Record<string, string> = {
  "Negocio y cliente": "NEG",
  "Alcance funcional": "ALC",
  Integraciones: "INT",
  "Datos, seguridad y cumplimiento": "DAT",
  "Tecnología y arquitectura": "TEC",
  "Operación y soporte": "OPE",
  "Incertidumbre y dependencias": "INC",
};

/** La dimensión cuyas preguntas alimentan el riesgo a partir de la versión 2. */
const UNCERTAINTY = "INC";

/** La escala normalizada de las cinco opciones que antes valían 0 a 4. */
const NORMALIZED = [0, 0.25, 0.5, 0.75, 1];

const codeOf = (dimension: string) => DIMENSION_CODES[dimension] ?? dimension;

/** El orden de las dimensiones es el orden en que aparecen sus preguntas. */
const DIMENSION_NAMES = [
  ...new Set(POOL_QUESTIONS.map((q) => q.dimension)),
];

const dimensions = (): ModelDimension[] =>
  DIMENSION_NAMES.map((name, index) => ({
    code: codeOf(name),
    name,
    order: index + 1,
    active: true,
  }));

const drivers = (withRisk: boolean): ModelDriver[] =>
  DIMENSION_NAMES.map((name) => ({
    code: codeOf(name),
    description: name,
    outputs:
      withRisk && codeOf(name) === UNCERTAINTY
        ? (["Size", "Effort", "Risk"] as const).slice()
        : (["Size", "Effort"] as const).slice(),
  }));

/**
 * Todas quedan evaluativas, incluidas las seis que el catálogo marca como
 * objetivas: quien responde elige un tramo de una lista, no escribe un número.
 * La cuantitativa es capacidad nueva del modelo, y convertir una etiqueta como
 * «3–5» en un tramo real es una decisión de calibración, no una conversión.
 */
const questions = (withRisk: boolean): ModelQuestion[] =>
  POOL_QUESTIONS.map((question) => {
    const scale = QUESTION_KINDS[question.id]?.scale ?? QUALITATIVE_SCALE;
    const dimensionCode = codeOf(question.dimension);
    const weights: ModelQuestion["weights"] = {
      // El puntaje único del modelo viejo decidía talla y persona-mes a la vez.
      Size: question.peso,
      Effort: question.peso,
    };

    if (withRisk && dimensionCode === UNCERTAINTY) {
      weights.Risk = question.peso;
    }

    return {
      id: question.id,
      dimension: dimensionCode,
      text: question.texto,
      type: "Evaluativa",
      driver: dimensionCode,
      active: true,
      options: scale.map((label, position) => ({
        label,
        score: NORMALIZED[position],
      })),
      weights,
    };
  });

/**
 * Las cinco tallas con sus tres parámetros de esfuerzo. El esperado es el punto
 * medio del rango sólo porque así lo dejó la migración: de ahí en más es un
 * parámetro propio que se puede recalibrar, y no una fórmula.
 */
const TALLA_RULES: TallaRule[] = [
  { talla: "XS", minPct: 0, maxPct: 20, pmMin: 0.5, pmExpected: 0.75, pmMax: 1, lectura: "Cambio menor", action: "Resolver con capacidad existente o célula ligera." },
  { talla: "S", minPct: 20, maxPct: 40, pmMin: 1, pmExpected: 2, pmMax: 3, lectura: "Ajuste puntual", action: "Célula reducida y apoyo puntual de arquitectura y seguridad." },
  { talla: "M", minPct: 40, maxPct: 60, pmMin: 3, pmExpected: 4.5, pmMax: 6, lectura: "Iniciativa media", action: "Célula base y discovery corto para validar supuestos." },
  { talla: "L", minPct: 60, maxPct: 80, pmMin: 6, pmExpected: 8, pmMax: 10, lectura: "Iniciativa grande", action: "Célula completa, arquitectura temprana y validación AppSec." },
  { talla: "XL", minPct: 80, maxPct: 100, pmMin: 10, pmExpected: 14, pmMax: 18, lectura: "Transformación mayor", action: "Evaluar dividir en frentes o células y hacer discovery formal." },
];

/**
 * El mix en porcentaje. Son los mismos seis perfiles que las células tienen
 * (`allocations.seeds.ts`), para que la demanda se pueda contrastar perfil por
 * perfil contra la composición real. Cada columna suma 100.
 */
const MIX: MixRow[] = [
  { capability: "Backend Dev", byTalla: { XS: 100, S: 66.67, M: 40, L: 37.5, XL: 30.77 } },
  { capability: "Frontend Dev", byTalla: { XS: 0, S: 0, M: 20, L: 12.5, XL: 15.38 } },
  { capability: "QA Engineer", byTalla: { XS: 0, S: 33.33, M: 20, L: 25, XL: 23.08 } },
  { capability: "Arquitecto", byTalla: { XS: 0, S: 0, M: 20, L: 12.5, XL: 15.39 } },
  { capability: "DevOps Engineer", byTalla: { XS: 0, S: 0, M: 0, L: 12.5, XL: 7.69 } },
  { capability: "Data Engineer", byTalla: { XS: 0, S: 0, M: 0, L: 0, XL: 7.69 } },
];

/**
 * Un modificador de ejemplo: una iniciativa muy integrada pide más backend a
 * costa de front. Reparte y no agrega — sus ajustes suman cero.
 */
const MIX_MODIFIERS: MixModifier[] = [
  {
    code: "MOD-INT",
    driver: "INT",
    operator: "gte",
    value: 0.75,
    tallas: ["M", "L", "XL"],
    adjustments: [
      { capability: "Backend Dev", points: 5 },
      { capability: "Frontend Dev", points: -5 },
    ],
  },
];

const RISK_BANDS = [
  { level: "Bajo", maxPct: 33 },
  { level: "Medio", maxPct: 66 },
  { level: "Alto", maxPct: 100 },
];

function buildVersion(
  versionId: string,
  versionNumber: number,
  withRisk: boolean
): EstimationModelVersion {
  return {
    modelId: MODEL_ID,
    versionId,
    versionNumber,
    dimensions: dimensions(),
    drivers: drivers(withRisk),
    questions: questions(withRisk),
    triage: TRIAGE.map((t) => ({ ...t })),
    tallaRules: TALLA_RULES.map((r) => ({ ...r })),
    riskBands: RISK_BANDS.map((b) => ({ ...b })),
    mix: MIX.map((m) => ({ ...m, byTalla: { ...m.byTalla } })),
    mixModifiers: withRisk
      ? MIX_MODIFIERS.map((m) => ({ ...m, adjustments: m.adjustments.map((a) => ({ ...a })) }))
      : [],
  };
}

export interface VersionSeed {
  id: string;
  number: number;
  status: ModelVersionStatus;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  changeNote: string | null;
  estimationsCount: number;
  content: EstimationModelVersion;
}

export function initialVersionSeeds(): VersionSeed[] {
  return [
    {
      id: "MOD-F1-V1",
      number: 1,
      status: "Archivada",
      effectiveFrom: "2026-01-15",
      effectiveTo: "2026-03-01",
      changeNote: "Versión inicial: los parámetros que regían antes del versionado.",
      estimationsCount: 123,
      content: buildVersion("MOD-F1-V1", 1, false),
    },
    {
      id: "MOD-F1-V2",
      number: 2,
      status: "Vigente",
      effectiveFrom: "2026-03-01",
      effectiveTo: null,
      changeNote:
        "Las preguntas de incertidumbre pasan a alimentar la salida de riesgo.",
      estimationsCount: 18,
      content: buildVersion("MOD-F1-V2", 2, true),
    },
    {
      id: "MOD-F1-V3",
      number: 3,
      status: "Borrador",
      effectiveFrom: null,
      effectiveTo: null,
      changeNote: null,
      estimationsCount: 0,
      content: buildVersion("MOD-F1-V3", 3, true),
    },
  ];
}

export const MODEL_SEED: Omit<EstimationModelListItem, "versions"> = {
  id: MODEL_ID,
  name: "Estimación paramétrica de iniciativas",
  phase: "Inicial",
};

/** El historial inicial de cada versión, de lo más viejo a lo más nuevo. */
export function initialHistorySeeds(): Record<
  number,
  { occurredAtUtc: string; author: string; section: string; summary: string }[]
> {
  return {
    1: [
      {
        occurredAtUtc: "2026-01-15T12:00:00Z",
        author: "Migración a modelo versionado",
        section: "publicar",
        summary: "Se creó la versión 1.",
      },
      {
        occurredAtUtc: "2026-01-15T12:00:01Z",
        author: "Migración a modelo versionado",
        section: "publicar",
        summary:
          "Se publicó la versión 1: los parámetros que regían antes del versionado.",
      },
    ],
    2: [
      {
        occurredAtUtc: "2026-03-01T09:30:00Z",
        author: "Estiben Licona",
        section: "drivers",
        summary: "Se guardaron los pesos de las preguntas de incertidumbre.",
      },
      {
        occurredAtUtc: "2026-03-01T10:00:00Z",
        author: "Estiben Licona",
        section: "publicar",
        summary:
          "Se publicó la versión 2: las preguntas de incertidumbre pasan a alimentar la salida de riesgo.",
      },
    ],
    3: [
      {
        occurredAtUtc: "2026-03-05T14:20:00Z",
        author: "Estiben Licona",
        section: "publicar",
        summary: "Se creó la versión 3.",
      },
    ],
  };
}
