import { describe, it, expect } from "vitest";
import type {
  SkillDto,
  SkillsCatalogDto,
} from "@features/skills/services/skillsService";
import {
  incompleteLabel,
  levelLabel,
  toCatalogView,
  toSkillView,
} from "../SkillsAdapter";

function skill(overrides: Partial<SkillDto> = {}): SkillDto {
  return {
    id: "s1",
    name: "Conocimiento del negocio",
    group: "technical",
    description: "Qué tanto entiende el negocio.",
    active: true,
    levels: [
      { level: 1, criteria: ["a", "b", "c", "d", "e"] },
      { level: 2, criteria: ["a", "b", "c", "d", "e"] },
      { level: 3, criteria: ["a", "b", "c", "d", "e", "f"] },
      { level: 4, criteria: ["a", "b", "c", "d"] },
    ],
    expectations: [
      { position: "Arquitecto", level: 4 },
      { position: "Data Analyst", level: null },
    ],
    ...overrides,
  };
}

describe("SkillsAdapter", () => {
  it("cuenta cada nivel por su cuenta y suma el total, sin asumir una cantidad", () => {
    const view = toSkillView(skill());

    expect(view.levels.map((l) => l.count)).toEqual([5, 5, 6, 4]);
    expect(view.totalCriteria).toBe(20);
    expect(view.incomplete).toBe(false);
  });

  it("marca la habilidad incompleta nombrando el nivel que le falta", () => {
    const view = toSkillView(
      skill({
        levels: [
          { level: 1, criteria: ["a"] },
          { level: 2, criteria: ["a"] },
          { level: 3, criteria: [] },
          { level: 4, criteria: ["a"] },
        ],
      })
    );

    expect(view.incomplete).toBe(true);
    expect(view.emptyLevels).toEqual([3]);
    expect(incompleteLabel(view)).toBe("Avanzado sin criterios");
  });

  it("resume varios niveles vacíos en vez de enumerarlos", () => {
    const view = toSkillView(
      skill({
        levels: [
          { level: 1, criteria: [] },
          { level: 2, criteria: [] },
          { level: 3, criteria: ["a"] },
          { level: 4, criteria: [] },
        ],
      })
    );

    expect(incompleteLabel(view)).toBe("3 niveles sin criterios");
    expect(incompleteLabel(toSkillView(skill()))).toBeNull();
  });

  it("distingue el rol sin definir del rol que exige el primer nivel", () => {
    const view = toSkillView(
      skill({
        expectations: [
          { position: "Arquitecto", level: 1 },
          { position: "Data Analyst", level: null },
        ],
      })
    );

    const [arquitecto, analista] = view.expectations;
    expect(arquitecto.label).toBe("Principiante");
    expect(arquitecto.defined).toBe(true);
    expect(analista.label).toBe("Sin definir");
    expect(analista.defined).toBe(false);
    expect(view.declaredExpectations).toBe(1);
  });

  it("agrupa en técnicas y humanas, con las técnicas primero", () => {
    const catalog: SkillsCatalogDto = {
      version: 3,
      positions: ["Arquitecto", "Data Analyst"],
      skills: [
        skill({ id: "h1", name: "Comunicación", group: "human" }),
        skill({ id: "t1" }),
        skill({
          id: "t2",
          name: "Arquitectura",
          levels: [
            { level: 1, criteria: ["a"] },
            { level: 2, criteria: ["a"] },
            { level: 3, criteria: [] },
            { level: 4, criteria: ["a"] },
          ],
        }),
      ],
    };

    const view = toCatalogView(catalog);

    expect(view.groups.map((g) => g.group)).toEqual(["technical", "human"]);
    expect(view.groups[0].label).toBe("Técnicas");
    expect(view.groups[0].skills.map((s) => s.id)).toEqual(["t1", "t2"]);
    expect(view.groups[1].skills.map((s) => s.id)).toEqual(["h1"]);
    expect(view.total).toBe(3);
    expect(view.incompleteCount).toBe(1);
    expect(view.version).toBe(3);
    expect(view.empty).toBe(false);
  });

  it("reconoce el catálogo vacío", () => {
    const view = toCatalogView({ version: 1, positions: [], skills: [] });
    expect(view.empty).toBe(true);
    expect(view.groups.every((g) => g.skills.length === 0)).toBe(true);
  });

  it("toma los nombres de nivel de la escala que la app ya usa", () => {
    expect([1, 2, 3, 4].map((l) => levelLabel(l as 1 | 2 | 3 | 4))).toEqual([
      "Principiante",
      "Competente",
      "Avanzado",
      "Experto",
    ]);
  });
});
