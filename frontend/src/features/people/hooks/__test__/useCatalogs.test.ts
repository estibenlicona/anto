import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { personService } from "../../services/personService";
import { useCatalogs } from "../useCatalogs";

vi.mock("../../services/personService", () => ({
  personService: {
    getSeniorities: vi.fn(),
    getModalities: vi.fn(),
    getCompanies: vi.fn(),
    getRoles: vi.fn(),
    getTechnicalLeads: vi.fn(),
  },
}));

const seniorities = [
  { value: 1, label: "Principiante" },
  { value: 2, label: "Competente" },
  { value: 3, label: "Avanzado" },
  { value: 4, label: "Experto" },
];

const companies = [{ id: "c1", name: "GFT" }];

const roles = [
  { value: "TechnicalLead" as const, label: "Líder Técnico" },
  { value: "Contributor" as const, label: "Colaborador" },
];

const technicalLeads = [{ id: "p1", name: "Carlos López" }];

describe("useCatalogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads every catalog the form needs on mount", async () => {
    vi.mocked(personService.getSeniorities).mockResolvedValue(seniorities);
    vi.mocked(personService.getModalities).mockResolvedValue([
      "Remote",
      "Hybrid",
      "OnSite",
    ]);
    vi.mocked(personService.getCompanies).mockResolvedValue(companies);
    vi.mocked(personService.getRoles).mockResolvedValue(roles);
    vi.mocked(personService.getTechnicalLeads).mockResolvedValue(
      technicalLeads
    );

    const { result } = renderHook(() => useCatalogs());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.seniorities).toEqual(seniorities);
    expect(result.current.modalities).toEqual(["Remote", "Hybrid", "OnSite"]);
    expect(result.current.companies).toEqual(companies);
    // El rol y el líder técnico llegan del servidor, no de una lista local:
    // es lo que evita que cada pantalla decida por su cuenta qué es un rol
    // válido o quién puede ser líder técnico.
    expect(result.current.roles).toEqual(roles);
    expect(result.current.technicalLeads).toEqual(technicalLeads);
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error when any catalog request fails", async () => {
    vi.mocked(personService.getSeniorities).mockResolvedValue([]);
    vi.mocked(personService.getModalities).mockResolvedValue([]);
    vi.mocked(personService.getRoles).mockResolvedValue([]);
    vi.mocked(personService.getTechnicalLeads).mockResolvedValue([]);
    vi.mocked(personService.getCompanies).mockRejectedValue(
      new Error("network error")
    );

    const { result } = renderHook(() => useCatalogs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network error");
  });
});
