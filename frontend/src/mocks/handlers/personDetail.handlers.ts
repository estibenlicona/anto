import { http, HttpResponse } from "msw";
import type {
  CostReading,
  CurrentHoursReportDto,
  DevOpsIdentityDto,
  PersonDetailAllocationDto,
  PersonDetailDto,
  SprintHoursDto,
  SuggestedSquadDto,
} from "@features/people/services/personDetailService";
// Lectura en un solo sentido de los tres mocks, como chapter.handlers.ts: la
// asignación, la célula, los compañeros y las sugerencias salen de lo que hay
// en memoria, para que asignar / mover / quitar se vea en el siguiente GET.
import { getAllocationsSnapshot } from "./allocations.handlers";
import { findChapter } from "./chapters";
import { getLineOfPerson } from "./expertise-lines.handlers";
import { getCompaniesSnapshot, getPeopleSnapshot } from "./people.handlers";
import { getSquadsSnapshot } from "./squads.handlers";
import {
  CANDIDATE_IDENTITIES,
  CONTRACT_ENDS_AT,
  COST_BANDS,
  CURRENT_SPRINT,
  CURRENT_SPRINT_CLOSES_AT,
  CURRENT_SPRINT_SUBMITTED_AT,
  HOURS_BY_PERSON,
  LINKED_IDENTITIES,
  REQUIRED_SFIA_BY_SQUAD,
  SPRINTS,
  SPRINT_HOURS,
  TOLERANCE,
  WANTED_POSITIONS_BY_SQUAD,
  type SeedIdentity,
  type SeedSprintHours,
} from "./personDetail.seeds";

const DETAIL_URL = "/people/:id/detail";
const VALIDATE_URL = "/people/:id/hours/:sprint/validate";
const LINK_URL = "/people/:id/devops-identity";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let hours: Record<string, SeedSprintHours[]> = clone(HOURS_BY_PERSON);
let identities: Record<string, SeedIdentity> = clone(LINKED_IDENTITIES);
let candidates = clone(CANDIDATE_IDENTITIES);

/**
 * Identidades DevOps vinculadas, por persona: lectura en un solo sentido para
 * el mock del backlog, que resuelve el usuario DevOps de cada historia a una
 * persona por acá (ver chapter.handlers.ts para el mismo patrón).
 */
export function getDevOpsIdentitiesSnapshot(): Array<{
  personId: string;
  userName: string;
}> {
  return Object.entries(identities).map(([personId, i]) => ({
    personId,
    userName: i.userName,
  }));
}

