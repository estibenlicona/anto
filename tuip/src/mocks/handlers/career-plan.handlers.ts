import { http, HttpResponse } from "msw";
import type {
  PersonPlanDto,
  PlanActionStatus,
  PlanSkillDto,
  SpanCellDto,
  SpanMatrixDto,
  SpanPersonDto,
  SpanSummaryDto,
} from "@features/career-plan/services/careerPlanService";
import type { SkillLevel } from "@features/skills/services/skillsService";
import { getSkillsCatalogSnapshot } from "./skills.handlers";
import {
  getClosedAssessmentsSnapshot,
  type ClosedAssessmentSnapshot,
} from "./assessments.handlers";
import { getPeopleSnapshot, peopleFor } from "./people.handlers";
import { actionSeeds } from "./career-plan.seeds";

const SPAN_URL = "/career-plan/span";
const SPAN_SUMMARY_URL = "/career-plan/span/summary";

/** Cuántas habilidades entran al bloque de foco. Cuatro es lo que la columna sostiene sin volverse una lista. */
const TOP_SKILLS = 4;
const PLAN_URL = "/career-plan/people/:personId/plan";

/**
 * La evaluación cerrada más reciente de una persona: la del ciclo más alto, no
 * la última del arreglo.
 *
 * El orden del arreglo dejó de alcanzar cuando entraron las semillas de
 * ciclos anteriores: una evaluación vieja que llegue después pisaría a la
 * vigente, y el mapa mostraría niveles de hace un semestre sin avisar. Los
 * ciclos se ordenan como texto porque su forma `AAAA-SN` ya ordena así.
 */
function latestClosed(
  closed: ClosedAssessmentSnapshot[],
  personId: string
): ClosedAssessmentSnapshot | undefined {
  return closed
    .filter((a) => a.personId === personId)
    .sort((a, b) => a.cycle.localeCompare(b.cycle))
    .slice(-1)[0];
}

/**
 * El span no tiene estado propio: es la lectura cruzada de dos snapshots que
 * ya existen —el catálogo y las evaluaciones cerradas— sobre las personas del
 * chapter.
 */
function buildSpan(request: Request): SpanMatrixDto {
  const catalog = getSkillsCatalogSnapshot();
  const closed = getClosedAssessmentsSnapshot();
  // Las personas del chapter de quien pidió: el span es la foto de su gente.
  const people = peopleFor(request);

  // Sólo las activas: una habilidad retirada del catálogo no es algo sobre lo
  // que el líder pueda actuar hoy, aunque siga en evaluaciones anteriores.
  const skills = catalog.skills.filter((s) => s.active);

  const rows: SpanPersonDto[] = people.map((person) => {
    // La cerrada más reciente de la persona: es la que describe dónde está hoy.
    const assessment = latestClosed(closed, person.id);

    const cells: SpanCellDto[] = skills.map((skill) => {
      const evaluated = assessment?.skills.find((s) => s.skillId === skill.id);
      const level = evaluated?.level ?? null;
      // El exigido sale del catálogo vigente y del rol de esta fila. La
      // evaluación cerrada guarda el suyo, pero para leer el span hoy interesa
      // lo que el rol pide ahora: es contra eso que hay trabajo por hacer.
      const expectedLevel =
        skill.expectations.find((e) => e.position === person.position)?.level ??
        null;

      return {
        skillId: skill.id,
        level,
        expectedLevel,
        gap:
          level === null || expectedLevel === null
            ? null
            : Math.max(0, expectedLevel - level),
      };
    });

    return {
      personId: person.id,
      personName: person.name,
      position: person.position,
      evaluated: assessment !== undefined,
      cells,
    };
  });

  return {
    skills: skills.map((s) => ({
      skillId: s.id,
      skillName: s.name,
      group: s.group,
    })),
    people: rows,
  };
}

interface StoredAction {
  id: string;
  personId: string;
  skillId: string;
  fromLevel: SkillLevel;
  targetLevel: SkillLevel;
  dueMonth: string;
  title: string;
  status: PlanActionStatus;
}

/**
 * Las acciones son lo único con estado propio de esta capacidad: el perfil se
 * deriva de la evaluación y del catálogo, pero un acuerdo con una persona no
 * se puede derivar de nada.
 */
let actions: StoredAction[] = [];

export function resetCareerPlanMock() {
  actions = actionSeeds.map((a) => ({ ...a }));
}

