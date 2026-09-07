import { httpClient } from "@shared/services/httpClient";

/**
 * Sólo lo que define el calendario. Las horas por semana y la tolerancia de
 * reporte se fueron con el registro de horas: la plataforma no las registra.
 * Los puntos por FTE se fueron con el balance de carga: el FTE mide capacidad
 * y los SP miden demanda, y no se convierten entre sí.
 */
export interface SprintConfig {
  weeks: number;
  sprintsPerQuarter: number;
  /**
   * Las horas que un colaborador a jornada completa tiene disponibles en un
   * sprint sin descuentos. Es el factor con el que el balance de carga expresa
   * la capacidad en horas —`FTE disponible × horas por sprint`— y nada más:
   * nadie reporta horas ni la plataforma las guarda.
   */
  hoursPerSprint: number;
  /**
   * Hora local (`HH:mm`, 24 h) del último día del sprint en que el backend
   * **sella el snapshot** de lo comprometido y lo completado. Tiene que ser
   * antes de que los equipos limpien y cierren las HUs: después de esa
   * limpieza, los estados de Azure DevOps ya no dicen lo que ocurrió.
   */
  sprintCloseTime: string;
  /** Cuántos sprints sellados entran en la mediana histórica y la tendencia. */
  historyWindowSprints: number;
  /**
   * Cuántos sprints sellados necesita un colaborador para que su señal de
   * balance se pueda calcular. Por debajo, su señal es "No evaluable".
   */
  minHistorySprints: number;
}

/** `HH:mm` en 24 horas: 00:00–23:59. */
export const SPRINT_CLOSE_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const SPRINT_CONFIG_URL = "/admin/sprint-config";

export const sprintConfigService = {
  getConfig: async (): Promise<SprintConfig> => {
    const response = await httpClient.get<SprintConfig>(SPRINT_CONFIG_URL);
    return response.data;
  },

  saveConfig: async (config: SprintConfig): Promise<SprintConfig> => {
    const response = await httpClient.put<SprintConfig>(
      SPRINT_CONFIG_URL,
      config
    );
    return response.data;
  },
};
