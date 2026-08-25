import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import { personService } from "@features/people/services/personService";
import { personDetailService } from "@features/people/services/personDetailService";
import { capacityOverviewService } from "@features/control-tower/services/capacityOverviewService";
import { squadService } from "@features/squads/services/squadService";
import { careerPlanService } from "@features/career-plan/services/careerPlanService";
import { absenceService } from "@features/absences/services/absenceService";
import { billingService } from "@features/billing/services/billingService";
import { backlogService } from "@features/backlog/services/backlogService";
import { CHAPTERS } from "../chapters";
import { getPeopleSnapshot, resetPeopleMock } from "../people.handlers";
import { resetSquadsMock } from "../squads.handlers";
import { resetAllocationsMock } from "../allocations.handlers";

/**
 * El acotado por responsabilidad, visto desde afuera: se pide con el token de
 * un lead y se mira qué vuelve.
 *
 * Las cifras se comparan **derivadas** —contra el propio listado acotado— y no
 * escritas a mano, porque una cifra fija se arregla sola bajando el número
 * hasta que pase. Lo que sí se afirma en firme es que el conjunto acotado es
 * más chico que el universo: sin eso, todo lo demás pasaría igual aunque el
 * acotado no hiciera absolutamente nada.
 */

const [CORE, CANALES, SIN_GENTE] = CHAPTERS;

/** Entrar como alguien: es lo mismo que hace el simulador al montar la sesión. */
function entrarComo(oid: string | null) {
  return setAccessTokenProvider(() => (oid ? `simulated.${oid}.token` : null));
}

const comoLead = (chapter: (typeof CHAPTERS)[number]) =>
  entrarComo(chapter.leadEntraObjectId);

const nombres = async () =>
  (await personService.list(1, 1000)).items.map((p) => p.name).sort();

/**
 * El mes que las semillas de ausencias pueblan: las calculan sobre `new Date()`
 * al cargar el módulo, así que un mes escrito a mano acá dejaría de tener
 * ausencias en cuanto pasara, y las afirmaciones sobre listas vacías pasarían
 * por vacías de verdad.
 */
const MES_CON_AUSENCIAS = (() => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
})();

describe("el dato: chapters y a quién pertenece cada persona", () => {
  beforeEach(() => resetPeopleMock());

  it("le da un chapter a cada persona, y ese chapter existe", () => {
    const ids = new Set(CHAPTERS.map((c) => c.id));
    const sinChapter = getPeopleSnapshot().filter(
      (p) => p.chapterId === null || !ids.has(p.chapterId)
    );
    expect(sinChapter.map((p) => p.name)).toEqual([]);
  });

  it("le da a cada chapter un lead que es una persona sembrada", () => {
    const gente = getPeopleSnapshot();
    for (const c of CHAPTERS) {
      const lead = gente.find((p) => p.name === c.leadName);
      expect(lead, `${c.name} sin lead sembrado`).toBeDefined();
      // Con su `oid`, que es la llave con la que el servidor lo reconoce.
      expect(lead!.entraObjectId).toBe(c.leadEntraObjectId);
    }
  });

  it("puebla más de un chapter, que es lo que hace probable la regla", () => {
    const porChapter = CHAPTERS.map((c) => ({
      chapter: c.name,
      gente: getPeopleSnapshot().filter((p) => p.chapterId === c.id).length,
    }));
    const poblados = porChapter.filter((c) => c.gente > 0);
    // Con un solo chapter poblado, acotar y no acotar dan lo mismo, y el
    // problema que este cambio corrige podría volver sin que nada fallara.
    expect(poblados.length).toBeGreaterThanOrEqual(2);
    // Y uno sin gente, a propósito: es el que ejercita el estado vacío.
    expect(porChapter.find((c) => c.gente === 0)?.chapter).toBe(SIN_GENTE.name);
  });
});

