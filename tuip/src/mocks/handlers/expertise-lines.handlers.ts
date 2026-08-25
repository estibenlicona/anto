import { http, HttpResponse } from "msw";
import type {
  ExpertiseLineDetailDto,
  ExpertiseLineDto,
  LinePersonDto,
  LineCapacityDto,
  RosterPersonDto,
  UpsertExpertiseLineRequest,
} from "@features/expertise-lines/services/expertiseLinesService";
import { EXPERTISE_LINE_LIMITS } from "@features/expertise-lines/services/expertiseLinesService";
// Lectura en un solo sentido, como chapter.handlers: las personas, sus células
// y sus dedicaciones salen de los mocks vigentes. Este handler es dueño de las
// líneas y del mapa persona → línea, y de nada más. En particular no escribe en
// people.handlers: mover a alguien de línea no toca su asignación a células.
import { getAllocationsSnapshot } from "./allocations.handlers";
import { allocatedFteOf, availableFteOf, freeFteOf } from "./fte";
import {
  initialLineSeeds,
  initialMembershipByName,
  type StoredExpertiseLine,
} from "./expertise-lines.seeds";
import { getPeopleSnapshot } from "./people.handlers";

const LINES_URL = "/expertise-lines";

type StoredLine = Omit<StoredExpertiseLine, "leadName"> & {
  leadPersonId: string | null;
};

let lines: StoredLine[] = [];
/** personId → lineId. El handler es su dueño único. */
let membership = new Map<string, string>();
let seeded = false;

/**
 * Las semillas se resuelven contra el snapshot de personas, y por eso se
 * siembra al primer uso y no al importar el módulo: al importar todavía no hay
 * garantía de que people.handlers haya inicializado el suyo.
 */
function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  resetExpertiseLinesMock();
}

export function resetExpertiseLinesMock() {
  seeded = true;
  const idByName = new Map(getPeopleSnapshot().map((p) => [p.name, p.id]));
  lines = initialLineSeeds.map(({ leadName, ...rest }) => ({
    ...rest,
    leadPersonId: (leadName && idByName.get(leadName)) || null,
  }));
  membership = new Map();
  for (const [name, lineId] of Object.entries(initialMembershipByName)) {
    const personId = idByName.get(name);
    if (personId) membership.set(personId, lineId);
  }
}

function findLine(id: string): StoredLine | undefined {
  ensureSeeded();
  return lines.find((l) => l.id === id);
}

function peopleOf(lineId: string) {
  return getPeopleSnapshot().filter((p) => membership.get(p.id) === lineId);
}

function allocationOf(personId: string) {
  // Una persona tiene una sola asignación (el POST de allocations rechaza la
  // segunda), igual que asume chapter.handlers.
  return getAllocationsSnapshot().find((a) => a.personId === personId) ?? null;
}

function toSummary(line: StoredLine): ExpertiseLineDto {
  const own = peopleOf(line.id);
  const lead = own.find((p) => p.id === line.leadPersonId);
  return {
    id: line.id,
    name: line.name,
    code: line.code,
    description: line.description,
    status: line.status,
    lead: lead ? { id: lead.id, name: lead.name } : null,
    peopleCount: own.length,
    availableFte: availableFteOf(own),
  };
}

function capacityOf(own: ReturnType<typeof peopleOf>): LineCapacityDto {
  const allocations = own
    .map((p) => allocationOf(p.id))
    .filter((a): a is NonNullable<typeof a> => a !== null);
  const availableFte = availableFteOf(own);
  const allocatedFte = allocatedFteOf(allocations);
  return {
    peopleCount: own.length,
    availableFte,
    allocatedFte,
    freeFte: freeFteOf(availableFte, allocatedFte),
    // Sobre el disponible, que es lo que la línea tiene para repartir. Sin
    // gente no hay porcentaje que calcular: cero, no NaN.
    unallocatedPercentage:
      availableFte === 0
        ? 0
        : Math.round(
            (Math.max(availableFte - allocatedFte, 0) / availableFte) * 100
          ),
  };
}

function toDetail(line: StoredLine): ExpertiseLineDetailDto {
  const own = peopleOf(line.id);
  const people: LinePersonDto[] = [...own]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => {
      const a = allocationOf(p.id);
      return {
        id: p.id,
        name: p.name,
        position: p.position,
        seniority: p.seniority,
        seniorityLabel: p.seniorityLabel,
        availableFte: p.availableFte,
        isLead: p.id === line.leadPersonId,
        allocation: a
          ? {
              squadId: a.squadId,
              squadName: a.squadName,
              dedicationPercentage: a.dedicationPercentage,
            }
          : null,
      };
    });
  return { ...toSummary(line), people, capacity: capacityOf(own) };
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

