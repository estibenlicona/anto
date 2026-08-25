import { describe, it, expect } from "vitest";
import {
  losesTechnicalLeadReferences,
  technicalLeadOptions,
} from "../personFormOptions";
import type { Person } from "../../adapters/PersonAdapter";
import type { PersonRole } from "../../services/personService";

const LIDERES = [
  { id: "p1", name: "Carlos López" },
  { id: "p2", name: "Tomás Giraldo" },
];

function persona(role: PersonRole, technicalLeadOfCount: number): Person {
  return {
    id: "p1",
    name: "Carlos López",
    documentId: "1",
    userPrincipalName: "carlos@tuya.com",
    position: "Arquitecto",
    role,
    technicalLeadId: null,
    technicalLeadName: null,
    technicalLeadOfCount,
    seniority: 4,
    seniorityLabel: "Experto",
    modality: "OnSite",
    availableFte: 1,
    utilization: 100,
    stacks: [],
    monthlyCost: 11500000,
    startDate: "2021-01-10",
    providerId: null,
    createdAtUtc: "2026-01-01T00:00:00Z",
    updatedAtUtc: null,
  };
}

describe("el selector de líder técnico", () => {
  it("ofrece a quienes tienen el rol", () => {
    expect(technicalLeadOptions(LIDERES)).toEqual(LIDERES);
  });

  it("no se ofrece a sí misma a la persona que se está editando", () => {
    // Ser el propio líder técnico no significa nada, y ofrecerlo invita a
    // guardarlo.
    expect(technicalLeadOptions(LIDERES, "p1")).toEqual([
      { id: "p2", name: "Tomás Giraldo" },
    ]);
  });

  it("queda vacío cuando nadie tiene el rol, y el formulario lo dice", () => {
    // El estado vacío es del formulario; lo que se comprueba acá es que la
    // lista efectivamente queda vacía y no que se rellene con cualquiera.
    expect(technicalLeadOptions([], "p1")).toEqual([]);
  });
});

describe("el aviso al quitarle el rol a un líder técnico", () => {
  it("avisa cuando la persona figura como líder técnico de alguien", () => {
    expect(
      losesTechnicalLeadReferences(persona("TechnicalLead", 4), "Contributor")
    ).toBe(true);
  });

  it("no avisa si no era líder técnico de nadie", () => {
    // Sin referencias no hay nada que perder: el aviso sería ruido.
    expect(
      losesTechnicalLeadReferences(persona("TechnicalLead", 0), "Contributor")
    ).toBe(false);
  });

  it("no avisa mientras sigue siendo Líder Técnico", () => {
    expect(
      losesTechnicalLeadReferences(persona("TechnicalLead", 4), "TechnicalLead")
    ).toBe(false);
  });

  it("no avisa en un alta, donde nadie la tiene como líder todavía", () => {
    expect(losesTechnicalLeadReferences(undefined, "Contributor")).toBe(false);
  });
});
