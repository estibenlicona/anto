import { describe, it, expect, beforeEach } from "vitest";
import { skillsService } from "@features/skills/services/skillsService";
import {
  getSkillsCatalogSnapshot,
  getSkillsCatalogVersion,
  resetSkillsMock,
  setSkillUsageLookup,
} from "../skills.handlers";
import { resetPeopleMock } from "../people.handlers";

const NEGOCIO = "s1000000-0000-0000-0000-000000000001";
const ARQUITECTURA = "s1000000-0000-0000-0000-000000000005";
const ADAPTABILIDAD = "s2000000-0000-0000-0000-000000000004";

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

describe("skills.handlers", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetSkillsMock();
  });

  it("trae las nueve habilidades con sus criterios por nivel y los cargos de las personas", async () => {
    const catalog = await skillsService.get();

    expect(catalog.skills).toHaveLength(9);
    expect(catalog.skills.filter((s) => s.group === "technical")).toHaveLength(
      5
    );
    expect(catalog.skills.filter((s) => s.group === "human")).toHaveLength(4);

    const negocio = catalog.skills.find((s) => s.id === NEGOCIO)!;
    expect(negocio.levels.map((l) => l.criteria.length)).toEqual([5, 5, 6, 4]);
    expect(negocio.levels[0].criteria[0]).toBe(
      "Identifica los productos del negocio y a quién sirven."
    );

    // Los cargos no son una lista propia del catálogo.
    expect(catalog.positions).toContain("Data Engineer");
    expect(catalog.positions).toContain("Arquitecto");
  });

  it("deja una habilidad con un nivel sin criterios y cantidades distintas entre habilidades", async () => {
    const catalog = await skillsService.get();

    const arquitectura = catalog.skills.find((s) => s.id === ARQUITECTURA)!;
    expect(arquitectura.levels[2].criteria).toEqual([]);

    const counts = catalog.skills.map((s) =>
      s.levels.reduce((total, l) => total + l.criteria.length, 0)
    );
    expect(new Set(counts).size).toBeGreaterThan(1);
  });

  it("lista todos los cargos en cada habilidad, con nivel o sin definir", async () => {
    const catalog = await skillsService.get();
    const negocio = catalog.skills.find((s) => s.id === NEGOCIO)!;

    expect(negocio.expectations.map((e) => e.position).sort()).toEqual(
      [...catalog.positions].sort()
    );
    expect(
      negocio.expectations.find((e) => e.position === "Data Engineer")?.level
    ).toBe(3);
    expect(
      negocio.expectations.find((e) => e.position === "Data Analyst")?.level
    ).toBeNull();
  });

  it("crea una habilidad con los cuatro niveles vacíos y rechaza el nombre repetido", async () => {
    const created = await skillsService.create({
      name: "Observabilidad",
      group: "technical",
      description: "Cómo se entera de que algo está fallando.",
    });

    expect(created.levels.map((l) => l.criteria.length)).toEqual([0, 0, 0, 0]);
    expect(created.active).toBe(true);

    expect(
      await status(() =>
        skillsService.create({
          name: "  observabilidad ",
          group: "human",
          description: "",
        })
      )
    ).toBe(400);

    expect(
      await status(() =>
        skillsService.create({
          name: "  ",
          group: "technical",
          description: "",
        })
      )
    ).toBe(400);

    const catalog = await skillsService.get();
    expect(
      catalog.skills.filter((s) => s.name === "Observabilidad")
    ).toHaveLength(1);
  });

  it("reemplaza la lista de criterios de un nivel y rechaza un texto vacío", async () => {
    const updated = await skillsService.setCriteria(ADAPTABILIDAD, 3, [
      "Primero",
      "Segundo",
      "Tercero",
    ]);
    expect(updated.levels[2].criteria).toEqual([
      "Primero",
      "Segundo",
      "Tercero",
    ]);

    expect(
      await status(() =>
        skillsService.setCriteria(ADAPTABILIDAD, 3, ["Vale", "   "])
      )
    ).toBe(400);

    const after = await skillsService.get();
    const adaptabilidad = after.skills.find((s) => s.id === ADAPTABILIDAD)!;
    expect(adaptabilidad.levels[2].criteria).toEqual([
      "Primero",
      "Segundo",
      "Tercero",
    ]);
  });

  it("declara y retira el nivel esperado de un rol", async () => {
    const declared = await skillsService.setExpectation(
      ARQUITECTURA,
      "Data Analyst",
      2
    );
    expect(
      declared.expectations.find((e) => e.position === "Data Analyst")?.level
    ).toBe(2);

    const withdrawn = await skillsService.setExpectation(
      ARQUITECTURA,
      "Data Analyst",
      null
    );
    expect(
      withdrawn.expectations.find((e) => e.position === "Data Analyst")?.level
    ).toBeNull();

    // Retirar uno no toca a los demás.
    expect(
      withdrawn.expectations.find((e) => e.position === "Arquitecto")?.level
    ).toBe(4);
  });

  it("impide borrar una habilidad en uso y ofrece desactivarla", async () => {
    expect(await status(() => skillsService.remove(NEGOCIO))).toBe(400);
    expect(await message(() => skillsService.remove(NEGOCIO))).toMatch(
      /Desactivarla/
    );

    const deactivated = await skillsService.deactivate(NEGOCIO);
    expect(deactivated.active).toBe(false);

    const catalog = await skillsService.get();
    expect(catalog.skills.some((s) => s.id === NEGOCIO)).toBe(true);
  });

  it("borra la que no está en uso, y respeta quién responde por el uso", async () => {
    await skillsService.remove(ADAPTABILIDAD);
    expect((await skillsService.get()).skills).toHaveLength(8);

    // El handler de evaluaciones toma el relevo de la semilla.
    setSkillUsageLookup((id) => id === ARQUITECTURA);
    expect(await status(() => skillsService.remove(ARQUITECTURA))).toBe(400);
    await skillsService.remove(NEGOCIO);
    expect(
      (await skillsService.get()).skills.some((s) => s.id === NEGOCIO)
    ).toBe(false);
  });

  it("publicar sube la versión y deja accesible la copia anterior", async () => {
    const before = await skillsService.get();
    const originalText = before.skills.find((s) => s.id === NEGOCIO)!.levels[0]
      .criteria[0];

    await skillsService.setCriteria(NEGOCIO, 1, [
      "Texto nuevo del primer criterio",
    ]);

    const after = await skillsService.get();
    expect(after.version).toBe(before.version + 1);
    expect(
      after.skills.find((s) => s.id === NEGOCIO)!.levels[0].criteria
    ).toEqual(["Texto nuevo del primer criterio"]);

    const historic = getSkillsCatalogVersion(before.version)!;
    expect(
      historic.skills.find((s) => s.id === NEGOCIO)!.levels[0].criteria[0]
    ).toBe(originalText);
    expect(getSkillsCatalogSnapshot().version).toBe(after.version);
  });
});
