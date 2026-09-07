import { useEffect, useState } from "react";
import {
  sprintConfigService,
  SPRINT_CLOSE_TIME_PATTERN,
  type SprintConfig,
} from "../services/sprintConfigService";

type FieldErrors = Partial<Record<keyof SprintConfig, string>>;

type NumericField = Exclude<keyof SprintConfig, "sprintCloseTime">;

const FIELD_RANGES: Record<
  NumericField,
  { min: number; max: number; label: string }
> = {
  weeks: { min: 1, max: 4, label: "Semanas por sprint" },
  sprintsPerQuarter: { min: 4, max: 8, label: "Sprints por quarter" },
  hoursPerSprint: { min: 20, max: 400, label: "Horas por sprint" },
  historyWindowSprints: { min: 3, max: 12, label: "Ventana de histórico" },
  minHistorySprints: {
    min: 2,
    max: 6,
    label: "Mínimo de sprints para evaluar",
  },
};

const CLOSE_TIME_LABEL = "Hora de cierre del sprint";

export function isNumericField(
  field: keyof SprintConfig
): field is NumericField {
  return field !== "sprintCloseTime";
}

function validateField(
  field: keyof SprintConfig,
  value: number | string
): string | null {
  if (field === "sprintCloseTime") {
    return SPRINT_CLOSE_TIME_PATTERN.test(String(value))
      ? null
      : `${CLOSE_TIME_LABEL} debe tener el formato HH:mm`;
  }
  const range = FIELD_RANGES[field];
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return `${range.label} debe ser un número`;
  if (numeric < range.min || numeric > range.max) {
    return `${range.label} debe estar entre ${range.min} y ${range.max}`;
  }
  return null;
}

/**
 * La única regla que cruza dos campos: no tiene sentido exigir más sprints
 * sellados para evaluar de los que la ventana llega a mirar. Se reporta sobre
 * el mínimo, que es el campo que el Administrador acaba de mover.
 */
function validateCross(values: SprintConfig): FieldErrors {
  if (values.minHistorySprints > values.historyWindowSprints) {
    return {
      minHistorySprints: `${FIELD_RANGES.minHistorySprints.label} no puede ser mayor que la ventana de histórico`,
    };
  }
  return {};
}

function validateAll(values: SprintConfig): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(values) as (keyof SprintConfig)[]).forEach((field) => {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  });
  return { ...errors, ...validateCross(values) };
}

export const useSprintConfig = () => {
  const [values, setValues] = useState<SprintConfig | null>(null);
  const [savedValues, setSavedValues] = useState<SprintConfig | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    sprintConfigService.getConfig().then((config) => {
      if (cancelled) return;
      setValues(config);
      setSavedValues(config);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (field: keyof SprintConfig, rawValue: string) => {
    if (!values) return;
    const next: SprintConfig = isNumericField(field)
      ? { ...values, [field]: Number(rawValue) }
      : { ...values, sprintCloseTime: rawValue };
    setValues(next);
    // Se revalida entero: mover la ventana puede arreglar o romper el mínimo.
    setErrors(validateAll(next));
  };

  const isDirty =
    !!values &&
    !!savedValues &&
    (Object.keys(values) as (keyof SprintConfig)[]).some(
      (field) => values[field] !== savedValues[field]
    );

  const isValid = !!values && Object.keys(validateAll(values)).length === 0;

  /** Devuelve el resultado directamente — leer `saveError` del hook justo
   * después del `await` vería el valor de la closure del render anterior,
   * no el que este mismo guardado acaba de fijar, así que el llamador debe
   * usar este valor de retorno para decidir qué feedback mostrar. */
  const save = async (): Promise<{ success: boolean; error?: string }> => {
    if (!values || !isValid) return { success: false };
    try {
      setSaving(true);
      setSaveError(null);
      const saved = await sprintConfigService.saveConfig(values);
      setValues(saved);
      setSavedValues(saved);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al guardar la configuración";
      setSaveError(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  return {
    values,
    errors,
    loading,
    saving,
    saveError,
    canSave: isDirty && isValid && !saving,
    setField,
    save,
  };
};
