import { http, HttpResponse } from "msw";
import type {
  AssessmentDto,
  AssessmentSkillDto,
} from "@features/assessments/services/assessmentService";
import {
  currentCycle,
  cycleBefore,
} from "@features/assessments/services/assessmentService";
import type {
  SkillDto,
  SkillLevel,
  SkillsCatalogDto,
} from "@features/skills/services/skillsService";
import {
  getSkillsCatalogSnapshot,
  getSkillsCatalogVersion,
  setSkillUsageLookup,
} from "./skills.handlers";
import { getPeopleSnapshot } from "./people.handlers";
import { assessmentSeeds } from "./assessments.seeds";

const ASSESSMENT_URL = "/people/:personId/assessment";

interface StoredSkill {
  skillId: string;
  level: SkillLevel | null;
  /** Textos marcados por nivel; índice 0..3 = niveles 1..4. */
  met: string[][];
  note: string;
}

interface StoredAssessment {
  id: string;
  personId: string;
  cycle: string;
  closed: boolean;
  /** Estampada al cerrar. Mientras está en curso se resuelve contra la vigente. */
  catalogVersion: number | null;
  closedAtUtc: string | null;
  skills: StoredSkill[];
}

let assessments: StoredAssessment[] = [];

/**
 * El catálogo pregunta qué habilidades están en uso para no dejar borrar una
 * que alguna evaluación ya usó. Desde acá la respuesta es la real: la semilla
 * que traía `skills.handlers` deja de participar.
 */
function registerUsageLookup() {
  setSkillUsageLookup((skillId) =>
    assessments.some(
      (a) =>
        a.closed &&
        a.skills.some((s) => s.skillId === skillId && s.level !== null)
    )
  );
}

/** Cuándo se cerró una evaluación de hace `cyclesAgo` semestres. */
function closedAt(cyclesAgo: number): string {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - cyclesAgo * 6);
  return fecha.toISOString();
}

function seedAssessments(): StoredAssessment[] {
  const catalog = getSkillsCatalogSnapshot();
  const cycle = currentCycle();

  return assessmentSeeds.map((seed) => ({
    id: seed.id,
    personId: seed.personId,
    // Las semillas de historial declaran cuántos ciclos atrás quedaron; el
    // resto es el ciclo vigente.
    cycle: seed.cyclesAgo ? cycleBefore(cycle, seed.cyclesAgo) : cycle,
    closed: seed.closed,
    catalogVersion: seed.closed ? catalog.version : null,
    // Un ciclo es un semestre: la evaluación de hace dos ciclos no puede
    // haberse cerrado hoy, o el plan de la persona diría que se evaluó dos
    // veces el mismo día.
    closedAtUtc: seed.closed ? closedAt(seed.cyclesAgo ?? 0) : null,
    skills: seed.skills.map((s) => {
      const skill = catalog.skills.find((c) => c.id === s.skillId);
      return {
        skillId: s.skillId,
        level: s.level,
        // La semilla dice cuántos criterios marcar y acá se resuelven contra
        // el catálogo: así nunca queda un texto marcado que el catálogo no
        // tenga, ni al revés.
        met: [0, 1, 2, 3].map((i) =>
          (skill?.levels[i].criteria ?? []).slice(0, s.metCounts[i])
        ),
        note: s.note,
      };
    }),
  }));
}

export function resetAssessmentsMock() {
  assessments = seedAssessments();
  registerUsageLookup();
}

/**
 * El catálogo con el que se resuelve una evaluación: el estampado si está
 * cerrada, el vigente si sigue en curso. Es lo que hace que una evaluación
 * cerrada no se mueva cuando los criterios cambian.
 */
function catalogFor(assessment: StoredAssessment): SkillsCatalogDto {
  if (assessment.catalogVersion === null) return getSkillsCatalogSnapshot();
  return (
    getSkillsCatalogVersion(assessment.catalogVersion) ??
    getSkillsCatalogSnapshot()
  );
}

function personOf(personId: string) {
  return getPeopleSnapshot().find((p) => p.id === personId);
}

/**
 * Las habilidades que la evaluación recorre: las activas del catálogo, más
 * cualquiera que esta evaluación ya haya usado — una habilidad desactivada
 * después no puede desaparecer de lo que ya se evaluó con ella.
 */
