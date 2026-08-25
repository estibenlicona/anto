import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { squadService } from "../../services/squadService";
import { useCriticalities } from "../useCriticalities";

vi.mock("../../services/squadService", () => ({
  squadService: {
    getCriticalities: vi.fn(),
  },
}));

describe("useCriticalities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the catalog on mount", async () => {
    vi.mocked(squadService.getCriticalities).mockResolvedValue([
      "Critical",
      "High",
      "Medium",
      "Low",
    ]);
    const { result } = renderHook(() => useCriticalities());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.criticalities).toEqual([
      "Critical",
      "High",
      "Medium",
      "Low",
    ]);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(squadService.getCriticalities).mockRejectedValue(
      new Error("network error")
    );
    const { result } = renderHook(() => useCriticalities());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
    expect(result.current.criticalities).toEqual([]);
  });
});
