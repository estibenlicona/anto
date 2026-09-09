/**
 * El modelo de evaluación y su motor de cálculo. Sin React ni red: lo usan
 * el hook de la pantalla (vista en vivo) y el mock (lo que persiste), así que
 * hay una sola verdad para el resultado. El backend real lo reemplazará sin
 * tocar la UI (design.md D1).
 */

export type QuestionKind = "Objective" | "Evaluative";

export interface EvaluationQuestion {
  id: string;
  dimension: string;
  text: string;
  weight: number;
  kind: QuestionKind;
  /** Cinco etiquetas, para los valores 0–4. */
  scale: string[];
}

export interface TriageQuestion {
  id: string;
  text: string;
  critical: boolean;
}

export interface TallaBandModel {
  talla: string;
  minPct: number;
  maxPct: number;
  pmMin: number;
  pmMax: number;
  lectura: string;
  action: string;
}

export interface CapabilityMixModel {
  capability: string;
  byTalla: Record<string, number>;
}

export interface EvaluationModel {
  dimensions: string[];
  questions: EvaluationQuestion[];
  triage: TriageQuestion[];
  bands: TallaBandModel[];
  mix: CapabilityMixModel[];
}

export interface EvaluationInput {
  /** Una por pregunta del tamizaje, en orden. */
  triage: boolean[];
  /** Valor 0–4 por id de pregunta; las no respondidas no aparecen. */
  answers: Record<string, number>;
  targetMonths: number;
}

export type TriageVerdict = "Required" | "Recommended" | "FastTrack";

export interface DimensionResult {
  dimension: string;
  answered: number;
  total: number;
  points: number;
  maxPoints: number;
  pct: number;
  /** Cuánto aporta la dimensión al puntaje máximo total, en %. */
  weightPct: number;
}

export interface MixResult {
  capability: string;
  people: number;
  compositionPct: number;
  fte: number;
}

export interface EvaluationResult {
  points: number;
  maxPoints: number;
  pct: number;
  talla: string;
  band: TallaBandModel;
  fteExpected: number;
  fteMin: number;
  fteMax: number;
  dimensions: DimensionResult[];
  mix: MixResult[];
  answered: number;
  totalQuestions: number;
  triageYes: number;
  triageVerdict: TriageVerdict;
  targetMonths: number;
}

export const SCORE_MAX = 4;

const round1 = (n: number) => Math.round(n * 10) / 10;

export function triageVerdict(
  model: EvaluationModel,
  triage: boolean[]
): { yes: number; verdict: TriageVerdict } {
  const yes = triage.filter(Boolean).length;
  const critical = model.triage.some((t, i) => t.critical && triage[i]);
  if (critical || yes >= 3) return { yes, verdict: "Required" };
  if (yes >= 1) return { yes, verdict: "Recommended" };
  return { yes, verdict: "FastTrack" };
}

/** La banda que contiene el porcentaje; por encima de todas, la última. */
export function bandFor(model: EvaluationModel, pct: number): TallaBandModel {
  const found = model.bands.find((b) => pct <= b.maxPct);
  return found ?? model.bands[model.bands.length - 1];
}

export function computeEvaluation(
  model: EvaluationModel,
  input: EvaluationInput
): EvaluationResult {
  const months = Math.max(1, input.targetMonths || 1);
  const value = (q: EvaluationQuestion) => {
    const v = input.answers[q.id];
    return typeof v === "number" ? Math.min(SCORE_MAX, Math.max(0, v)) : 0;
  };
  const maxPoints = model.questions.reduce(
    (a, q) => a + SCORE_MAX * q.weight,
    0
  );
  const points = model.questions.reduce((a, q) => a + value(q) * q.weight, 0);
  const pct = maxPoints > 0 ? round1((points / maxPoints) * 100) : 0;
  const band = bandFor(model, pct);

  const dimensions: DimensionResult[] = model.dimensions.map((dimension) => {
    const qs = model.questions.filter((q) => q.dimension === dimension);
    const dMax = qs.reduce((a, q) => a + SCORE_MAX * q.weight, 0);
    const dPts = qs.reduce((a, q) => a + value(q) * q.weight, 0);
    return {
      dimension,
      answered: qs.filter((q) => typeof input.answers[q.id] === "number")
        .length,
      total: qs.length,
      points: dPts,
      maxPoints: dMax,
      pct: dMax > 0 ? Math.round((dPts / dMax) * 100) : 0,
      weightPct: maxPoints > 0 ? Math.round((dMax / maxPoints) * 100) : 0,
    };
  });

  const fteExpected = (band.pmMin + band.pmMax) / 2 / months;
  const fteMin = band.pmMin / months;
  const fteMax = band.pmMax / months;

  const people = model.mix.map((m) => ({
    capability: m.capability,
    people: m.byTalla[band.talla] ?? 0,
  }));
  const totalPeople = people.reduce((a, p) => a + p.people, 0);
  const mix: MixResult[] = people
    .filter((p) => p.people > 0)
    .map((p) => {
      const compositionPct =
        totalPeople > 0 ? Math.round((p.people / totalPeople) * 100) : 0;
      return {
        capability: p.capability,
        people: p.people,
        compositionPct,
        fte: totalPeople > 0 ? (p.people / totalPeople) * fteExpected : 0,
      };
    });

  const { yes, verdict } = triageVerdict(model, input.triage);

  return {
    points,
    maxPoints,
    pct,
    talla: band.talla,
    band,
    fteExpected,
    fteMin,
    fteMax,
    dimensions,
    mix,
    answered: model.questions.filter(
      (q) => typeof input.answers[q.id] === "number"
    ).length,
    totalQuestions: model.questions.length,
    triageYes: yes,
    triageVerdict: verdict,
    targetMonths: months,
  };
}

