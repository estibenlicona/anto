import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { squadService } from "../../services/squadService";
import { useSquadTeamStats } from "../useSquadTeamStats";

vi.mock("../../services/squadService", () => ({
  squadService: {
    getTeamStats: vi.fn(),
  },
}));

const stats = {
  memberCount: 4,
  members: [{ id: "p1", name: "Ana" }],
  expertCount: 2,
  beginnerCount: 1,
  allocatedFte: 2.7,
  bauFte: 1.7,
  transformationFte: 1,
  peopleAvailableFte: 3.8,
};

describe("useSquadTeamStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the team stats for the squad", async () => {
    vi.mocked(squadService.getTeamStats).mockResolvedValue(stats);
    const { result } = renderHook(() => useSquadTeamStats("1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(squadService.getTeamStats).toHaveBeenCalledWith("1");
    expect(result.current.stats).toEqual(stats);
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(squadService.getTeamStats).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useSquadTeamStats("1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
    expect(result.current.stats).toBeNull();
  });

  it("refetch reloads the stats", async () => {
    vi.mocked(squadService.getTeamStats).mockResolvedValue(stats);
    const { result } = renderHook(() => useSquadTeamStats("1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(squadService.getTeamStats).mockResolvedValue({
      ...stats,
      memberCount: 5,
    });
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.stats?.memberCount).toBe(5));
  });
});
