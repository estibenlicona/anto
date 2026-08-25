import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { allocationService } from "../../services/allocationService";
import { useAllocationMutations } from "../useAllocationMutations";

vi.mock("../../services/allocationService", () => ({
  allocationService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const formValues = {
  personId: "p1",
  dedicationPercentage: "80",
  bauPercentage: "50",
  transformationPercentage: "30",
};

const allocation = {
  id: "a1",
  personId: "p1",
  personName: "María González",
  squadId: "s1",
  squadName: "Backend Platform",
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

describe("useAllocationMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create succeeds", async () => {
    vi.mocked(allocationService.create).mockResolvedValue({
      ...allocation,
      id: "a2",
      initiativeId: null,
      initiativeName: null,
    });
    const { result } = renderHook(() => useAllocationMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create("s1", formValues);
    });

    expect(allocationService.create).toHaveBeenCalledWith("s1", {
      personId: "p1",
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
    });
    expect(outcome).toEqual({ success: true });
  });

  it("create surfaces an error", async () => {
    vi.mocked(allocationService.create).mockRejectedValue(new Error("400"));
    const { result } = renderHook(() => useAllocationMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create("s1", formValues);
    });

    expect(outcome).toEqual({ success: false, error: "400" });
  });

  it("update succeeds without sending personId or squadId", async () => {
    vi.mocked(allocationService.update).mockResolvedValue({
      ...allocation,
      initiativeId: null,
      initiativeName: null,
    });
    const { result } = renderHook(() => useAllocationMutations());

    await act(async () => {
      await result.current.update(allocation, formValues);
    });

    expect(allocationService.update).toHaveBeenCalledWith("a1", {
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
    });
  });

  it("remove succeeds", async () => {
    vi.mocked(allocationService.remove).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAllocationMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(allocation);
    });

    expect(allocationService.remove).toHaveBeenCalledWith("a1");
    expect(outcome).toEqual({ success: true });
  });

  it("remove surfaces an error", async () => {
    vi.mocked(allocationService.remove).mockRejectedValue(new Error("404"));
    const { result } = renderHook(() => useAllocationMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(allocation);
    });

    expect(outcome).toEqual({ success: false, error: "404" });
  });
});
