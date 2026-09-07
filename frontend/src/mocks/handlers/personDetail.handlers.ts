import { http, HttpResponse } from "msw";
import type {
  CostReading,
  DevOpsIdentityDto,
  PersonDetailAllocationDto,
  PersonDetailDto,
  SuggestedSquadDto,
} from "@features/people/services/personDetailService";
// Lectura en un solo sentido de los tres mocks, como chapter.handlers.ts: la
// asignación, la célula, los compañeros y las sugerencias salen de lo que hay
// en memoria, para que asignar / mover / quitar se vea en el siguiente GET.
import { getAllocationsSnapshot } from "./allocations.handlers";
import { findChapter } from "./chapters";
// La lectura del sprint en curso sale del mock de dedicación real, que a su
// vez lee de acá las identidades: dependencia de ida y vuelta, pero sólo
// dentro de funciones (ver la nota en dedication.handlers.ts).
import { getBalanceSignalsSnapshot } from "./dedication.handlers";
import { getLineOfPerson } from "./expertise-lines.handlers";
import { getCompaniesSnapshot, getPeopleSnapshot } from "./people.handlers";
import { getSquadsSnapshot } from "./squads.handlers";
import {
  CONTRACT_ENDS_AT,
  COST_BANDS,
  DEVOPS_USERS,
  LINKED_IDENTITIES,
  REQUIRED_SFIA_BY_SQUAD,
  WANTED_POSITIONS_BY_SQUAD,
  type SeedIdentity,
} from "./personDetail.seeds";

const DETAIL_URL = "/people/:id/detail";
const LINK_URL = "/people/:id/devops-identity";
const DEVOPS_USERS_URL = "/devops/users";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let identities: Record<string, SeedIdentity> = clone(LINKED_IDENTITIES);
// El directorio de DevOps no cambia durante la sesión: vincular no lo consume
// (a diferencia de las candidatas de antes), sólo crea la relación.
const devOpsUsers = clone(DEVOPS_USERS);

/**
 * Identidades DevOps vinculadas, por persona: lectura en un solo sentido para
 * el mock de dedicación real, que resuelve por el identificador del usuario
 * de DevOps los sprints y la actividad de cada persona (ver chapter.handlers.ts
 * para el mismo patrón).
 */
export function getDevOpsIdentitiesSnapshot(): Array<{
  personId: string;
  id: string;
  userName: string;
}> {
  return Object.entries(identities).map(([personId, i]) => ({
    personId,
    id: i.id,
    userName: i.userName,
  }));
}

export function resetPersonDetailMock() {
  identities = clone(LINKED_IDENTITIES);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function costReadingOf(level: number, monthlyCost: number): CostReading {
  const band = COST_BANDS[level];
  if (!band) return "InRange";
  if (monthlyCost > band.max) return "High";
  if (monthlyCost < band.min) return "Low";
  return "InRange";
}

function requiredLevel(squadId: string, position: string): number {
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
      requiredLevel: requiredLevel(own.squadId, person.position),
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
            requiredLevel: requiredLevel(s.id, person.position),
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
    ? {
        ...linked,
        // La misma cuenta que el listado de Dedicación real, para que la
        // ficha y el listado digan lo mismo de la misma persona.
        currentSprint: getBalanceSignalsSnapshot()[person.id] ?? null,
      }
    : null;

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
    devOpsIdentity,
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
    costReading: costReadingOf(person.level, person.monthlyCost),
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

  // La búsqueda es contra el directorio de DevOps, no contra la persona: por
  // eso no cuelga de /people/:id. Sin coincidencia responde 404, que el
  // frontend lee como "no hay usuario con ese correo", no como falla.
  http.get(DEVOPS_USERS_URL, ({ request }) => {
    const email = new URL(request.url).searchParams.get("email")?.trim();
    if (!email) {
      return HttpResponse.json(
        { message: "Falta el correo a buscar" },
        { status: 400 }
      );
    }
    const user = devOpsUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      return HttpResponse.json(
        { message: "Ningún usuario de Azure DevOps tiene ese correo" },
        { status: 404 }
      );
    }
    return HttpResponse.json(user);
  }),

  http.post(LINK_URL, async ({ params, request }) => {
    const personId = String(params.id);
    const body = (await request.json()) as { identityId?: string };
    const user = devOpsUsers.find((u) => u.id === body.identityId);
    if (!user) {
      return HttpResponse.json(
        { message: "Ese usuario ya no existe en Azure DevOps" },
        { status: 404 }
      );
    }
    // Una identidad, una persona: la regla la aplica el servidor, y el mensaje
    // dice quién la tiene para que el lead sepa a quién mirar.
    const takenBy = Object.entries(identities).find(
      ([otherPersonId, i]) => i.id === user.id && otherPersonId !== personId
    );
    if (takenBy) {
      const owner = getPeopleSnapshot().find((p) => p.id === takenBy[0]);
      return HttpResponse.json(
        {
          message: `Esa identidad ya está vinculada a ${owner?.name ?? "otra persona"}`,
        },
        { status: 409 }
      );
    }
    identities[personId] = {
      // El identificador es la clave con la que la dedicación real resuelve
      // los sprints y la actividad de esta persona.
      id: user.id,
      userName: user.email,
      linkedAt: new Date().toISOString().slice(0, 10),
    };
    return HttpResponse.json({ ok: true });
  }),
];
