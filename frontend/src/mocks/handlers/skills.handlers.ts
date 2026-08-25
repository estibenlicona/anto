import { http, HttpResponse } from "msw";
import type {
  SkillDto,
  SkillGroup,
  SkillLevel,
  SkillsCatalogDto,
} from "@features/skills/services/skillsService";
import { skillSeeds } from "./skills.seeds";
import { getPeopleSnapshot } from "./people.handlers";

const CATALOG_URL = "/skills-catalog";

interface StoredSkill {
  id: string;
  name: string;
  group: SkillGroup;
  description: string;
  active: boolean;
  /** Índice 0..3 = niveles 1..4. */
  criteria: string[][];
  /** Sólo los cargos con nivel declarado; el resto se resuelve como "sin definir". */
  expectations: Record<string, SkillLevel>;
}

function seedSkills(): StoredSkill[] {
  return skillSeeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    group: seed.group,
    description: seed.description,
    active: seed.active,
    criteria: seed.criteria.map((list) => [...list]),
    expectations: { ...seed.expectations },
  }));
}

/**
 * Habilidades que alguna evaluación ya usó, y por eso no se pueden borrar.
 *
 * Vive acá porque el catálogo tiene que responder la pregunta antes de que
 * exista el mock de evaluaciones (`add-skill-assessment`), que es quien va a
 * saberlo de verdad. Cuando llegue, reemplaza esta lista con
 * `setSkillUsageLookup` y la semilla deja de participar.
 */
const initialUsedSkillIds = [
  "s1000000-0000-0000-0000-000000000001",
  "s1000000-0000-0000-0000-000000000002",
];

let skills: StoredSkill[] = seedSkills();
let version = 1;
/** Copia de cada versión publicada, para resolver con cuál se cerró una evaluación. */
let publishedVersions = new Map<number, SkillsCatalogDto>();
let usedSkillIds = new Set(initialUsedSkillIds);
let usageLookup: (skillId: string) => boolean = (id) => usedSkillIds.has(id);

/**
 * Deja que el handler de evaluaciones sea el que responda qué habilidad está
 * en uso, en lugar de la semilla de arriba.
 */
export function setSkillUsageLookup(lookup: (skillId: string) => boolean) {
  usageLookup = lookup;
}

/** Reinicia el estado en memoria del mock — llamar en los tests que mutan. */
export function resetSkillsMock() {
  skills = seedSkills();
  version = 1;
  publishedVersions = new Map();
  usedSkillIds = new Set(initialUsedSkillIds);
  usageLookup = (id) => usedSkillIds.has(id);
  publish();
}

/**
 * Cargos del snapshot de personas, no de una lista propia: inventar un catálogo
 * de cargos duplicaría un dato que ya existe y se desincronizaría con la primera
 * alta de persona.
 *
 * El nivel esperado se declara por cargo y no por rol: el rol es un catálogo
 * cerrado de cinco valores de participación —Administrador, Líder Técnico,
 * Líder de Expertise, Product Owner, Colaborador— y no puede responder por
 * todas las disciplinas del chapter.
 */
function currentPositions(): string[] {
  const positions = new Set(getPeopleSnapshot().map((p) => p.position));
  return [...positions].sort((a, b) => a.localeCompare(b, "es"));
}

function toDto(skill: StoredSkill, positions: string[]): SkillDto {
  return {
    id: skill.id,
    name: skill.name,
    group: skill.group,
    description: skill.description,
    active: skill.active,
    levels: [1, 2, 3, 4].map((level) => ({
      level: level as SkillLevel,
      criteria: [...(skill.criteria[level - 1] ?? [])],
    })),
    // Una entrada por cargo vigente, con nivel o sin definir: así un cargo que
    // aparece con el alta de una persona nueva ya viene listado.
    expectations: positions.map((position) => ({
      position,
      level: skill.expectations[position] ?? null,
    })),
  };
}

function currentCatalog(): SkillsCatalogDto {
  const positions = currentPositions();
  return {
    version,
    positions,
    skills: skills.map((skill) => toDto(skill, positions)),
  };
}

/**
 * Publicar es subir el contador y guardar una copia. No hay pantalla de
 * historial: alcanza para que una evaluación cerrada resuelva su versión.
 */
function publish() {
  publishedVersions.set(version, currentCatalog());
}

/** Sólo lectura del catálogo vigente, para otros handlers. */
export function getSkillsCatalogSnapshot(): SkillsCatalogDto {
  return currentCatalog();
}

/** Sólo lectura de una versión publicada; `undefined` si no existe. */
export function getSkillsCatalogVersion(
  n: number
): SkillsCatalogDto | undefined {
  return publishedVersions.get(n);
}

function find(id: string): StoredSkill | undefined {
  return skills.find((s) => s.id === id);
}

function badRequest(message: string, extra?: Record<string, unknown>) {
  return HttpResponse.json({ message, ...extra }, { status: 400 });
}

function notFound() {
  return HttpResponse.json(
    { message: "Habilidad no encontrada" },
    { status: 404 }
  );
}

interface UpsertBody {
  name?: unknown;
  group?: unknown;
  description?: unknown;
}

/** Compara ignorando mayúsculas y espacios de los bordes: "QA" y "qa " chocan. */
function sameName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase("es") === b.trim().toLocaleLowerCase("es");
}

