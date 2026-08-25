import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { capacityOverviewService } from "../../services/capacityOverviewService";
import { useCapacityOverview } from "../useCapacityOverview";

vi.mock("../../services/capacityOverviewService", () => ({
  capacityOverviewService: { getOverview: vi.fn() },
}));

const dto = {
  chapterFte: 1,
  bauFte: 0,
  transformationFte: 0,
  freeFte: 1,
  peopleTotal: 1,
  peopleUnassigned: 1,
  peoplePartial: 0,
  squadsAtCapacity: 0,
  squadsWithoutTeam: 0,
  people: [
    {
      id: "p",
      name: "P",
      position: "",
      seniorityLabel: "",
      availableFte: 1,
      allocation: null,
      marginPercentage: 100,
    },
  ],
  squads: [],
};

describe("useCapacityOverview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads and derives the ordered lists", async () => {
    vi.mocked(capacityOverviewService.getOverview).mockResolvedValue(dto);
    const { result } = renderHook(() => useCapacityOverview());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.overview?.peopleTotal).toBe(1);
    expect(result.current.peopleWithMargin).toHaveLength(1);
    expect(result.current.unassignedPeople).toHaveLength(1);
  });

  it("surfaces errors and refetches", async () => {
    vi.mocked(capacityOverviewService.getOverview).mockRejectedValue(
      new Error("boom")
    );
    const { result } = renderHook(() => useCapacityOverview());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
    vi.mocked(capacityOverviewService.getOverview).mockResolvedValue(dto);
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.overview).not.toBeNull());
  });
});
