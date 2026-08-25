import { httpClient } from "@shared/services/httpClient";

/**
 * Una capacidad y cuánta gente suya pide cada talla.
 *
 * `id` existe aparte del nombre porque el nombre es justamente lo que se
 * edita: si la fila se identificara por él, renombrar "QA Engineer" a "QA"
 * sería indistinguible de borrar una fila y crear otra, y sus cantidades se
 * perderían o se confundirían con las de otra.
 */
export interface CapabilityMixRow {
  id: string;
  capacidad: string;
  /**
   * Cantidades indexadas por talla, no campos fijos `xs`/`s`/`m`. Con campos
   * fijos habría dos listas de tallas —la de las bandas y la implícita acá— y
   * nada que obligue a que coincidan; indexando, una talla nueva deja una celda
   * por completar en vez de una columna fantasma.
   */
  porTalla: Record<string, number>;
}

export type CapabilityMix = CapabilityMixRow[];

/** La ausencia de una talla en una fila se lee como cero: una talla nueva no rompe el render. */
export function mixAmount(row: CapabilityMixRow, talla: string): number {
  return row.porTalla[talla] ?? 0;
}

const CAPABILITY_MIX_URL = "/admin/capability-mix";

export const capabilityMixService = {
  getMix: async (): Promise<CapabilityMix> => {
    const response = await httpClient.get<CapabilityMix>(CAPABILITY_MIX_URL);
    return response.data;
  },

  saveMix: async (mix: CapabilityMix): Promise<CapabilityMix> => {
    const response = await httpClient.put<CapabilityMix>(
      CAPABILITY_MIX_URL,
      mix
    );
    return response.data;
  },
};