/* ------------------------------------------------------------------------- *
 * El modelo paramétrico versionado.
 *
 * Convive con el motor de arriba mientras dura la migración: el de arriba lee
 * el modelo plano de hoy (peso escalar, escala 0–4 cableada), éste lee el
 * contenido de una versión (opciones con puntaje normalizado, drivers, pesos
 * por salida). El de arriba se retira cuando la pantalla consuma éste.
 *
 * Es espejo de `ParametricEstimationEngine` en el backend; los dos cumplen el
 * algoritmo escrito en `fixtures/estimation-model/README.md` y los dos corren
 * los mismos casos dorados.
 * ------------------------------------------------------------------------- */

/** Las tres salidas del modelo más el eje de mix. */
export type EstimationOutput = "Size" | "Effort" | "Risk" | "Mix";

export type EstimationQuestionType = "Cuantitativa" | "Evaluativa" | "Binaria";

export interface ModelDimension {
  code: string;
  name: string;
  order: number;
  active: boolean;
}

export interface ModelDriver {
  code: string;
  description: string;
  outputs: EstimationOutput[];
}

/**
 * Una opción con su puntaje normalizado entre 0 y 1. En una cuantitativa
 * `from`/`to` delimitan el tramo: `from` exclusivo salvo en el primero, `to`
 * inclusivo, y `to` nulo en el último significa "sin tope".
 */
export interface QuestionOption {
  label: string;
  score: number;
  from?: number | null;
  to?: number | null;
}

/**
 * Una salida ausente de `weights` es "no aporta"; con peso `0` es "aporta, y
 * pesa cero". Numéricamente da igual, en la lectura no.
 */
export interface ModelQuestion {
  id: string;
  dimension: string;
  text: string;
  type: EstimationQuestionType;
  unit?: string;
  driver: string;
  active: boolean;
  options: QuestionOption[];
  weights: Partial<Record<EstimationOutput, number>>;
}

/** El esperado es un parámetro propio, no el punto medio de min y max. */
export interface TallaRule {
  talla: string;
  minPct: number;
  maxPct: number;
  pmMin: number;
  pmExpected: number;
  pmMax: number;
  lectura: string;
  action: string;
}

export interface RiskBand {
  level: string;
  maxPct: number;
}

/** El mix base de una capacidad, en porcentaje por talla. */
export interface MixRow {
  capability: string;
  byTalla: Record<string, number>;
}

export interface MixAdjustment {
  capability: string;
  points: number;
}

/** Reparte y no agrega: sus ajustes suman cero puntos porcentuales. */
export interface MixModifier {
  code: string;
  driver: string;
  operator: "gte" | "lte";
  value: number;
  tallas: string[];
  adjustments: MixAdjustment[];
}

export interface EstimationModelVersion {
  modelId: string;
  versionId: string;
  versionNumber: number;
  dimensions: ModelDimension[];
  drivers: ModelDriver[];
  questions: ModelQuestion[];
  triage: TriageQuestion[];
  tallaRules: TallaRule[];
  riskBands: RiskBand[];
  mix: MixRow[];
  mixModifiers: MixModifier[];
}

/** O el índice de la opción elegida, o el número escrito. Nunca las dos. */
export interface RawAnswer {
  option?: number;
  number?: number;
}

export interface EstimationInput {
  triage: boolean[];
  answers: Record<string, RawAnswer>;
  targetMonths: number;
}

export interface OutputScore {
  points: number;
  maxPoints: number;
  pct: number;
  /** Las preguntas que declaran peso en la salida, en el orden del modelo. */
  contributes: string[];
}

export interface RiskScore extends OutputScore {
  level: string;
}

export interface DimensionScore {
  dimension: string;
  answered: number;
  total: number;
  points: number;
  maxPoints: number;
  pct: number;
  weightPct: number;
}

