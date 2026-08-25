import { describe, it, expect } from "vitest";
import { getPersonInitials, personAdapter } from "../PersonAdapter";
import type { PersonDto } from "../../services/personService";

const dto: PersonDto = {
  id: "1",
  name: "María González",
  documentId: "1036884001",
  entraObjectId: "some-entra-id",
  userPrincipalName: "maria.gonzalez@tuya.com",
  position: "Backend Dev",
  role: "Contributor" as const,
  technicalLeadId: null,
  technicalLeadName: null,
  technicalLeadOfCount: 0,
  seniority: 3,
  seniorityLabel: "Avanzado",
  modality: "Hybrid",
  availableFte: 1,
  utilization: 40,
  stacks: [],
  monthlyCost: 7900000,
  startDate: "2023-03-01",
  chapterId: null,
  providerId: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-02T00:00:00Z",
};

describe("personAdapter", () => {
  it("maps a DTO to the UI entity", () => {
    const entity = personAdapter.toEntity(dto);
    expect(entity).toEqual({
      id: "1",
      name: "María González",
      documentId: "1036884001",
      userPrincipalName: "maria.gonzalez@tuya.com",
      position: "Backend Dev",
      role: "Contributor" as const,
      technicalLeadId: null,
      technicalLeadName: null,
      technicalLeadOfCount: 0,
      seniority: 3,
      seniorityLabel: "Avanzado",
      modality: "Hybrid",
      availableFte: 1,
      utilization: 40,
      stacks: [],
      monthlyCost: 7900000,
      startDate: "2023-03-01",
      providerId: null,
      createdAtUtc: "2026-01-01T00:00:00Z",
      updatedAtUtc: "2026-01-02T00:00:00Z",
    });
  });

  it("derives isExternal false and an empty providerId when the DTO has no provider", () => {
    const entity = personAdapter.toEntity(dto);
    const values = personAdapter.toFormValues(entity);
    expect(values.isExternal).toBe(false);
    expect(values.providerId).toBe("");
  });

  it("derives isExternal true and the providerId when the DTO has a provider", () => {
    const entity = personAdapter.toEntity({ ...dto, providerId: "c1" });
    const values = personAdapter.toFormValues(entity);
    expect(values.isExternal).toBe(true);
    expect(values.providerId).toBe("c1");
  });

  it("maps an entity to form values with numeric fields as strings", () => {
    const entity = personAdapter.toEntity(dto);
    const values = personAdapter.toFormValues(entity);
    expect(values.seniority).toBe("3");
    expect(values.availableFte).toBe("1");
    expect(values.monthlyCost).toBe("7900000");
    expect(values.startDate).toBe("2023-03-01");
  });

  it("maps form values to a create request, trimming fields and sending an empty entraObjectId", () => {
    const request = personAdapter.toCreateRequest({
      name: "  Nueva Persona  ",
      documentId: "  123  ",
      userPrincipalName: "  nueva@tuya.com  ",
      position: "  QA  ",
      role: "Contributor" as const,
      technicalLeadId: "",
      seniority: "1",
      modality: "Remote",
      availableFte: "1",
      monthlyCost: "5000000",
      startDate: "2026-01-01",
      isExternal: false,
      providerId: "",
    });
    expect(request).toEqual({
      name: "Nueva Persona",
      documentId: "123",
      entraObjectId: "",
      userPrincipalName: "nueva@tuya.com",
      position: "QA",
      role: "Contributor" as const,
      technicalLeadId: null,
      seniority: 1,
      modality: "Remote",
      availableFte: 1,
      monthlyCost: 5000000,
      startDate: "2026-01-01",
    });
  });

  it("maps form values to an update request the same way as create", () => {
    const values = {
      name: "Persona",
      documentId: "123",
      userPrincipalName: "persona@tuya.com",
      position: "QA",
      role: "Contributor" as const,
      technicalLeadId: "",
      seniority: "3",
      modality: "OnSite" as const,
      availableFte: "0.5",
      monthlyCost: "6000000",
      startDate: "2026-01-01",
      isExternal: false,
      providerId: "",
    };
    expect(personAdapter.toUpdateRequest(values)).toEqual(
      personAdapter.toCreateRequest(values)
    );
  });
});

describe("getPersonInitials", () => {
  it("returns the first letter of the first and second token", () => {
    expect(getPersonInitials("María González")).toBe("MG");
  });

  it("returns a single letter for a one-token name", () => {
    expect(getPersonInitials("Madonna")).toBe("M");
  });

  it("takes the first two tokens of a compound name", () => {
    expect(getPersonInitials("Ana María Torres Gómez")).toBe("AM");
  });

  it("ignores extra or double spaces between tokens", () => {
    expect(getPersonInitials("  Carlos   López  ")).toBe("CL");
  });
});