/**
 * El perfil de una persona: lo que su evaluación cerrada registró, resuelto
 * contra el nivel que su rol pide hoy.
 *
 * Los criterios cumplidos y los faltantes no se recalculan acá: salen de lo
 * que la evaluación marcó. Es lo que hace que la conversación se apoye en el
 * criterio exacto y no en una impresión.
 */
function buildPlan(personId: string): PersonPlanDto | null {
  const person = getPeopleSnapshot().find((p) => p.id === personId);
  if (!person) return null;

  const catalog = getSkillsCatalogSnapshot();
  const assessment = latestClosed(getClosedAssessmentsSnapshot(), personId);

  const skills: PlanSkillDto[] = (assessment?.skills ?? [])
    .filter((s) => s.level !== null)
    .map((s) => {
      const catalogSkill = catalog.skills.find((c) => c.id === s.skillId);
      const expectedLevel =
        catalogSkill?.expectations.find((e) => e.position === person.position)
          ?.level ?? null;
      const level = s.level as SkillLevel;
      const gap =
        expectedLevel === null ? null : Math.max(0, expectedLevel - level);

      const atLevel = s.levels[level - 1];
      const expected =
        expectedLevel === null ? null : s.levels[expectedLevel - 1];

      return {
        skillId: s.skillId,
        skillName: s.skillName,
        group: s.group,
        level,
        expectedLevel,
        gap,
        metCriteria: atLevel.criteria.filter((c) => c.met).map((c) => c.text),
        levelTotal: atLevel.criteria.length,
        // Sólo con brecha: sin ella no hay un nivel siguiente que el sistema
        // deba inventar como exigencia.
        missingCriteria:
          gap !== null && gap > 0 && expected
            ? expected.criteria.filter((c) => !c.met).map((c) => c.text)
            : [],
        expectedTotal: expected?.criteria.length ?? 0,
        note: s.note,
      };
    });

  return {
    personId: person.id,
    personName: person.name,
    position: person.position,
    assessmentClosedAtUtc: assessment?.closedAtUtc ?? null,
    cycle: assessment?.cycle ?? null,
    skills,
    actions: actions
      .filter((a) => a.personId === personId)
      .map((a) => ({
        ...a,
        skillName:
          skills.find((s) => s.skillId === a.skillId)?.skillName ??
          catalog.skills.find((c) => c.id === a.skillId)?.name ??
          "",
      })),
  };
}

/** Sólo lectura del agregado del span. */
export function getSpanSnapshot(request: Request): SpanMatrixDto {
  return buildSpan(request);
}

/**
 * Las brechas de un ciclo: se recorre la evaluación cerrada de ese ciclo, no
 * la vigente, y se compara contra lo que el rol pide **hoy**.
 *
 * Comparar el pasado contra la exigencia de hoy es deliberado: si el catálogo
 * subió el nivel de una habilidad, la lectura honesta es "esto es lo que
 * faltaba entonces para lo que pedimos ahora". Con la exigencia de cada época,
 * la serie mezclaría dos varas y una mejora podría deberse a que bajamos el
 * listón.
 */
function gapsInCycle(cycle: string, request: Request): number {
  const catalog = getSkillsCatalogSnapshot();
  // La serie histórica se acota igual que la foto de hoy: si no, la tarjeta
  // de tendencia contaría brechas de gente de otro chapter al lado de un
  // total que no las cuenta, y las dos cifras se contradirían en la misma
  // fila. Es la misma trampa que el resto del resumen ya evita.
  const delChapter = new Set(peopleFor(request).map((p) => p.id));

  // Una por persona, no una por evaluación cerrada: nada impide cerrar dos en
  // el mismo ciclo, y sumarlas contaría dos veces las brechas de esa persona.
  // Se queda la última, que es la que describe cómo terminó el ciclo.
  const porPersona = new Map<string, ClosedAssessmentSnapshot>();
  for (const a of getClosedAssessmentsSnapshot()) {
    if (a.cycle === cycle && delChapter.has(a.personId))
      porPersona.set(a.personId, a);
  }
  const closed = [...porPersona.values()];

  return closed.reduce((total, assessment) => {
    const person = getPeopleSnapshot().find(
      (p) => p.id === assessment.personId
    );
    if (!person) return total;

    const conBrecha = assessment.skills.filter((s) => {
      if (s.level === null) return false;
      const skill = catalog.skills.find((c) => c.id === s.skillId);
      if (!skill?.active) return false;
      const expected =
        skill.expectations.find((e) => e.position === person.position)?.level ??
        null;
      return expected !== null && expected - s.level > 0;
    });

    return total + conBrecha.length;
  }, 0);
}

