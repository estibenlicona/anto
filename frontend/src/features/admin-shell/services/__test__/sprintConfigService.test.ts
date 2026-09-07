import { describe, it, expect, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../../mocks/server";
import { resetSprintConfigMock } from "../../../../mocks/handlers/sprint-config.handlers";
import { sprintConfigService, type SprintConfig } from "../sprintConfigService";

/**
 * Contra el mock de red, como los demás servicios de Admin: mockear
 * `httpClient` por alias no surtía efecto —MSW respondía igual— y las
 * aserciones sobre las llamadas nunca llegaban a cumplirse.
 */
const defaultConfig: SprintConfig = {
  weeks: 2,
  sprintsPerQuarter: 6,
  hoursPerSprint: 80,
  sprintCloseTime: "23:00",
  historyWindowSprints: 6,
  minHistorySprints: 3,
};

describe("sprintConfigService", () => {
  afterEach(() => {
    resetSprintConfigMock();
  });

  describe("getConfig", () => {
    it("devuelve la configuración vigente, sin horas ni puntos por FTE", async () => {
      const result = await sprintConfigService.getConfig();

      expect(result).toEqual(defaultConfig);
      expect(result).not.toHaveProperty("pointsPerFtePerSprint");
      expect(result).not.toHaveProperty("hoursPerWeek");
      expect(result).not.toHaveProperty("toleranceHours");
    });

    it("propaga el error cuando la petición falla", async () => {
      server.use(
        http.get("/admin/sprint-config", () =>
          HttpResponse.json({ message: "Error de servidor" }, { status: 500 })
        )
      );

      await expect(sprintConfigService.getConfig()).rejects.toThrow();
    });
  });

  describe("saveConfig", () => {
    it("persiste la configuración y un GET posterior la refleja", async () => {
      const updated: SprintConfig = {
        ...defaultConfig,
        weeks: 3,
        sprintCloseTime: "18:30",
        historyWindowSprints: 10,
      };

      const result = await sprintConfigService.saveConfig(updated);

      expect(result).toEqual(updated);
      await expect(sprintConfigService.getConfig()).resolves.toEqual(updated);
    });

    it("rechaza un mínimo de sprints mayor que la ventana de histórico", async () => {
      await expect(
        sprintConfigService.saveConfig({
          ...defaultConfig,
          historyWindowSprints: 4,
          minHistorySprints: 6,
        })
      ).rejects.toThrow();

      // Y no deja rastro: la configuración guardada sigue siendo la anterior.
      await expect(sprintConfigService.getConfig()).resolves.toEqual(
        defaultConfig
      );
    });

    it("rechaza una hora de cierre mal formada", async () => {
      await expect(
        sprintConfigService.saveConfig({
          ...defaultConfig,
          sprintCloseTime: "25:00",
        })
      ).rejects.toThrow();
    });
  });
});