function readUpsert(
  body: unknown,
  skipId?: string
): { name: string; group: SkillGroup; description: string } | string {
  if (!body || typeof body !== "object") return "Solicitud inválida";
  const v = body as UpsertBody;
  const name = typeof v.name === "string" ? v.name.trim() : "";
  if (!name) return "El nombre de la habilidad es obligatorio";
  if (v.group !== "human" && v.group !== "technical") {
    return "El grupo debe ser humana o técnica";
  }
  const clash = skills.find((s) => s.id !== skipId && sameName(s.name, name));
  if (clash) return `Ya existe una habilidad llamada "${clash.name}"`;
  return {
    name,
    group: v.group,
    description: typeof v.description === "string" ? v.description.trim() : "",
  };
}

function parseLevel(raw: string): SkillLevel | null {
  const n = Number(raw);
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : null;
}

export const skillsHandlers = [
  http.get(CATALOG_URL, () => HttpResponse.json(currentCatalog())),

  http.post(`${CATALOG_URL}/skills`, async ({ request }) => {
    const parsed = readUpsert(await request.json().catch(() => null));
    if (typeof parsed === "string") return badRequest(parsed);

    const skill: StoredSkill = {
      id: crypto.randomUUID(),
      ...parsed,
      active: true,
      // Nace con los cuatro niveles vacíos, y por lo tanto incompleta: la
      // escala existe desde el principio, los criterios se cargan después.
      criteria: [[], [], [], []],
      expectations: {},
    };
    skills.push(skill);
    version += 1;
    publish();
    return HttpResponse.json(toDto(skill, currentPositions()), { status: 201 });
  }),

  http.put(`${CATALOG_URL}/skills/:id`, async ({ params, request }) => {
    const skill = find(String(params.id));
    if (!skill) return notFound();

    const parsed = readUpsert(await request.json().catch(() => null), skill.id);
    if (typeof parsed === "string") return badRequest(parsed);

    Object.assign(skill, parsed);
    version += 1;
    publish();
    return HttpResponse.json(toDto(skill, currentPositions()));
  }),

  http.put(
    `${CATALOG_URL}/skills/:id/levels/:level/criteria`,
    async ({ params, request }) => {
      const skill = find(String(params.id));
      if (!skill) return notFound();

      const level = parseLevel(String(params.level));
      if (level === null) return badRequest("Nivel inválido");

      const body = (await request.json().catch(() => null)) as {
        criteria?: unknown;
      } | null;
      if (!body || !Array.isArray(body.criteria)) {
        return badRequest("Se espera la lista completa de criterios del nivel");
      }
      if (!body.criteria.every((c) => typeof c === "string")) {
        return badRequest("Cada criterio debe ser un texto");
      }
      const criteria = (body.criteria as string[]).map((c) => c.trim());
      if (criteria.some((c) => c.length === 0)) {
        return badRequest("Un criterio no puede quedar vacío");
      }

      // La lista se reemplaza entera: los criterios se editan en bloque y el
      // orden es parte del dato, así que no hay merge que hacer.
      skill.criteria[level - 1] = criteria;
      version += 1;
      publish();
      return HttpResponse.json(toDto(skill, currentPositions()));
    }
  ),

  http.put(
    `${CATALOG_URL}/skills/:id/expectations`,
    async ({ params, request }) => {
      const skill = find(String(params.id));
      if (!skill) return notFound();

      const body = (await request.json().catch(() => null)) as {
        position?: unknown;
        level?: unknown;
      } | null;
      const position =
        body && typeof body.position === "string" ? body.position.trim() : "";
      if (!position) return badRequest("El cargo es obligatorio");
      if (!currentPositions().includes(position)) {
        return badRequest(
          `El cargo "${position}" no existe entre las personas registradas`
        );
      }

      if (body?.level === null || body?.level === undefined) {
        // Retirar la exigencia deja el cargo sin definir, que no es lo mismo
        // que cero: sin nivel declarado no hay brecha que calcular.
        delete skill.expectations[position];
      } else {
        const level = parseLevel(String(body.level));
        if (level === null) return badRequest("Nivel inválido");
        skill.expectations[position] = level;
      }

      version += 1;
      publish();
      return HttpResponse.json(toDto(skill, currentPositions()));
    }
  ),

  http.put(`${CATALOG_URL}/skills/:id/active`, async ({ params, request }) => {
    const skill = find(String(params.id));
    if (!skill) return notFound();

    const body = (await request.json().catch(() => null)) as {
      active?: unknown;
    } | null;
    if (typeof body?.active !== "boolean")
      return badRequest("Se espera `active`");

    skill.active = body.active;
    version += 1;
    publish();
    return HttpResponse.json(toDto(skill, currentPositions()));
  }),

  http.delete(`${CATALOG_URL}/skills/:id`, ({ params }) => {
    const skill = find(String(params.id));
    if (!skill) return notFound();

    if (usageLookup(skill.id)) {
      // Borrar dejaría evaluaciones apuntando a algo inexistente. El 400 lleva
      // la salida adentro para que la pantalla no tenga que adivinarla.
      return badRequest(
        `"${skill.name}" ya se usó en evaluaciones cerradas y no se puede eliminar. Desactivarla la saca de las evaluaciones nuevas y deja las anteriores como están.`,
        { canDeactivate: true }
      );
    }

    skills = skills.filter((s) => s.id !== skill.id);
    version += 1;
    publish();
    return new HttpResponse(null, { status: 204 });
  }),
];

publish();
