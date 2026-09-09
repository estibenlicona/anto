import type {
  ModelValidationCheck,
  ModelValidationReport,
} from "@features/admin-shell/services/estimationModelService";
import type {
  EstimationModelVersion,
  EstimationOutput,
  ModelQuestion,
} from "@features/initiatives/services/evaluationModel";

/**
 * Los nueve chequeos de publicación, del lado del mock.
 *
 * Vive acá y no en la feature porque **el cliente no valida**: la lista la
 * calcula el servidor, y la pantalla sólo la pinta y navega a arreglar cada
 * impedimento. Este archivo es el servidor haciendo de servidor mientras no hay
 * red — es el espejo de `ModelVersionValidation` del backend, y si alguna vez
 * discrepan, manda el backend.
 */

const CHECK_DIMENSIONS = "DIMENSIONES";
const CHECK_QUESTIONS = "PREGUNTAS";
const CHECK_DRIVERS = "DRIVERS";
const CHECK_WEIGHTS = "PESOS";
const CHECK_TALLAS = "TALLAS";
const CHECK_EFFORT = "ESFUERZO";
const CHECK_RISK = "RIESGO";
const CHECK_MIX = "MIX";
const CHECK_MODIFIERS = "MODIFICADORES";

const MIN_TALLA_WIDTH = 5;

const RESULT_OUTPUTS: EstimationOutput[] = ["Size", "Effort", "Risk"];

const LABELS: Record<string, string> = {
  Size: "tamaño",
  Effort: "esfuerzo",
  Risk: "riesgo",
  Mix: "mix",
};

const passed = (
  code: string,
  title: string,
  section: ModelValidationCheck["section"]
): ModelValidationCheck => ({
  code,
  title,
  status: "pasa",
  missing: null,
  section,
});

const failed = (
  code: string,
  title: string,
  missing: string,
  section: ModelValidationCheck["section"]
): ModelValidationCheck => ({
  code,
  title,
  status: "impedimento",
  missing,
  section,
});

function activeQuestions(version: EstimationModelVersion): ModelQuestion[] {
  const active = new Set(
    version.dimensions.filter((d) => d.active).map((d) => d.code)
  );
  return version.questions.filter((q) => q.active && active.has(q.dimension));
}

function dimensionsCheck(
  version: EstimationModelVersion,
  active: ModelQuestion[]
): ModelValidationCheck {
  const activeDimensions = version.dimensions.filter((d) => d.active);
  if (activeDimensions.length === 0) {
    return failed(CHECK_DIMENSIONS, "Dimensiones activas", "No hay ninguna dimensión activa.", "dimensiones");
  }

  const empty = activeDimensions
    .filter((d) => !active.some((q) => q.dimension === d.code))
    .map((d) => d.name);

  return empty.length > 0
    ? failed(
        CHECK_DIMENSIONS,
        "Dimensiones activas",
        `Sin preguntas activas: ${empty.join(", ")}.`,
        "dimensiones"
      )
    : passed(CHECK_DIMENSIONS, "Dimensiones activas", "dimensiones");
}

function questionsCheck(
  version: EstimationModelVersion,
  active: ModelQuestion[]
): ModelValidationCheck {
  if (active.length === 0) {
    return failed(CHECK_QUESTIONS, "Preguntas del cuestionario", "No hay ninguna pregunta activa.", "dimensiones");
  }

  const declared = new Set(version.dimensions.map((d) => d.code));
  const orphan = version.questions
    .filter((q) => q.active && !declared.has(q.dimension))
    .map((q) => q.id);

  if (orphan.length > 0) {
    return failed(
      CHECK_QUESTIONS,
      "Preguntas del cuestionario",
      `Apuntan a una dimensión que no existe: ${orphan.join(", ")}.`,
      "dimensiones"
    );
  }

  const withoutUnit = active
    .filter((q) => q.type === "Cuantitativa" && !q.unit?.trim())
    .map((q) => q.id);

  return withoutUnit.length > 0
    ? failed(
        CHECK_QUESTIONS,
        "Preguntas del cuestionario",
        `Cuantitativas sin unidad: ${withoutUnit.join(", ")}.`,
        "dimensiones"
      )
    : passed(CHECK_QUESTIONS, "Preguntas del cuestionario", "dimensiones");
}

