import { useEffect, useState } from "react";
import {
  sprintConfigService,
  type SprintConfig,
} from "../services/sprintConfigService";

type FieldErrors = Partial<Record<keyof SprintConfig, string>>;

const FIELD_RANGES: Record<
  keyof SprintConfig,
  { min: number; max: number; label: string }
> = {
  weeks: { min: 1, max: 4, label: "Semanas por sprint" },
  hoursPerWeek: { min: 20, max: 48, label: "Horas por semana" },
  sprintsPerQuarter: { min: 4, max: 8, label: "Sprints por quarter" },
  toleranceHours: { min: 0, max: 16, label: "Tolerancia de reporte" },
};

function validateField(
  field: keyof SprintConfig,
  value: number
): string | null {
  const range = FIELD_RANGES[field];
  if (Number.isNaN(value)) return `${range.label} debe ser un número`;
  if (value < range.min || value > range.max) {
    return `${range.label} debe estar entre ${range.min} y ${range.max}`;
  }
  return null;
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
    const numericValue = Number(rawValue);
    setValues({ ...values, [field]: numericValue });
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, numericValue) ?? undefined,
    }));
  };

  const isDirty =
    !!values &&
    !!savedValues &&
    (Object.keys(values) as (keyof SprintConfig)[]).some(
      (field) => values[field] !== savedValues[field]
    );

  const isValid =
    !!values &&
    (Object.keys(values) as (keyof SprintConfig)[]).every(
      (field) => validateField(field, values[field]) === null
    );

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
