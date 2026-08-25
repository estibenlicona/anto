import { http, HttpResponse } from "msw";
import {
  TALLA_MIN_BAND_WIDTH,
  TALLA_RANGE_MAX,
  TALLA_RANGE_MIN,
  type TallaBand,
  type TallaBands,
} from "@features/admin-shell/services/tallaBandsService";

const TALLA_BANDS_URL = "/admin/talla-bands";

const defaultTallaBands: TallaBands = {
  boundaries: [20, 40, 60, 80],
  bands: [
    { talla: "XS", pmMin: 0.5, pmMax: 1, lectura: "Cambio menor" },
    { talla: "S", pmMin: 1, pmMax: 3, lectura: "Ajuste puntual" },
    { talla: "M", pmMin: 3, pmMax: 6, lectura: "Iniciativa media" },
    { talla: "L", pmMin: 6, pmMax: 10, lectura: "Iniciativa grande" },
    { talla: "XL", pmMin: 10, pmMax: 18, lectura: "Transformación mayor" },
  ],
};

function clone(bands: TallaBands): TallaBands {
  return {
    boundaries: [...bands.boundaries] as TallaBands["boundaries"],
    bands: bands.bands.map((band) => ({ ...band })) as TallaBands["bands"],
  };
}

let tallaBands: TallaBands = clone(defaultTallaBands);

/** Lectura de sólo consulta para otros handlers (el modelo de evaluación se arma desde acá). */
export function getTallaBandsSnapshot(): TallaBands {
  return clone(tallaBands);
}

/** Reinicia el estado en memoria del mock — llamar explícitamente en los tests que ejercitan el guardado. */
export function resetTallaBandsMock() {
  tallaBands = clone(defaultTallaBands);
}

function isValidBand(value: unknown): value is TallaBand {
  if (!value || typeof value !== "object") return false;
  const band = value as Partial<TallaBand>;
  return (
    typeof band.talla === "string" &&
    band.talla.length > 0 &&
    typeof band.pmMin === "number" &&
    typeof band.pmMax === "number" &&
    band.pmMin >= 0 &&
    band.pmMin <= band.pmMax &&
    typeof band.lectura === "string" &&
    band.lectura.trim().length > 0
  );
}

/**
 * La contigüidad no se valida en el hook —los límites salen de un Slider que
 * no puede desordenarlos— pero acá sí: este handler recibe un cuerpo
 * arbitrario por HTTP, donde nada garantiza de dónde vino.
 */
function isValidTallaBands(value: unknown): value is TallaBands {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TallaBands>;
  const { boundaries, bands } = candidate;

  if (!Array.isArray(boundaries) || !Array.isArray(bands)) return false;
  if (bands.length !== boundaries.length + 1) return false;
  if (!bands.every(isValidBand)) return false;

  return boundaries.every((boundary, index) => {
    if (typeof boundary !== "number") return false;
    const floor = index === 0 ? TALLA_RANGE_MIN : boundaries[index - 1];
    const ceiling =
      index === boundaries.length - 1 ? TALLA_RANGE_MAX : boundaries[index + 1];
    return (
      boundary - floor >= TALLA_MIN_BAND_WIDTH &&
      ceiling - boundary >= TALLA_MIN_BAND_WIDTH
    );
  });
}

export const tallaBandsHandlers = [
  http.get(TALLA_BANDS_URL, () => {
    return HttpResponse.json(tallaBands);
  }),

  http.put(TALLA_BANDS_URL, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!isValidTallaBands(body)) {
      return HttpResponse.json(
        { message: "Bandas de talla inválidas" },
        { status: 400 }
      );
    }
    tallaBands = clone(body);
    return HttpResponse.json(tallaBands);
  }),
];