function skillsInScope(
  assessment: StoredAssessment,
  catalog: SkillsCatalogDto
): SkillDto[] {
  const used = new Set(assessment.skills.map((s) => s.skillId));
  return catalog.skills.filter((s) => s.active || used.has(s.id));
}

function toSkillDto(
  skill: SkillDto,
  stored: StoredSkill | undefined,
  position: string
): AssessmentSkillDto {
  const met = stored?.met ?? [[], [], [], []];
  const level = stored?.level ?? null;
  const expectedLevel =
    skill.expectations.find((e) => e.position === position)?.level ?? null;

  // La brecha no se guarda: se deriva del nivel y de lo exigido. Guardarla
  // sería poder quedar desincronizada con el nivel que la produce.
  const gap =
    level === null || expectedLevel === null
      ? null
      : Math.max(0, expectedLevel - level);

  const expectedCriteria =
    expectedLevel === null ? [] : skill.levels[expectedLevel - 1].criteria;
  const markedAtExpected =
    expectedLevel === null ? [] : (met[expectedLevel - 1] ?? []);

  return {
    skillId: skill.id,
    skillName: skill.name,
    group: skill.group,
    level,
    note: stored?.note ?? "",
    levels: skill.levels.map((l) => ({
      level: l.level,
      criteria: l.criteria.map((text) => ({
        text,
        met: (met[l.level - 1] ?? []).includes(text),
      })),
    })),
    expectedLevel,
    gap,
    // Sólo tiene sentido como contenido de una brecha abierta.
    missingCriteria:
      gap !== null && gap > 0
        ? expectedCriteria.filter((c) => !markedAtExpected.includes(c))
        : [],
  };
}

function toDto(assessment: StoredAssessment): AssessmentDto | null {
  const person = personOf(assessment.personId);
  if (!person) return null;

  const catalog = catalogFor(assessment);
  const scope = skillsInScope(assessment, catalog);

  return {
    id: assessment.id,
    personId: assessment.personId,
    personName: person.name,
    position: person.position,
    cycle: assessment.cycle,
    status: assessment.closed ? "Closed" : "InProgress",
    catalogVersion: assessment.catalogVersion ?? catalog.version,
    closedAtUtc: assessment.closedAtUtc,
    skills: scope.map((skill) =>
      toSkillDto(
        skill,
        assessment.skills.find((s) => s.skillId === skill.id),
        person.position
      )
    ),
  };
}

/** Sólo lectura de lo cerrado, para la matriz del span y el plan individual. */
export interface ClosedAssessmentSnapshot {
  personId: string;
  personName: string;
  position: string;
  cycle: string;
  catalogVersion: number;
  closedAtUtc: string | null;
  skills: AssessmentSkillDto[];
}

export function getClosedAssessmentsSnapshot(): ClosedAssessmentSnapshot[] {
  return assessments
    .filter((a) => a.closed)
    .map((a) => toDto(a))
    .filter((dto): dto is AssessmentDto => dto !== null)
    .map((dto) => ({
      personId: dto.personId,
      personName: dto.personName,
      position: dto.position,
      cycle: dto.cycle,
      catalogVersion: dto.catalogVersion,
      closedAtUtc: dto.closedAtUtc,
      skills: dto.skills,
    }));
}

function badRequest(message: string, extra?: Record<string, unknown>) {
  return HttpResponse.json({ message, ...extra }, { status: 400 });
}

function findInProgress(personId: string, cycle: string) {
  return assessments.find(
    (a) => a.personId === personId && a.cycle === cycle && !a.closed
  );
}

function findLastClosed(personId: string, cycle: string) {
  const closed = assessments.filter(
    (a) => a.personId === personId && a.cycle === cycle && a.closed
  );
  return closed[closed.length - 1];
}

