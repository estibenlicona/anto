import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import { dedicationService } from "@features/dedication/services/dedicationService";
import { personDetailService } from "@features/people/services/personDetailService";
import { allocationService } from "@features/allocations/services/allocationService";
import { absenceService } from "@features/absences/services/absenceService";
import { sprintConfigService } from "@features/admin-shell/services/sprintConfigService";
import { CHAPTERS } from "../chapters";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";
import { resetAbsencesMock } from "../absences.handlers";
import { resetPeopleMock } from "../people.handlers";
import { resetPersonDetailMock } from "../personDetail.handlers";
import { resetSprintConfigMock } from "../sprint-config.handlers";
import { resetDedicationMock } from "../dedication.handlers";
import {
  ANDRES,
  CAMILA,
  CARLOS,
  DANIELA,
  ISABELLA,
  JULIAN,
  LAURA,
  MARIA,
  MATEO,
  PAULA,
  SEBASTIAN,
  SOFIA,
  VALENTINA,
} from "../personDetail.seeds";

const BACKEND = "11111111-1111-1111-1111-111111111111";
const DATOS = "55555555-5555-5555-5555-555555555555";

async function status(fn: () => Promise<unknown>): Promise<number> {
  try {
    await fn();
    return 200;
  } catch (e) {
    return (e as { response?: { status: number } }).response?.status ?? 0;
  }
}

const all = () =>
  dedicationService.listCollaborators({}, { page: 1, pageSize: 50 });

