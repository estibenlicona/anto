import { httpClient } from "@shared/services/httpClient";

export interface SprintConfig {
  weeks: number;
  hoursPerWeek: number;
  sprintsPerQuarter: number;
  toleranceHours: number;
}

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
