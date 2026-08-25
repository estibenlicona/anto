import { describe, it, expect } from "vitest";
import {
  CRITICALITY_LABELS,
  CRITICALITY_ORDER,
  squadAdapter,
} from "../SquadAdapter";
import type { SquadDto } from "../../services/squadService";

const dto: SquadDto = {
  id: "1",
  name: "Backend Platform",
  team: "Ecosistema Digital",
  criticality: "High",
  description: "Servicios core",
  memberCount: 4,
  members: [
    { id: "p1", name: "Ana" },
    { id: "p2", name: "Bruno" },
    { id: "p3", name: "Carla" },
  ],
  allocatedFte: 2.7,
  bauFte: 1.7,
  transformationFte: 1,
  peopleAvailableFte: 3.8,
  activeInitiative: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-02T00:00:00Z",
};

describe("squadAdapter", () => {
  it("maps a DTO to the UI entity, adding the Spanish criticality label", () => {
    const entity = squadAdapter.toEntity(dto);
    expect(entity).toEqual({
      id: "1",
      name: "Backend Platform",
      team: "Ecosistema Digital",
      criticality: "High",
      criticalityLabel: "Alta",
      description: "Servicios core",
      memberCount: 4,
      members: dto.members,
      allocatedFte: 2.7,
      bauFte: 1.7,
      transformationFte: 1,
      peopleAvailableFte: 3.8,
      activeInitiative: null,
      createdAtUtc: "2026-01-01T00:00:00Z",
      updatedAtUtc: "2026-01-02T00:00:00Z",
    });
  });

  it("maps a null description to an empty string", () => {
    const entity = squadAdapter.toEntity({ ...dto, description: null });
    expect(entity.description).toBe("");
  });

  it("normalizes missing calculated fields to zero / empty (real backend gap)", () => {
    const bare = { ...dto } as Partial<SquadDto>;
    delete bare.memberCount;
    delete bare.members;
    delete bare.allocatedFte;
    delete bare.bauFte;
    delete bare.transformationFte;
    delete bare.peopleAvailableFte;
    delete bare.activeInitiative;
    const entity = squadAdapter.toEntity(bare as SquadDto);
    expect(entity).toMatchObject({
      memberCount: 0,
      members: [],
      allocatedFte: 0,
      bauFte: 0,
      transformationFte: 0,
      peopleAvailableFte: 0,
      activeInitiative: null,
    });
  });

  it("reads an active initiative without a talla as no initiative at all", () => {
    // Sólo se activa lo evaluado, así que no debería llegar; si llega, la fila
    // dice "Sin iniciativa" en vez de mostrar una etiqueta vacía.
    const entity = squadAdapter.toEntity({
      ...dto,
      activeInitiative: { id: "i1", name: "Sin evaluar", talla: "" },
    });
    expect(entity.activeInitiative).toBeNull();
  });

  it("labels every criticality in the catalog, in scale order", () => {
    expect(CRITICALITY_ORDER).toEqual(["Critical", "High", "Medium", "Low"]);
    expect(CRITICALITY_ORDER.map((c) => CRITICALITY_LABELS[c])).toEqual([
      "Crítica",
      "Alta",
      "Media",
      "Baja",
    ]);
  });

  it("maps an entity to form values", () => {
    const entity = squadAdapter.toEntity(dto);
    expect(squadAdapter.toFormValues(entity)).toEqual({
      name: "Backend Platform",
      team: "Ecosistema Digital",
      criticality: "High",
      description: "Servicios core",
    });
  });

  it("maps form values to a create request, trimming and dropping an empty description", () => {
    const request = squadAdapter.toCreateRequest({
      name: "  Nueva Célula  ",
      team: "  Tribu  ",
      criticality: "Medium",
      description: "   ",
    });
    expect(request).toEqual({
      name: "Nueva Célula",
      team: "Tribu",
      criticality: "Medium",
      description: undefined,
    });
  });

  it("maps form values to an update request the same way as create", () => {
    const values = {
      name: "Célula",
      team: "Tribu",
      criticality: "Low" as const,
      description: "Detalle",
    };
    expect(squadAdapter.toUpdateRequest(values)).toEqual(
      squadAdapter.toCreateRequest(values)
    );
  });
});
