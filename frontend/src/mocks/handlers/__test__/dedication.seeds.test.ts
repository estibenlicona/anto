import { describe, it, expect } from "vitest";
import {
  DEDICATION_BY_USER,
  holidaysOf,
  SPRINTS,
  TODAY,
  type SeedUserSprint,
} from "../dedication.seeds";
import { devOpsUserByEmail, LINKED_IDENTITIES } from "../personDetail.seeds";

/**
 * Las semillas del balance de carga existen para que la pantalla muestre cada
 * caso de la spec sin que nadie tenga que fabricarlo a mano. Esta prueba los
 * enumera: si alguien retoca las historias y se lleva un caso por delante, acá
 * se ve cuál.
 */

const sprintsOf = (email: string): SeedUserSprint[] =>
  DEDICATION_BY_USER[devOpsUserByEmail(email).id] ?? [];

const committed = (sprint: SeedUserSprint) =>
  sprint.stories.reduce((acc, s) => acc + s.points, 0);

const sealedCount = (email: string) =>
  sprintsOf(email).filter((s) => s.snapshotStatus === "Sealed").length;

const currentOf = (email: string) => {
  const sprints = sprintsOf(email);
  return sprints[sprints.length - 1];
};

describe("semillas de balance de carga · el calendario", () => {
  it("son siete sprints de dos semanas y el en curso contiene a TODAY", () => {
    expect(SPRINTS).toHaveLength(7);
    const current = SPRINTS.filter(
      (s) => s.startDate <= TODAY && TODAY <= s.endDate
    );
    expect(current.map((s) => s.name)).toEqual(["S18"]);
  });

  it("el sprint en curso tiene un festivo y otro sprint de la ventana también", () => {
    expect(holidaysOf("S18")).toBe(1);
    expect(holidaysOf("S16")).toBe(1);
    expect(holidaysOf("S12")).toBe(0);
  });
});

