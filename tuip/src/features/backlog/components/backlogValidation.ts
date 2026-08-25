import type { ClassificationKind } from "../services/backlogService";

export interface DecisionValues {
  kind: ClassificationKind | "";
  initiativeId: string;
  bauCategory: string;
}

export interface DecisionErrors {
  kind?: string;
  initiativeId?: string;
  bauCategory?: string;
}

/** Iniciativa exige su iniciativa; BAU su categoría; Descartar nada. */
export function validateDecision(values: DecisionValues): DecisionErrors {
  const errors: DecisionErrors = {};
  if (values.kind === "") {
    errors.kind = "Selecciona qué es este trabajo";
    return errors;
  }
  if (values.kind === "Initiative" && !values.initiativeId) {
    errors.initiativeId = "Selecciona la iniciativa";
  }
  if (values.kind === "Bau" && !values.bauCategory) {
    errors.bauCategory = "Selecciona la categoría";
  }
  return errors;
}

export function isDecisionValid(values: DecisionValues): boolean {
  return Object.keys(validateDecision(values)).length === 0;
}
