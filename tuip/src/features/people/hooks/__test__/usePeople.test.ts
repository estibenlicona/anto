import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { personService } from "../../services/personService";
import { usePeople } from "../usePeople";

vi.mock("../../services/personService", () => ({
  personService: {
    list: vi.fn(),
  },
}));

const mockDto = {
  id: "1",
  name: "María González",
  documentId: "1036884001",
  entraObjectId: "",
  userPrincipalName: "maria.gonzalez@tuya.com",
  position: "Backend Dev",
  role: "Contributor" as const,
  technicalLeadId: null,
  technicalLeadName: null,
  technicalLeadOfCount: 0,
  seniority: 3,
  seniorityLabel: "Avanzado",
  modality: "Hybrid" as const,
  availableFte: 1,
  utilization: 40,
  stacks: [],
  monthlyCost: 7900000,
  startDate: "2023-03-01",
  chapterId: null,
  providerId: null,
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

describe("usePeople", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the people on mount, defaulting to page 1 / pageSize 10", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => usePeople());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(personService.list).toHaveBeenCalledWith(1, 10, "", [], []);
    expect(result.current.people).toHaveLength(1);
    expect(result.current.people[0].name).toBe("María González");
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it("surfaces an error when the request fails", async () => {
    vi.mocked(personService.list).mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => usePeople());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
    expect(result.current.people).toEqual([]);
  });

  it("refetch reloads the list", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([]));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.people).toHaveLength(1));
  });

  it("onPageChange requests the new page", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });

    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(2, 10, "", [], [])
    );
  });

  it("onPageSizeChange resets to page 1 with the new page size", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(2, 10, "", [], [])
    );

    act(() => {
      result.current.onPageSizeChange(20);
    });

    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(1, 20, "", [], [])
    );
  });

  it("accepts an initialPageSize for consumers that need a larger page (e.g. dropdowns)", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    renderHook(() => usePeople(100));

    await waitFor(() =>
      expect(personService.list).toHaveBeenCalledWith(1, 100, "", [], [])
    );
  });

  it("onSearchChange resets to page 1 and debounces the request", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onPageChange(2);
    });
    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(2, 10, "", [], [])
    );

    act(() => {
      result.current.onSearchChange("maría");
    });

    expect(result.current.page).toBe(1);
    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(
        1,
        10,
        "maría",
        [],
        []
      )
    );
  });

  it("onSenioritiesChange filters and resets to page 1", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onSenioritiesChange([3]);
    });
    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(1, 10, "", [3], [])
    );
  });
  it("onStacksChange filters by stack and resets to page 1", async () => {
    vi.mocked(personService.list).mockResolvedValue(pagedOf([mockDto]));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.onStacksChange(["Azure", "AS400"]);
    });
    await waitFor(() =>
      expect(personService.list).toHaveBeenLastCalledWith(
        1,
        10,
        "",
        [],
        ["Azure", "AS400"]
      )
    );
    expect(result.current.stacks).toEqual(["Azure", "AS400"]);
  });
});
