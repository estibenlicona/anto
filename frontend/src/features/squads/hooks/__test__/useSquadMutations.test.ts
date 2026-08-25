import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { squadService } from "../../services/squadService";
import { useSquadMutations } from "../useSquadMutations";

vi.mock("../../services/squadService", () => ({
  squadService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const formValues = {
  name: "Nueva",
  team: "Tribu",
  criticality: "Low" as const,
  description: "",
};

const squad = {
  id: "1",
  name: "Existente",
  team: "Tribu",
  criticality: "Medium" as const,
  criticalityLabel: "Media",
  description: "",
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

describe("useSquadMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create succeeds", async () => {
    vi.mocked(squadService.create).mockResolvedValue({
      ...squad,
      id: "2",
    });
    const { result } = renderHook(() => useSquadMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create(formValues);
    });

    expect(outcome).toEqual({ success: true });
    expect(result.current.creating).toBe(false);
  });

  it("create surfaces an error", async () => {
    vi.mocked(squadService.create).mockRejectedValue(new Error("400"));
    const { result } = renderHook(() => useSquadMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create(formValues);
    });

    expect(outcome).toEqual({ success: false, error: "400" });
  });

  it("update succeeds", async () => {
    vi.mocked(squadService.update).mockResolvedValue(squad);
    const { result } = renderHook(() => useSquadMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.update(squad, formValues);
    });

    expect(squadService.update).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ name: "Nueva" })
    );
    expect(outcome).toEqual({ success: true });
  });

  it("remove succeeds", async () => {
    vi.mocked(squadService.remove).mockResolvedValue(undefined);
    const { result } = renderHook(() => useSquadMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(squad);
    });

    expect(squadService.remove).toHaveBeenCalledWith("1");
    expect(outcome).toEqual({ success: true });
  });

  it("remove surfaces an error", async () => {
    vi.mocked(squadService.remove).mockRejectedValue(new Error("404"));
    const { result } = renderHook(() => useSquadMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(squad);
    });

    expect(outcome).toEqual({ success: false, error: "404" });
  });
});
