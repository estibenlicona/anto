import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@shared/services/httpClient";
import { personService } from "./../personService";

vi.mock("@shared/services/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPerson = {
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
  monthlyCost: 7900000,
  startDate: "2023-03-01",
  chapterId: null,
  providerId: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

describe("personService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list calls httpClient.get with page/pageSize and returns the paged result", async () => {
    const paged = {
      items: [mockPerson],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    };
    vi.mocked(httpClient.get).mockResolvedValue({ data: paged });
    const result = await personService.list(1, 10);
    const call = vi.mocked(httpClient.get).mock.calls[0];
    expect(call[0]).toBe("/people");
    expect((call[1]?.params as URLSearchParams).toString()).toBe(
      "page=1&pageSize=10"
    );
    expect(result).toEqual(paged);
  });

  it("list serializes search and repeated seniority without brackets", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    });
    await personService.list(1, 10, "maría", [3, 4]);
    const call = vi.mocked(httpClient.get).mock.calls[0];
    expect((call[1]?.params as URLSearchParams).toString()).toBe(
      "page=1&pageSize=10&search=mar%C3%ADa&seniority=3&seniority=4"
    );
  });

  it("list omits search/seniority params when not provided", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
    });
    await personService.list(1, 10, "", []);
    const call = vi.mocked(httpClient.get).mock.calls[0];
    expect((call[1]?.params as URLSearchParams).toString()).toBe(
      "page=1&pageSize=10"
    );
  });

  it("create calls httpClient.post with the request and returns the created person", async () => {
    const request = {
      name: "Nueva",
      documentId: "123",
      entraObjectId: "",
      userPrincipalName: "nueva@tuya.com",
      position: "QA",
      role: "Contributor" as const,
      technicalLeadId: null,
      technicalLeadName: null,
      technicalLeadOfCount: 0,
      seniority: 1,
      modality: "Remote" as const,
      availableFte: 1,
      monthlyCost: 5000000,
      startDate: "2026-01-01",
    };
    vi.mocked(httpClient.post).mockResolvedValue({ data: mockPerson });
    const result = await personService.create(request);
    expect(httpClient.post).toHaveBeenCalledWith("/people", request);
    expect(result).toEqual(mockPerson);
  });

  it("update calls httpClient.put with the id in the path", async () => {
    const request = {
      name: "Editada",
      documentId: "123",
      entraObjectId: "",
      userPrincipalName: "editada@tuya.com",
      position: "QA",
      role: "Contributor" as const,
      technicalLeadId: null,
      technicalLeadName: null,
      technicalLeadOfCount: 0,
      seniority: 2,
      modality: "OnSite" as const,
      availableFte: 0.5,
      monthlyCost: 6000000,
      startDate: "2026-01-01",
    };
    vi.mocked(httpClient.put).mockResolvedValue({ data: mockPerson });
    const result = await personService.update("1", request);
    expect(httpClient.put).toHaveBeenCalledWith("/people/1", request);
    expect(result).toEqual(mockPerson);
  });

  it("remove calls httpClient.delete with the id in the path", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({ data: undefined });
    await personService.remove("1");
    expect(httpClient.delete).toHaveBeenCalledWith("/people/1");
  });

  it("assignProvider calls httpClient.put with the person and provider ids in the path", async () => {
    vi.mocked(httpClient.put).mockResolvedValue({ data: undefined });
    await personService.assignProvider("1", "c1");
    expect(httpClient.put).toHaveBeenCalledWith("/people/1/provider/c1");
  });

  it("getSeniorities calls httpClient.get and returns the catalog", async () => {
    const levels = [
      { value: 1, label: "Principiante" },
      { value: 2, label: "Competente" },
      { value: 3, label: "Avanzado" },
      { value: 4, label: "Experto" },
    ];
    vi.mocked(httpClient.get).mockResolvedValue({ data: levels });
    const result = await personService.getSeniorities();
    expect(httpClient.get).toHaveBeenCalledWith("/catalogs/seniorities");
    expect(result).toEqual(levels);
  });

  it("getModalities calls httpClient.get and returns the catalog", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: ["Remote", "Hybrid", "OnSite"],
    });
    const result = await personService.getModalities();
    expect(httpClient.get).toHaveBeenCalledWith("/catalogs/modalities");
    expect(result).toEqual(["Remote", "Hybrid", "OnSite"]);
  });

  it("getCompanies calls httpClient.get and returns the catalog", async () => {
    const companies = [{ id: "c1", name: "GFT" }];
    vi.mocked(httpClient.get).mockResolvedValue({ data: companies });
    const result = await personService.getCompanies();
    expect(httpClient.get).toHaveBeenCalledWith("/companies");
    expect(result).toEqual(companies);
  });

  it("throws when a request fails", async () => {
    vi.mocked(httpClient.get).mockRejectedValue(new Error("network error"));
    await expect(personService.list(1, 10)).rejects.toThrow("network error");
  });
});
