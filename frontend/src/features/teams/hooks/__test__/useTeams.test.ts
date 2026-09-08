import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { teamService } from "../../services/teamService";
import { useTeams } from "../useTeams";

vi.mock("../../services/teamService", () => ({
  teamService: {
    list: vi.fn(),
  },
}));

const mockDto = {
  id: "t1",
  name: "Ecosistema Digital",
  description: "Canales digitales",
  squadCount: 2,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

function pagedOf(items: (typeof mockDto)[]) {
  return {
    items,
    page: 1,
    pageSize: 10,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / 10)),
  };
}

describe("useTeams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the teams on mount, defaulting to page 1 / pageSize 10", async () => {
    vi.mocked(teamService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => useTeams());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(teamService.list).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.current.teams).toEqual([
      {
        id: "t1",
        name: "Ecosistema Digital",
        description: "Canales digitales",
        squadCount: 2,
        createdAtUtc: "2026-01-01T00:00:00Z",
        updatedAtUtc: "2026-01-01T00:00:00Z",
      },
    ]);
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(1);
  });

  it("computes the stats totals independently of the list's page and search", async () => {
    vi.mocked(teamService.list).mockResolvedValue(
      pagedOf([mockDto, { ...mockDto, id: "t2", squadCount: 3 }])
    );
    const { result } = renderHook(() => useTeams());

    await waitFor(() => expect(result.current.statsLoading).toBe(false));
    expect(result.current.totalTeamsCount).toBe(2);
    expect(result.current.totalSquadCount).toBe(5);
    // La consulta de stats no lleva término de búsqueda.
    expect(teamService.list).toHaveBeenCalledWith(1, 1000);
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(teamService.list).mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useTeams());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
    expect(result.current.teams).toEqual([]);
  });

  it("refetch reloads the list", async () => {
    vi.mocked(teamService.list).mockResolvedValue(pagedOf([]));
    const { result } = renderHook(() => useTeams());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(teamService.list).mockResolvedValue(pagedOf([mockDto]));
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.teams).toHaveLength(1));
  });

  it("searching sends the (debounced) term and goes back to page 1", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(teamService.list).mockResolvedValue(pagedOf([mockDto]));
      const { result } = renderHook(() => useTeams());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onPageChange(2);
      });
      await waitFor(() =>
        expect(teamService.list).toHaveBeenLastCalledWith(2, 10, undefined)
      );

      act(() => {
        result.current.onSearchChange("pagos");
      });
      expect(result.current.page).toBe(1);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() =>
        expect(teamService.list).toHaveBeenLastCalledWith(1, 10, "pagos")
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
