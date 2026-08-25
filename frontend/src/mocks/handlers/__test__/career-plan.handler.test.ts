import { describe, it, expect, beforeEach } from "vitest";
import { careerPlanService } from "@features/career-plan/services/careerPlanService";
import {
  assessmentService,
  currentCycle,
} from "@features/assessments/services/assessmentService";
import { skillsService } from "@features/skills/services/skillsService";
import { resetCareerPlanMock } from "../career-plan.handlers";
import { resetAssessmentsMock } from "../assessments.handlers";
import { resetSkillsMock } from "../skills.handlers";
import { resetPeopleMock } from "../people.handlers";
import { PAULA, MARIA, LAURA } from "../assessments.seeds";

const ANDRES = "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const NEGOCIO = "s1000000-0000-0000-0000-000000000001";
const DESARROLLO = "s1000000-0000-0000-0000-000000000002";
const CICLO = "s1000000-0000-0000-0000-000000000003";

const CYCLE = currentCycle();

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

async function message(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
    return "";
  } catch (e) {
    return (
      (e as { response?: { data?: { message?: string } } }).response?.data
        ?.message ?? ""
    );
  }
}

describe("career-plan.handlers — plan individual", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
    resetCareerPlanMock();
  });

  it("arma el perfil con los criterios que la evaluación registró, no con un texto aparte", async () => {
    const plan = await careerPlanService.getPlan(PAULA);

    expect(plan.position).toBe("Data Engineer");
    expect(plan.skills).toHaveLength(9);
    expect(plan.assessmentClosedAtUtc).not.toBeNull();

    const negocio = plan.skills.find((s) => s.skillId === NEGOCIO)!;
    expect(negocio.level).toBe(2);
    expect(negocio.expectedLevel).toBe(3);
    expect(negocio.gap).toBe(1);

    // Competente tiene 5 criterios y los cumple todos.
    expect(negocio.metCriteria).toHaveLength(5);
    expect(negocio.levelTotal).toBe(5);
    // De Avanzado (6) marcó 2, así que faltan 4.
    expect(negocio.expectedTotal).toBe(6);
    expect(negocio.missingCriteria).toHaveLength(4);
    expect(negocio.missingCriteria).toContain(
      "Conoce las reglas de al menos dos dominios además del suyo."
    );
    expect(negocio.note).toMatch(/anticipar impacto/);
  });

  it("no inventa un nivel siguiente cuando no hay brecha", async () => {
    const plan = await careerPlanService.getPlan(PAULA);
    const sinBrecha = plan.skills.find((s) => s.gap === 0)!;

    expect(sinBrecha.missingCriteria).toEqual([]);
    expect(sinBrecha.metCriteria.length).toBeGreaterThan(0);
  });

  it("deja sin exigencia la habilidad cuyo rol no declara nivel", async () => {
    // Se retira el nivel de Data Engineer en Ciclo de desarrollo.
    await skillsService.setExpectation(CICLO, "Data Engineer", null);

    const plan = await careerPlanService.getPlan(PAULA);
    const ciclo = plan.skills.find((s) => s.skillId === CICLO)!;

    expect(ciclo.expectedLevel).toBeNull();
    expect(ciclo.gap).toBeNull();
    expect(ciclo.missingCriteria).toEqual([]);
  });

  it("trae las acciones sembradas, incluida una cumplida cuya brecha sigue abierta", async () => {
    const plan = await careerPlanService.getPlan(PAULA);

    expect(plan.actions).toHaveLength(3);
    const cumplida = plan.actions.find((a) => a.status === "Done")!;
    expect(cumplida.skillId).toBe(NEGOCIO);
    expect(cumplida.skillName).toBe("Conocimiento del negocio");

    // La brecha que la originó sigue abierta.
    const negocio = plan.skills.find((s) => s.skillId === NEGOCIO)!;
    expect(negocio.gap).toBe(1);
  });

  it("rechaza una acción que no nace de una brecha registrada", async () => {
    const plan = await careerPlanService.getPlan(PAULA);
    const sinBrecha = plan.skills.find((s) => s.gap === 0)!;

    const intento = () =>
      careerPlanService.createAction(PAULA, {
        skillId: sinBrecha.skillId,
        targetLevel: 4,
        dueMonth: "2027-01",
        title: "Un curso cualquiera",
      });

    expect(await status(intento)).toBe(400);
    expect(await message(intento)).toMatch(/No hay brecha registrada/);

    // Tampoco vale una habilidad que la persona no tiene evaluada.
    expect(
      await status(() =>
        careerPlanService.createAction(PAULA, {
          skillId: "no-existe",
          targetLevel: 3,
          dueMonth: "2027-01",
          title: "Otra",
        })
      )
    ).toBe(400);
  });

  it("registra una acción sobre una brecha, en curso y con su objetivo", async () => {
    const antes = await careerPlanService.getPlan(MARIA);
    const brecha = antes.skills.find((s) => (s.gap ?? 0) > 0)!;
    expect(antes.actions).toHaveLength(0);

    const despues = await careerPlanService.createAction(MARIA, {
      skillId: brecha.skillId,
      targetLevel: (brecha.level + 1) as 2,
      dueMonth: "2027-03",
      title: "Rotar por la célula de plataforma",
    });

    expect(despues.actions).toHaveLength(1);
    const [accion] = despues.actions;
    expect(accion.status).toBe("InProgress");
    expect(accion.fromLevel).toBe(brecha.level);
    expect(accion.targetLevel).toBe(brecha.level + 1);
    expect(accion.skillName).toBe(brecha.skillName);
  });

  it("valida el objetivo, el compromiso y el título", async () => {
    const plan = await careerPlanService.getPlan(MARIA);
    const brecha = plan.skills.find((s) => (s.gap ?? 0) > 0)!;
    const base = {
      skillId: brecha.skillId,
      targetLevel: 3 as const,
      dueMonth: "2027-03",
      title: "Algo",
    };

    // Objetivo por debajo o igual al nivel actual.
    expect(
      await status(() =>
        careerPlanService.createAction(MARIA, {
          ...base,
          targetLevel: brecha.level as 2,
        })
      )
    ).toBe(400);
    // Mes mal formado.
    expect(
      await status(() =>
        careerPlanService.createAction(MARIA, { ...base, dueMonth: "marzo" })
      )
    ).toBe(400);
    // Sin título.
    expect(
      await status(() =>
        careerPlanService.createAction(MARIA, { ...base, title: "   " })
      )
    ).toBe(400);
  });

  it("marcar una acción como cumplida no cierra la brecha", async () => {
    const plan = await careerPlanService.getPlan(PAULA);
    const enCurso = plan.actions.find(
      (a) => a.status === "InProgress" && a.skillId === NEGOCIO
    )!;
    const brechaAntes = plan.skills.find((s) => s.skillId === NEGOCIO)!.gap;

    const despues = await careerPlanService.completeAction(PAULA, enCurso.id);

    expect(despues.actions.find((a) => a.id === enCurso.id)!.status).toBe(
      "Done"
    );
    expect(despues.skills.find((s) => s.skillId === NEGOCIO)!.gap).toBe(
      brechaAntes
    );
  });

  it("la brecha se cierra cuando una evaluación posterior alcanza el nivel", async () => {
    const antes = await careerPlanService.getPlan(MARIA);
    const brecha = antes.skills.find((s) => s.skillId === DESARROLLO)!;
    expect(brecha.gap).toBe(1);

    const spanAntes = await careerPlanService.getSpan();
    const totalAntes = spanAntes.people
      .flatMap((p) => p.cells)
      .filter((c) => (c.gap ?? 0) > 0).length;

    // Se reevalúa a María y esta vez alcanza lo que su rol pide.
    const nueva = await assessmentService.open(MARIA, CYCLE);
    for (const skill of nueva.skills) {
      await assessmentService.saveSkill(MARIA, nueva.id, skill.skillId, {
        level: 4,
        met: [[], [], [], []],
        note: "",
      });
    }
    await assessmentService.close(MARIA, nueva.id);

    const despues = await careerPlanService.getPlan(MARIA);
    expect(despues.skills.find((s) => s.skillId === DESARROLLO)!.gap).toBe(0);

    const spanDespues = await careerPlanService.getSpan();
    const totalDespues = spanDespues.people
      .flatMap((p) => p.cells)
      .filter((c) => (c.gap ?? 0) > 0).length;
    expect(totalDespues).toBeLessThan(totalAntes);
  });

  it("una persona sin evaluación cerrada devuelve el plan vacío, no un error", async () => {
    const plan = await careerPlanService.getPlan(ANDRES);
    expect(plan.skills).toEqual([]);
    expect(plan.assessmentClosedAtUtc).toBeNull();
    expect(plan.personName).toBe("Andrés Martínez");

    // Laura tiene una evaluación en curso, que tampoco cuenta.
    const laura = await careerPlanService.getPlan(LAURA);
    expect(laura.skills).toEqual([]);
  });

  it("responde 404 para una persona que no existe", async () => {
    expect(await status(() => careerPlanService.getPlan("no-existe"))).toBe(
      404
    );
  });
});

