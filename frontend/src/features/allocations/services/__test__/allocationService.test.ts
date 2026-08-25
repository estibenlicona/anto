import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@shared/services/httpClient";
import { allocationService } from "./../allocationService";

vi.mock("@shared/services/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockAllocation = {
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
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

describe("allocationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listBySquad calls httpClient.get with the squad path and page/pageSize", async () => {
    const paged = {
      items: [mockAllocation],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    };
    vi.mocked(httpClient.get).mockResolvedValue({ data: paged });
    const result = await allocationService.listBySquad("s1", 1, 10);
    const [url, config] = vi.mocked(httpClient.get).mock.calls[0];
    expect(url).toBe("/squads/s1/allocations");
    expect((config!.params as URLSearchParams).toString()).toBe(
      "page=1&pageSize=10"
    );
    expect(result).toEqual(paged);
  });

  it("listBySquad serializes search and repeated seniority params", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    });
    await allocationService.listBySquad("s1", 2, 20, "dev", [3, 4]);
    const [, config] = vi.mocked(httpClient.get).mock.calls[0];
    expect((config!.params as URLSearchParams).toString()).toBe(
      "page=2&pageSize=20&search=dev&seniority=3&seniority=4"
    );
  });

  it("create calls httpClient.post with the squad path and returns the created allocation", async () => {
    const request = {
      personId: "p1",
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
    };
    vi.mocked(httpClient.post).mockResolvedValue({ data: mockAllocation });
    const result = await allocationService.create("s1", request);
    expect(httpClient.post).toHaveBeenCalledWith(
      "/squads/s1/allocations",
      request
    );
    expect(result).toEqual(mockAllocation);
  });

  it("update calls httpClient.put with the allocation id in the path", async () => {
    const request = {
      dedicationPercentage: 100,
      bauPercentage: 100,
      transformationPercentage: 0,
    };
    vi.mocked(httpClient.put).mockResolvedValue({ data: mockAllocation });
    const result = await allocationService.update("a1", request);
    expect(httpClient.put).toHaveBeenCalledWith("/allocations/a1", request);
    expect(result).toEqual(mockAllocation);
  });

  it("remove calls httpClient.delete with the allocation id in the path", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({ data: undefined });
    await allocationService.remove("a1");
    expect(httpClient.delete).toHaveBeenCalledWith("/allocations/a1");
  });

  it("throws when a request fails", async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error("network error"));
    await expect(allocationService.listBySquad("s1", 1, 10)).rejects.toThrow(
      "network error"
    );
  });
});
