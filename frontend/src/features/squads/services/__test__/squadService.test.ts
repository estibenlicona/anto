import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@shared/services/httpClient";
import { squadService } from "./../squadService";

vi.mock("@shared/services/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSquad = {
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High" as const,
  description: "Servicios core",
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

describe("squadService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list calls httpClient.get with page/pageSize and returns the paged result", async () => {
    const paged = {
      items: [mockSquad],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    };
    vi.mocked(httpClient.get).mockResolvedValue({ data: paged });
    const result = await squadService.list(1, 10);
    const [url, config] = vi.mocked(httpClient.get).mock.calls[0];
    expect(url).toBe("/squads");
    expect((config!.params as URLSearchParams).toString()).toBe(
      "page=1&pageSize=10"
    );
    expect(result).toEqual(paged);
  });

  it("list serializes search and repeated criticality params", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    });
    await squadService.list(2, 20, "pagos", ["Critical", "High"]);
    const [, config] = vi.mocked(httpClient.get).mock.calls[0];
    expect((config!.params as URLSearchParams).toString()).toBe(
      "page=2&pageSize=20&search=pagos&criticality=Critical&criticality=High"
    );
  });

  it("getById and getTeamStats call their per-squad endpoints", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: mockSquad });
    expect(await squadService.getById("1")).toEqual(mockSquad);
    expect(httpClient.get).toHaveBeenLastCalledWith("/squads/1");

    const stats = { memberCount: 4 };
    vi.mocked(httpClient.get).mockResolvedValue({ data: stats });
    expect(await squadService.getTeamStats("1")).toEqual(stats);
    expect(httpClient.get).toHaveBeenLastCalledWith("/squads/1/team-stats");
  });

  it("getStats calls the stats endpoint and returns its payload", async () => {
    const stats = { totalCount: 2, withoutPeopleCount: 1 };
    vi.mocked(httpClient.get).mockResolvedValue({ data: stats });
    const result = await squadService.getStats();
    expect(httpClient.get).toHaveBeenCalledWith("/squads/stats");
    expect(result).toEqual(stats);
  });

  it("create calls httpClient.post with the request and returns the created squad", async () => {
    const request = {
      name: "Nueva",
      team: "Tribu",
      criticality: "Low" as const,
    };
    vi.mocked(httpClient.post).mockResolvedValue({ data: mockSquad });
    const result = await squadService.create(request);
    expect(httpClient.post).toHaveBeenCalledWith("/squads", request);
    expect(result).toEqual(mockSquad);
  });

  it("update calls httpClient.put with the id in the path", async () => {
    const request = {
      name: "Editada",
      team: "Tribu",
      criticality: "Medium" as const,
    };
    vi.mocked(httpClient.put).mockResolvedValue({ data: mockSquad });
    const result = await squadService.update("1", request);
    expect(httpClient.put).toHaveBeenCalledWith("/squads/1", request);
    expect(result).toEqual(mockSquad);
  });

  it("remove calls httpClient.delete with the id in the path", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({ data: undefined });
    await squadService.remove("1");
    expect(httpClient.delete).toHaveBeenCalledWith("/squads/1");
  });

  it("getCriticalities calls httpClient.get and returns the catalog", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: ["Critical", "High", "Medium", "Low"],
    });
    const result = await squadService.getCriticalities();
    expect(httpClient.get).toHaveBeenCalledWith("/criticalities");
    expect(result).toEqual(["Critical", "High", "Medium", "Low"]);
  });

  it("throws when a request fails", async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error("network error"));
    await expect(squadService.list(1, 10)).rejects.toThrow("network error");
  });
});
