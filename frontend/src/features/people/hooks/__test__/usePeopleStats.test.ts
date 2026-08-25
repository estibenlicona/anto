import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { personService } from "../../services/personService";
import { usePeopleStats } from "../usePeopleStats";

vi.mock("../../services/personService", () => ({
  personService: {
    getStats: vi.fn(),
  },
}));

const mockStats = {
  activeCount: 3,
  fteAvailable: 2.8,
  fteTarget: 12,
  bySeniority: [{ seniority: 3, label: "Avanzado", count: 1 }],
  sample: [{ id: "1", name: "María González" }],
  stackCoverage: { distinct: 0, atRisk: [] },
};

describe("usePeopleStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the stats on mount", async () => {
    vi.mocked(personService.getStats).mockResolvedValue(mockStats);
    const { result } = renderHook(() => usePeopleStats());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(personService.getStats).mockRejectedValue(
      new Error("network error")
    );
    const { result } = renderHook(() => usePeopleStats());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
    expect(result.current.stats).toBeNull();
  });
});
