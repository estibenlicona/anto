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
  activeInitiatives: [],
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
      activeInitiatives: [],
      assignmentStatus: { kind: "sin-demanda" },
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
    delete bare.activeInitiatives;
    const entity = squadAdapter.toEntity(bare as SquadDto);
    expect(entity).toMatchObject({
      memberCount: 0,
      members: [],
      allocatedFte: 0,
      bauFte: 0,
      transformationFte: 0,
      peopleAvailableFte: 0,
      activeInitiatives: [],
      assignmentStatus: { kind: "sin-demanda" },
    });
  });

  it("reads an active initiative without a talla as no initiative at all", () => {
    // Sólo se activa lo evaluado, así que no debería llegar; si llega, se
    // omite de la fila y de la demanda en vez de mostrar una etiqueta vacía.
    const entity = squadAdapter.toEntity({
      ...dto,
      activeInitiatives: [
        { id: "i1", name: "Sin evaluar", talla: "", fteMin: 1, fteMax: 2 },
      ],
    });
    expect(entity.activeInitiatives).toEqual([]);
    expect(entity.assignmentStatus).toEqual({ kind: "sin-demanda" });
  });

  const actives = (
    ranges: Array<[number, number]>
  ): SquadDto["activeInitiatives"] =>
    ranges.map(([fteMin, fteMax], i) => ({
      id: `i${i}`,
      name: `Iniciativa ${i}`,
      talla: "M",
      fteMin,
      fteMax,
    }));

  it("derives sub-asignada when coverage falls short of the demand minimum", () => {
    // Demanda 1.5–2.5 contra 1.0 asignado (escenario de la spec).
    const entity = squadAdapter.toEntity({
      ...dto,
      allocatedFte: 1.0,
      activeInitiatives: actives([
        [0.5, 1.0],
        [1.0, 1.5],
      ]),
    });
    expect(entity.assignmentStatus).toEqual({
      kind: "sub",
      demandMin: 1.5,
      demandMax: 2.5,
      deltaFte: 0.5,
    });
  });

  it("derives en-rango inside the demand range, extremes included", () => {
    const base = { ...dto, activeInitiatives: actives([[1.5, 2.5]]) };
    expect(
      squadAdapter.toEntity({ ...base, allocatedFte: 2.0 }).assignmentStatus
    ).toMatchObject({ kind: "en-rango", deltaFte: 0 });
    // Los extremos pertenecen al rango.
    expect(
      squadAdapter.toEntity({ ...base, allocatedFte: 1.5 }).assignmentStatus
    ).toMatchObject({ kind: "en-rango" });
    expect(
      squadAdapter.toEntity({ ...base, allocatedFte: 2.5 }).assignmentStatus
    ).toMatchObject({ kind: "en-rango" });
  });

  it("derives sobre-asignada above the demand maximum", () => {
    const entity = squadAdapter.toEntity({
      ...dto,
      allocatedFte: 3.0,
      activeInitiatives: actives([[1.5, 2.5]]),
    });
    expect(entity.assignmentStatus).toEqual({
      kind: "sobre",
      demandMin: 1.5,
      demandMax: 2.5,
      deltaFte: 0.5,
    });
  });

  it("derives sub-asignada against the minimum when the squad has no people", () => {
    const entity = squadAdapter.toEntity({
      ...dto,
      allocatedFte: 0,
      activeInitiatives: actives([[1.0, 1.5]]),
    });
    expect(entity.assignmentStatus).toEqual({
      kind: "sub",
      demandMin: 1.0,
      demandMax: 1.5,
      deltaFte: 1.0,
    });
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