type ValidationFailure = { status: 400 | 409; error: string };

function validateUpsert(
  body: unknown,
  editingId: string | null
): UpsertExpertiseLineRequest | ValidationFailure {
  if (!body || typeof body !== "object")
    return { status: 400, error: "Cuerpo inválido." };
  const v = body as Partial<UpsertExpertiseLineRequest>;
  const name = typeof v.name === "string" ? v.name.trim() : "";
  const rawCode = typeof v.code === "string" ? v.code : "";
  const code = normalizeCode(rawCode);
  const description =
    typeof v.description === "string" && v.description.trim().length > 0
      ? v.description.trim()
      : null;

  if (name.length === 0)
    return { status: 400, error: "El nombre es obligatorio." };
  if (name.length > EXPERTISE_LINE_LIMITS.name)
    return { status: 400, error: "El nombre supera los 100 caracteres." };
  if (code.length === 0)
    return { status: 400, error: "El código es obligatorio." };
  if (code.length > EXPERTISE_LINE_LIMITS.code)
    return { status: 400, error: "El código supera los 10 caracteres." };
  if (description && description.length > EXPERTISE_LINE_LIMITS.description)
    return { status: 400, error: "La descripción supera los 200 caracteres." };

  const others = lines.filter((l) => l.id !== editingId);
  // El nombre sólo choca contra las líneas vigentes: una línea archivada libera
  // su nombre. El código choca contra todas, incluidas las archivadas, porque
  // es la etiqueta corta que se muestra en listados y no puede cambiar de
  // significado.
  const nameClash = others.find(
    (l) => l.status === "Active" && l.name.toLowerCase() === name.toLowerCase()
  );
  if (nameClash)
    return {
      status: 409,
      error: `Ya existe una línea llamada "${nameClash.name}".`,
    };
  const codeClash = others.find((l) => l.code === code);
  if (codeClash)
    return {
      status: 409,
      error: `El código "${code}" ya lo usa la línea "${codeClash.name}".`,
    };

  return { name, code, description };
}

function isFailure(
  value: UpsertExpertiseLineRequest | ValidationFailure
): value is ValidationFailure {
  return "status" in value;
}

function notFound() {
  return HttpResponse.json(
    { message: "Línea no encontrada." },
    { status: 404 }
  );
}

/** Lectura del estado vigente para personDetail.handlers. Sólo lectura. */
export function getLineOfPerson(
  personId: string
): { line: StoredLine; leadName: string | null } | null {
  ensureSeeded();
  const lineId = membership.get(personId);
  if (!lineId) return null;
  const line = lines.find((l) => l.id === lineId);
  if (!line) return null;
  const lead = line.leadPersonId
    ? (getPeopleSnapshot().find((p) => p.id === line.leadPersonId)?.name ??
      null)
    : null;
  return { line, leadName: lead };
}

