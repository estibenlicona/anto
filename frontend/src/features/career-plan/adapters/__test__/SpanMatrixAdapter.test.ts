import { describe, it, expect } from "vitest";
import type {
  SpanMatrixDto,
  SpanPersonDto,
} from "@features/career-plan/services/careerPlanService";
import type { SkillLevel } from "@features/skills/services/skillsService";
import { pendingLabel, toSpanView } from "../SpanMatrixAdapter";

const NEGOCIO = "s1";
const CALIDAD = "s2";
const COMUNICACION = "h1";

/** `[nivel, exigido]` por habilidad; `null` en el nivel = sin evaluar. */
function person(
  name: string,
  position: string,
  cells: Record<string, [SkillLevel | null, SkillLevel | null]>,
  evaluated = true
): SpanPersonDto {
  return {
    personId: name.toLowerCase().replace(/\s/g, "-"),
    personName: name,
    position,
    evaluated,
    cells: Object.entries(cells).map(([skillId, [level, expectedLevel]]) => ({
      skillId,
      level,
      expectedLevel,
      gap:
        level === null || expectedLevel === null
          ? null
          : Math.max(0, expectedLevel - level),
    })),
  };
}

function matrix(people: SpanPersonDto[]): SpanMatrixDto {
  return {
    skills: [
      {
        skillId: NEGOCIO,
        skillName: "Conocimiento del negocio",
        group: "technical",
      },
      { skillId: CALIDAD, skillName: "Calidad y pruebas", group: "technical" },
      { skillId: COMUNICACION, skillName: "Comunicación", group: "human" },
    ],
    people,
  };
}

