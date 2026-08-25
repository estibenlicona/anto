import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { squadService } from "../../services/squadService";
import { useSquad } from "../useSquad";

vi.mock("../../services/squadService", () => ({
  squadService: {
    getById: vi.fn(),
  },
}));

const dto = {
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High" as const,
  description: "Servicios core",
  memberCount: 2,
  members: [],
  allocatedFte: 1.8,
  bauFte: 1.1,
  transformationFte: 0.7,
  peopleAvailableFte: 2,
  activeInitiative: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

describe("useSquad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the squad by id", async () => {
    vi.mocked(squadService.getById).mockResolvedValue(dto);
    const { result } = renderHook(() => useSquad("1"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(squadService.getById).toHaveBeenCalledWith("1");
    expect(result.current.squad?.criticalityLabel).toBe("Alta");
    expect(result.current.notFound).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("flags notFound on a 404 without surfacing an error", async () => {
    vi.mocked(squadService.getById).mockRejectedValue({
      response: { status: 404 },
    });
    const { result } = renderHook(() => useSquad("nope"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.squad).toBeNull();
  });

  it("surfaces other failures as error", async () => {
    vi.mocked(squadService.getById).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useSquad("1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
    expect(result.current.notFound).toBe(false);
  });

  it("refetch reloads the squad", async () => {
    vi.mocked(squadService.getById).mockResolvedValue(dto);
    const { result } = renderHook(() => useSquad("1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(squadService.getById).mockResolvedValue({
      ...dto,
      name: "Nuevo",
    });
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.squad?.name).toBe("Nuevo"));
  });
});