describe("career-plan.handlers — resumen del span", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
    resetCareerPlanMock();
  });

  it("cuenta las brechas críticas dentro del total de brechas abiertas", async () => {
    const resumen = await careerPlanService.getSpanSummary();
    const span = await careerPlanService.getSpan();

    // La misma cuenta que la matriz: el resumen no puede contar distinto de lo
    // que se ve al recorrer las celdas.
    const celdas = span.people
      .filter((p) => p.evaluated)
      .flatMap((p) => p.cells)
      .filter((c) => c.gap !== null && c.gap > 0);

    expect(resumen.totalGaps).toBe(celdas.length);
    expect(resumen.criticalGaps).toBe(
      celdas.filter((c) => (c.gap ?? 0) >= 2).length
    );
    expect(resumen.criticalGaps).toBeLessThanOrEqual(resumen.totalGaps);
  });

  it("mide la cobertura sobre las personas del chapter, no sobre las evaluadas", async () => {
    const resumen = await careerPlanService.getSpanSummary();

    expect(resumen.evaluatedPeople).toBe(3);
    expect(resumen.totalPeople).toBeGreaterThan(resumen.evaluatedPeople);
    // Lo que no está evaluado es lo que falta para llegar al total.
    // Cifras, no la misma resta que hace el handler: comparar tres campos del
    // mismo objeto con su propia fórmula no puede fallar.
    expect(resumen.totalPeople).toBe(18);
    expect(resumen.pending.unassessed).toBe(15);
  });

  it("nombra a las personas con tres brechas o más, de mayor a menor", async () => {
    const resumen = await careerPlanService.getSpanSummary();

    // Con las semillas, Carlos es el único que llega a tres. Nombrarlo es lo
    // que hace que la prueba falle si el umbral o el conteo cambian: sobre un
    // arreglo vacío, cualquier `every` habría pasado igual.
    expect(resumen.peopleAtRisk).toHaveLength(1);
    expect(resumen.peopleAtRisk[0]).toMatchObject({
      personName: "Carlos López",
      gapCount: 3,
    });
    expect(resumen.peopleAtRisk.every((p) => p.gapCount >= 3)).toBe(true);
  });

  it("compara contra el ciclo anterior y arma la serie de ciclos cerrados", async () => {
    const resumen = await careerPlanService.getSpanSummary();

    expect(resumen.trend.length).toBeGreaterThan(1);
    // Del más viejo al vigente: el último punto es el presente.
    const ciclos = resumen.trend.map((p) => p.cycle);
    expect([...ciclos].sort()).toEqual(ciclos);
    expect(ciclos[ciclos.length - 1]).toBe(CYCLE);

    expect(resumen.previousCycle).not.toBeNull();
    expect(resumen.previousCycle!.cycle).toBe(ciclos[ciclos.length - 2]);
  });

  it("cada punto de la serie cuenta las brechas de su propio ciclo", async () => {
    const resumen = await careerPlanService.getSpanSummary();

    // Los tres ciclos sembrados tienen cifras distintas entre sí: si
    // `gapsInCycle` ignorara el ciclo, los tres puntos serían iguales y esto
    // fallaría. El del ciclo vigente coincide además con el total de hoy.
    const porCiclo = Object.fromEntries(
      resumen.trend.map((p) => [p.cycle, p.totalGaps])
    );
    expect(Object.keys(porCiclo)).toHaveLength(3);
    expect(new Set(Object.values(porCiclo)).size).toBeGreaterThan(1);
    expect(porCiclo[CYCLE]).toBe(resumen.totalGaps);
  });

  it("ordena las habilidades por cuánto pesa la brecha, no por cuántas son", async () => {
    const resumen = await careerPlanService.getSpanSummary();

    // Calidad y pruebas tiene una sola persona con brecha (Carlos) pero de dos
    // niveles: pesa 2 con una persona, y va delante de las que tienen una
    // persona a un nivel. Contando personas quedarían todas empatadas.
    const calidad = resumen.topSkills.find(
      (s) => s.skillName === "Calidad y pruebas"
    );
    expect(calidad).toMatchObject({ weight: 2, peopleWithGap: 1 });
    expect(resumen.topSkills[0].skillName).toBe("Calidad y pruebas");

    const pesos = resumen.topSkills.map((s) => s.weight);
    expect([...pesos].sort((a, b) => b - a)).toEqual(pesos);
    expect(resumen.topSkills.length).toBeLessThanOrEqual(4);
  });

  it("cuenta los pendientes de gestión sobre todo el chapter", async () => {
    const resumen = await careerPlanService.getSpanSummary();

    // Cifras exactas y no `>= 0`: un conteo nunca es negativo, así que esa
    // comparación no puede fallar y la prueba no vigilaba nada.
    expect(resumen.pending).toEqual({
      // 18 personas, 3 con evaluación cerrada.
      unassessed: 15,
      // La única acción vencida de las semillas ya está cumplida.
      overduePlans: 0,
      // Once de los trece roles del chapter no declaran nivel en alguna
      // habilidad activa.
      positionsWithoutLevel: 11,
      // Seis brechas abiertas, tres con una acción en curso encima.
      gapsWithoutPlan: 3,
    });
    expect(resumen.pending.gapsWithoutPlan).toBeLessThanOrEqual(
      resumen.totalGaps
    );
  });

  it("el historial no pisa la evaluación vigente ni en la matriz ni en el plan", async () => {
    // Paula tiene evaluaciones de dos ciclos anteriores, con niveles más
    // bajos. Lo que el mapa y su plan describen es el presente.
    const plan = await careerPlanService.getPlan(PAULA);
    expect(plan.cycle).toBe(CYCLE);

    const negocio = plan.skills.find((s) => s.skillId === NEGOCIO)!;
    expect(negocio.level).toBe(2);

    const span = await careerPlanService.getSpan();
    const paula = span.people.find((p) => p.personId === PAULA)!;
    const celda = paula.cells.find((c) => c.skillId === NEGOCIO)!;
    expect(celda.level).toBe(2);
    expect(celda.gap).toBe(1);
  });
});
