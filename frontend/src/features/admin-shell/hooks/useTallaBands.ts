import { useCallback, useEffect, useState } from "react";
import {
  replaceBand,
  tallaBandsService,
  type TallaBand,
  type TallaBands,
  type TallaBoundaries,
} from "../services/tallaBandsService";

/** Sólo los campos que se escriben a mano pueden ser inválidos; ver `validateBand`. */
export type BandFieldErrors = Partial<
  Record<"pmMin" | "pmMax" | "lectura", string>
>;

/**
 * Un 200 no alcanza para confiar en la forma. Con `VITE_BASE_URL=/` y sin los
 * mocks activos (`pnpm dev` en vez de `pnpm dev:mock`), el dev server responde
 * su `index.html` con 200 a una ruta que no conoce, así que acá llega una
 * cadena de HTML en vez de un objeto. Sin esta guarda `values.bands` queda
 * indefinido y el `.map` de la pantalla se lleva puesta la ruta entera.
 */
function isTallaBands(value: unknown): value is TallaBands {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TallaBands>;
  return (
    Array.isArray(candidate.boundaries) &&
    Array.isArray(candidate.bands) &&
    candidate.bands.length === candidate.boundaries.length + 1
  );
}

function validateBand(band: TallaBand): BandFieldErrors {
  const errors: BandFieldErrors = {};
  if (Number.isNaN(band.pmMin)) errors.pmMin = "Debe ser un número";
  else if (band.pmMin < 0) errors.pmMin = "No puede ser negativo";
  if (Number.isNaN(band.pmMax)) errors.pmMax = "Debe ser un número";
  else if (band.pmMax < band.pmMin)
    errors.pmMax = "No puede ser menor que el mínimo";
  if (band.lectura.trim().length === 0)
    errors.lectura = "No puede quedar vacía";
  return errors;
}

/**
 * Carga, edita y guarda las bandas de talla, con la misma forma que
 * `useSprintConfig`: valores vigentes contra guardados para saber si hay
 * cambios, errores por campo, y un `save` que devuelve su resultado.
 *
 * Los límites no se validan. Salen de un Slider que no puede desordenarlos ni
 * dejar una banda sin ancho, así que una validación acá no tendría forma de
 * fallar — a diferencia del handler del mock, que sí la hace porque recibe un
 * cuerpo arbitrario por HTTP.
 */
export const useTallaBands = () => {
  const [values, setValues] = useState<TallaBands | null>(null);
  const [savedValues, setSavedValues] = useState<TallaBands | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    tallaBandsService
      .getBands()
      .then((bands) => {
        if (cancelled) return;
        if (!isTallaBands(bands)) {
          setLoadError(
            "La respuesta del servidor no tiene la forma de unas bandas de talla."
          );
          setLoading(false);
          return;
        }
        setValues(bands);
        setSavedValues(bands);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("No se pudieron cargar las bandas de talla.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setBoundaries = useCallback((boundaries: TallaBoundaries) => {
    setValues((current) => (current ? { ...current, boundaries } : current));
  }, []);

  const setBandField = useCallback(
    (index: number, field: keyof TallaBand, rawValue: string) => {
      setValues((current) => {
        if (!current) return current;
        const band = current.bands[index];
        const nextBand: TallaBand =
          field === "lectura"
            ? { ...band, lectura: rawValue }
            : { ...band, [field]: Number(rawValue) };
        return {
          ...current,
          bands: replaceBand(current.bands, index, nextBand),
        };
      });
    },
    []
  );

  /** Vuelve a lo último guardado — el cancelar del modal. */
  const discard = useCallback(() => {
    setValues(savedValues);
    setSaveError(null);
  }, [savedValues]);

  const errors: BandFieldErrors[] = values
    ? values.bands.map(validateBand)
    : [];
  const isValid = errors.every(
    (bandErrors) => Object.keys(bandErrors).length === 0
  );
  const isDirty =
    !!values &&
    !!savedValues &&
    JSON.stringify(values) !== JSON.stringify(savedValues);

  /**
   * Devuelve el resultado directamente — leer `saveError` del hook justo
   * después del `await` vería el valor de la closure del render anterior, no
   * el que este mismo guardado acaba de fijar, así que el llamador debe usar
   * este valor de retorno para decidir qué feedback mostrar.
   */
  const save = async (): Promise<{ success: boolean; error?: string }> => {
    if (!values || !isValid) return { success: false };
    try {
      setSaving(true);
      setSaveError(null);
      const saved = await tallaBandsService.saveBands(values);
      setValues(saved);
      setSavedValues(saved);
      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al guardar las bandas de talla";
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
    loadError,
    canSave: isDirty && isValid && !saving,
    setBoundaries,
    setBandField,
    discard,
    save,
  };
};
