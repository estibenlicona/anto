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
