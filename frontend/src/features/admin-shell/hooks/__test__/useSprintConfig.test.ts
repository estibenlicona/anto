import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { sprintConfigService } from "../../services/sprintConfigService";
import { useSprintConfig } from "../useSprintConfig";

vi.mock("../../services/sprintConfigService", () => ({
  sprintConfigService: {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
  },
  // El hook valida la hora de cierre con este patrón: sin él, el mock deja el
  // formulario colgado en "cargando".
  SPRINT_CLOSE_TIME_PATTERN: /^([01]\d|2[0-3]):[0-5]\d$/,
}));

const mockConfig = {
  weeks: 2,
  sprintsPerQuarter: 6,
  hoursPerSprint: 80,
  sprintCloseTime: "23:00",
  historyWindowSprints: 6,
  minHistorySprints: 3,
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

  it("valida la ventana de histórico entre 3 y 12", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("historyWindowSprints", "20");
    });
    expect(result.current.errors.historyWindowSprints).toBe(
      "Ventana de histórico debe estar entre 3 y 12"
    );
    expect(result.current.canSave).toBe(false);

    act(() => {
      result.current.setField("historyWindowSprints", "10");
    });
    expect(result.current.errors.historyWindowSprints).toBeUndefined();
    expect(result.current.canSave).toBe(true);
  });

  it("valida las horas por sprint entre 20 y 400", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("hoursPerSprint", "500");
    });
    expect(result.current.errors.hoursPerSprint).toBe(
      "Horas por sprint debe estar entre 20 y 400"
    );
    expect(result.current.canSave).toBe(false);

    act(() => {
      result.current.setField("hoursPerSprint", "100");
    });
    expect(result.current.errors.hoursPerSprint).toBeUndefined();
    expect(result.current.canSave).toBe(true);
  });

  it("rechaza un mínimo de sprints mayor que la ventana de histórico", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // La ventana por defecto es 6: pedir 6 cabe.
    act(() => {
      result.current.setField("minHistorySprints", "6");
    });
    expect(result.current.errors.minHistorySprints).toBeUndefined();

    // Bajar la ventana por debajo del mínimo sí es contradictorio.
    act(() => {
      result.current.setField("historyWindowSprints", "5");
    });
    expect(result.current.errors.minHistorySprints).toBe(
      "Mínimo de sprints para evaluar no puede ser mayor que la ventana de histórico"
    );
    expect(result.current.canSave).toBe(false);
  });

  it("valida el formato HH:mm de la hora de cierre", async () => {
    vi.mocked(sprintConfigService.getConfig).mockResolvedValue(mockConfig);
    const { result } = renderHook(() => useSprintConfig());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setField("sprintCloseTime", "25:00");
    });
    expect(result.current.errors.sprintCloseTime).toBe(
      "Hora de cierre del sprint debe tener el formato HH:mm"
    );
    expect(result.current.canSave).toBe(false);

    act(() => {
      result.current.setField("sprintCloseTime", "18:30");
    });
    expect(result.current.errors.sprintCloseTime).toBeUndefined();
    expect(result.current.canSave).toBe(true);
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
