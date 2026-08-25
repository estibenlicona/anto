import { describe, it, expect } from "vitest";
import { allocationAdapter } from "../AllocationAdapter";
import type { AllocationDto } from "../../services/allocationService";

const dto: AllocationDto = {
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
  personPosition: "Backend Dev",
  personModality: "Hybrid" as const,
  personSeniority: 3,
  personSeniorityLabel: "Avanzado",
  personAvailablePercentage: 20,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-02T00:00:00Z",
};

describe("allocationAdapter", () => {
  it("maps a DTO to the UI entity", () => {
    const entity = allocationAdapter.toEntity(dto);
    expect(entity).toEqual({
      id: "a1",
      personId: "p1",
      personName: "María González",
      squadId: "s1",
      squadName: "Backend Platform",
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
      personPosition: "Backend Dev",
      personModality: "Hybrid",
      personSeniority: 3,
      personSeniorityLabel: "Avanzado",
      personAvailablePercentage: 20,
      createdAtUtc: "2026-01-01T00:00:00Z",
      updatedAtUtc: "2026-01-02T00:00:00Z",
    });
  });

  it("normalizes missing person fields (real backend gap)", () => {
    const bare = { ...dto } as Partial<AllocationDto>;
    delete bare.personPosition;
    delete bare.personModality;
    delete bare.personSeniority;
    delete bare.personSeniorityLabel;
    delete bare.personAvailablePercentage;
    expect(allocationAdapter.toEntity(bare as AllocationDto)).toMatchObject({
      personPosition: "",
      personModality: "Hybrid",
      personSeniority: 0,
      personSeniorityLabel: "",
      personAvailablePercentage: 0,
    });
  });

  it("maps an entity to form values with numeric fields as strings", () => {
    const entity = allocationAdapter.toEntity(dto);
    const values = allocationAdapter.toFormValues(entity);
    expect(values).toEqual({
      personId: "p1",
      dedicationPercentage: "80",
      bauPercentage: "50",
      transformationPercentage: "30",
    });
  });

  it("maps form values to a create request with numbers", () => {
    const request = allocationAdapter.toCreateRequest({
      personId: "p1",
      dedicationPercentage: "80",
      bauPercentage: "50",
      transformationPercentage: "30",
    });
    expect(request).toEqual({
      personId: "p1",
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
    });
  });

  it("maps form values to an update request without personId", () => {
    const request = allocationAdapter.toUpdateRequest({
      personId: "p1",
      dedicationPercentage: "80",
      bauPercentage: "50",
      transformationPercentage: "30",
    });
    expect(request).toEqual({
      dedicationPercentage: 80,
      bauPercentage: 50,
      transformationPercentage: 30,
    });
  });
});
