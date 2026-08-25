import { httpClient } from "@shared/services/httpClient";

/** Lo propio de una banda. Su rango de porcentaje no vive acá: sale de los límites. */
export interface TallaBand {
  /** "XS", "S", "M", "L", "XL". No se edita: son cinco y se llaman así. */
  talla: string;
  pmMin: number;
  pmMax: number;
  lectura: string;
}

/**
 * Las bandas parten 0–100% compartiendo fronteras, así que se guarda un número
 * por frontera y no un mínimo y un máximo por banda. Con dos números por banda
 * el servicio, el mock, el hook y la pantalla tendrían cada uno la oportunidad
 * de dejar un hueco o un solape, y habría que validar contra eso en los cuatro
 * lados; con una frontera compartida no hay dos números que puedan discrepar.
 *
 * `boundaries` son los límites interiores —los cuatro que separan cinco
 * bandas—; 0 y 100 los cierran y no se guardan porque no se mueven.
 */
export interface TallaBands {
  boundaries: TallaBoundaries;
  bands: TallaBandSet;
}

/**
 * Tuplas y no arreglos sueltos: son las que hacen que "una banda más que
 * límites" lo verifique el compilador en vez de quedar como comentario. Las
 * bandas son cinco fijas —no se agregan ni se quitan— así que fijar el largo
 * no cuesta flexibilidad que alguien vaya a necesitar.
 */
export type TallaBoundaries = [number, number, number, number];
export type TallaBandSet = [
  TallaBand,
  TallaBand,
  TallaBand,
  TallaBand,
  TallaBand,
];

/**
 * Reemplaza una banda conservando el largo de la tupla. `map` devolvería un
 * arreglo suelto y obligaría a afirmar el tipo en cada llamada; acá la
 * afirmación queda en un solo lugar, sobre una copia que sólo cambia de
 * contenido y nunca de longitud.
 */
export function replaceBand(
  bands: TallaBandSet,
  index: number,
  band: TallaBand
): TallaBandSet {
  const next = [...bands] as TallaBandSet;
  next[index] = band;
  return next;
}

/** Los extremos del rango que las bandas reparten. */
export const TALLA_RANGE_MIN = 0;
export const TALLA_RANGE_MAX = 100;

/** Ninguna banda puede quedar más angosta que esto, en puntos de porcentaje. */
export const TALLA_MIN_BAND_WIDTH = 5;

/**
 * El rango que le toca a una banda, derivado de los límites. El inferior suma
 * uno porque la frontera pertenece a la banda de abajo: si el límite es 20,
 * XS llega hasta 20 y S arranca en 21.
 */
/**
 * Persona-mes para mostrar: coma decimal y siempre un decimal.
 *
 * Los valores crudos mezclan `0.5` con enteros como `1` o `10`, así que sin
 * formatear la columna alterna entre una y ninguna cifra decimal y los dígitos
 * dejan de caer en la misma vertical — que es justamente para lo que esa
 * columna usa cifras tabulares. El punto decimal, además, es de otra locale.
 *
 * No se usa para los campos del editor: un `input[type=number]` no acepta la
 * coma, así que ahí el valor va crudo.
 */
export function formatPersonMonths(value: number): string {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function bandRange(
  boundaries: number[],
  index: number
): { from: number; to: number } {
  const edges = [TALLA_RANGE_MIN, ...boundaries, TALLA_RANGE_MAX];
  return {
    from: index === 0 ? edges[0] : edges[index] + 1,
    to: edges[index + 1],
  };
}

const TALLA_BANDS_URL = "/admin/talla-bands";

export const tallaBandsService = {
  getBands: async (): Promise<TallaBands> => {
    const response = await httpClient.get<TallaBands>(TALLA_BANDS_URL);
    return response.data;
  },

  saveBands: async (bands: TallaBands): Promise<TallaBands> => {
    const response = await httpClient.put<TallaBands>(TALLA_BANDS_URL, bands);
    return response.data;
  },
};
