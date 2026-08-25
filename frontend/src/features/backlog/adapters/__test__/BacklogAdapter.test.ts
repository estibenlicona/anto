import { describe, expect, it } from "vitest";
import { backlogAdapter } from "../BacklogAdapter";
import type {
  BacklogCatalogsDto,
  BacklogStoryDto,
} from "../../services/backlogService";

const catalogs: BacklogCatalogsDto = {
  initiatives: [{ id: "ini-kafka", name: "Kafka Migration", squadId: "s1" }],
  bauCategories: ["Documentación técnica"],
  rejectReasons: [{ value: "Duplicate", label: "Duplicado" }],
};

const base: BacklogStoryDto = {
  id: "wi-1",
  number: 1,
  title: "T",
  description: "",
  type: "UserStory",
  points: 3,
  devOpsState: "Active",
  board: "B",
  sprint: "S16",
  epicTitle: "E",
  epicInitiativeId: "ini-kafka",
  assignedTo: "clopez@tuya",
  previousAssignedTo: "jpena@tuya",
  personId: "p",
  personName: "Carlos López",
  personPosition: "Arquitecto",
  squadId: "s1",
  squadName: "Backend",
  ingestedAt: "2026-08-22",
  status: "Pending",
  classification: null,
  rejectReason: null,
  rejectDetail: null,
  order: 0,
};

describe("backlogAdapter", () => {
  it("deriva iniciales, estado en español, cambio de asignado y sugerida", () => {
    const s = backlogAdapter.toStory(base, catalogs);
    expect(s.initials).toBe("CL");
    expect(s.devOpsStateLabel).toBe("Activa");
    expect(s.ingestedLabel).toBe("22 ago 2026");
    expect(s.changedAssignee).toBe(true);
    expect(s.suggestedInitiativeId).toBe("ini-kafka");
    expect(s.outcomeLabel).toBeNull();
  });

  it("etiqueta el resultado de clasificadas y rechazadas", () => {
    const ini = backlogAdapter.toStory(
      {
        ...base,
        status: "Classified",
        classification: {
          kind: "Initiative",
          initiativeId: "ini-kafka",
          bauCategory: null,
          classifiedAt: "2026-08-22",
        },
      },
      catalogs
    );
    expect(ini.outcomeLabel).toBe("Iniciativa · Kafka Migration");
    const bau = backlogAdapter.toStory(
      {
        ...base,
        status: "Classified",
        classification: {
          kind: "Bau",
          initiativeId: null,
          bauCategory: "Documentación técnica",
          classifiedAt: "2026-08-22",
        },
      },
      catalogs
    );
    expect(bau.outcomeLabel).toBe("BAU · Documentación técnica");
    const rej = backlogAdapter.toStory(
      { ...base, status: "Rejected", rejectReason: "Duplicate" },
      catalogs
    );
    expect(rej.outcomeLabel).toBe("Rechazada · Duplicado");
  });

  it("calcula el progreso del día", () => {
    const q = backlogAdapter.toQueue(
      {
        items: [],
        summary: {
          total: 20,
          pending: 11,
          classifiedToday: 3,
          pendingBySquad: [],
          excludedWithoutIdentity: 6,
        },
      },
      catalogs
    );
    expect(q.summary.progressPercentage).toBe(21);
    const empty = backlogAdapter.toQueue(
      {
        items: [],
        summary: {
          total: 0,
          pending: 0,
          classifiedToday: 0,
          pendingBySquad: [],
          excludedWithoutIdentity: 0,
        },
      },
      catalogs
    );
    expect(empty.summary.progressPercentage).toBe(100);
  });
});