/**
 * La lectura de situación del chapter. Se calcula acá y no en el cliente
 * porque dos de sus cifras viven en los planes individuales: pedirlas desde la
 * pantalla serían tantas peticiones como personas tenga el chapter.
 */
function buildSpanSummary(request: Request): SpanSummaryDto {
  const span = buildSpan(request);
  const catalog = getSkillsCatalogSnapshot();

  const conBrecha = (person: SpanPersonDto) =>
    person.evaluated
      ? person.cells.filter((c) => c.gap !== null && c.gap > 0)
      : [];

  const brechas = span.people.flatMap(conBrecha);
  const evaluadas = span.people.filter((p) => p.evaluated);

  const peopleAtRisk = span.people
    .map((p) => ({
      personId: p.personId,
      personName: p.personName,
      gapCount: conBrecha(p).length,
    }))
    .filter((p) => p.gapCount >= 3)
    .sort(
      (a, b) =>
        b.gapCount - a.gapCount || a.personName.localeCompare(b.personName)
    );

  // ── La serie ─────────────────────────────────────────────────────────────
  // Los ciclos cerrados que existen, del más viejo al más nuevo. Sin
  // historial queda un solo punto, que es la verdad: no hay contra qué
  // comparar todavía.
  const delChapter = new Set(span.people.map((p) => p.personId));
  const ciclos = [
    ...new Set(
      getClosedAssessmentsSnapshot()
        .filter((a) => delChapter.has(a.personId))
        .map((a) => a.cycle)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const trend = ciclos.map((cycle) => ({
    cycle,
    totalGaps: gapsInCycle(cycle, request),
  }));
  const previousCycle = trend.length >= 2 ? trend[trend.length - 2] : null;

  // ── Dónde se concentra ───────────────────────────────────────────────────
  const topSkills = span.skills
    .map((skill) => {
      const celdas = span.people
        .filter((p) => p.evaluated)
        .map((p) => p.cells.find((c) => c.skillId === skill.skillId))
        .filter((c): c is NonNullable<typeof c> => c !== undefined)
        .filter((c) => c.gap !== null && c.gap > 0);

      return {
        skillId: skill.skillId,
        skillName: skill.skillName,
        // El peso suma niveles y no personas: tres a un nivel y tres a tres no
        // son el mismo problema, y ordenar por cantidad los empataría.
        weight: celdas.reduce((a, c) => a + (c.gap ?? 0), 0),
        peopleWithGap: celdas.length,
        expectedLevel: celdas.reduce<SkillLevel | null>(
          (max, c) =>
            c.expectedLevel !== null && (max === null || c.expectedLevel > max)
              ? c.expectedLevel
              : max,
          null
        ),
      };
    })
    .filter((s) => s.weight > 0)
    .sort(
      (a, b) => b.weight - a.weight || a.skillName.localeCompare(b.skillName)
    )
    .slice(0, TOP_SKILLS);

  // ── Lo que falta gestionar ───────────────────────────────────────────────
  // En hora local y no en UTC: los compromisos se escriben en el huso de
  // quien los acordó, y con toISOString las últimas horas de cada mes caían
  // en el siguiente y volvían "vencido" lo que no lo estaba.
  const ahora = new Date();
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  // De su gente: un plan vencido es trabajo pendiente de quien tiene a esa
  // persona a cargo, y empujar a un lead a resolver el de otro chapter es
  // mandarlo a una pantalla que ni siquiera puede abrir.
  const vencidas = actions.filter(
    (a) =>
      a.status === "InProgress" &&
      a.dueMonth < mesActual &&
      delChapter.has(a.personId)
  );

  // Una brecha sin plan es un par persona-habilidad sin ninguna acción, no una
  // persona sin acciones: alguien puede tener plan para una brecha y ninguna
  // para las otras dos.
  const gapsWithoutPlan = span.people.reduce(
    (total, person) =>
      total +
      conBrecha(person).filter(
        (c) =>
          // Sólo las acciones en curso cuentan como plan: cumplir una acción no
          // cierra la brecha —eso es reevaluar—, así que una brecha cuya única
          // acción ya terminó vuelve a estar sin plan.
          !actions.some(
            (a) =>
              a.personId === person.personId &&
              a.skillId === c.skillId &&
              a.status === "InProgress"
          )
      ).length,
    0
  );

  // Cargos del chapter sin nivel declarado en alguna habilidad activa: es lo
  // que produce las celdas que no se pueden medir. Por cargo y no por rol: lo
  // que se le exige a alguien depende de a qué se dedica, no de cómo participa
  // en la aplicación.
  const positions = [...new Set(peopleFor(request).map((p) => p.position))];
  const activas = catalog.skills.filter((s) => s.active);
  // El catálogo lista **todos** los cargos en cada habilidad y deja el nivel
  // en `null` cuando no lo declara: preguntar si el cargo está en la lista
  // devuelve siempre que sí, y el pendiente quedaba clavado en cero. Lo que
  // falta es el nivel, no la fila.
  const positionsWithoutLevel = positions.filter((position) =>
    activas.some(
      (s) =>
        (s.expectations.find((e) => e.position === position)?.level ?? null) ===
        null
    )
  ).length;

  return {
    totalGaps: brechas.length,
    criticalGaps: brechas.filter((c) => (c.gap ?? 0) >= 2).length,
    evaluatedPeople: evaluadas.length,
    totalPeople: span.people.length,
    peopleAtRisk,
    previousCycle,
    trend,
    topSkills,
    pending: {
      unassessed: span.people.length - evaluadas.length,
      overduePlans: vencidas.length,
      positionsWithoutLevel,
      gapsWithoutPlan,
    },
  };
}

function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 });
}

