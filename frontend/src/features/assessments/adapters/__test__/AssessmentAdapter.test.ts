import { describe, it, expect } from "vitest";
import type {
  AssessmentDto,
  AssessmentSkillDto,
} from "@features/assessments/services/assessmentService";
import {
  firstToWorkOn,
  previewGap,
  toAssessmentView,
  toSkillView,
} from "../AssessmentAdapter";

function skill(
  overrides: Partial<AssessmentSkillDto> = {}
): AssessmentSkillDto {
  return {
    skillId: "s1",
    skillName: "Conocimiento del negocio",
    group: "technical",
    level: 2,
    note: "",
    levels: [
      {
        level: 1,
        criteria: [
          { text: "a", met: true },
          { text: "b", met: true },
        ],
      },
      {
        level: 2,
        criteria: [
          { text: "c", met: true },
          { text: "d", met: true },
        ],
      },
      {
        level: 3,
        criteria: [
          { text: "e", met: true },
          { text: "f", met: true },
          { text: "g", met: false },
          { text: "h", met: false },
          { text: "i", met: false },
          { text: "j", met: false },
        ],
      },
      { level: 4, criteria: [{ text: "k", met: false }] },
    ],
    expectedLevel: 3,
    gap: 1,
    missingCriteria: ["g", "h", "i", "j"],
    ...overrides,
  };
}

