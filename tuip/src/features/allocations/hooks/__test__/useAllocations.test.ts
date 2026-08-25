import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { allocationService } from "../../services/allocationService";
import { useAllocations } from "../useAllocations";

vi.mock("../../services/allocationService", () => ({
  allocationService: {
    listBySquad: vi.fn(),
  },
}));

const mockDto = {
  id: "a1",
  personId: "p1",
  personName: "María González",
  squadId: "s1",
  squadName: "Backend Platform",
  initiativeId: null,
  initiativeName: null,
  dedicationPercentage: 80,
  bauPercentage: 50,
  transformationPercentage: 30,
  personPosition: "Backend Dev",
  personModality: "Hybrid" as const,
  personSeniority: 3,
  personSeniorityLabel: "Avanzado",
  personAvailablePercentage: 20,
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

describe("useAllocations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not load anything without a squadId", () => {
    const { result } = renderHook(() => useAllocations(undefined));
    expect(result.current.loading).toBe(false);
    expect(result.current.allocations).toEqual([]);
    expect(allocationService.listBySquad).not.toHaveBeenCalled();
  });

  it("loads the allocations for the given squad", async () => {
    vi.mocked(allocationService.listBySquad).mockResolvedValue(
      pagedOf([mockDto])
    );
    const { result } = renderHook(() => useAllocations("s1"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(allocationService.listBySquad).toHaveBeenCalledWith(
      "s1",
      1,
      10,
      undefined,
      []
    );
    expect(result.current.allocations).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(1);
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(allocationService.listBySquad).mockRejectedValue(
      new Error("network error")
    );
    const { result } = renderHook(() => useAllocations("s1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
  });

  it("refetch reloads the list", async () => {
    vi.mocked(allocationService.listBySquad).mockResolvedValue(pagedOf([]));
    const { result } = renderHook(() => useAllocations("s1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(allocationService.listBySquad).mockResolvedValue(
      pagedOf([mockDto])
    );
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.allocations).toHaveLength(1));
  });

  it("onPageChange requests the new page", async () => {
    vi.mocked(allocationService.listBySquad).mockResolvedValue(
      pagedOf([mockDto])
    );
    const { result } = renderHook(() => useAllocations("s1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });

    await waitFor(() =>
      expect(allocationService.listBySquad).toHaveBeenLastCalledWith(
        "s1",
        2,
        10,
        undefined,
        []
      )
    );
  });

  it("resets to page 1 when the squad changes", async () => {
    vi.mocked(allocationService.listBySquad).mockResolvedValue(
      pagedOf([mockDto])
    );
    const { result, rerender } = renderHook(
      ({ squadId }) => useAllocations(squadId),
      { initialProps: { squadId: "s1" } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() =>
      expect(allocationService.listBySquad).toHaveBeenLastCalledWith(
        "s1",
        2,
        10,
        undefined,
        []
      )
    );

    rerender({ squadId: "s2" });

    await waitFor(() =>
      expect(allocationService.listBySquad).toHaveBeenLastCalledWith(
        "s2",
        1,
        10,
        undefined,
        []
      )
    );
    expect(result.current.page).toBe(1);
  });

  it("filtering by seniority sends the values and goes back to page 1", async () => {
    vi.mocked(allocationService.listBySquad).mockResolvedValue(
      pagedOf([mockDto])
    );
    const { result } = renderHook(() => useAllocations("s1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() =>
      expect(allocationService.listBySquad).toHaveBeenLastCalledWith(
        "s1",
        2,
        10,
        undefined,
        []
      )
    );

    act(() => {
      result.current.onSenioritiesChange([4]);
    });
    expect(result.current.page).toBe(1);
    await waitFor(() =>
      expect(allocationService.listBySquad).toHaveBeenLastCalledWith(
        "s1",
        1,
        10,
        undefined,
        [4]
      )
    );
  });

  it("searching sends the debounced term", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(allocationService.listBySquad).mockResolvedValue(
        pagedOf([mockDto])
      );
      const { result } = renderHook(() => useAllocations("s1"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.onSearchChange("dev");
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      await waitFor(() =>
        expect(allocationService.listBySquad).toHaveBeenLastCalledWith(
          "s1",
          1,
          10,
          "dev",
          []
        )
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