export function resetPersonDetailMock() {
  hours = clone(HOURS_BY_PERSON);
  identities = clone(LINKED_IDENTITIES);
  candidates = clone(CANDIDATE_IDENTITIES);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function sprintsOf(personId: string): SprintHoursDto[] {
  const rows = hours[personId] ?? [];
  return rows.map((r, i) => ({
    sprint: SPRINTS[i],
    sprintHours: SPRINT_HOURS,
    bauHours: r.bau,
    initiativeHours: r.initiative,
    freeHours: r.free,
    status: r.status,
  }));
}

function currentReportOf(
  personId: string,
  hasAllocation: boolean
): CurrentHoursReportDto | null {
  if (!hasAllocation) return null;
  const all = sprintsOf(personId);
  const current = all.find((s) => s.sprint === CURRENT_SPRINT);
  if (!current) {
    return {
      sprint: CURRENT_SPRINT,
      sprintHours: SPRINT_HOURS,
      bauHours: 0,
      initiativeHours: 0,
      freeHours: 0,
      status: "NotReported",
      toleranceMin: TOLERANCE.min,
      toleranceMax: TOLERANCE.max,
      submittedAt: null,
      closesAt: CURRENT_SPRINT_CLOSES_AT,
    };
  }
  return {
    ...current,
    toleranceMin: TOLERANCE.min,
    toleranceMax: TOLERANCE.max,
    submittedAt:
      current.status === "Submitted" || current.status === "Validated"
        ? CURRENT_SPRINT_SUBMITTED_AT
        : null,
    closesAt: CURRENT_SPRINT_CLOSES_AT,
  };
}

/** FTE real = horas sin libres / horas del sprint, del último sprint validado. */
function realFteOf(personId: string): number | null {
  const validatedOnes = sprintsOf(personId).filter(
    (s) => s.status === "Validated"
  );
  const validated = validatedOnes[validatedOnes.length - 1];
  if (!validated) return null;
  return round2(
    (validated.bauHours + validated.initiativeHours) / validated.sprintHours
  );
}

function costReadingOf(seniority: number, monthlyCost: number): CostReading {
  const band = COST_BANDS[seniority];
  if (!band) return "InRange";
  if (monthlyCost > band.max) return "High";
  if (monthlyCost < band.min) return "Low";
  return "InRange";
}

function requiredSfia(squadId: string, position: string): number {
  return REQUIRED_SFIA_BY_SQUAD[squadId]?.[position] ?? 2;
}

export function computePersonDetail(personId: string): PersonDetailDto | null {
  const todas = getPeopleSnapshot();
  const person = todas.find((p) => p.id === personId);
  if (!person) return null;
  const chapter = findChapter(person.chapterId);
  // La ficha se cuenta dentro del chapter de la persona —no del de quien
  // mira—: quiénes son sus compañeros de célula, quién más cubre sus stacks y
  // qué células podrían recibirla son propiedades de ella, y tienen que decir
  // lo mismo la abra quien la abra. Como sólo la ve el lead que la tiene a
  // cargo, en la práctica es el mismo conjunto.
  const people = chapter
    ? todas.filter((p) => p.chapterId === chapter.id)
    : todas;
  const visibles = new Set(people.map((p) => p.id));
  const allocations = getAllocationsSnapshot().filter((a) =>
    visibles.has(a.personId)
  );
  const squads = getSquadsSnapshot();

  const own = allocations.find((a) => a.personId === person.id);
  let allocation: PersonDetailAllocationDto | null = null;
  if (own) {
    const squad = squads.find((s) => s.id === own.squadId);
    const teammates = allocations
      .filter((a) => a.squadId === own.squadId && a.personId !== person.id)
      .map(
        (a) => people.find((p) => p.id === a.personId)?.name ?? a.personName
      );
    allocation = {
      id: own.id,
      squadId: own.squadId,
      squadName: squad?.name ?? own.squadName,
      squadCriticality: squad?.criticality ?? "Low",
      squadTribe: squad?.team ?? "",
      squadDescription: squad?.description ?? "",
      teammates,
      dedicationPercentage: own.dedicationPercentage,
      bauPercentage: own.bauPercentage,
      transformationPercentage: own.transformationPercentage,
      since: own.createdAtUtc.slice(0, 10),
      requiredSfia: requiredSfia(own.squadId, person.position),
    };
  }

  // Sugerencias: células cuyo cargo pedido coincide con el de la persona y que
  // todavía no tienen a nadie con ese cargo en su equipo real.
  const suggestedSquads: SuggestedSquadDto[] = own
    ? []
    : squads
        .filter((s) =>
          WANTED_POSITIONS_BY_SQUAD[s.id]?.includes(person.position)
        )
        .filter(
          (s) =>
            !allocations.some(
              (a) =>
                a.squadId === s.id &&
                people.find((p) => p.id === a.personId)?.position ===
                  person.position
            )
        )
        .map((s) => {
          const team = allocations.filter((a) => a.squadId === s.id);
          const fteOf = (personIdOf: string) =>
            people.find((p) => p.id === personIdOf)?.availableFte ?? 0;
          return {
            id: s.id,
            name: s.name,
            criticality: s.criticality,
            reason:
              team.length === 0
                ? "Sin equipo"
                : `Sin ${person.position} en el equipo`,
            requiredSfia: requiredSfia(s.id, person.position),
            allocatedFte: round1(
              team.reduce((acc, a) => acc + a.dedicationPercentage / 100, 0)
            ),
            teamAvailableFte: round1(
              team.reduce((acc, a) => acc + fteOf(a.personId), 0)
            ),
          };
        });

  const linked = identities[person.id];
  const devOpsIdentity: DevOpsIdentityDto | null = linked
    ? { ...linked }
    : null;
  const devOpsCandidates = linked
    ? []
    : candidates
        .filter((c) => c.forPersonId === person.id)
        .map(({ id, userName, displayName }) => ({
          id,
          userName,
          displayName,
        }));

  const line = getLineOfPerson(person.id);
  const provider = person.providerId
    ? (getCompaniesSnapshot().find((c) => c.id === person.providerId) ?? null)
    : null;

  return {
    person: {
      ...person,
      // Derivado también acá: la edición se abre desde la ficha igual que desde
      // el listado, y sin este número no puede avisar a cuántas personas afecta
      // quitarle el rol de líder técnico.
      technicalLeadOfCount: people.filter(
        (p) => p.technicalLeadId === person.id
      ).length,
    },
    providerName: provider?.name ?? null,
    contractEndsAt: provider ? (CONTRACT_ENDS_AT[person.id] ?? null) : null,
    // El chapter sale de la relación que decide el alcance —la misma con la
    // que el servidor acota lo que ve ese lead—, y no del líder de la línea
    // de expertise, que es otra jerarquía y nombraría a otra persona.
    chapterName: chapter?.name ?? null,
    // El nombre sale de la persona, no de la constante del catálogo: si al
    // lead le corrigen el nombre en su ficha, la de su gente lo sigue —igual
    // que el lead de la línea, que se resuelve vivo.
    chapterLeadName: chapter
      ? (todas.find((p) => p.entraObjectId === chapter.leadEntraObjectId)
          ?.name ?? chapter.leadName)
      : null,
    // Del maestro de líneas, no de una constante: mover a la persona de línea
    // o cambiarle el lead se ve en el siguiente GET sin tocar a la persona.
    expertiseLineName: line?.line.name ?? null,
    expertiseLineLeadName: line?.leadName ?? null,
    allocation,
    realFte: realFteOf(person.id),
    currentReport: currentReportOf(person.id, Boolean(own)),
    sprints: sprintsOf(person.id),
    devOpsIdentity,
    devOpsCandidates,
    stacks: person.stacks.map((s) => {
      // Cobertura derivada del resto del chapter de esta persona, no sembrada.
      const others = people.filter(
        (p) => p.id !== person.id && p.stacks.some((x) => x.name === s.name)
      );
      return {
        name: s.name,
        level: s.level,
        isPrimary: s.isPrimary,
        otherCoverers: others.length,
        coverers: others.slice(0, 3).map((p) => ({ id: p.id, name: p.name })),
      };
    }),
    costReading: costReadingOf(person.seniority, person.monthlyCost),
    suggestedSquads,
  };
}

export const personDetailHandlers = [
  http.get(DETAIL_URL, ({ params }) => {
    const detail = computePersonDetail(String(params.id));
    if (!detail) {
      return HttpResponse.json(
        { message: "Persona no encontrada" },
        { status: 404 }
      );
    }
    return HttpResponse.json(detail);
  }),

  http.post(VALIDATE_URL, ({ params }) => {
    const personId = String(params.id);
    const sprint = String(params.sprint);
    const index = SPRINTS.indexOf(sprint as (typeof SPRINTS)[number]);
    const row = hours[personId]?.[index];
    if (!row) {
      return HttpResponse.json(
        { message: "Reporte no encontrado" },
        { status: 404 }
      );
    }
    if (row.status !== "Submitted") {
      return HttpResponse.json(
        { message: "Sólo se valida un reporte enviado" },
        { status: 409 }
      );
    }
    row.status = "Validated";
    return HttpResponse.json({ ok: true });
  }),

  http.post(LINK_URL, async ({ params, request }) => {
    const personId = String(params.id);
    const body = (await request.json()) as { identityId?: string };
    const candidate = candidates.find(
      (c) => c.id === body.identityId && c.forPersonId === personId
    );
    if (!candidate) {
      return HttpResponse.json(
        { message: "Identidad no encontrada" },
        { status: 404 }
      );
    }
    identities[personId] = {
      id: candidate.id,
      userName: candidate.userName,
      linkedAt: new Date().toISOString().slice(0, 10),
      ...candidate.items,
    };
    candidates = candidates.filter((c) => c.id !== candidate.id);
    return HttpResponse.json({ ok: true });
  }),
];