function driversCheck(
  version: EstimationModelVersion,
  active: ModelQuestion[]
): ModelValidationCheck {
  if (version.drivers.length === 0) {
    return failed(CHECK_DRIVERS, "Drivers", "No hay ningún driver definido.", "drivers");
  }

  const declared = new Set(version.drivers.map((d) => d.code));
  const unknown = active.filter((q) => !declared.has(q.driver)).map((q) => q.id);
  if (unknown.length > 0) {
    return failed(
      CHECK_DRIVERS,
      "Drivers",
      `Apuntan a un driver que no existe: ${unknown.join(", ")}.`,
      "drivers"
    );
  }

  const orphan = version.drivers
    .filter((d) => !active.some((q) => q.driver === d.code))
    .map((d) => d.code);

  return orphan.length > 0
    ? failed(
        CHECK_DRIVERS,
        "Drivers",
        `Sin preguntas activas que los alimenten: ${orphan.join(", ")}.`,
        "drivers"
      )
    : passed(CHECK_DRIVERS, "Drivers", "drivers");
}

function weightsCheck(active: ModelQuestion[]): ModelValidationCheck {
  const starved = RESULT_OUTPUTS.filter(
    (output) => !active.some((q) => q.weights[output] !== undefined)
  ).map((output) => LABELS[output]);

  if (starved.length > 0) {
    return failed(
      CHECK_WEIGHTS,
      "Pesos por salida",
      `Sin ninguna pregunta que aporte: ${starved.join(", ")}.`,
      "drivers"
    );
  }

  // Advertencia y no impedimento: una pregunta sin peso en ninguna salida no
  // rompe el cálculo, sólo le hace perder el tiempo a quien responde.
  const inert = active
    .filter((q) => Object.keys(q.weights).length === 0)
    .map((q) => q.id);

  return inert.length > 0
    ? {
        code: CHECK_WEIGHTS,
        title: "Pesos por salida",
        status: "advertencia",
        missing: `No mueven ningún resultado: ${inert.join(", ")}.`,
        section: "drivers",
      }
    : passed(CHECK_WEIGHTS, "Pesos por salida", "drivers");
}

function tallasCheck(version: EstimationModelVersion): ModelValidationCheck {
  const rules = version.tallaRules;
  if (rules.length < 2) {
    return failed(CHECK_TALLAS, "Reglas de talla", "Hacen falta al menos dos tallas.", "tallas");
  }

  if (rules[0].minPct !== 0 || rules[rules.length - 1].maxPct !== 100) {
    return failed(
      CHECK_TALLAS,
      "Reglas de talla",
      "Las tallas no cubren el rango completo de 0 a 100.",
      "tallas"
    );
  }

  for (let i = 0; i < rules.length; i++) {
    if (i > 0 && rules[i].minPct !== rules[i - 1].maxPct) {
      return failed(
        CHECK_TALLAS,
        "Reglas de talla",
        `Hay un hueco o un solape entre ${rules[i - 1].talla} y ${rules[i].talla}.`,
        "tallas"
      );
    }

    if (rules[i].maxPct - rules[i].minPct < MIN_TALLA_WIDTH) {
      return failed(
        CHECK_TALLAS,
        "Reglas de talla",
        `La talla ${rules[i].talla} queda más angosta que ${MIN_TALLA_WIDTH} puntos.`,
        "tallas"
      );
    }
  }

  return passed(CHECK_TALLAS, "Reglas de talla", "tallas");
}

function effortCheck(version: EstimationModelVersion): ModelValidationCheck {
  const broken = version.tallaRules
    .filter((r) => r.pmMin > r.pmExpected || r.pmExpected > r.pmMax)
    .map((r) => r.talla);

  return broken.length > 0
    ? failed(
        CHECK_EFFORT,
        "Parámetros de esfuerzo",
        `El esperado queda fuera del rango en: ${broken.join(", ")}.`,
        "tallas"
      )
    : passed(CHECK_EFFORT, "Parámetros de esfuerzo", "tallas");
}

