import { describe, expect, it } from "vitest";
import {
  formatDate,
  personDetailAdapter,
  tenureLabel,
} from "../PersonDetailAdapter";
import type { PersonDetailDto } from "../../services/personDetailService";
import type { PersonDto } from "../../services/personService";

const TODAY = new Date("2026-08-22T12:00:00");

const person: PersonDto = {
  id: "p1",
  name: "María González",
  documentId: "1",
  entraObjectId: "",
  userPrincipalName: "maria@tuya.com",
  position: "Backend Dev",
  role: "Contributor",
  technicalLeadId: null,
  technicalLeadName: null,
  technicalLeadOfCount: 0,
  level: 3,
  levelLabel: "Avanzado",

  seniority: "Intermediate",
  seniorityLabel: "Intermedio",
  modality: "Hybrid",
  availableFte: 1,
  utilization: 80,
  stacks: [],
  monthlyCost: 7_900_000,
  startDate: "2023-05-15",
  chapterId: null,
  providerId: null,
  createdAtUtc: "",
  updatedAtUtc: null,
};

const base: PersonDetailDto = {
  person,
  providerName: null,
  contractEndsAt: null,
  chapterName: "Core y Datos",
  chapterLeadName: "Lead del chapter",
  expertiseLineName: "Backend",
  expertiseLineLeadName: "Lead de la línea",
  allocation: {
    id: "a1",
    squadId: "s1",
    squadName: "Backend Platform",
    squadCriticality: "High",
    squadTribe: "Ecosistema Digital",
    squadDescription: "",
    teammates: ["Carlos López"],
    dedicationPercentage: 80,
    bauPercentage: 50,
    transformationPercentage: 30,
    since: "2024-03-12",
    requiredLevel: 3,
  },
  devOpsIdentity: null,
  stacks: [
    {
      name: ".NET",
      level: 3,
      isPrimary: true,
      otherCoverers: 6,
      coverers: [{ id: "p2", name: "Carlos López" }],
    },
    {
      name: "AS400",
      level: 2,
      isPrimary: false,
      otherCoverers: 0,
      coverers: [],
    },
  ],
  costReading: "InRange",
  suggestedSquads: [],
};

describe("personDetailAdapter.toEntity", () => {
  it("deriva SFIA, modalidad, antigüedad, FTE asignado y lectura del costo", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.level).toBe(3);
    expect(d.modalityLabel).toBe("Híbrido");
    expect(d.isExternal).toBe(false);
    expect(d.startDateLabel).toBe("15 may 2023");
    expect(d.tenureLabel).toBe("3 años y 3 meses");
    expect(d.assignedFte).toBe(0.8);
    expect(d.costReadingLabel).toBe("en rango para Avanzado");
    // Sin registro de horas no hay nada "real" que derivar.
    expect(d).not.toHaveProperty("realFte");
    expect(d).not.toHaveProperty("deltaPoints");
    expect(d).not.toHaveProperty("sprints");
    expect(d).not.toHaveProperty("overReportingStreak");
  });

  it("asignación: criticidad en español, libre y SFIA acorde", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.allocation).toMatchObject({
      criticalityLabel: "Alta",
      freePercentage: 20,
      freeFte: 0.2,
      sinceLabel: "12 mar 2024",
      levelGap: "Adequate",
    });
  });

  it("SFIA insuficiente cuando la célula pide más", () => {
    const d = personDetailAdapter.toEntity(
      { ...base, allocation: { ...base.allocation!, requiredLevel: 4 } },
      TODAY
    );
    expect(d.allocation?.levelGap).toBe("Insufficient");
  });

  it("bus factor 1 cuando nadie más cubre el stack", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.stacks.map((c) => c.busFactorOne)).toEqual([false, true]);
    expect(d.stacks.map((c) => c.levelLabel)).toEqual([
      "Avanzado",
      "Competente",
    ]);
  });

  it("sin célula: sin asignado, externa con proveedor", () => {
    const d = personDetailAdapter.toEntity(
      {
        ...base,
        person: {
          ...person,
          providerId: "c1",
          startDate: "2026-08-04",
          level: 4,
          levelLabel: "Experto",

          seniority: "Senior",
          seniorityLabel: "Senior",
        },
        providerName: "Globant",
        allocation: null,
        costReading: "High",
      },
      TODAY
    );
    expect(d.allocation).toBeNull();
    expect(d.assignedFte).toBe(0);
    expect(d.isExternal).toBe(true);
    expect(d.providerName).toBe("Globant");
    expect(d.tenureLabel).toBe("hace 18 días");
    expect(d.costReadingLabel).toBe("alto para Experto");
  });

  it("stack principal para el encabezado; sin identidad el puntero es unlinked", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.primaryStackName).toBe(".NET");
    expect(d.sprintPointer).toEqual({
      kind: "unlinked",
      balance: null,
      meta: null,
    });
    expect(
      personDetailAdapter.toEntity({ ...base, stacks: [] }, TODAY)
        .primaryStackName
    ).toBeNull();
  });

  it("con sprint el puntero resume la señal con su conteo, sin SP", () => {
    const d = personDetailAdapter.toEntity(
      {
        ...base,
        devOpsIdentity: {
          id: "i1",
          userName: "m@tuya",
          linkedAt: "2026-07-25",
          currentSprint: {
            sprint: {
              name: "S18",
              startDate: "2026-08-17",
              endDate: "2026-08-30",
              snapshotStatus: "Provisional",
              sealedAt: null,
            },
            committedPoints: 28,
            ownMedianPoints: 22,
            ownDeviationRate: 27.3,
            capacity: {
              contractualFte: 1,
              availableFte: 0.8,
              breakdown: {
                businessDays: 10,
                holidays: 1,
                vacationDays: 0,
                absenceDays: 1,
                otherUnavailableDays: 0,
              },
              availableHours: 64,
              deductedHours: 16,
            },
            signal: "PossibleOverload",
            notEvaluableReason: null,
            evidenceCount: 2,
          },
        },
      },
      TODAY
    );
    expect(d.sprintPointer.kind).toBe("sprint");
    expect(d.sprintPointer.balance?.signal).toBe("PossibleOverload");
    expect(d.sprintPointer.meta).toBe("2 de 6 señales · S18 · en curso");
    // Con identidad pero sin sprint, el puntero lo dice sin inventar señal.
    const noSprint = personDetailAdapter.toEntity(
      {
        ...base,
        devOpsIdentity: {
          id: "i1",
          userName: "m@tuya",
          linkedAt: "2026-07-25",
          currentSprint: null,
        },
      },
      TODAY
    );
    expect(noSprint.sprintPointer.kind).toBe("noSprint");
  });

  it("toOverviewPerson produce lo que el drawer de la Torre espera", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(personDetailAdapter.toOverviewPerson(d)).toMatchObject({
      id: "p1",
      allocation: { squadId: "s1", dedicationPercentage: 80 },
      marginPercentage: 20,
      marginFte: 0.2,
    });
  });
});

describe("helpers de fecha", () => {
  it("formatDate y tenureLabel", () => {
    expect(formatDate("2024-03-12")).toBe("12 mar 2024");
    expect(tenureLabel("2026-01-22", TODAY)).toBe("7 meses");
    expect(tenureLabel("2025-08-22", TODAY)).toBe("1 año");
    expect(tenureLabel("2026-08-21", TODAY)).toBe("hace 1 día");
  });
});
