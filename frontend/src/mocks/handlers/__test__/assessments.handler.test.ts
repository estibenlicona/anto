import { describe, it, expect, beforeEach } from "vitest";
import {
  assessmentService,
  currentCycle,
} from "@features/assessments/services/assessmentService";
import { skillsService } from "@features/skills/services/skillsService";
import {
  getClosedAssessmentsSnapshot,
  resetAssessmentsMock,
} from "../assessments.handlers";
import { resetSkillsMock } from "../skills.handlers";
import { resetPeopleMock } from "../people.handlers";
import { PAULA, CARLOS, MARIA, LAURA } from "../assessments.seeds";

const ANDRES = "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const NEGOCIO = "s1000000-0000-0000-0000-000000000001";
const ARQUITECTURA = "s1000000-0000-0000-0000-000000000005";
const ADAPTABILIDAD = "s2000000-0000-0000-0000-000000000004";

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

describe("assessments.handlers", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
    resetAssessmentsMock();
  });

  it("devuelve la evaluación cerrada de una persona con sus nueve habilidades", async () => {
    const evaluacion = (await assessmentService.get(PAULA, CYCLE))!;

    expect(evaluacion.status).toBe("Closed");
    expect(evaluacion.position).toBe("Data Engineer");
    expect(evaluacion.skills).toHaveLength(9);
    expect(evaluacion.skills.every((s) => s.level !== null)).toBe(true);
  });

  it("deriva la brecha de la diferencia con lo que pide el rol, y su contenido de lo que quedó sin marcar", async () => {
    const evaluacion = (await assessmentService.get(PAULA, CYCLE))!;
    const negocio = evaluacion.skills.find((s) => s.skillId === NEGOCIO)!;

    expect(negocio.level).toBe(2);
    expect(negocio.expectedLevel).toBe(3);
    expect(negocio.gap).toBe(1);

    // Avanzado tiene 6 criterios y la semilla marcó los dos primeros.
    expect(negocio.levels[2].criteria).toHaveLength(6);
    expect(negocio.missingCriteria).toHaveLength(4);
    expect(negocio.missingCriteria).toContain(
      "Conoce las reglas de al menos dos dominios además del suyo."
    );
    expect(negocio.missingCriteria).not.toContain(
      "Anticipa el impacto de una decisión técnica sin que se lo pidan."
    );
  });

  it("el mismo nivel evaluado es brecha o no según el rol de cada persona", async () => {
    const paula = (await assessmentService.get(PAULA, CYCLE))!;
    const maria = (await assessmentService.get(MARIA, CYCLE))!;

    const suyo = paula.skills.find((s) => s.skillId === NEGOCIO)!;
    const deElla = maria.skills.find((s) => s.skillId === NEGOCIO)!;

    expect(suyo.level).toBe(deElla.level);
    // Data Engineer pide Avanzado; Backend Dev, Competente.
    expect(suyo.gap).toBe(1);
    expect(deElla.gap).toBe(0);
    expect(deElla.missingCriteria).toEqual([]);
  });

  it("no registra brecha cuando el rol no declara nivel, y sin nota lo deja pasar", async () => {
    // El catálogo no declara nivel de Arquitectura para QA Engineer, y Laura
    // sigue en curso: se resuelve contra el catálogo vigente.
    const laura = (await assessmentService.get(LAURA, CYCLE))!;
    const arquitectura = laura.skills.find((s) => s.skillId === ARQUITECTURA)!;

    expect(arquitectura.expectedLevel).toBeNull();
    expect(arquitectura.gap).toBeNull();

    // Sin nivel exigido no hay brecha que justificar: guarda sin nota.
    const guardada = await assessmentService.saveSkill(
      LAURA,
      laura.id,
      ARQUITECTURA,
      { level: 1, met: [[], [], [], []], note: "" }
    );
    const despues = guardada.skills.find((s) => s.skillId === ARQUITECTURA)!;
    expect(despues.level).toBe(1);
    expect(despues.gap).toBeNull();
    expect(despues.missingCriteria).toEqual([]);
  });

  it("abre una evaluación para quien no tiene, y rechaza la segunda en curso", async () => {
    expect(await assessmentService.get(ANDRES, CYCLE)).toBeNull();

    const abierta = await assessmentService.open(ANDRES, CYCLE);
    expect(abierta.status).toBe("InProgress");
    expect(abierta.skills.every((s) => s.level === null)).toBe(true);

    expect(await status(() => assessmentService.open(ANDRES, CYCLE))).toBe(400);

    const traida = (await assessmentService.get(ANDRES, CYCLE))!;
    expect(traida.id).toBe(abierta.id);
  });

  it("guarda una habilidad y exige la nota sólo cuando hay brecha", async () => {
    const laura = (await assessmentService.get(LAURA, CYCLE))!;
    expect(laura.status).toBe("InProgress");

    const negocio = laura.skills.find((s) => s.skillId === NEGOCIO)!;
    const criteriosDeCompetente = negocio.levels[1].criteria.map((c) => c.text);

    // QA Engineer pide Competente en Conocimiento del negocio: evaluar en
    // Principiante abre brecha, y sin nota no pasa.
    const sinNota = () =>
      assessmentService.saveSkill(LAURA, laura.id, NEGOCIO, {
        level: 1,
        met: [[], [], [], []],
        note: "",
      });
    expect(await status(sinNota)).toBe(400);
    expect(await message(sinNota)).toMatch(/nota es obligatoria/);

    // Al nivel exigido no hace falta nota.
    const guardada = await assessmentService.saveSkill(
      LAURA,
      laura.id,
      NEGOCIO,
      {
        level: 2,
        met: [[], criteriosDeCompetente, [], []],
        note: "",
      }
    );
    const despues = guardada.skills.find((s) => s.skillId === NEGOCIO)!;
    expect(despues.level).toBe(2);
    expect(despues.gap).toBe(0);
    expect(despues.levels[1].criteria.every((c) => c.met)).toBe(true);
  });

  it("rechaza un nivel fuera de la escala y un criterio que el catálogo no tiene", async () => {
    const laura = (await assessmentService.get(LAURA, CYCLE))!;

    expect(
      await status(() =>
        assessmentService.saveSkill(LAURA, laura.id, NEGOCIO, {
          level: 7 as 1,
          met: [[], [], [], []],
          note: "",
        })
      )
    ).toBe(400);

    const guardada = await assessmentService.saveSkill(
      LAURA,
      laura.id,
      NEGOCIO,
      {
        level: 2,
        met: [["Criterio inventado que no está en el catálogo"], [], [], []],
        note: "",
      }
    );
    const negocio = guardada.skills.find((s) => s.skillId === NEGOCIO)!;
    expect(negocio.levels[0].criteria.some((c) => c.met)).toBe(false);
  });

  it("no deja cerrar con habilidades sin nivel y dice cuáles faltan", async () => {
    const laura = (await assessmentService.get(LAURA, CYCLE))!;
    const evaluadas = laura.skills.filter((s) => s.level !== null);
    expect(evaluadas).toHaveLength(4);

    const cerrar = () => assessmentService.close(LAURA, laura.id);
    expect(await status(cerrar)).toBe(400);
    expect(await message(cerrar)).toMatch(/Faltan 5 habilidades sin nivel/);
  });

  it("cierra cuando están todas y estampa la versión del catálogo", async () => {
    const laura = (await assessmentService.get(LAURA, CYCLE))!;
    const catalogo = await skillsService.get();

    for (const skill of laura.skills.filter((s) => s.level === null)) {
      await assessmentService.saveSkill(LAURA, laura.id, skill.skillId, {
        level: 4,
        met: [[], [], [], []],
        note: "",
      });
    }

    const cerrada = await assessmentService.close(LAURA, laura.id);
    expect(cerrada.status).toBe("Closed");
    expect(cerrada.catalogVersion).toBe(catalogo.version);
    expect(cerrada.closedAtUtc).not.toBeNull();

    // Cerrada es de sólo lectura.
    expect(
      await status(() =>
        assessmentService.saveSkill(LAURA, laura.id, NEGOCIO, {
          level: 1,
          met: [[], [], [], []],
          note: "algo",
        })
      )
    ).toBe(400);
  });

  it("una evaluación cerrada no se mueve cuando el catálogo cambia de versión", async () => {
    const antes = (await assessmentService.get(PAULA, CYCLE))!;
    const negocioAntes = antes.skills.find((s) => s.skillId === NEGOCIO)!;

    // Se reescribe el nivel exigido y los criterios del nivel de la brecha.
    await skillsService.setExpectation(NEGOCIO, "Data Engineer", 4);
    await skillsService.setCriteria(NEGOCIO, 3, ["Un único criterio nuevo"]);

    const despues = (await assessmentService.get(PAULA, CYCLE))!;
    const negocioDespues = despues.skills.find((s) => s.skillId === NEGOCIO)!;

    expect(despues.catalogVersion).toBe(antes.catalogVersion);
    expect(negocioDespues.expectedLevel).toBe(negocioAntes.expectedLevel);
    expect(negocioDespues.gap).toBe(negocioAntes.gap);
    expect(negocioDespues.missingCriteria).toEqual(
      negocioAntes.missingCriteria
    );
    expect(negocioDespues.levels[2].criteria).toHaveLength(6);
  });

  it("una habilidad desactivada sale del alcance pero no de lo ya evaluado", async () => {
    await skillsService.deactivate(ADAPTABILIDAD);

    // Quien ya la evaluó la conserva.
    const paula = (await assessmentService.get(PAULA, CYCLE))!;
    expect(paula.skills.some((s) => s.skillId === ADAPTABILIDAD)).toBe(true);

    // Una evaluación nueva no la ofrece.
    const nueva = await assessmentService.open(ANDRES, CYCLE);
    expect(nueva.skills).toHaveLength(8);
    expect(nueva.skills.some((s) => s.skillId === ADAPTABILIDAD)).toBe(false);
  });

  it("le dice al catálogo qué habilidades ya se usaron, y sólo cuentan las cerradas", async () => {
    // Las nueve están en evaluaciones cerradas.
    expect(await status(() => skillsService.remove(NEGOCIO))).toBe(400);

    const snapshot = getClosedAssessmentsSnapshot();

    // Tres personas evaluadas en el ciclo vigente. El resto del snapshot son
    // ciclos anteriores: existen para que el mapa pueda comparar contra el
    // pasado, y no se mezclan con lo que describe el presente.
    const vigentes = snapshot.filter((s) => s.cycle === CYCLE);
    expect(vigentes).toHaveLength(3);
    expect(vigentes.map((s) => s.personId).sort()).toEqual(
      [PAULA, CARLOS, MARIA].sort()
    );
    expect(snapshot.some((s) => s.cycle !== CYCLE)).toBe(true);

    expect(snapshot.every((s) => s.catalogVersion > 0)).toBe(true);
    expect(
      vigentes
        .find((s) => s.personId === PAULA)!
        .skills.find((s) => s.skillId === NEGOCIO)!.gap
    ).toBe(1);
  });
});
