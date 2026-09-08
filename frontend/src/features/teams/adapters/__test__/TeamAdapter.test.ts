import { describe, it, expect } from "vitest";
import { teamAdapter } from "../TeamAdapter";
import type { TeamDto } from "../../services/teamService";

const dto: TeamDto = {
  id: "t1",
  name: "Ecosistema Digital",
  description: "Canales digitales y banca en línea",
  squadCount: 2,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-02T00:00:00Z",
};

describe("teamAdapter", () => {
  it("maps a DTO to the UI entity", () => {
    expect(teamAdapter.toEntity(dto)).toEqual({
      id: "t1",
      name: "Ecosistema Digital",
      description: "Canales digitales y banca en línea",
      squadCount: 2,
      createdAtUtc: "2026-01-01T00:00:00Z",
      updatedAtUtc: "2026-01-02T00:00:00Z",
    });
  });

  it("maps a null description to an empty string", () => {
    const entity = teamAdapter.toEntity({ ...dto, description: null });
    expect(entity.description).toBe("");
  });

  it("maps an entity to form values", () => {
    const entity = teamAdapter.toEntity(dto);
    expect(teamAdapter.toFormValues(entity)).toEqual({
      name: "Ecosistema Digital",
      description: "Canales digitales y banca en línea",
    });
  });

  it("maps form values to a create request, trimming and dropping an empty description", () => {
    const request = teamAdapter.toCreateRequest({
      name: "  Nuevo Equipo  ",
      description: "   ",
    });
    expect(request).toEqual({
      name: "Nuevo Equipo",
      description: undefined,
    });
  });

  it("maps form values to an update request the same way as create", () => {
    const values = { name: "Equipo", description: "Detalle" };
    expect(teamAdapter.toUpdateRequest(values)).toEqual(
      teamAdapter.toCreateRequest(values)
    );
  });
});