export const expertiseLinesHandlers = [
  /*
    La línea de una persona, para mostrarla en su formulario sin editarla. La
    sirve este handler y no people.handlers porque el dueño del mapa persona →
    línea es éste: preguntarle a él es lo que hace que mover a alguien de línea
    se vea en su formulario sin tocar a la persona.
  */
  http.get("/people/:id/expertise-line", ({ params }) => {
    const found = getLineOfPerson(String(params.id));
    return HttpResponse.json(
      found ? { id: found.line.id, name: found.line.name } : null
    );
  }),

  // Antes de `/:id`, que si no se lo come.
  http.get(`${LINES_URL}/people`, () => {
    ensureSeeded();
    const roster: RosterPersonDto[] = getPeopleSnapshot()
      .map((p) => {
        const line = lines.find((l) => l.id === membership.get(p.id)) ?? null;
        return {
          id: p.id,
          name: p.name,
          position: p.position,
          seniority: p.seniority,
          seniorityLabel: p.seniorityLabel,
          availableFte: p.availableFte,
          line: line ? { id: line.id, name: line.name } : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return HttpResponse.json(roster);
  }),

  http.get(LINES_URL, () => {
    ensureSeeded();
    return HttpResponse.json(lines.map(toSummary));
  }),

  http.get(`${LINES_URL}/:id`, ({ params }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    return HttpResponse.json(toDetail(line));
  }),

  http.post(LINES_URL, async ({ request }) => {
    ensureSeeded();
    const result = validateUpsert(await request.json(), null);
    if (isFailure(result))
      return HttpResponse.json(
        { message: result.error },
        { status: result.status }
      );
    const now = new Date().toISOString();
    const created: StoredLine = {
      id: crypto.randomUUID(),
      ...result,
      status: "Active",
      leadPersonId: null,
      createdAtUtc: now,
      updatedAtUtc: now,
    };
    lines = [...lines, created];
    return HttpResponse.json(toSummary(created), { status: 201 });
  }),

  http.put(`${LINES_URL}/:id`, async ({ params, request }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    const result = validateUpsert(await request.json(), line.id);
    if (isFailure(result))
      return HttpResponse.json(
        { message: result.error },
        { status: result.status }
      );
    const updated: StoredLine = {
      ...line,
      ...result,
      updatedAtUtc: new Date().toISOString(),
    };
    lines = lines.map((l) => (l.id === line.id ? updated : l));
    return HttpResponse.json(toSummary(updated));
  }),

  http.put(`${LINES_URL}/:id/lead`, async ({ params, request }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    const body = (await request.json()) as { personId?: string | null };
    const personId = body?.personId ?? null;

    if (personId === null) {
      // Quitar el lead no saca a la persona de la línea: sigue perteneciendo.
      const updated = { ...line, leadPersonId: null };
      lines = lines.map((l) => (l.id === line.id ? updated : l));
      return HttpResponse.json(toDetail(updated));
    }

    const person = getPeopleSnapshot().find((p) => p.id === personId);
    if (!person)
      return HttpResponse.json(
        { message: "Persona no encontrada." },
        { status: 404 }
      );
    const otherLed = lines.find(
      (l) => l.id !== line.id && l.leadPersonId === personId
    );
    if (otherLed)
      return HttpResponse.json(
        { message: `${person.name} ya lidera la línea "${otherLed.name}".` },
        { status: 409 }
      );

    // Designar incorpora: el lead pertenece a la línea que lidera.
    membership.set(personId, line.id);
    const updated = { ...line, leadPersonId: personId };
    lines = lines.map((l) => (l.id === line.id ? updated : l));
    return HttpResponse.json(toDetail(updated));
  }),

  http.post(`${LINES_URL}/:id/people`, async ({ params, request }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    if (line.status === "Archived")
      return HttpResponse.json(
        { message: "Una línea archivada no recibe personas." },
        { status: 409 }
      );
    const body = (await request.json()) as { personIds?: unknown };
    const ids = Array.isArray(body?.personIds) ? body.personIds : [];
    if (ids.length === 0)
      return HttpResponse.json(
        { message: "No se indicó ninguna persona." },
        { status: 400 }
      );
    const known = new Set(getPeopleSnapshot().map((p) => p.id));
    if (ids.some((id) => typeof id !== "string" || !known.has(id)))
      return HttpResponse.json(
        { message: "Alguna de las personas no existe." },
        { status: 404 }
      );
    for (const id of ids as string[]) {
      // Sale de la línea que tuviera, y deja de liderarla si la lideraba: si no,
      // quedaría de lead de una línea a la que ya no pertenece.
      lines = lines.map((l) =>
        l.leadPersonId === id && l.id !== line.id
          ? { ...l, leadPersonId: null }
          : l
      );
      membership.set(id, line.id);
    }
    const fresh = lines.find((l) => l.id === line.id)!;
    return HttpResponse.json(toDetail(fresh));
  }),

  http.delete(`${LINES_URL}/:id/people/:personId`, ({ params }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    const personId = String(params.personId);
    if (membership.get(personId) !== line.id)
      return HttpResponse.json(
        { message: "Esa persona no pertenece a esta línea." },
        { status: 404 }
      );
    if (line.leadPersonId === personId)
      return HttpResponse.json(
        {
          message:
            "Quien lidera la línea no puede salir de ella. Designa otro lead primero.",
        },
        { status: 409 }
      );
    membership.delete(personId);
    return HttpResponse.json(toDetail(line));
  }),

  http.post(`${LINES_URL}/:id/archive`, ({ params }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    const count = peopleOf(line.id).length;
    if (count > 0)
      return HttpResponse.json(
        {
          message: `La línea todavía agrupa ${count} persona${count === 1 ? "" : "s"}. Movelas a otra línea antes de archivarla.`,
        },
        { status: 409 }
      );
    const updated: StoredLine = {
      ...line,
      status: "Archived",
      leadPersonId: null,
      updatedAtUtc: new Date().toISOString(),
    };
    lines = lines.map((l) => (l.id === line.id ? updated : l));
    return HttpResponse.json(toSummary(updated));
  }),

  http.post(`${LINES_URL}/:id/reactivate`, ({ params }) => {
    const line = findLine(String(params.id));
    if (!line) return notFound();
    const updated: StoredLine = {
      ...line,
      status: "Active",
      updatedAtUtc: new Date().toISOString(),
    };
    lines = lines.map((l) => (l.id === line.id ? updated : l));
    return HttpResponse.json(toSummary(updated));
  }),
];