describe("AssessmentAdapter", () => {
  it("cuenta los criterios cumplidos de cada nivel sobre su propio total", () => {
    const view = toSkillView(skill());

    expect(view.levels.map((l) => l.total)).toEqual([2, 2, 6, 1]);
    expect(view.levels.map((l) => l.metCount)).toEqual([2, 2, 2, 0]);
    expect(view.levels[2].counterLabel).toBe("cumple 2 de 6");
    expect(view.levels[3].counterLabel).toBe("cumple 0 de 1");
  });

  it("dice sin criterios en vez de cumple 0 de 0", () => {
    const view = toSkillView(
      skill({
        levels: [
          { level: 1, criteria: [] },
          { level: 2, criteria: [{ text: "c", met: true }] },
          { level: 3, criteria: [] },
          { level: 4, criteria: [] },
        ],
      })
    );
    expect(view.levels[0].counterLabel).toBe("Sin criterios");
  });

  it("distingue brecha, al nivel, sin definir y sin evaluar", () => {
    expect(toSkillView(skill()).gapState).toBe("gap");
    expect(toSkillView(skill()).gapLabel).toBe("Le falta 1 nivel");
    expect(toSkillView(skill()).noteRequired).toBe(true);

    const dos = toSkillView(skill({ level: 1, gap: 2 }));
    expect(dos.gapLabel).toBe("Le faltan 2 niveles");

    const alNivel = toSkillView(
      skill({ level: 3, gap: 0, missingCriteria: [] })
    );
    expect(alNivel.gapState).toBe("met");
    expect(alNivel.gapLabel).toBe("Al nivel que pide su cargo");
    expect(alNivel.noteRequired).toBe(false);

    const sinDefinir = toSkillView(
      skill({ expectedLevel: null, gap: null, missingCriteria: [] })
    );
    expect(sinDefinir.gapState).toBe("undefined");
    expect(sinDefinir.expectedLabel).toBe("Sin definir");
    expect(sinDefinir.noteRequired).toBe(false);

    const sinEvaluar = toSkillView(
      skill({ level: null, gap: null, missingCriteria: [] })
    );
    expect(sinEvaluar.gapState).toBe("unevaluated");
    expect(sinEvaluar.levelLabel).toBeNull();
    expect(sinEvaluar.progress).toBe("pending");
  });

  it("arma la brecha contra el nivel que se está eligiendo, no contra el guardado", () => {
    // Guardada en Competente (2), su cargo pide Avanzado (3).
    const view = toSkillView(skill());
    expect(view.gap).toBe(1);

    // Se baja a Principiante sin guardar: la brecha crece en el momento.
    const bajando = previewGap(view, 1, [[], [], [], []]);
    expect(bajando.gap).toBe(2);
    expect(bajando.gapLabel).toBe("Le faltan 2 niveles");
    expect(bajando.missingCriteria).toEqual(["e", "f", "g", "h", "i", "j"]);
    expect(bajando.noteRequired).toBe(true);

    // Se sube al nivel exigido: desaparece, y con ella la nota obligatoria.
    const alcanzando = previewGap(view, 3, [[], [], [], []]);
    expect(alcanzando.gapState).toBe("met");
    expect(alcanzando.missingCriteria).toEqual([]);
    expect(alcanzando.noteRequired).toBe(false);
  });

  it("la brecha sólo lista lo que quedó sin marcar del nivel exigido", () => {
    const view = toSkillView(skill());
    const conDos = previewGap(view, 2, [[], [], ["e", "f"], []]);
    expect(conDos.missingCriteria).toEqual(["g", "h", "i", "j"]);
  });

  it("sin nivel exigido no hay brecha aunque se elija el más bajo", () => {
    const view = toSkillView(
      skill({ expectedLevel: null, gap: null, missingCriteria: [] })
    );
    const preview = previewGap(view, 1, [[], [], [], []]);
    expect(preview.gapState).toBe("undefined");
    expect(preview.noteRequired).toBe(false);
  });

  it("resume el avance y nombra las que faltan", () => {
    const dto: AssessmentDto = {
      id: "e1",
      personId: "p1",
      personName: "Paula Ramírez",
      position: "Data Engineer",
      cycle: "2026-S2",
      status: "InProgress",
      catalogVersion: 4,
      closedAtUtc: null,
      skills: [
        skill(),
        skill({
          skillId: "s2",
          skillName: "Arquitectura",
          level: null,
          gap: null,
        }),
        skill({
          skillId: "h1",
          skillName: "Comunicación",
          group: "human",
          level: 3,
          gap: 0,
          missingCriteria: [],
        }),
      ],
    };

    const view = toAssessmentView(dto);

    expect(view.evaluatedCount).toBe(2);
    expect(view.totalCount).toBe(3);
    expect(view.progressLabel).toBe("2 de 3 habilidades evaluadas");
    expect(view.complete).toBe(false);
    expect(view.pendingNames).toEqual(["Arquitectura"]);
    expect(view.gapCount).toBe(1);
    expect(view.readOnly).toBe(false);
    expect(view.groups.map((g) => g.group)).toEqual(["technical", "human"]);
    expect(view.groups[0].skills).toHaveLength(2);
    expect(view.groups[1].label).toBe("Humanas");
  });

  it("una cerrada es de sólo lectura y está completa", () => {
    const view = toAssessmentView({
      id: "e1",
      personId: "p1",
      personName: "Carlos López",
      position: "Arquitecto",
      cycle: "2026-S2",
      status: "Closed",
      catalogVersion: 3,
      closedAtUtc: "2026-08-01T10:00:00.000Z",
      skills: [skill({ level: 3, gap: 0, missingCriteria: [] })],
    });

    expect(view.readOnly).toBe(true);
    expect(view.statusLabel).toBe("Cerrada");
    expect(view.complete).toBe(true);
    expect(view.pendingNames).toEqual([]);
  });

  it("abre la primera sin evaluar, y si están todas, la primera", () => {
    const conPendiente = toAssessmentView({
      id: "e1",
      personId: "p1",
      personName: "Paula",
      position: "Data Engineer",
      cycle: "2026-S2",
      status: "InProgress",
      catalogVersion: 1,
      closedAtUtc: null,
      skills: [skill(), skill({ skillId: "s2", level: null })],
    });
    expect(firstToWorkOn(conPendiente)).toBe("s2");

    const completa = toAssessmentView({
      id: "e1",
      personId: "p1",
      personName: "Paula",
      position: "Data Engineer",
      cycle: "2026-S2",
      status: "Closed",
      catalogVersion: 1,
      closedAtUtc: null,
      skills: [skill(), skill({ skillId: "s2" })],
    });
    expect(firstToWorkOn(completa)).toBe("s1");
  });
});
