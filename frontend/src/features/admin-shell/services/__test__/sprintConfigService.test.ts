import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@shared/services/httpClient";
import { sprintConfigService } from "./../sprintConfigService";

vi.mock("@shared/services/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockConfig = {
  weeks: 2,
  hoursPerWeek: 40,
  sprintsPerQuarter: 6,
  toleranceHours: 4,
};

describe("sprintConfigService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConfig", () => {
    it("calls httpClient.get and returns the config", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockConfig });

      const result = await sprintConfigService.getConfig();

      expect(httpClient.get).toHaveBeenCalledWith("/admin/sprint-config");
      expect(result).toEqual(mockConfig);
    });

    it("throws when the request fails", async () => {
      vi.mocked(httpClient.get).mockRejectedValue(new Error("network error"));

      await expect(sprintConfigService.getConfig()).rejects.toThrow(
        "network error"
      );
    });
  });

  describe("saveConfig", () => {
    it("calls httpClient.put with the config and returns the response", async () => {
      const updated = { ...mockConfig, weeks: 3 };
      vi.mocked(httpClient.put).mockResolvedValue({ data: updated });

      const result = await sprintConfigService.saveConfig(updated);

      expect(httpClient.put).toHaveBeenCalledWith(
        "/admin/sprint-config",
        updated
      );
      expect(result).toEqual(updated);
    });

    it("throws when the request fails", async () => {
      vi.mocked(httpClient.put).mockRejectedValue(new Error("invalid config"));

      await expect(sprintConfigService.saveConfig(mockConfig)).rejects.toThrow(
        "invalid config"
      );
    });
  });
});
