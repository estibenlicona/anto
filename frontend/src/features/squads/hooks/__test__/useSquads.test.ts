import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { squadService } from "../../services/squadService";
import { useSquads } from "../useSquads";

vi.mock("../../services/squadService", () => ({
  squadService: {
    list: vi.fn(),
  },
}));

const mockDto = {
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High" as const,
  description: "Servicios core",
  memberCount: 0,
  members: [],
  allocatedFte: 0,
  bauFte: 0,
  transformationFte: 0,
  peopleAvailableFte: 0,
  activeInitiative: null,
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

describe("useSquads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the squads on mount, defaulting to page 1 / pageSize 10", async () => {
    vi.mocked(squadService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => useSquads());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(squadService.list).toHaveBeenCalledWith(1, 10, undefined, []);
    expect(result.current.squads).toEqual([
      { ...mockDto, criticalityLabel: "Alta" },
    ]);
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(squadService.list).mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useSquads());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
    expect(result.current.squads).toEqual([]);
  });

  it("refetch reloads the list", async () => {
    vi.mocked(squadService.list).mockResolvedValue(pagedOf([]));
    const { result } = renderHook(() => useSquads());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(squadService.list).mockResolvedValue(pagedOf([mockDto]));
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.squads).toHaveLength(1));
  });

  it("onPageChange requests the new page", async () => {
    vi.mocked(squadService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => useSquads());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });

    await waitFor(() =>
      expect(squadService.list).toHaveBeenLastCalledWith(2, 10, undefined, [])
    );
  });

  it("accepts an initialPageSize for consumers that need a larger page (e.g. dropdowns)", async () => {
    vi.mocked(squadService.list).mockResolvedValue(pagedOf([mockDto]));
    renderHook(() => useSquads(100));

    await waitFor(() =>
      expect(squadService.list).toHaveBeenCalledWith(1, 100, undefined, [])
    );
  });

  it("searching sends the (debounced) term and goes back to page 1", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(squadService.list).mockResolvedValue(pagedOf([mockDto]));
      const { result } = renderHook(() => useSquads());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onPageChange(3);
      });
      await waitFor(() =>
        expect(squadService.list).toHaveBeenLastCalledWith(3, 10, undefined, [])
      );

      act(() => {
        result.current.onSearchChange("pagos");
      });
      expect(result.current.page).toBe(1);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() =>
        expect(squadService.list).toHaveBeenLastCalledWith(1, 10, "pagos", [])
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("filtering by criticality sends the values and goes back to page 1", async () => {
    vi.mocked(squadService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => useSquads());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() =>
      expect(squadService.list).toHaveBeenLastCalledWith(2, 10, undefined, [])
    );

    act(() => {
      result.current.onCriticalitiesChange(["Critical", "High"]);
    });
    expect(result.current.page).toBe(1);
    await waitFor(() =>
      expect(squadService.list).toHaveBeenLastCalledWith(1, 10, undefined, [
        "Critical",
        "High",
      ])
    );
  });
});