describe("semillas de balance de carga · los casos de la spec", () => {
  it("carga habitual: María se mantiene en torno a su mediana", () => {
    expect(committed(currentOf("maria.gonzalez@tuya.com"))).toBe(18);
    expect(sealedCount("maria.gonzalez@tuya.com")).toBe(5);
  });

  it("posible sobreasignación: Carlos sube la demanda y recibe trabajo tarde", () => {
    const current = currentOf("carlos.lopez@tuya.com");
    expect(committed(current)).toBe(30);
    const added = current.stories
      .filter((s) => s.addedAfterSprintStart)
      .reduce((acc, s) => acc + s.points, 0);
    expect(added).toBe(8);
    expect(Math.max(...current.wipSeries)).toBe(4);
  });

  // Tres épicas es también lo que hace falta para ver el "+N" de la columna de
  // célula e iniciativas, que muestra dos y colapsa el resto.
  it("varias iniciativas: Andrés sube la demanda y toca tres épicas a la vez", () => {
    const current = currentOf("andres.martinez@tuya.com");
    expect(committed(current)).toBe(28);
    const epics = new Set(
      current.stories.filter((s) => s.epic).map((s) => s.epic!.id)
    );
    expect(epics.size).toBe(3);
  });

  it("posible subasignación: Valentina cae y es la única medida de su célula", () => {
    expect(committed(currentOf("valentina.ospina@tuya.com"))).toBe(6);
    expect(sealedCount("valentina.ospina@tuya.com")).toBe(6);
  });

  it("la célula que acompaña: Sebastián y Paula caen juntos", () => {
    expect(committed(currentOf("sebastian.cardenas@tuya.com"))).toBe(9);
    expect(committed(currentOf("paula.ramirez@tuya.com"))).toBe(8);
    // Ambos cierran todo lo comprometido: la subasignación se ve también en
    // que no les quedó nada por hacer.
    for (const email of [
      "sebastian.cardenas@tuya.com",
      "paula.ramirez@tuya.com",
    ]) {
      const current = currentOf(email);
      expect(current.stories.every((s) => s.state === "Closed")).toBe(true);
    }
  });

  it("sin célula: Julián está vinculado y tiene sprints", () => {
    const julian = devOpsUserByEmail("julian.pena@tuya.com").id;
    expect(DEDICATION_BY_USER[julian]).toBeDefined();
    expect(sealedCount("julian.pena@tuya.com")).toBe(6);
  });

  it("sin sprints: Daniela está vinculada y DevOps no le devuelve nada", () => {
    const daniela = devOpsUserByEmail("daniela.castano@tuya.com").id;
    expect(DEDICATION_BY_USER[daniela]).toBeUndefined();
    expect(Object.values(LINKED_IDENTITIES).some((i) => i.id === daniela)).toBe(
      true
    );
  });

  /**
   * El caso lo sostiene Camila sola, y no es casual: no tiene célula. Alguien
   * con asignación declarada y sin identidad sería una contradicción entre
   * módulos —la célula diría que dedica el 100 % y el balance de carga no
   * podría decir nada de él—, y eso lo fija `dedication.consistency.test.ts`.
   */
  it("sin identidad: Camila tiene sprints sembrados y nadie la vinculó", () => {
    const user = devOpsUserByEmail("camila.restrepo@tuya.com").id;

    expect(DEDICATION_BY_USER[user]?.length).toBeGreaterThan(0);
    expect(Object.values(LINKED_IDENTITIES).some((i) => i.id === user)).toBe(
      false
    );
  });

  it("histórico insuficiente: Isabella y Camila quedan por debajo del mínimo de 3", () => {
    expect(sealedCount("isabella.moreno@tuya.com")).toBe(2);
    expect(sealedCount("camila.restrepo@tuya.com")).toBe(1);
  });

  it("medible: Diego supera el mínimo de sellados que exige el Calendario", () => {
    // Está asignado al 100 % en Canales, así que tiene que poder medirse.
    expect(sealedCount("diego.salazar@tuya.com")).toBeGreaterThanOrEqual(3);
  });

  it("sprint cerrado sin snapshot: el S15 de María", () => {
    const missing = sprintsOf("maria.gonzalez@tuya.com").filter(
      (s) => s.snapshotStatus === "Missing"
    );
    expect(missing.map((s) => s.sprint)).toEqual(["S15"]);
  });

  it("sprint en curso provisional: el S18 de todos los que tienen sprints", () => {
    for (const sprints of Object.values(DEDICATION_BY_USER)) {
      const current = sprints[sprints.length - 1];
      expect(current.sprint).toBe("S18");
      expect(current.snapshotStatus).toBe("Provisional");
    }
  });

  it("épicas mapeadas y sin mapear: Julián toca una de cada", () => {
    const current = currentOf("julian.pena@tuya.com");
    const epics = current.stories.filter((s) => s.epic).map((s) => s.epic!);
    expect(epics.some((e) => e.initiativeId !== null)).toBe(true);
    expect(epics.some((e) => e.initiativeId === null)).toBe(true);
  });

  it("sprint sin actividad: el S17 de Isabella", () => {
    const s17 = sprintsOf("isabella.moreno@tuya.com").find(
      (s) => s.sprint === "S17"
    );
    expect(s17).toBeDefined();
    expect(Object.keys(s17!.activity)).toHaveLength(0);
  });

  it("todo sprint declara su procedencia, sus días no disponibles y su serie de WIP", () => {
    for (const sprints of Object.values(DEDICATION_BY_USER)) {
      for (const sprint of sprints) {
        expect(["Sealed", "Provisional", "Missing"]).toContain(
          sprint.snapshotStatus
        );
        expect(sprint.otherUnavailableDays).toBeGreaterThanOrEqual(0);
        expect(sprint.wipSeries.length).toBeGreaterThan(0);
        expect(sprint.stories.length).toBeGreaterThan(0);
      }
    }
  });
});
