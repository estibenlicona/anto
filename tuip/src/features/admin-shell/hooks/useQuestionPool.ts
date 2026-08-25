import { useCallback, useEffect, useState } from "react";
import {
  questionPoolService,
  type QuestionPool,
  type QuestionPoolRow,
} from "../services/questionPoolService";

/** Sólo el texto y el peso pueden ser inválidos; la dimensión la fija el editor. */
export type QuestionRowErrors = { texto?: string; peso?: string };

/**
 * Un 200 no alcanza para confiar en la forma: con `VITE_BASE_URL=/` y sin los
 * mocks activos, el dev server responde su `index.html` con 200 a una ruta que
 * no conoce. Mismo motivo que en `useTallaBands` y `useCapabilityMix`.
 */
function isQuestionPool(value: unknown): value is QuestionPool {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof row.id === "string" &&
        typeof row.dimension === "string" &&
        typeof row.texto === "string" &&
        typeof row.peso === "number"
    )
  );
}

function validateRows(pool: QuestionPool): QuestionRowErrors[] {
  return pool.map((row) => {
    const errors: QuestionRowErrors = {};
    if (row.texto.trim().length === 0) errors.texto = "No puede quedar vacío";
    if (!Number.isInteger(row.peso) || row.peso < 1) {
      errors.peso = "Tiene que ser un número entero de al menos 1";
    }
    return errors;
  });
}

function newRowId(): string {
  return `pregunta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Carga, edita y guarda el pool de preguntas, con la misma forma que
 * `useCapabilityMix` más el alta y baja acotadas a una dimensión.
 *
 * Editar, agregar y quitar son cambios sobre la misma lista y se confirman
 * juntos: separarlos obligaría a decidir qué pasa si alguien agrega una
 * pregunta y después cancela.
 */
export const useQuestionPool = () => {
  const [values, setValues] = useState<QuestionPool | null>(null);
  const [savedValues, setSavedValues] = useState<QuestionPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    questionPoolService
      .getPool()
      .then((pool) => {
        if (cancelled) return;
        if (!isQuestionPool(pool)) {
          setLoadError(
            "La respuesta del servidor no tiene la forma de un pool de preguntas."
          );
          setLoading(false);
          return;
        }
        setValues(pool);
        setSavedValues(pool);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("No se pudo cargar el pool de preguntas.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setRowTexto = useCallback((index: number, texto: string) => {
    setValues((current) =>
      current
        ? current.map((row, i) => (i === index ? { ...row, texto } : row))
        : current
    );
  }, []);

  const setRowPeso = useCallback((index: number, rawValue: string) => {
    setValues((current) =>
      current
        ? current.map((row, i) =>
            i === index ? { ...row, peso: Number(rawValue) } : row
          )
        : current
    );
  }, []);

  /** El id se genera acá y no en el servidor: la fila tiene que ser distinguible desde que aparece. */
  const addRow = useCallback((dimension: string) => {
    setValues((current) =>
      current
        ? [
            ...current,
            {
              id: newRowId(),
              dimension,
              texto: "",
              peso: 1,
            } satisfies QuestionPoolRow,
          ]
        : current
    );
  }, []);

  const removeRow = useCallback((index: number) => {
    setValues((current) =>
      current ? current.filter((_, i) => i !== index) : current
    );
  }, []);

  /** Vuelve a lo último guardado — el cancelar del editor, altas y bajas incluidas. */
  const discard = useCallback(() => {
    setValues(savedValues);
    setSaveError(null);
  }, [savedValues]);

  const errors: QuestionRowErrors[] = values ? validateRows(values) : [];
  const isValid = errors.every(
    (rowErrors) => Object.keys(rowErrors).length === 0
  );
  const isDirty =
    !!values &&
    !!savedValues &&
    JSON.stringify(values) !== JSON.stringify(savedValues);

  /**
   * Devuelve el resultado directamente — leer `saveError` del hook justo
   * después del `await` vería el valor de la closure del render anterior, no
   * el que este mismo guardado acaba de fijar.
   */
  const save = async (): Promise<{ success: boolean; error?: string }> => {
    if (!values || !isValid) return { success: false };
    try {
      setSaving(true);
      setSaveError(null);
      const saved = await questionPoolService.savePool(values);
      setValues(saved);
      setSavedValues(saved);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al guardar el pool de preguntas";
      setSaveError(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  return {
    values,
    /**
     * Lo último guardado, para quien muestre el resumen en vez de editarlo. La
     * tabla no puede leer `values`: son los valores en edición, así que una
     * pregunta a medio completar en el editor aparecería en el resumen como si
     * ya estuviera guardada.
     */
    saved: savedValues,
    errors,
    loading,
    saving,
    saveError,
    loadError,
    canSave: isDirty && isValid && !saving,
    setRowTexto,
    setRowPeso,
    addRow,
    removeRow,
    discard,
    save,
  };
};