export interface MixDemand {
  capability: string;
  pct: number;
  fte: number;
}

/** La traza de una respuesta, que es lo que hace auditable el cálculo. */
export interface AnswerDerivation {
  questionId: string;
  raw: string;
  optionLabel: string;
  score: number;
  driver: string;
  weights: Partial<Record<EstimationOutput, number>>;
}

export interface EstimationResult {
  size: OutputScore;
  effort: OutputScore;
  risk: RiskScore;
  talla: string;
  pmMin: number;
  pmExpected: number;
  pmMax: number;
  fteMin: number;
  fteExpected: number;
  fteMax: number;
  dimensions: DimensionScore[];
  mix: MixDemand[];
  mixModifiersApplied: string[];
  derivations: AnswerDerivation[];
  answered: number;
  totalQuestions: number;
  triageYes: number;
  triageVerdict: TriageVerdict;
}

/** El punto de la escala de esfuerzo en el que el resultado es el parámetro esperado. */
const EFFORT_ANCHOR_PCT = 50;

const RESULT_OUTPUTS = ["Size", "Effort", "Risk"] as const;

const round1p = (n: number) => Math.round(n * 10 + Number.EPSILON) / 10;
const round0p = (n: number) => Math.round(n + Number.EPSILON);

/** La talla que contiene el porcentaje; por encima de todas, la última. */
export function tallaFor(
  version: EstimationModelVersion,
  sizePct: number
): TallaRule {
  return (
    version.tallaRules.find((r) => sizePct <= r.maxPct) ??
    version.tallaRules[version.tallaRules.length - 1]
  );
}

/**
 * El esfuerzo esperado: `pmExpected` es el ancla y el puntaje de esfuerzo
 * interpola alrededor de él. Con el puntaje en la mitad de la escala da
 * exactamente el parámetro — que es distinto del punto medio del rango, y por
 * eso dos iniciativas de la misma talla ya no reciben la misma cifra.
 */
export function expectedEffort(rule: TallaRule, effortPct: number): number {
  const pm =
    effortPct <= EFFORT_ANCHOR_PCT
      ? rule.pmMin +
        (rule.pmExpected - rule.pmMin) * (effortPct / EFFORT_ANCHOR_PCT)
      : rule.pmExpected +
        (rule.pmMax - rule.pmExpected) *
          ((effortPct - EFFORT_ANCHOR_PCT) / EFFORT_ANCHOR_PCT);
  return round1p(pm);
}

/** La opción en la que cae una respuesta cruda, o `undefined` si no cae en ninguna. */
function resolveOption(
  question: ModelQuestion,
  answer: RawAnswer | undefined
): QuestionOption | undefined {
  if (!answer) return undefined;

  if (question.type === "Cuantitativa") {
    if (typeof answer.number !== "number") return undefined;
    const n = answer.number;
    return question.options.find((option, i) => {
      const aboveFloor =
        option.from === undefined || option.from === null
          ? true
          : i === 0
            ? n >= option.from
            : n > option.from;
      const underCeiling =
        option.to === undefined || option.to === null ? true : n <= option.to;
      return aboveFloor && underCeiling;
    });
  }

  return typeof answer.option === "number"
    ? question.options[answer.option]
    : undefined;
}