describe("SpanMatrixAdapter", () => {
  it("marca el mismo nivel distinto según lo que pide el cargo de cada persona", () => {
    const view = toSpanView(
      matrix([
        // Las dos en Competente; una lo tiene como su nivel, la otra debe Avanzado.
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [2, 2],
          [CALIDAD]: [3, 3],
          [COMUNICACION]: [2, 2],
        }),
        person("Beto Salas", "Data Engineer", {
          [NEGOCIO]: [2, 3],
          [CALIDAD]: [3, 3],
          [COMUNICACION]: [2, 2],
        }),
      ]),
      { sort: "name" }
    );

    const [ana, beto] = view.people;
    const anaNegocio = ana.cells.find((c) => c.skillId === NEGOCIO)!;
    const betoNegocio = beto.cells.find((c) => c.skillId === NEGOCIO)!;

    expect(anaNegocio.level).toBe(betoNegocio.level);
    expect(anaNegocio.state).toBe("met");
    expect(anaNegocio.attention).toBeNull();
    expect(betoNegocio.state).toBe("gap");
    expect(betoNegocio.attention).toBe("low");
    expect(betoNegocio.description).toMatch(
      /Beto Salas, Conocimiento del negocio: .*le falta 1 nivel para Avanzado/
    );
  });

  it("no marca brecha cuando el cargo no declara nivel, y estar por encima no alerta", () => {
    const view = toSpanView(
      matrix([
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [3, null],
          [CALIDAD]: [4, 2],
          [COMUNICACION]: [2, 2],
        }),
      ])
    );

    const [ana] = view.people;
    const sinDeclarar = ana.cells.find((c) => c.skillId === NEGOCIO)!;
    const porEncima = ana.cells.find((c) => c.skillId === CALIDAD)!;

    expect(sinDeclarar.state).toBe("undefined");
    expect(sinDeclarar.attention).toBeNull();
    expect(sinDeclarar.exceeds).toBe(false);
    expect(sinDeclarar.levelLabel).toBe("Avanzado");

    // Superar lo exigido no es lo mismo que estar justo al nivel: comparten
    // estado porque ninguno pide atención, pero el hecho queda expuesto.
    expect(porEncima.state).toBe("met");
    expect(porEncima.exceeds).toBe(true);
    expect(porEncima.attention).toBeNull();
    expect(porEncima.description).toMatch(/por encima de Competente/);

    const justoAlNivel = ana.cells.find((c) => c.skillId === COMUNICACION)!;
    expect(justoAlNivel.state).toBe("met");
    expect(justoAlNivel.exceeds).toBe(false);

    expect(ana.gapCount).toBe(0);
    expect(view.totalGaps).toBe(0);
  });

  it("deja sin dato a quien no tiene evaluación y lo excluye de los totales", () => {
    const view = toSpanView(
      matrix([
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [1, 2],
          [CALIDAD]: [1, 2],
          [COMUNICACION]: [2, 2],
        }),
        person(
          "Carla Díaz",
          "Data Engineer",
          {
            [NEGOCIO]: [null, 3],
            [CALIDAD]: [null, 2],
            [COMUNICACION]: [null, 2],
          },
          false
        ),
      ])
    );

    const carla = view.people.find((p) => p.personName === "Carla Díaz")!;
    expect(carla.cells.every((c) => c.state === "unevaluated")).toBe(true);
    expect(carla.cells.every((c) => c.attention === null)).toBe(true);
    expect(carla.cells.every((c) => c.level === null)).toBe(true);
    expect(carla.gapCount).toBe(0);

    // Sus celdas no cuentan en ninguna columna ni en el total.
    expect(view.totalGaps).toBe(2);
    expect(view.skills.find((s) => s.skillId === NEGOCIO)!.gapCount).toBe(1);
    expect(view.evaluatedCount).toBe(1);
    expect(view.pendingCount).toBe(1);
    expect(view.pendingNames).toEqual(["Carla Díaz"]);
    expect(pendingLabel(view)).toBe(
      "1 persona sin evaluar, que no cuenta en los totales"
    );
  });

  it("recalcula los totales sobre las habilidades visibles y avisa que están acotadas", () => {
    const base = matrix([
      person("Ana Ruiz", "QA Engineer", {
        [NEGOCIO]: [1, 2],
        [CALIDAD]: [1, 2],
        [COMUNICACION]: [1, 2],
      }),
    ]);

    const todo = toSpanView(base);
    expect(todo.totalGaps).toBe(3);
    expect(todo.narrowed).toBe(false);
    expect(todo.totalSkills).toBe(3);

    const soloTecnicas = toSpanView(base, { groups: ["technical"] });
    // Qué columnas quedan, no en qué orden: eso lo decide el criterio de orden.
    expect(soloTecnicas.skills.map((s) => s.skillId).sort()).toEqual(
      [NEGOCIO, CALIDAD].sort()
    );
    expect(soloTecnicas.totalGaps).toBe(2);
    expect(soloTecnicas.people[0].gapCount).toBe(2);
    expect(soloTecnicas.narrowed).toBe(true);

    const unaSola = toSpanView(base, { skillIds: [COMUNICACION] });
    expect(unaSola.skills).toHaveLength(1);
    expect(unaSola.totalGaps).toBe(1);
  });

  it("ordena filas y columnas por brechas, con los pendientes al final", () => {
    const view = toSpanView(
      matrix([
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [2, 2],
          [CALIDAD]: [2, 2],
          [COMUNICACION]: [2, 2],
        }),
        person(
          "Carla Díaz",
          "Data Engineer",
          {
            [NEGOCIO]: [null, 3],
            [CALIDAD]: [null, 2],
            [COMUNICACION]: [null, 2],
          },
          false
        ),
        person("Beto Salas", "Arquitecto", {
          [NEGOCIO]: [1, 4],
          [CALIDAD]: [1, 3],
          [COMUNICACION]: [2, 2],
        }),
      ])
    );

    // Beto tiene 2 brechas, Ana 0, Carla sin evaluar.
    expect(view.people.map((p) => p.personName)).toEqual([
      "Beto Salas",
      "Ana Ruiz",
      "Carla Díaz",
    ]);
    // Negocio y Calidad tienen 1 cada una; Comunicación 0 queda última.
    expect(view.skills.map((s) => s.skillId)).toEqual([
      CALIDAD,
      NEGOCIO,
      COMUNICACION,
    ]);
    // Las celdas siguen el orden de las columnas.
    expect(view.people[0].cells.map((c) => c.skillId)).toEqual([
      CALIDAD,
      NEGOCIO,
      COMUNICACION,
    ]);
  });

  it("sube el paso de atención a medida que crece la brecha", () => {
    const view = toSpanView(
      matrix([
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [3, 4],
          [CALIDAD]: [2, 4],
          [COMUNICACION]: [1, 4],
        }),
      ])
    );

    const [ana] = view.people;
    const paso = (skillId: string) =>
      ana.cells.find((c) => c.skillId === skillId)!.attention;

    expect(paso(NEGOCIO)).toBe("low");
    expect(paso(CALIDAD)).toBe("medium");
    expect(paso(COMUNICACION)).toBe("high");
  });

  it("los tres estados sin brecha no comparten paso de atención", () => {
    const view = toSpanView(
      matrix([
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [2, 2],
          [CALIDAD]: [3, null],
          [COMUNICACION]: [null, 2],
        }),
      ])
    );

    const [ana] = view.people;
    const estados = ana.cells.map((c) => c.state);

    // Tres hechos distintos, ninguno con color de la escala: lo que no pide
    // atención va en la familia neutra.
    expect(new Set(estados).size).toBe(3);
    expect(ana.cells.every((c) => c.attention === null)).toBe(true);
  });

  it("cada celda lleva el mismo conteo por columna que el pie", () => {
    const view = toSpanView(
      matrix([
        person("Ana Ruiz", "QA Engineer", {
          [NEGOCIO]: [1, 3],
          [CALIDAD]: [3, 3],
          [COMUNICACION]: [2, 2],
        }),
        person("Beto Salas", "Data Engineer", {
          [NEGOCIO]: [2, 3],
          [CALIDAD]: [3, 3],
          [COMUNICACION]: [2, 2],
        }),
        person(
          "Carla Díaz",
          "Data Engineer",
          {
            [NEGOCIO]: [null, 3],
            [CALIDAD]: [null, 3],
            [COMUNICACION]: [null, 2],
          },
          false
        ),
      ])
    );

    for (const skill of view.skills) {
      for (const person of view.people) {
        const cell = person.cells.find((c) => c.skillId === skill.skillId)!;
        expect(cell.columnGapCount).toBe(skill.gapCount);
      }
    }

    // Las dos evaluadas están cortas en Negocio; la pendiente no cuenta.
    expect(view.skills.find((s) => s.skillId === NEGOCIO)!.gapCount).toBe(2);
  });

  it("reconoce el span sin ninguna evaluación cerrada", () => {
    const view = toSpanView(
      matrix([
        person(
          "Ana Ruiz",
          "QA Engineer",
          {
            [NEGOCIO]: [null, 2],
            [CALIDAD]: [null, 2],
            [COMUNICACION]: [null, 2],
          },
          false
        ),
      ])
    );

    expect(view.empty).toBe(true);
    expect(view.totalGaps).toBe(0);
    expect(pendingLabel(view)).toMatch(/1 persona sin evaluar/);
  });
});
