import { describe, it, expect } from "vitest";
import type {
  PersonPlanDto,
  PlanSkillDto,
} from "@features/career-plan/services/careerPlanService";
import { toPersonPlanView, toPlanSkillView } from "../PersonPlanAdapter";

function skill(overrides: Partial<PlanSkillDto> = {}): PlanSkillDto {
  return {
    skillId: "s1",
    skillName: "Conocimiento del negocio",
    group: "technical",
    level: 2,
    expectedLevel: 3,
    gap: 1,
    metCriteria: ["a", "b", "c", "d", "e"],
    levelTotal: 5,
    missingCriteria: ["g", "h", "i", "j"],
    expectedTotal: 6,
    note: "Le falta el dominio de riesgo.",
    ...overrides,
  };
}

function plan(overrides: Partial<PersonPlanDto> = {}): PersonPlanDto {
  return {
    personId: "p1",
    personName: "Paula Ramírez",
    position: "Data Engineer",
    assessmentClosedAtUtc: "2026-08-12T14:00:00.000Z",
    cycle: "2026-S2",
    skills: [skill()],
    actions: [],
    ...overrides,
  };
}

describe("PersonPlanAdapter", () => {
  it("arma los dos bloques de criterios con su contador sobre el total del nivel", () => {
    const view = toPlanSkillView(skill());

    expect(view.metGroup.title).toBe("En el nivel que tiene · Competente");
    expect(view.metGroup.counterLabel).toBe("5 de 5");
    expect(view.missingGroup!.title).toBe(
      "Para el que pide su cargo · Avanzado"
    );
    // De los 6 del nivel exigido cumple 2, porque le faltan 4.
    expect(view.missingGroup!.counterLabel).toBe("2 de 6");
    expect(view.missingGroup!.criteria).toEqual(["g", "h", "i", "j"]);
  });

  it("sin brecha no arma el bloque de faltantes", () => {
    const view = toPlanSkillView(
      skill({ level: 3, gap: 0, missingCriteria: [], expectedTotal: 6 })
    );

    expect(view.state).toBe("met");
    expect(view.stateLabel).toBe("Al nivel");
    expect(view.missingGroup).toBeNull();
    expect(view.metGroup.title).toBe("En el nivel que tiene · Avanzado");
  });

  it("sin nivel declarado no hay estado de brecha ni marca", () => {
    const view = toPlanSkillView(
      skill({ expectedLevel: null, gap: null, missingCriteria: [] })
    );

    expect(view.state).toBe("undefined");
    expect(view.stateLabel).toBe("Su cargo no declara nivel");
    expect(view.expectedLabel).toBeNull();
    expect(view.missingGroup).toBeNull();
  });

  it("nombra la brecha en singular y en plural", () => {
    expect(toPlanSkillView(skill({ gap: 1 })).stateLabel).toBe("−1 nivel");
    expect(
      toPlanSkillView(skill({ level: 1, expectedLevel: 3, gap: 2 })).stateLabel
    ).toBe("−2 niveles");
  });

  it("resume las brechas abiertas y cuáles quedaron sin acción", () => {
    const view = toPersonPlanView(
      plan({
        skills: [
          skill(),
          skill({ skillId: "s2", skillName: "Arquitectura", level: 1, gap: 1 }),
          skill({
            skillId: "h1",
            skillName: "Comunicación",
            group: "human",
            level: 3,
            gap: 0,
            missingCriteria: [],
          }),
        ],
        actions: [
          {
            id: "a1",
            personId: "p1",
            skillId: "s1",
            skillName: "Conocimiento del negocio",
            fromLevel: 2,
            targetLevel: 3,
            dueMonth: "2026-12",
            title: "Acompañar el rediseño",
            status: "InProgress",
          },
        ],
      })
    );

    expect(view.openGapCount).toBe(2);
    // Arquitectura tiene brecha y ninguna acción; Comunicación no tiene brecha.
    expect(view.gapsWithoutAction.map((s) => s.skillName)).toEqual([
      "Arquitectura",
    ]);
    expect(view.groups.map((g) => g.group)).toEqual(["technical", "human"]);
    expect(view.groups[0].skills).toHaveLength(2);
  });

  it("hace legibles el objetivo, el compromiso y el estado de una acción", () => {
    const view = toPersonPlanView(
      plan({
        actions: [
          {
            id: "a1",
            personId: "p1",
            skillId: "s1",
            skillName: "Conocimiento del negocio",
            fromLevel: 2,
            targetLevel: 3,
            dueMonth: "2026-12",
            title: "Acompañar el rediseño",
            status: "Done",
          },
        ],
      })
    );

    const [accion] = view.actions;
    expect(accion.objectiveLabel).toBe("Competente → Avanzado");
    expect(accion.dueLabel).toBe("dic 2026");
    expect(accion.statusLabel).toBe("Cumplida");
    expect(accion.done).toBe(true);
  });

  it("fecha de evaluación legible, y sin evaluación cerrada no hay perfil", () => {
    expect(toPersonPlanView(plan()).assessedOnLabel).toBe(
      "12 de agosto de 2026"
    );

    const sinEvaluar = toPersonPlanView(
      plan({ skills: [], assessmentClosedAtUtc: null, cycle: null })
    );
    expect(sinEvaluar.assessed).toBe(false);
    expect(sinEvaluar.assessedOnLabel).toBeNull();
    expect(sinEvaluar.openGapCount).toBe(0);
  });
});
