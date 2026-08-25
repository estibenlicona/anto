import { describe, expect, it } from "vitest";
import {
  formatDate,
  personDetailAdapter,
  tenureLabel,
} from "../PersonDetailAdapter";
import type {
  PersonDetailDto,
  SprintHoursDto,
} from "../../services/personDetailService";
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
  seniority: 3,
  seniorityLabel: "Avanzado",
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

const sprint = (
  s: string,
  bau: number,
  ini: number,
  status: SprintHoursDto["status"] = "Validated"
): SprintHoursDto => ({
  sprint: s,
  sprintHours: 80,
  bauHours: bau,
  initiativeHours: ini,
  freeHours: 80 - bau - ini,
  status,
});

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
    requiredSfia: 3,
  },
  realFte: 0.9,
  currentReport: {
    ...sprint("S16", 42, 32, "Submitted"),
    toleranceMin: 76,
    toleranceMax: 84,
    submittedAt: "2026-08-08",
    closesAt: "2026-08-22",
  },
  sprints: [
    sprint("S13", 30, 30),
    sprint("S14", 40, 30),
    sprint("S15", 40, 32),
    sprint("S16", 42, 32, "Submitted"),
  ],
  devOpsIdentity: null,
  devOpsCandidates: [],
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
  it("deriva SFIA, modalidad, antigüedad, FTE asignado / real / delta y tolerancia", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.sfiaLevel).toBe(3);
    expect(d.modalityLabel).toBe("Híbrido");
    expect(d.isExternal).toBe(false);
    expect(d.startDateLabel).toBe("15 may 2023");
    expect(d.tenureLabel).toBe("3 años y 3 meses");
    expect(d.assignedFte).toBe(0.8);
    expect(d.deltaPoints).toBe(10);
    expect(d.hoursWithinTolerance).toBe(true);
    expect(d.costReadingLabel).toBe("en rango para Avanzado");
  });

  it("asignación: criticidad en español, libre, SFIA acorde; racha de exceso sólo sobre validados", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.allocation).toMatchObject({
      criticalityLabel: "Alta",
      freePercentage: 20,
      freeFte: 0.2,
      sinceLabel: "12 mar 2024",
      sfiaGap: "Adequate",
    });
    expect(d.expectedHours).toBe(64);
    // S15 (72) y S14 (70) superan 64; S13 (60) corta; S16 no está validado.
    expect(d.overReportingStreak).toBe(2);
  });

  it("SFIA insuficiente cuando la célula pide más", () => {
    const d = personDetailAdapter.toEntity(
      { ...base, allocation: { ...base.allocation!, requiredSfia: 4 } },
      TODAY
    );
    expect(d.allocation?.sfiaGap).toBe("Insufficient");
  });

  it("bus factor 1 cuando nadie más cubre el stack", () => {
    const d = personDetailAdapter.toEntity(base, TODAY);
    expect(d.stacks.map((c) => c.busFactorOne)).toEqual([false, true]);
    expect(d.stacks.map((c) => c.levelLabel)).toEqual([
      "Avanzado",
      "Competente",
    ]);
  });

  it("sin célula ni sprints: sin real, sin delta, sin tolerancia, externa con proveedor", () => {
    const d = personDetailAdapter.toEntity(
      {
        ...base,
        person: {
          ...person,
          providerId: "c1",
          startDate: "2026-08-04",
          seniority: 4,
          seniorityLabel: "Experto",
        },
        providerName: "Globant",
        allocation: null,
        realFte: null,
        currentReport: null,
        sprints: [],
        costReading: "High",
      },
      TODAY
    );
    expect(d.allocation).toBeNull();
    expect(d.assignedFte).toBe(0);
    expect(d.realFte).toBeNull();
    expect(d.deltaPoints).toBeNull();
    expect(d.hoursWithinTolerance).toBeNull();
    expect(d.overReportingStreak).toBe(0);
    expect(d.isExternal).toBe(true);
    expect(d.providerName).toBe("Globant");
    expect(d.tenureLabel).toBe("hace 18 días");
    expect(d.costReadingLabel).toBe("alto para Experto");
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
