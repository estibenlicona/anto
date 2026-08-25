import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { sprintConfigService } from "../../services/sprintConfigService";
import { useSprintConfig } from "../useSprintConfig";

vi.mock("../../services/sprintConfigService", () => ({
  sprintConfigService: {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
  },
}));

const mockConfig = {
  weeks: 2,
  hoursPerWeek: 40,
  sprintsPerQuarter: 6,
  toleranceHours: 4,
};

describe("useSprintConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the config on mount", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);

    const { result } = renderHook(() => useSprintConfig());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.values).toEqual(mockConfig);
    expect(result.current.canSave).toBe(false);
  });

  it("marks a field invalid when it is out of range", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("weeks", "10");
    });

    expect(result.current.errors.weeks).toBeTruthy();
    expect(result.current.canSave).toBe(false);
  });

  it("saves successfully when the form is valid and dirty", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    const saved = { ...mockConfig, weeks: 3 };
    vi.mocked(sprintConfigService.saveConfig).mockResolvedValue(saved);
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("weeks", "3");
    });
    expect(result.current.canSave).toBe(true);

    await act(async () => {
      await result.current.save();
    });

    expect(sprintConfigService.saveConfig).toHaveBeenCalledWith({
      ...mockConfig,
      weeks: 3,
    });
    expect(result.current.values).toEqual(saved);
    expect(result.current.saveError).toBeNull();
    expect(result.current.canSave).toBe(false);
  });

  it("surfaces an error when saving fails", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(sprintConfigService.saveConfig).mockRejectedValue(
      new Error("Error de servidor")
    );
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("weeks", "3");
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveError).toBe("Error de servidor");
    expect(result.current.saving).toBe(false);
  });
});
