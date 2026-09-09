import {
  bandFor,
  type EvaluationModel,
  type EvaluationResult,
} from "../services/evaluationModel";
import type { InitiativeEvaluationDto } from "../services/initiativeService";

/**
 * La evaluación guardada, en la forma que consumen las piezas de lectura.
 *
 * El DTO persistido trae lo calculado (puntaje, talla, PM, FTE, dimensiones,
 * mix) pero no tres cosas que la lectura necesita, y las tres se derivan sin
 * pedirle nada al servidor:
 *
 * · `answered` y `totalQuestions` salen de sumar las dimensiones, que ya
 *   viajan con su propio `answered`/`total`.
 * · `triageYes` sale de contar los "sí" del tamizaje, que también viaja.
 * · La banda de talla se busca en el modelo con `bandFor`.
 *
 * Esa última tiene una consecuencia que conviene tener presente: **la banda
 * sale del modelo vigente, no del que calculó la evaluación**. Mientras los
 * parámetros no estén versionados, mover un umbral cambia la lectura de una
 * estimación vieja aunque su talla y su puntaje sigan siendo los mismos. Es la
 * brecha que el snapshot de la HU (CA11) viene a cerrar.
 */
export function savedEvaluationResult(
  dto: InitiativeEvaluationDto,
  model: EvaluationModel
): EvaluationResult {
  const answered = dto.dimensions.reduce((sum, d) => sum + d.answered, 0);
  const totalQuestions = dto.dimensions.reduce((sum, d) => sum + d.total, 0);

  return {
    points: dto.points,
    maxPoints: dto.maxPoints,
    pct: dto.pct,
    talla: dto.talla,
    band: bandFor(model, dto.pct),
    fteExpected: dto.fteExpected,
    fteMin: dto.fteMin,
    fteMax: dto.fteMax,
    dimensions: dto.dimensions,
    mix: dto.mix,
    answered,
    totalQuestions,
    triageYes: dto.triage.filter(Boolean).length,
    triageVerdict: dto.triageVerdict,
    targetMonths: dto.targetMonths,
  };
}
