import type { AlertVariant } from "@tuya-ui/components";
import type {
  EvaluationResult,
  TriageVerdict,
} from "../services/evaluationModel";

export const TRIAGE_STEP = 0;
export const RESULT_STEP = 8;

export interface TriageRecommendation {
  title: string;
  text: string;
  variant: AlertVariant;
  fastTrack: boolean;
}

export const TRIAGE_RECOMMENDATIONS: Record<
  TriageVerdict,
  TriageRecommendation
> = {
  Required: {
    title: "Evaluación completa obligatoria",
    text: "Talla probable M o superior: hay una respuesta crítica o tres o más en sí.",
    variant: "danger",
    fastTrack: false,
  },
  Recommended: {
    title: "Evaluación completa recomendada",
    text: "Talla probable S–M. Conviene responder las siete dimensiones.",
    variant: "warning",
    fastTrack: false,
  },
  FastTrack: {
    title: "Vía rápida (XS–S)",
    text: "No requiere evaluación completa. Se puede guardar así o seguir para más detalle.",
    variant: "success",
    fastTrack: true,
  },
};

export const QUESTION_KIND_LABELS = {
  Objective: "Objetiva",
  Evaluative: "Evaluativa",
} as const;

export interface EvaluationStep {
  index: number;
  /** "T", "1".."7", "R" */
  code: string;
  label: string;
  /** Texto a la derecha: "3 sí", "4/4 · 45%", talla. */
  detail: string;
  done: boolean;
}

/** Los pasos del panel lateral, derivados del resultado en vivo. */
export function evaluationSteps(result: EvaluationResult): EvaluationStep[] {
  const steps: EvaluationStep[] = [
    {
      index: TRIAGE_STEP,
      code: "T",
      label: "Tamizaje",
      detail: `${result.triageYes} sí`,
      done: true,
    },
  ];
  result.dimensions.forEach((d, i) => {
    steps.push({
      index: i + 1,
      code: String(i + 1),
      label: d.dimension,
      detail: `${d.answered}/${d.total} · ${d.pct}%`,
      done: d.answered === d.total,
    });
  });
  steps.push({
    index: RESULT_STEP,
    code: "R",
    label: "Resultado",
    detail: result.talla,
    done: false,
  });
  return steps;
}

export const pctText = (pct: number) => `${pct.toLocaleString("es-CO")}%`;
export const pmText = (min: number, max: number) =>
  `${min.toLocaleString("es-CO")}–${max.toLocaleString("es-CO")}`;
export const uncertaintyFactor = (min: number, max: number) =>
  min > 0 ? Math.round((max / min) * 10) / 10 : 0;

/** La dimensión con más puntaje; con empate, la primera. */
export function heaviestDimension(result: EvaluationResult) {
  return result.dimensions.reduce(
    (a, b) => (b.pct > a.pct ? b : a),
    result.dimensions[0]
  );
}