function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 });
}

const MONTH = /^\d{4}-\d{2}$/;

export const careerPlanHandlers = [
  // Antes que el del span: msw resuelve por orden y  no debe comerse
  // a .
  http.get(SPAN_SUMMARY_URL, ({ request }) =>
    HttpResponse.json(buildSpanSummary(request))
  ),

  http.get(SPAN_URL, ({ request }) => HttpResponse.json(buildSpan(request))),

  http.get(PLAN_URL, ({ params }) => {
    const plan = buildPlan(String(params.personId));
    return plan ? HttpResponse.json(plan) : notFound("Persona no encontrada");
  }),

  http.post(`${PLAN_URL}/actions`, async ({ params, request }) => {
    const personId = String(params.personId);
    const plan = buildPlan(personId);
    if (!plan) return notFound("Persona no encontrada");

    const body = (await request.json().catch(() => null)) as {
      skillId?: unknown;
      targetLevel?: unknown;
      dueMonth?: unknown;
      title?: unknown;
    } | null;

    const skillId = typeof body?.skillId === "string" ? body.skillId : "";
    const skill = plan.skills.find((s) => s.skillId === skillId);
    if (!skill) {
      return badRequest(
        "La acción tiene que nacer de una habilidad evaluada de esta persona"
      );
    }
    // Es lo que evita que el plan se vuelva una lista de cursos sueltos: sin
    // brecha registrada no hay nada que la acción esté cerrando.
    if (skill.gap === null || skill.gap === 0) {
      return badRequest(
        `No hay brecha registrada en ${skill.skillName}: una acción del plan existe para cerrar algo concreto`
      );
    }

    const targetLevel = Number(body?.targetLevel);
    if (
      targetLevel !== 1 &&
      targetLevel !== 2 &&
      targetLevel !== 3 &&
      targetLevel !== 4
    ) {
      return badRequest(
        "El nivel objetivo debe estar en la escala de cuatro pasos"
      );
    }
    if (targetLevel <= skill.level) {
      return badRequest(
        "El nivel objetivo tiene que estar por encima del que tiene hoy"
      );
    }

    const dueMonth =
      typeof body?.dueMonth === "string" ? body.dueMonth.trim() : "";
    if (!MONTH.test(dueMonth)) {
      return badRequest(
        "El compromiso se expresa como mes, en formato YYYY-MM"
      );
    }

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return badRequest("La acción necesita un título");

    actions.push({
      id: crypto.randomUUID(),
      personId,
      skillId,
      fromLevel: skill.level,
      targetLevel,
      dueMonth,
      title,
      status: "InProgress",
    });

    return HttpResponse.json(buildPlan(personId), { status: 201 });
  }),

  http.put(
    `${PLAN_URL}/actions/:actionId/status`,
    async ({ params, request }) => {
      const personId = String(params.personId);
      const action = actions.find(
        (a) => a.id === String(params.actionId) && a.personId === personId
      );
      if (!action) return notFound("Acción no encontrada");

      const body = (await request.json().catch(() => null)) as {
        status?: unknown;
      } | null;
      if (body?.status !== "Done" && body?.status !== "InProgress") {
        return badRequest("Estado inválido");
      }

      // Cumplir la acción no toca la brecha: la brecha se deriva del nivel
      // evaluado, y sólo una evaluación posterior puede moverlo.
      action.status = body.status;
      return HttpResponse.json(buildPlan(personId));
    }
  ),
];

resetCareerPlanMock();