export function computeEstimation(
  version: EstimationModelVersion,
  input: EstimationInput
): EstimationResult {
  // Un plazo de cero dividiría por cero: se lee como un mes.
  const months = Math.max(1, input.targetMonths || 1);

  const activeDimensions = new Set(
    version.dimensions.filter((d) => d.active).map((d) => d.code)
  );
  const active = version.questions.filter(
    (q) => q.active && activeDimensions.has(q.dimension)
  );

  // Se resuelve una vez por pregunta: la opción en la que cayó la respuesta es
  // lo que alimenta el puntaje, la derivación y el driver.
  const resolved = new Map<string, QuestionOption | undefined>(
    active.map((q) => [q.id, resolveOption(q, input.answers[q.id])])
  );
  const scoreOf = (q: ModelQuestion) => resolved.get(q.id)?.score ?? 0;

  /**
   * El puntaje de una salida sobre las preguntas que **declaran** peso en ella.
   * Una que no aporta queda fuera de la suma y fuera de `contributes`; una con
   * peso cero está en las dos.
   */
  const scoreForOutput = (output: EstimationOutput): OutputScore => {
    const contributing = active.filter((q) => q.weights[output] !== undefined);
    const maxPoints = contributing.reduce(
      (sum, q) => sum + q.weights[output]!,
      0
    );
    const points = contributing.reduce(
      (sum, q) => sum + q.weights[output]! * scoreOf(q),
      0
    );
    return {
      points,
      maxPoints,
      pct: maxPoints > 0 ? round1p((points / maxPoints) * 100) : 0,
      contributes: contributing.map((q) => q.id),
    };
  };

  const [size, effort, risk] = RESULT_OUTPUTS.map(scoreForOutput);

  const rule = tallaFor(version, size.pct);
  const pmExpected = expectedEffort(rule, effort.pct);
  const fteExpected = pmExpected / months;

  const riskBand =
    version.riskBands.find((b) => risk.pct <= b.maxPct) ??
    version.riskBands[version.riskBands.length - 1];

  /**
   * El puntaje de un driver: el promedio de sus preguntas activas ponderado por
   * su peso en el mix. Sin preguntas que lo alimenten por ese eje, el driver no
   * participa y sus modificadores no se disparan.
   */
  const driverScore = (driver: string): number | undefined => {
    const feeding = active.filter(
      (q) => q.driver === driver && q.weights.Mix !== undefined
    );
    const totalWeight = feeding.reduce((sum, q) => sum + q.weights.Mix!, 0);
    if (totalWeight <= 0) return undefined;
    return (
      feeding.reduce((sum, q) => sum + q.weights.Mix! * scoreOf(q), 0) /
      totalWeight
    );
  };

  const percentages = new Map<string, number>(
    version.mix.map((m) => [m.capability, m.byTalla[rule.talla] ?? 0])
  );
  const mixModifiersApplied: string[] = [];
  for (const modifier of version.mixModifiers) {
    if (!modifier.tallas.includes(rule.talla)) continue;
    const score = driverScore(modifier.driver);
    if (score === undefined) continue;
    const triggers =
      modifier.operator === "lte"
        ? score <= modifier.value
        : score >= modifier.value;
    if (!triggers) continue;

    mixModifiersApplied.push(modifier.code);
    for (const adjustment of modifier.adjustments) {
      percentages.set(
        adjustment.capability,
        (percentages.get(adjustment.capability) ?? 0) + adjustment.points
      );
    }
  }

  // Un perfil en cero no es composición, es ruido en la tarjeta. Los FTE no se
  // redondean: tres porciones redondeadas no suman el total.
  const mix: MixDemand[] = version.mix
    .map((m) => ({
      capability: m.capability,
      pct: percentages.get(m.capability) ?? 0,
    }))
    .filter((m) => m.pct > 0)
    .map((m) => ({ ...m, fte: (m.pct / 100) * fteExpected }));

  /**
   * El desglose por dimensión es sobre la salida de tamaño. Una dimensión cuyas
   * preguntas no pesan en tamaño da cero, que es correcto: es lo que hace
   * visible que una dimensión de riesgo no agranda la iniciativa.
   */
  const dimensions: DimensionScore[] = version.dimensions
    .filter((d) => d.active)
    .sort((a, b) => a.order - b.order)
    .map((dimension) => {
      const own = active.filter((q) => q.dimension === dimension.code);
      const contributing = own.filter((q) => q.weights.Size !== undefined);
      const maxPoints = contributing.reduce(
        (sum, q) => sum + q.weights.Size!,
        0
      );
      const points = contributing.reduce(
        (sum, q) => sum + q.weights.Size! * scoreOf(q),
        0
      );
      return {
        dimension: dimension.code,
        answered: own.filter((q) => input.answers[q.id] !== undefined).length,
        total: own.length,
        points,
        maxPoints,
        pct: maxPoints > 0 ? round0p((points / maxPoints) * 100) : 0,
        weightPct:
          size.maxPoints > 0 ? round0p((maxPoints / size.maxPoints) * 100) : 0,
      };
    });

  const derivations: AnswerDerivation[] = [];
  for (const question of active) {
    const raw = input.answers[question.id];
    const option = resolved.get(question.id);
    if (!raw || !option) continue;
    derivations.push({
      questionId: question.id,
      raw:
        question.type === "Cuantitativa"
          ? String(raw.number ?? 0)
          : option.label,
      optionLabel: option.label,
      score: option.score,
      driver: question.driver,
      weights: question.weights,
    });
  }

  const yes = input.triage.filter(Boolean).length;
  const critical = version.triage.some((t, i) => t.critical && input.triage[i]);
  const verdict: TriageVerdict =
    critical || yes >= 3 ? "Required" : yes >= 1 ? "Recommended" : "FastTrack";

  return {
    size,
    effort,
    risk: { ...risk, level: riskBand.level },
    talla: rule.talla,
    pmMin: rule.pmMin,
    pmExpected,
    pmMax: rule.pmMax,
    fteMin: rule.pmMin / months,
    fteExpected,
    fteMax: rule.pmMax / months,
    dimensions,
    mix,
    mixModifiersApplied,
    derivations,
    answered: active.filter((q) => input.answers[q.id] !== undefined).length,
    totalQuestions: active.length,
    triageYes: yes,
    triageVerdict: verdict,
  };
}