export const assessmentsHandlers = [
  http.get(ASSESSMENT_URL, ({ params, request }) => {
    const personId = String(params.personId);
    const cycle =
      new URL(request.url).searchParams.get("cycle") ?? currentCycle();
    if (!personOf(personId)) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }

    // La en curso primero: es la que se está trabajando. Sin ninguna, la
    // última cerrada, que es lo que hay para leer.
    const found =
      findInProgress(personId, cycle) ?? findLastClosed(personId, cycle);
    return HttpResponse.json(found ? toDto(found) : null);
  }),

  http.post(ASSESSMENT_URL, async ({ params, request }) => {
    const personId = String(params.personId);
    if (!personOf(personId)) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      cycle?: unknown;
    } | null;
    const cycle =
      body && typeof body.cycle === "string" && body.cycle
        ? body.cycle
        : currentCycle();

    if (findInProgress(personId, cycle)) {
      return badRequest(
        "Ya hay una evaluación en curso para esta persona y ciclo"
      );
    }

    const assessment: StoredAssessment = {
      id: crypto.randomUUID(),
      personId,
      cycle,
      closed: false,
      catalogVersion: null,
      closedAtUtc: null,
      skills: [],
    };
    assessments.push(assessment);
    return HttpResponse.json(toDto(assessment), { status: 201 });
  }),

  http.put(
    `${ASSESSMENT_URL}/:assessmentId/skills/:skillId`,
    async ({ params, request }) => {
      const assessment = assessments.find(
        (a) => a.id === String(params.assessmentId)
      );
      if (!assessment) {
        return HttpResponse.json(
          { message: "Evaluación no encontrada" },
          { status: 404 }
        );
      }
      if (assessment.closed) {
        return badRequest(
          "La evaluación está cerrada. Para corregirla hay que evaluar de nuevo."
        );
      }

      const catalog = catalogFor(assessment);
      const skill = skillsInScope(assessment, catalog).find(
        (s) => s.id === String(params.skillId)
      );
      if (!skill) {
        return badRequest(
          "Esa habilidad no está en el alcance de la evaluación"
        );
      }

      const body = (await request.json().catch(() => null)) as {
        level?: unknown;
        met?: unknown;
        note?: unknown;
      } | null;

      const level = Number(body?.level);
      if (level !== 1 && level !== 2 && level !== 3 && level !== 4) {
        return badRequest("El nivel debe estar en la escala de cuatro pasos");
      }

      const rawMet = Array.isArray(body?.met) ? body.met : [];
      const met = [0, 1, 2, 3].map((i) => {
        const list = Array.isArray(rawMet[i]) ? (rawMet[i] as unknown[]) : [];
        // Sólo se aceptan textos que el catálogo tiene en ese nivel: marcar
        // algo que no existe convertiría la evidencia en texto libre.
        return skill.levels[i].criteria.filter((c) => list.includes(c));
      });

      const note = typeof body?.note === "string" ? body.note.trim() : "";
      const person = personOf(assessment.personId)!;
      const expected =
        skill.expectations.find((e) => e.position === person.position)?.level ??
        null;
      const hasGap = expected !== null && expected > level;
      if (hasGap && note.length === 0) {
        // Sin brecha no hay nada que justificar; con brecha, la nota es lo que
        // después le da sentido a la acción del plan.
        return badRequest(
          "Con brecha la nota es obligatoria: es lo que sostiene la acción del plan."
        );
      }

      const existing = assessment.skills.find((s) => s.skillId === skill.id);
      if (existing) {
        existing.level = level;
        existing.met = met;
        existing.note = note;
      } else {
        assessment.skills.push({ skillId: skill.id, level, met, note });
      }

      return HttpResponse.json(toDto(assessment));
    }
  ),

  http.put(`${ASSESSMENT_URL}/:assessmentId/close`, ({ params }) => {
    const assessment = assessments.find(
      (a) => a.id === String(params.assessmentId)
    );
    if (!assessment) {
      return HttpResponse.json(
        { message: "Evaluación no encontrada" },
        { status: 404 }
      );
    }
    if (assessment.closed) return badRequest("La evaluación ya está cerrada");

    const catalog = getSkillsCatalogSnapshot();
    const pending = skillsInScope(assessment, catalog)
      .filter((skill) => {
        const stored = assessment.skills.find((s) => s.skillId === skill.id);
        return !stored || stored.level === null;
      })
      .map((s) => s.name);

    if (pending.length > 0) {
      return badRequest(
        `Faltan ${pending.length} ${pending.length === 1 ? "habilidad" : "habilidades"} sin nivel: ${pending.join(", ")}`,
        { pending }
      );
    }

    // Estampar la versión es lo que congela las cifras: a partir de acá esta
    // evaluación se resuelve siempre contra este catálogo.
    assessment.closed = true;
    assessment.catalogVersion = catalog.version;
    assessment.closedAtUtc = new Date().toISOString();
    return HttpResponse.json(toDto(assessment));
  }),
];

resetAssessmentsMock();