function riskCheck(version: EstimationModelVersion): ModelValidationCheck {
  const bands = version.riskBands;
  if (bands.length === 0) {
    return failed(CHECK_RISK, "Bandas de riesgo", "No hay ninguna banda de riesgo.", "tallas");
  }

  for (let i = 1; i < bands.length; i++) {
    if (bands[i].maxPct <= bands[i - 1].maxPct) {
      return failed(
        CHECK_RISK,
        "Bandas de riesgo",
        `El techo de «${bands[i].level}» no supera al de «${bands[i - 1].level}».`,
        "tallas"
      );
    }
  }

  return bands[bands.length - 1].maxPct !== 100
    ? failed(
        CHECK_RISK,
        "Bandas de riesgo",
        `La última banda llega a ${bands[bands.length - 1].maxPct} y tiene que llegar a 100.`,
        "tallas"
      )
    : passed(CHECK_RISK, "Bandas de riesgo", "tallas");
}

function mixCheck(version: EstimationModelVersion): ModelValidationCheck {
  if (version.mix.length === 0) {
    return failed(CHECK_MIX, "Mix de capacidades", "No hay ninguna capacidad en el mix.", "mix");
  }

  const offBy: string[] = [];
  for (const rule of version.tallaRules) {
    const total = version.mix.reduce(
      (sum, row) => sum + (row.byTalla[rule.talla] ?? 0),
      0
    );
    // Los porcentajes salen de una conversión con dos decimales: se compara con
    // la tolerancia de esa precisión, no con igualdad exacta de coma flotante.
    const difference = Math.round((total - 100) * 100) / 100;
    if (difference !== 0) {
      offBy.push(
        difference > 0
          ? `${rule.talla} (sobran ${difference})`
          : `${rule.talla} (faltan ${-difference})`
      );
    }
  }

  return offBy.length > 0
    ? failed(CHECK_MIX, "Mix de capacidades", `No suman 100: ${offBy.join(", ")}.`, "mix")
    : passed(CHECK_MIX, "Mix de capacidades", "mix");
}

function modifiersCheck(version: EstimationModelVersion): ModelValidationCheck {
  const drivers = new Set(version.drivers.map((d) => d.code));
  const capabilities = new Set(version.mix.map((m) => m.capability));

  for (const modifier of version.mixModifiers) {
    if (!drivers.has(modifier.driver)) {
      return failed(
        CHECK_MODIFIERS,
        "Modificadores de mix",
        `«${modifier.code}» apunta al driver ${modifier.driver}, que no existe.`,
        "mix"
      );
    }

    const total = modifier.adjustments.reduce((sum, a) => sum + a.points, 0);
    if (Math.round(total * 100) !== 0) {
      return failed(
        CHECK_MODIFIERS,
        "Modificadores de mix",
        `«${modifier.code}» no reparte: sus ajustes suman ${total} puntos en vez de cero.`,
        "mix"
      );
    }

    for (const adjustment of modifier.adjustments) {
      if (!capabilities.has(adjustment.capability)) {
        return failed(
          CHECK_MODIFIERS,
          "Modificadores de mix",
          `«${modifier.code}» ajusta ${adjustment.capability}, que no está en el mix.`,
          "mix"
        );
      }

      const row = version.mix.find((m) => m.capability === adjustment.capability);
      for (const talla of modifier.tallas) {
        if (row && (row.byTalla[talla] ?? 0) + adjustment.points < 0) {
          return failed(
            CHECK_MODIFIERS,
            "Modificadores de mix",
            `«${modifier.code}» deja a ${row.capability} por debajo de cero en la talla ${talla}.`,
            "mix"
          );
        }
      }
    }
  }

  return passed(CHECK_MODIFIERS, "Modificadores de mix", "mix");
}

export function validateVersion(
  version: EstimationModelVersion
): ModelValidationReport {
  const active = activeQuestions(version);

  const checks: ModelValidationCheck[] = [
    dimensionsCheck(version, active),
    questionsCheck(version, active),
    driversCheck(version, active),
    weightsCheck(active),
    tallasCheck(version),
    effortCheck(version),
    riskCheck(version),
    mixCheck(version),
    modifiersCheck(version),
  ];

  const impedimentCount = checks.filter((c) => c.status === "impedimento").length;

  return {
    checks,
    impedimentCount,
    warningCount: checks.filter((c) => c.status === "advertencia").length,
    canPublish: impedimentCount === 0,
  };
}
