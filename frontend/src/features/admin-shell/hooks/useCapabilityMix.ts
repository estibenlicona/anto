import { useCallback, useEffect, useState } from "react";
import {
  capabilityMixService,
  type CapabilityMix,
  type CapabilityMixRow,
} from "../services/capabilityMixService";

/** Sólo el nombre puede ser inválido; las cantidades se corrigen a número al escribirlas. */
export type MixRowErrors = { capacidad?: string };

/**
 * Un 200 no alcanza para confiar en la forma: con `VITE_BASE_URL=/` y sin los
 * mocks activos, el dev server responde su `index.html` con 200 a una ruta que
 * no conoce. Mismo motivo que en `useTallaBands`.
 */
function isCapabilityMix(value: unknown): value is CapabilityMix {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof row.id === "string" &&
        typeof row.capacidad === "string" &&
        !!row.porTalla &&
        typeof row.porTalla === "object"
    )
  );
}

function validateRows(mix: CapabilityMix): MixRowErrors[] {
  // Se compara sin distinguir mayúsculas ni espacios de sobra: "QA" y "qa "
  // son la misma capacidad para quien lee la tabla.
  const normalized = mix.map((row) => row.capacidad.trim().toLocaleLowerCase());
  return mix.map((_, index) => {
    const name = normalized[index];
    if (name.length === 0) return { capacidad: "No puede quedar vacío" };
    if (normalized.some((other, i) => i !== index && other === name)) {
      return { capacidad: "Ya hay una capacidad con ese nombre" };
    }
    return {};
  });
}

function newRowId(): string {
  return `capacidad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Carga, edita y guarda el mix de capacidades, con la misma forma que
 * `useTallaBands` más el alta y baja de filas.
 *
 * Editar, agregar y quitar son cambios sobre la misma matriz y se confirman
 * juntos: separarlos obligaría a decidir qué pasa si alguien agrega una fila y
 * después cancela.
 */
export const useCapabilityMix = () => {
  const [values, setValues] = useState<CapabilityMix | null>(null);
  const [savedValues, setSavedValues] = useState<CapabilityMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    capabilityMixService
      .getMix()
      .then((mix) => {
        if (cancelled) return;
        if (!isCapabilityMix(mix)) {
          setLoadError(
            "La respuesta del servidor no tiene la forma de un mix de capacidades."
          );
          setLoading(false);
          return;
        }
        setValues(mix);
        setSavedValues(mix);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("No se pudo cargar el mix de capacidades.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setRowName = useCallback((index: number, name: string) => {
    setValues((current) =>
      current
        ? current.map((row, i) =>
            i === index ? { ...row, capacidad: name } : row
          )
        : current
    );
  }, []);

  const setRowAmount = useCallback(
    (index: number, talla: string, rawValue: string) => {
      setValues((current) =>
        current
          ? current.map((row, i) =>
              i === index
                ? {
                    ...row,
                    porTalla: { ...row.porTalla, [talla]: Number(rawValue) },
                  }
                : row
            )
          : current
      );
    },
    []
  );

  /** El id se genera acá y no en el servidor: la fila tiene que ser distinguible desde que aparece. */
  const addRow = useCallback((tallas: string[]) => {
    setValues((current) =>
      current
        ? [
            ...current,
            {
              id: newRowId(),
              capacidad: "",
              porTalla: Object.fromEntries(tallas.map((talla) => [talla, 0])),
            } satisfies CapabilityMixRow,
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

  const errors: MixRowErrors[] = values ? validateRows(values) : [];
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
      const saved = await capabilityMixService.saveMix(values);
      setValues(saved);
      setSavedValues(saved);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al guardar el mix de capacidades";
      setSaveError(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }
  };

  return {
    values,
    /**
     * Lo último guardado, para quien muestre el mix en vez de editarlo. La
     * tabla no puede leer `values`: son los valores en edición, así que una
     * fila a medio completar en el editor aparecería en ella como si ya
     * estuviera guardada.
     */
    saved: savedValues,
    errors,
    loading,
    saving,
    saveError,
    loadError,
    canSave: isDirty && isValid && !saving,
    setRowName,
    setRowAmount,
    addRow,
    removeRow,
    discard,
    save,
  };
};