describe("mock de balance de carga", () => {
  beforeEach(() => {
    resetSquadsMock();
    resetAllocationsMock();
    resetAbsencesMock();
    resetPeopleMock();
    resetPersonDetailMock();
    resetSprintConfigMock();
    resetDedicationMock();
  });

  afterEach(() => {
    setAccessTokenProvider(() => null);
  });

  it("listado: una fila por persona, ordenada por señal accionable, con el resumen por señal", async () => {
    const list = await all();
    expect(list.totalCount).toBe(18);
    expect(list.settings).toEqual({
      historyWindowSprints: 6,
      minHistorySprints: 3,
      hoursPerSprint: 80,
    });
    expect(list.lastSyncedAt).not.toBeNull();
    // Todo el listado habla del sprint en curso, y no se avanza más allá.
    expect(list.sprint).toEqual({
      name: "S18",
      startDate: "2026-08-17",
      endDate: "2026-08-30",
      isCurrent: true,
      previousName: "S17",
      nextName: null,
    });

    // Primero lo que pide una decisión de carga —entre ellas, quien más se
    // desvía—, luego la carga habitual, y al final lo que no se pudo evaluar.
    // No hay estado intermedio.
    expect(list.items.slice(0, 10).map((r) => r.balance.signal)).toEqual([
      "PossibleOverload",
      "PossibleOverload",
      "PossibleUnderload",
      "PossibleUnderload",
      "PossibleUnderload",
      "PossibleOverload",
      "PossibleOverload",
      "PossibleOverload",
      "Usual",
      "Usual",
    ]);
    expect(
      list.items.slice(10).every((r) => r.balance.signal === "NotEvaluable")
    ).toBe(true);
    expect(list.items.map((r) => r.balance.signal)).not.toContain("Review");

    expect(list.summary).toEqual({
      total: 18,
      possibleOverload: 5,
      possibleUnderload: 3,
      usual: 2,
      notEvaluable: 8,
      noIdentity: 6,
      noSprint: 1,
      insufficientHistory: 1,
      overloadPeople: [
        { id: LAURA, name: "Laura Ruiz" },
        { id: MATEO, name: "Mateo Vargas" },
        { id: CARLOS, name: "Carlos López" },
        { id: SOFIA, name: "Sofía Herrera" },
        { id: ANDRES, name: "Andrés Martínez" },
      ],
      underloadPeople: [
        { id: VALENTINA, name: "Valentina Ospina" },
        { id: PAULA, name: "Paula Ramírez" },
        { id: SEBASTIAN, name: "Sebastián Cárdenas" },
      ],
    });
  });

  it("el navegador mueve el listado entero a otro sprint", async () => {
    const prev = await dedicationService.listCollaborators(
      {},
      { page: 1, pageSize: 50 },
      "S17"
    );
    expect(prev.sprint).toMatchObject({
      name: "S17",
      isCurrent: false,
      previousName: "S16",
      nextName: "S18",
    });
    // Todas las filas hablan de ese sprint, y el resumen las acompaña.
    expect(
      prev.items.filter((r) => r.sprint).every((r) => r.sprint!.name === "S17")
    ).toBe(true);
    expect(prev.summary.total).toBe(18);
    expect(
      prev.summary.possibleOverload +
        prev.summary.possibleUnderload +
        prev.summary.usual +
        prev.summary.notEvaluable
    ).toBe(18);
    // En un sprint sellado en el que todos cumplieron, nadie pide decisión.
    expect(prev.summary.possibleOverload).toBe(0);
    expect(prev.summary.possibleUnderload).toBe(0);
  });

  it("las horas siguen al parámetro del Calendario sin mover la señal", async () => {
    const before = (await all()).items.find((r) => r.person.id === MARIA)!;
    expect(before.capacity.availableHours).toBe(64);
    expect(before.capacity.deductedHours).toBe(16);

    await sprintConfigService.saveConfig({
      weeks: 2,
      sprintsPerQuarter: 6,
      hoursPerSprint: 100,
      sprintCloseTime: "23:00",
      historyWindowSprints: 6,
      minHistorySprints: 3,
    });

    const after = (await all()).items.find((r) => r.person.id === MARIA)!;
    expect(after.capacity.availableHours).toBe(80);
    expect(after.capacity.deductedHours).toBe(20);
    // El FTE y la señal no se mueven: las horas sólo traducen la unidad.
    expect(after.capacity.availableFte).toBe(before.capacity.availableFte);
    expect(after.balance.signal).toBe(before.balance.signal);
  });

  it("cada fila trae las iniciativas que sus historias tocaron en el sprint", async () => {
    const { items } = await all();
    // Andrés toca tres épicas: es el caso que ejercita el "+N" de la columna.
    const andres = items.find((r) => r.person.id === ANDRES)!;
    expect(andres.sprintInitiatives).toHaveLength(3);
    expect(andres.sprintInitiatives.every((i) => i.points > 0)).toBe(true);

    // Sin sprint no hay iniciativas que mostrar, no una lista inventada.
    const camila = items.find((r) => r.person.id === CAMILA)!;
    expect(camila.sprintInitiatives).toEqual([]);
  });

  it("un sprint desconocido cae al en curso, no responde un error", async () => {
    const stale = await dedicationService.listCollaborators(
      {},
      { page: 1, pageSize: 50 },
      "S03"
    );
    expect(stale.sprint?.name).toBe("S18");
    expect(stale.sprint?.isCurrent).toBe(true);
  });

  it("una fila leída: Carlos, 0.72 / 0.8 FTE, 30 SP contra 22 habituales, cuatro evidencias", async () => {
    const { items } = await all();
    const carlos = items.find((r) => r.person.id === CARLOS)!;

    expect(carlos).toMatchObject({
      hasIdentity: true,
      sprint: {
        name: "S18",
        startDate: "2026-08-17",
        endDate: "2026-08-30",
        snapshotStatus: "Provisional",
        sealedAt: null,
      },
    });
    // La capacidad se mide: 10 días hábiles menos el festivo del sprint,
    // sobre su 0.8 contractual.
    expect(carlos.capacity).toEqual({
      contractualFte: 0.8,
      availableFte: 0.72,
      breakdown: {
        businessDays: 10,
        holidays: 1,
        vacationDays: 0,
        absenceDays: 0,
        otherUnavailableDays: 0,
      },
      // La misma capacidad en horas, sobre las 80 del Calendario.
      availableHours: 58,
      deductedHours: 6,
    });
    expect(carlos.execution.committedPoints).toBe(30);
    expect(carlos.reference).toMatchObject({
      ownMedian: 22,
      sealedSprintCount: 6,
      sufficient: true,
      ownDeviationPoints: 8,
    });
    expect(carlos.multitasking).toMatchObject({
      concurrentInitiatives: 2,
      committedWorkItems: 6,
      wip: 4,
    });
    expect(carlos.balance).toMatchObject({
      signal: "PossibleOverload",
      overCount: 4,
      underCount: 0,
      squadContext: "Different",
      notEvaluableReason: null,
    });
    // Las seis viajan siempre, incluidas las que no se pudieron evaluar.
    expect(carlos.balance.evidences).toHaveLength(6);
    expect(
      carlos.balance.evidences
        .filter((e) => e.direction === "Over")
        .map((e) => e.id)
    ).toEqual([
      "demandVsOwnHistory",
      "demandPerAvailableFte",
      "unplannedWork",
      "multitasking",
    ]);
    // El sprint en curso no tiene cierre: esas dos no se pueden mirar todavía.
    expect(
      carlos.balance.evidences
        .filter((e) => e.direction === "Unknown")
        .map((e) => e.id)
    ).toEqual(["completion", "carryOver"]);

    expect(carlos.person).toMatchObject({
      name: "Carlos López",
      position: "Arquitecto",
    });
    expect(carlos.person).not.toHaveProperty("availableFte");
    expect(carlos.allocation).toMatchObject({
      squadId: BACKEND,
      squadName: "Backend Platform",
      declaredDedicationPercentage: 100,
    });
  });

  it("la célula que se comporta igual se anota, y los dos cuentan en su indicador", async () => {
    const list = await all();
    const { items } = list;
    const sebastian = items.find((r) => r.person.id === SEBASTIAN)!;
    const paula = items.find((r) => r.person.id === PAULA)!;

    for (const row of [sebastian, paula]) {
      expect(row.allocation?.squadId).toBe(DATOS);
      expect(row.balance.squadContext).toBe("SameDirection");
      // La anotación no atenúa: las tres evidencias siguen contando.
      expect(row.balance.underCount).toBe(3);
      expect(row.balance.signal).toBe("PossibleUnderload");
    }
    // Y por eso los dos aparecen en el indicador de subasignación.
    expect(list.summary.underloadPeople.map((p) => p.id)).toEqual(
      expect.arrayContaining([SEBASTIAN, PAULA])
    );

    // Valentina cae igual de fuerte pero es la única medida de su célula: sin
    // comportamiento de equipo contra el cual contrastar, no hay descuento.
    const valentina = items.find((r) => r.person.id === VALENTINA)!;
    expect(valentina.balance.squadContext).toBe("NoSquad");
    expect(valentina.balance.underCount).toBe(3);
    expect(valentina.balance.signal).toBe("PossibleUnderload");
  });

  it("sin célula sigue siendo evaluable; sin identidad, sin sprints y sin histórico no lo son", async () => {
    const { items } = await all();
    const julian = items.find((r) => r.person.id === JULIAN)!;
    expect(julian.allocation).toBeNull();
    expect(julian.balance.signal).toBe("Usual");
    expect(julian.balance.squadContext).toBe("NoSquad");

    const noEvaluables = {
      [CAMILA]: "NoIdentity",
      [DANIELA]: "NoSprint",
      [ISABELLA]: "InsufficientHistory",
    };
    for (const [personId, reason] of Object.entries(noEvaluables)) {
      const row = items.find((r) => r.person.id === personId)!;
      expect(row.balance.signal).toBe("NotEvaluable");
      expect(row.balance.notEvaluableReason).toBe(reason);
    }
    // Isabella trabaja media jornada: su capacidad se lee sobre 0.50, no 1.0.
    const isabella = items.find((r) => r.person.id === ISABELLA)!;
    expect(isabella.capacity).toMatchObject({
      contractualFte: 0.5,
      availableFte: 0.45,
    });
    expect(isabella.reference.sealedSprintCount).toBe(2);
  });

  it("filtra por célula y búsqueda, pagina, y el resumen no cambia con el filtro", async () => {
    const bySquad = await dedicationService.listCollaborators(
      { squadIds: [DATOS] },
      { page: 1, pageSize: 50 }
    );
    expect(bySquad.items.map((r) => r.person.name).sort()).toEqual([
      "Paula Ramírez",
      "Sebastián Cárdenas",
    ]);
    // Los indicadores describen el sprint de la gente a cargo, no el filtro.
    expect(bySquad.summary.total).toBe(18);

    const bySearch = await dedicationService.listCollaborators(
      { search: "arquitecto" },
      { page: 1, pageSize: 50 }
    );
    expect(bySearch.items.map((r) => r.person.name)).toContain("Carlos López");

    const page2 = await dedicationService.listCollaborators(
      {},
      { page: 2, pageSize: 10 }
    );
    expect(page2.page).toBe(2);
    expect(page2.items).toHaveLength(8);
  });

  it("detalle: sin sprint responde el en curso; con sprint, ese; la tendencia es la misma", async () => {
    const current = await dedicationService.getCollaborator(CARLOS);
    expect(current.hasIdentity).toBe(true);
    expect(current.settings.historyWindowSprints).toBe(6);
    expect(current.sprints.map((s) => s.name)).toEqual([
      "S12",
      "S13",
      "S14",
      "S15",
      "S16",
      "S17",
      "S18",
    ]);
    expect(
      current.sprints.filter((s) => s.isCurrent).map((s) => s.name)
    ).toEqual(["S18"]);
    expect(current.selectedSprint?.name).toBe("S18");

    // Historias de mayor a menor por puntos, con la épica y su iniciativa
    // mapeada, y la marca de las que entraron con el sprint ya arrancado.
    const items = current.selectedSprint!.workItems;
    expect(items.map((w) => w.points)).toEqual([8, 5, 5, 5, 4, 3]);
    expect(items[0]).toMatchObject({
      tag: "Initiative",
      epicId: "ep-kafka",
      epicTitle: "Migración plataforma Kafka",
      initiativeId: "ini-kafka",
      initiativeName: "Kafka Migration",
      board: "Backend Core",
      addedAfterSprintStart: false,
    });
    expect(items[0].url).toContain(String(items[0].number));
    expect(
      items.filter((w) => w.addedAfterSprintStart).map((w) => w.points)
    ).toEqual([5, 3]);

    // 22 SP comprometidos al inicio + 8 que entraron después = 30 trabajados.
    expect(current.selectedSprint!.unplannedWork).toEqual({
      committedAtStartPoints: 22,
      addedDuringSprintPoints: 8,
      totalWorkedPoints: 30,
      unplannedRate: 36.4,
    });

    // Actividad por día dentro del sprint, con los tres tipos.
    const activity = current.selectedSprint!.activity;
    expect(
      activity.every((d) => d.date >= "2026-08-17" && d.date <= "2026-08-30")
    ).toBe(true);
    expect(activity.find((d) => d.date === "2026-08-19")).toEqual({
      date: "2026-08-19",
      commits: 4,
      releases: 1,
      features: 0,
    });

    // Un sprint anterior: sellado, con sus cifras de cierre y su fecha.
    const past = await dedicationService.getCollaborator(CARLOS, "S17");
    expect(past.selectedSprint).toMatchObject({
      name: "S17",
      snapshotStatus: "Sealed",
      execution: {
        committedPoints: 22,
        completedPoints: 20,
        notCompletedPoints: 2,
        completionRate: 90.9,
        carryOverPoints: 2,
        carryOverRate: 9.1,
      },
    });
    expect(past.selectedSprint!.sealedAt).toContain("2026-08-16T23:00");
    expect(past.sprints).toEqual(current.sprints);

    // Un sprint que DevOps ya no devuelve cae al en curso.
    const stale = await dedicationService.getCollaborator(CARLOS, "S03");
    expect(stale.selectedSprint?.name).toBe("S18");

    // Sin identidad y sin sprints: listas vacías, no errores.
    const camila = await dedicationService.getCollaborator(CAMILA);
    expect(camila).toMatchObject({
      hasIdentity: false,
      sprints: [],
      selectedSprint: null,
    });
    const daniela = await dedicationService.getCollaborator(DANIELA);
    expect(daniela).toMatchObject({
      hasIdentity: true,
      sprints: [],
      selectedSprint: null,
    });
  });

  it("un sprint cerrado sin snapshot no entra al histórico y no muestra cifras de cierre", async () => {
    const detail = await dedicationService.getCollaborator(MARIA);
    const missing = detail.sprints.find((s) => s.name === "S15")!;
    expect(missing.snapshotStatus).toBe("Missing");
    expect(missing.sealedAt).toBeNull();
    expect(missing.execution).toMatchObject({
      committedPoints: 22,
      completedPoints: null,
      completionRate: null,
      carryOverPoints: null,
      carryOverRate: null,
    });
    // Seis sprints cerrados, cinco sellados: la ventana efectiva lo dice.
    expect(detail.sprints.filter((s) => !s.isCurrent)).toHaveLength(6);
    expect(detail.selectedSprint!.reference.sealedSprintCount).toBe(5);
  });

  it("la señal sigue a una ausencia aprobada: menos capacidad, más demanda por FTE", async () => {
    const before = (await all()).items.find((r) => r.person.id === MARIA)!;
    expect(before.capacity.availableFte).toBe(0.8);
    expect(before.balance.signal).toBe("Usual");

    // Tres días hábiles más fuera, dentro del sprint en curso.
    const absence = await absenceService.create({
      personId: MARIA,
      type: "Vacation",
      startDate: "2026-08-26",
      endDate: "2026-08-28",
      startsHalfDay: false,
      endsHalfDay: false,
    });
    await absenceService.approve(absence.id);

    const after = (await all()).items.find((r) => r.person.id === MARIA)!;
    expect(after.capacity.breakdown).toMatchObject({
      businessDays: 10,
      holidays: 1,
      vacationDays: 3,
      absenceDays: 1,
    });
    expect(after.capacity.availableFte).toBe(0.5);
    // Los mismos 18 SP en la mitad del tiempo: la demanda por FTE se dispara y
    // la señal deja de ser "Carga habitual".
    expect(after.execution.committedPoints).toBe(18);
    expect(after.balance.signal).toBe("PossibleOverload");
  });

  it("la señal no sigue a lo que la célula declara", async () => {
    const before = (await all()).items.find((r) => r.person.id === CARLOS)!;
    await allocationService.update(before.allocation!.id, {
      dedicationPercentage: 20,
      bauPercentage: 10,
      transformationPercentage: 10,
    });
    const after = (await all()).items.find((r) => r.person.id === CARLOS)!;
    expect(after.allocation!.declaredDedicationPercentage).toBe(20);
    expect(after.balance.signal).toBe(before.balance.signal);
    expect(after.balance.overCount).toBe(before.balance.overCount);
  });

  it("la señal sigue a la ventana de histórico y al mínimo del Calendario", async () => {
    const before = (await all()).items.find((r) => r.person.id === MARIA)!;
    expect(before.reference.sealedSprintCount).toBe(5);
    expect(before.balance.signal).toBe("Usual");

    // Exigir 6 sprints sellados deja a María —que tiene 5— sin evaluar.
    await sprintConfigService.saveConfig({
      weeks: 2,
      sprintsPerQuarter: 6,
      hoursPerSprint: 80,
      sprintCloseTime: "23:00",
      historyWindowSprints: 6,
      minHistorySprints: 6,
    });

    const after = (await all()).items.find((r) => r.person.id === MARIA)!;
    expect(after.balance.signal).toBe("NotEvaluable");
    expect(after.balance.notEvaluableReason).toBe("InsufficientHistory");
    expect(after.reference.sufficient).toBe(false);
  });

  it("actualizar desde DevOps: recalcula lo provisional y no toca lo sellado", async () => {
    const before = await dedicationService.getCollaborator(CARLOS);
    const result = await dedicationService.syncCollaborator(CARLOS);
    const after = await dedicationService.getCollaborator(CARLOS);

    expect(after.lastSyncedAt).toBe(result.lastSyncedAt);
    expect(after.lastSyncedAt).not.toBe(before.lastSyncedAt);
    // Los sellados son el registro de lo que ocurrió al cierre: idénticos.
    const sealedOf = (d: typeof before) =>
      d.sprints.filter((s) => s.snapshotStatus === "Sealed");
    expect(sealedOf(after)).toEqual(sealedOf(before));
    expect(after.selectedSprint?.execution).toEqual(
      before.selectedSprint?.execution
    );
  });

  it("actualizar: 200 con la hora nueva, 404 sin persona, 409 sin identidad", async () => {
    const list = await dedicationService.syncAll();
    expect(list.lastSyncedAt).not.toBe("");
    expect((await all()).lastSyncedAt).toBe(list.lastSyncedAt);

    expect(await status(() => dedicationService.syncCollaborator(CARLOS))).toBe(
      200
    );
    expect(
      await status(() => dedicationService.syncCollaborator("no-existe"))
    ).toBe(404);
    // Camila está en el listado pero sin identidad: no hay a quién consultar.
    expect(await status(() => dedicationService.syncCollaborator(CAMILA))).toBe(
      409
    );
  });

  it("vincular una identidad deja al colaborador en No evaluable · histórico insuficiente", async () => {
    const before = (await all()).items.find((r) => r.person.id === CAMILA)!;
    expect(before.balance.notEvaluableReason).toBe("NoIdentity");

    const user = await personDetailService.searchDevOpsUser(
      "camila.restrepo@tuya.com"
    );
    await personDetailService.linkDevOpsIdentity(CAMILA, user.id);

    const after = (await all()).items.find((r) => r.person.id === CAMILA)!;
    expect(after.hasIdentity).toBe(true);
    expect(after.sprint?.name).toBe("S18");
    expect(after.execution.committedPoints).toBe(10);
    // Un solo sprint sellado contra un mínimo de 3: se ve la demanda, no la señal.
    expect(after.reference.sealedSprintCount).toBe(1);
    expect(after.balance.signal).toBe("NotEvaluable");
    expect(after.balance.notEvaluableReason).toBe("InsufficientHistory");
  });

  it("el detalle de persona trae la señal del sprint en curso con la misma cuenta", async () => {
    const row = (await all()).items.find((r) => r.person.id === ANDRES)!;
    const detail = await personDetailService.getDetail(ANDRES);
    expect(detail.devOpsIdentity?.currentSprint).toMatchObject({
      sprint: { name: row.sprint!.name },
      committedPoints: row.execution.committedPoints,
      ownMedianPoints: row.reference.ownMedian,
      signal: row.balance.signal,
      evidenceCount: row.balance.overCount,
    });
  });

  it("acotado por chapter: un lead sólo lista y abre a su gente", async () => {
    const core = CHAPTERS.find((c) => c.name === "Core y Datos")!;
    setAccessTokenProvider(() => `simulated.${core.leadEntraObjectId}.token`);

    const list = await all();
    const names = list.items.map((r) => r.person.name);
    expect(names).toContain("Carlos López");
    expect(names).not.toContain("Valentina Ospina");
    expect(list.summary.total).toBeLessThan(18);
    // Valentina queda fuera del chapter, pero Paula y Sebastián no: los dos de
    // la célula que cayó entera cuentan en el indicador.
    expect(list.summary.possibleUnderload).toBe(2);

    expect(
      await status(() => dedicationService.getCollaborator(VALENTINA))
    ).toBe(404);
    expect(
      await status(() => dedicationService.syncCollaborator(VALENTINA))
    ).toBe(404);
    expect(await status(() => dedicationService.getCollaborator(CARLOS))).toBe(
      200
    );
  });
});