describe("el acotado lo hace el servidor", () => {
  let salir = () => {};

  beforeEach(() => {
    resetPeopleMock();
    resetSquadsMock();
    resetAllocationsMock();
  });
  afterEach(() => salir());

  it("devuelve a cada lead sólo su gente, y el conjunto cambia entero al cambiar de lead", async () => {
    salir = entrarComo(null);
    const universo = await nombres();

    salir();
    salir = comoLead(CORE);
    const core = await nombres();

    salir();
    salir = comoLead(CANALES);
    const canales = await nombres();

    // Cada uno ve menos que el universo: es lo que prueba que el acotado
    // efectivamente ocurre, y no que las cifras coinciden de casualidad.
    expect(core.length).toBeLessThan(universo.length);
    expect(canales.length).toBeLessThan(universo.length);
    // Sin nadie repetido entre los dos, y entre los dos, todos.
    expect(core.filter((n) => canales.includes(n))).toEqual([]);
    expect([...core, ...canales].sort()).toEqual(universo);
  });

  it("no le devuelve a un lead ni una persona de otro chapter", async () => {
    salir = comoLead(CANALES);
    const { items } = await personService.list(1, 1000);
    expect(items).not.toHaveLength(0);
    expect(items.every((p) => p.chapterId === CANALES.id)).toBe(true);
  });

  it("le devuelve una lista vacía —y no un error— al lead de un chapter sin personas", async () => {
    salir = comoLead(SIN_GENTE);
    const { items, totalCount } = await personService.list(1, 1000);
    expect(items).toEqual([]);
    expect(totalCount).toBe(0);
    // Y las demás pantallas del rol, lo mismo: vacías, no rotas.
    await expect(capacityOverviewService.getOverview()).resolves.toMatchObject({
      peopleTotal: 0,
      people: [],
    });
    await expect(careerPlanService.getSpan()).resolves.toMatchObject({
      people: [],
    });
    await expect(
      absenceService.getByMonth(MES_CON_AUSENCIAS)
    ).resolves.toMatchObject({ items: [] });
    // Y el backlog, que es la otra cola de trabajo del rol.
    await expect(backlogService.getQueue({})).resolves.toMatchObject({
      items: [],
    });
  });

  it("acota también las pantallas que no listan personas pero cuentan sobre ellas", async () => {
    salir = comoLead(CANALES);
    const mios = (await personService.list(1, 1000)).items;
    const idsMios = new Set(mios.map((p) => p.id));

    const [stats, overview, squadStats, span, resumen, ausencias, cola] =
      await Promise.all([
        personService.getStats(),
        capacityOverviewService.getOverview(),
        squadService.getStats(),
        careerPlanService.getSpan(),
        careerPlanService.getSpanSummary(),
        absenceService.getByMonth(MES_CON_AUSENCIAS),
        backlogService.getQueue({}),
      ]);

    // Los tres indicadores de Personas, la Torre y Células cuentan lo mismo.
    expect(stats.activeCount).toBe(mios.length);
    expect(stats.fteAvailable).toBeCloseTo(
      mios.reduce((acc, p) => acc + p.availableFte, 0),
      5
    );
    expect(overview.peopleTotal).toBe(mios.length);
    expect(overview.chapterFte).toBeCloseTo(stats.fteAvailable, 5);
    expect(squadStats.chapterFte).toBeCloseTo(stats.fteAvailable, 5);
    // Competencias, sobre la misma gente.
    expect(span.people).toHaveLength(mios.length);
    expect(resumen.totalPeople).toBe(mios.length);
    // Y las ausencias del mes y las historias de la cola son de gente suya,
    // no de cualquiera. Se exige que haya algo que mirar: `every` sobre una
    // lista vacía es verdad y no probaría nada.
    expect(ausencias.items).not.toHaveLength(0);
    expect(ausencias.items.every((a) => idsMios.has(a.personId))).toBe(true);
    expect(cola.items).not.toHaveLength(0);
    expect(cola.items.every((s) => idsMios.has(s.personId!))).toBe(true);
  });

  it("acota las asignaciones junto con las personas, para que las cifras cierren", async () => {
    salir = comoLead(CORE);
    const overview = await capacityOverviewService.getOverview();

    // La trampa del cambio: si se acotan las personas y no sus asignaciones,
    // la dedicación de gente ajena sigue sumando al BAU mientras su FTE
    // disponible ya no suma, y el FTE libre del chapter se va a negativo.
    expect(overview.freeFte).toBeGreaterThanOrEqual(0);
    expect(overview.bauFte + overview.transformationFte).toBeLessThanOrEqual(
      overview.chapterFte + 0.001
    );
    // Y el equipo de una célula no nombra a nadie que el lead no vea.
    const mios = new Set(overview.people.map((p) => p.id));
    const conEquipo = overview.squads.find((s) => s.memberCount > 0);
    expect(conEquipo, "ninguna célula con equipo visible").toBeDefined();
    const equipo = await squadService.getTeamStats(conEquipo!.id);
    expect(equipo.members).not.toHaveLength(0);
    expect(equipo.members.every((m) => mios.has(m.id))).toBe(true);
  });

  it("acota la serie histórica de brechas, no sólo la foto de hoy", async () => {
    salir = comoLead(CORE);
    const core = await careerPlanService.getSpanSummary();
    // Las evaluaciones cerradas sembradas son todas de gente de Core y Datos.
    expect(core.evaluatedPeople).toBeGreaterThan(0);
    expect(core.trend.length).toBeGreaterThan(0);

    salir();
    salir = comoLead(CANALES);
    const canales = await careerPlanService.getSpanSummary();
    // Su gente no tiene ninguna evaluación cerrada, así que no hay historia
    // que dibujar. La tarjeta de tendencia sacaba la serie de un snapshot sin
    // acotar: mostraba la historia de Core al lado de un total en cero, y el
    // delta comparaba contra un ciclo de otro chapter.
    expect(canales.evaluatedPeople).toBe(0);
    expect(canales.trend).toEqual([]);
    expect(canales.previousCycle).toBeNull();
  });

  it("no le muestra a un lead los planes vencidos de otro chapter", async () => {
    salir = comoLead(CORE);
    const antes = await careerPlanService.getSpanSummary();
    // Una acción sólo puede nacer de una brecha registrada, así que la persona
    // y la habilidad salen del propio span en vez de escribirse a mano.
    const span = await careerPlanService.getSpan();
    const persona = span.people.find((p) =>
      p.cells.some((c) => (c.gap ?? 0) > 0)
    )!;
    const celda = persona.cells.find((c) => (c.gap ?? 0) > 0)!;
    await careerPlanService.createAction(persona.personId, {
      skillId: celda.skillId,
      targetLevel: celda.expectedLevel as 1 | 2 | 3 | 4,
      dueMonth: "2020-01",
      title: "Compromiso que ya venció",
    });

    // Para su lead es trabajo pendiente…
    const despues = await careerPlanService.getSpanSummary();
    expect(despues.pending.overduePlans).toBe(antes.pending.overduePlans + 1);

    // …y para el de al lado no existe: es de una persona que ni siquiera
    // aparece en su matriz, y cuyo plan no puede abrir.
    salir();
    salir = comoLead(CANALES);
    const ajeno = await careerPlanService.getSpanSummary();
    expect(ajeno.pending.overduePlans).toBe(0);
  });

  it("acota la facturación, que también enumera personas", async () => {
    salir = entrarComo(null);
    const todas = await billingService.listPeriod("2026-07");

    salir();
    salir = comoLead(CORE);
    const mias = await billingService.listPeriod("2026-07");
    const gente = new Set(
      (await personService.list(1, 1000)).items.map((p) => p.id)
    );

    expect(mias.length).toBeLessThan(todas.length);
    expect(mias.every((p) => gente.has(p.personId))).toBe(true);
  });

  it("deja el catálogo de stacks quieto: no es una cifra de personas", async () => {
    salir = entrarComo(null);
    const completo = await personService.getStackCatalog();

    salir();
    salir = comoLead(SIN_GENTE);
    // Un lead sin gente no ve menos catálogo: el catálogo es del sistema y no
    // depende de a quién tenga a cargo quien mira.
    expect(completo.length).toBeGreaterThan(0);
    await expect(personService.getStackCatalog()).resolves.toEqual(completo);
  });
});

