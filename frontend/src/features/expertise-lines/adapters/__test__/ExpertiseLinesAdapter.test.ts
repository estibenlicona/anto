import { describe, it, expect } from "vitest";
import type {
  ExpertiseLineDetailDto,
  ExpertiseLineDto,
  RosterPersonDto,
} from "../../services/expertiseLinesService";
import {
  toAssignCandidates,
  toLeadCandidates,
  toLineDetail,
  toLinesIndex,
  toUnassignedPeople,
} from "../ExpertiseLinesAdapter";

const line = (over: Partial<ExpertiseLineDto> = {}): ExpertiseLineDto => ({
  id: "l1",
  name: "Backend",
  code: "BE",
  description: null,
  status: "Active",
  lead: { id: "p1", name: "María González" },
  peopleCount: 3,
  availableFte: 2.8,
  ...over,
});

const detail = (
  over: Partial<ExpertiseLineDetailDto> = {}
): ExpertiseLineDetailDto => ({
  ...line(),
  people: [],
  capacity: {
    peopleCount: 0,
    availableFte: 0,
    allocatedFte: 0,
    freeFte: 0,
    unallocatedPercentage: 0,
  },
  ...over,
});

const person = (over: Partial<RosterPersonDto> = {}): RosterPersonDto => ({
  id: "p9",
  name: "Valentina Ospina",
  position: "UX Designer",
  seniority: 3,
  seniorityLabel: "Avanzado",
  availableFte: 1,
  line: null,
  ...over,
});

describe("ExpertiseLinesAdapter", () => {
  it("separa activas de archivadas y sólo marca incompleta a la activa sin lead", () => {
    const view = toLinesIndex([
      line({ id: "a", name: "Backend", lead: null }),
      line({ id: "b", name: "QA" }),
      line({
        id: "c",
        name: "AS-400",
        status: "Archived",
        lead: null,
        peopleCount: 0,
      }),
    ]);

    expect(view.active.map((l) => l.id)).toEqual(["a", "b"]);
    expect(view.archived.map((l) => l.id)).toEqual(["c"]);
    expect(view.active.find((l) => l.id === "a")!.incomplete).toBe(true);
    expect(view.active.find((l) => l.id === "b")!.incomplete).toBe(false);
    // Archivada sin lead: no tiene de qué responder, no se marca.
    expect(view.archived[0].incomplete).toBe(false);
  });

  it("busca por nombre y por código, sin perder el estado vacío", () => {
    const lines = [line({ id: "a", name: "Backend", code: "BE" })];

    expect(toLinesIndex(lines, "back").active).toHaveLength(1);
    expect(toLinesIndex(lines, "BE").active).toHaveLength(1);
    expect(toLinesIndex(lines, "datos").active).toHaveLength(0);
    // Buscar sin resultados no es lo mismo que no tener líneas.
    expect(toLinesIndex(lines, "datos").empty).toBe(false);
    expect(toLinesIndex([]).empty).toBe(true);
  });

  it("una línea sin gente no divide por cero y se puede archivar", () => {
    const view = toLineDetail(detail({ peopleCount: 0, availableFte: 0 }));

    expect(view.hasPeople).toBe(false);
    expect(view.canArchive).toBe(true);
    expect(view.capacity.availableFteLabel).toBe("0.0");
    expect(view.capacity.unallocatedPercentage).toBe(0);
    expect(view.capacity.overAllocated).toBe(false);
  });

  it("una línea con gente no se puede archivar", () => {
    const view = toLineDetail(
      detail({
        people: [
          {
            id: "p1",
            name: "María González",
            position: "Backend Dev",
            seniority: 3,
            seniorityLabel: "Avanzado",
            availableFte: 1,
            isLead: true,
            allocation: {
              squadId: "s1",
              squadName: "Canales Digitales",
              dedicationPercentage: 80,
            },
          },
        ],
      })
    );

    expect(view.canArchive).toBe(false);
    expect(view.people[0].isLead).toBe(true);
    expect(view.people[0].allocationLabel).toBe("80 % en Canales Digitales");
  });

  it("dice 'Sin célula' cuando la persona no está asignada", () => {
    const view = toLineDetail(
      detail({
        people: [
          {
            id: "p2",
            name: "Diego Salazar",
            position: "Backend Dev",
            seniority: 1,
            seniorityLabel: "Principiante",
            availableFte: 1,
            isLead: false,
            allocation: null,
          },
        ],
      })
    );

    expect(view.people[0].allocationLabel).toBe("Sin célula");
    expect(view.people[0].squadName).toBeNull();
  });

  it("señala el asignado por encima del disponible en vez de disimularlo", () => {
    const view = toLineDetail(
      detail({
        capacity: {
          peopleCount: 2,
          availableFte: 1.8,
          allocatedFte: 2,
          freeFte: 0,
          unallocatedPercentage: 0,
        },
      })
    );

    expect(view.capacity.overAllocated).toBe(true);
    expect(view.capacity.freeFteLabel).toBe("0.0");
  });

  it("distingue no tener a nadie sin línea de una lista vacía cualquiera", () => {
    expect(toUnassignedPeople([]).allAssigned).toBe(true);
    // Un padrón donde todos tienen línea tampoco deja a nadie sin asignar.
    expect(
      toUnassignedPeople([person({ line: { id: "l1", name: "Backend" } })])
    ).toMatchObject({ count: 0, allAssigned: true });
    expect(toUnassignedPeople([person()])).toMatchObject({
      count: 1,
      allAssigned: false,
    });
  });

  it("ofrece a todo el padrón menos quien ya está en la línea, diciendo de dónde sale", () => {
    const candidates = toAssignCandidates(
      [
        person({ id: "p1", name: "Valentina Ospina" }),
        person({
          id: "p2",
          name: "Laura Ruiz",
          line: { id: "l2", name: "QA" },
        }),
        person({
          id: "p3",
          name: "María González",
          line: { id: "l1", name: "Backend" },
        }),
      ],
      "l1"
    );

    // La que ya está en Backend no se ofrece; la de QA sí, con su línea.
    expect(candidates.map((c) => c.id)).toEqual(["p2", "p1"]);
    expect(candidates.find((c) => c.id === "p1")!.lineName).toBeNull();
    expect(candidates.find((c) => c.id === "p2")!.lineName).toBe("QA");
  });

  it("bloquea a quien ya lidera otra línea, diciendo cuál", () => {
    const candidates = toLeadCandidates(
      [
        { id: "p1", name: "María González", position: "Backend Dev" },
        { id: "p2", name: "Laura Ruiz", position: "QA Engineer" },
      ],
      [
        line({
          id: "l1",
          name: "Backend",
          lead: { id: "p1", name: "María González" },
        }),
        line({ id: "l2", name: "QA", lead: { id: "p2", name: "Laura Ruiz" } }),
      ],
      "l1"
    );

    // Su propia lead sigue elegible en su línea; la de otra queda bloqueada.
    expect(candidates.find((c) => c.id === "p1")).toMatchObject({
      disabled: false,
      note: null,
    });
    expect(candidates.find((c) => c.id === "p2")).toMatchObject({
      disabled: true,
      note: "Lidera QA",
    });
  });
});
