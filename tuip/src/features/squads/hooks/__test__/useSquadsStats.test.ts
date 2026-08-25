import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { squadService } from "../../services/squadService";
import { useSquadsStats } from "../useSquadsStats";

vi.mock("../../services/squadService", () => ({
  squadService: {
    getStats: vi.fn(),
  },
}));

const mockStats = {
  totalCount: 5,
  withoutPeopleCount: 1,
  atCapacityCount: 0,
  teamCount: 4,
  allocatedFte: 6.3,
  bauFte: 3.4,
  transformationFte: 2.9,
  chapterFte: 17.8,
  byCriticality: [
    { criticality: "Critical" as const, count: 2 },
    { criticality: "High" as const, count: 1 },
    { criticality: "Medium" as const, count: 1 },
    { criticality: "Low" as const, count: 1 },
  ],
};

describe("useSquadsStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the stats on mount", async () => {
    vi.mocked(squadService.getStats).mockResolvedValue(mockStats);
    const { result } = renderHook(() => useSquadsStats());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(squadService.getStats).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useSquadsStats());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe("boom");
  });

  it("refetch reloads the stats", async () => {
    vi.mocked(squadService.getStats).mockResolvedValue(mockStats);
    const { result } = renderHook(() => useSquadsStats());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(squadService.getStats).mockResolvedValue({
      ...mockStats,
      totalCount: 6,
    });
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.stats?.totalCount).toBe(6);
  });
});