describe("una sola relación de responsabilidad", () => {
  let salir = () => {};
  beforeEach(() => resetPeopleMock());
  afterEach(() => salir());

  it("le muestra a cada persona el mismo lead que la ve en su listado", async () => {
    // Para cada lead: la gente que aparece en SU listado tiene que decir, en
    // su ficha, que él es su Chapter Lead. Es la contradicción que el cambio
    // cierra — antes la ficha nombraba al líder de la línea de expertise, que
    // puede ser alguien que no la ve en ninguna de sus pantallas.
    for (const chapter of [CORE, CANALES]) {
      salir();
      salir = comoLead(chapter);
      const { items } = await personService.list(1, 1000);
      expect(items.length).toBeGreaterThan(0);

      for (const persona of items) {
        const ficha = await personDetailService.getDetail(persona.id);
        expect(ficha.chapterName).toBe(chapter.name);
        expect(ficha.chapterLeadName).toBe(chapter.leadName);
      }
    }
  });

  it("no confunde al líder de la línea de expertise con el del chapter", async () => {
    salir = comoLead(CORE);
    // María lidera la línea Backend y pertenece a Core y Datos, que lidera
    // otra persona: los dos campos existen y dicen cosas distintas.
    const maria = getPeopleSnapshot().find((p) => p.name === "María González")!;
    const ficha = await personDetailService.getDetail(maria.id);
    expect(ficha.expertiseLineName).toBe("Backend");
    expect(ficha.expertiseLineLeadName).toBe("María González");
    // Dos nombres distintos en la misma ficha: es lo que hace que importe
    // cuál de las dos relaciones decide el alcance.
    expect(ficha.chapterLeadName).toBe(CORE.leadName);
  });
});
