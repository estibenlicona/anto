import { http, HttpResponse } from "msw";
import type {
  BacklogCatalogsDto,
  BacklogQueueDto,
  BacklogStoryDto,
  ClassifyRequest,
  RejectRequest,
  StoryClassificationDto,
  TriageStatus,
} from "@features/backlog/services/backlogService";
// Lectura en un solo sentido de los otros mocks (ver chapter.handlers.ts):
// la persona y la célula de cada historia se derivan del usuario DevOps.
import { getAllocationsSnapshot } from "./allocations.handlers";
import { getPeopleSnapshot } from "./people.handlers";
import { getDevOpsIdentitiesSnapshot } from "./personDetail.handlers";
import { vistaDe } from "./scope";
import { getSquadsSnapshot } from "./squads.handlers";
import {
  BAU_CATEGORIES,
  initiativeCatalog,
  REJECT_REASONS,
  STORIES,
  TODAY,
  type SeedStory,
} from "./backlog.seeds";

const QUEUE_URL = "/backlog/queue";
const CATALOGS_URL = "/backlog/catalogs";
const ITEM_URL = "/backlog/items/:id";

interface StoredStory {
  id: string;
  number: number;
  title: string;
  description: string;
  points: number;
  devOpsState: string;
  board: string;
  sprint: string;
  epicTitle: string | null;
  epicInitiativeId: string | null;
  assignedTo: string;
  previousAssignedTo: string | null;
  ingestedAt: string;
  status: TriageStatus;
  classification: StoryClassificationDto | null;
  rejectReason: RejectRequest["reason"] | null;
  rejectDetail: string | null;
  order: number;
}

function fromSeed(seed: SeedStory, index: number): StoredStory {
  return {
    id: `wi-${seed.number}`,
    number: seed.number,
    title: seed.title,
    description: seed.description,
    points: seed.points,
    devOpsState: seed.devOpsState,
    board: seed.board,
    sprint: seed.sprint,
    epicTitle: seed.epicTitle,
    epicInitiativeId: seed.epicInitiativeId,
    assignedTo: seed.assignedTo,
    previousAssignedTo: seed.previousAssignedTo ?? null,
    ingestedAt: seed.ingestedAt,
    status: seed.classified ? "Classified" : "Pending",
    classification: seed.classified
      ? {
          kind: seed.classified.kind,
          initiativeId: seed.classified.initiativeId ?? null,
          bauCategory: seed.classified.bauCategory ?? null,
          classifiedAt: seed.classified.at,
        }
      : null,
    rejectReason: null,
    rejectDetail: null,
    order: index,
  };
}

function seedStories(): StoredStory[] {
  // Orden inicial: ingesta más antigua primero, luego el orden de las semillas.
  return [...STORIES]
    .map((s, i) => ({ s, i }))
    .sort((a, b) => ingestRank(a.s) - ingestRank(b.s) || a.i - b.i)
    .map(({ s }, index) => fromSeed(s, index));
}

let stories: StoredStory[] = seedStories();
let nextOrder = stories.length;
let nextNumber = 13000;

export function resetBacklogMock() {
  stories = seedStories();
  nextOrder = stories.length;
  nextNumber = 13000;
}

/** El "hoy" del mock es fijo para que el progreso del día sea determinista. */
export function todayIso(): string {
  return TODAY;
}

function enrich(story: StoredStory): BacklogStoryDto {
  const identity = getDevOpsIdentitiesSnapshot().find(
    (i) => i.userName === story.assignedTo
  );
  const person = identity
    ? getPeopleSnapshot().find((p) => p.id === identity.personId)
    : undefined;
  const allocation = person
    ? getAllocationsSnapshot().find((a) => a.personId === person.id)
    : undefined;
  const squad = allocation
    ? getSquadsSnapshot().find((s) => s.id === allocation.squadId)
    : undefined;
  return {
    ...story,
    type: "UserStory",
    personId: person?.id ?? null,
    personName: person?.name ?? null,
    personPosition: person?.position ?? null,
    squadId: squad?.id ?? null,
    squadName: squad?.name ?? null,
  };
}

/**
 * Cambio de asignado primero, luego por `order`. El orden inicial sigue la
 * ingesta (las semillas vienen por fecha) y "saltar" lo reescribe al final:
 * si la ingesta pesara más que `order`, saltar no movería nada.
 */
function compare(a: BacklogStoryDto, b: BacklogStoryDto): number {
  const changed =
    Number(b.previousAssignedTo !== null) -
    Number(a.previousAssignedTo !== null);
  if (changed !== 0) return changed;
  return a.order - b.order;
}
function ingestRank(s: SeedStory): number {
  return s.ingestedAt < TODAY ? 0 : 1;
}

export function computeBacklogQueue(
  filters: {
    squadId?: string | null;
    personId?: string | null;
    status?: string | null;
  },
  /** Si la persona de la historia entra en lo que quien pide alcanza a ver. */
  ve: (personId: string) => boolean = () => true
): BacklogQueueDto {
  // `enrich` resuelve la identidad contra el conjunto completo a propósito: si
  // se le acotara acá, una historia de otro chapter quedaría con `personId`
  // nulo y se contaría como "sin identidad DevOps", que es un problema
  // distinto y que alguien tendría que ir a resolver en vano.
  const all = stories.map(enrich);
  // Sin persona vinculada no entra a ninguna vista (RN-23); con persona de
  // otro chapter, tampoco entra a la de este lead.
  const visible = all.filter((s) => s.personId !== null && ve(s.personId));
  const excludedWithoutIdentity = all.filter(
    (s) => s.personId === null && s.status === "Pending"
  ).length;

  const scoped = visible.filter(
    (s) =>
      (!filters.squadId || s.squadId === filters.squadId) &&
      (!filters.personId || s.personId === filters.personId)
  );
  const status = (filters.status as TriageStatus | undefined) ?? "Pending";
  const items = scoped
    .filter((s) =>
      status === "Pending" ? s.status === "Pending" : s.status !== "Pending"
    )
    .sort(
      status === "Pending"
        ? compare
        : (a, b) =>
            (a.classification?.classifiedAt ?? "") <
            (b.classification?.classifiedAt ?? "")
              ? 1
              : -1
    );

  const pendingVisible = scoped.filter((s) => s.status === "Pending");
  const bySquad = new Map<
    string,
    { squadId: string; squadName: string; pending: number }
  >();
  for (const s of pendingVisible) {
    if (!s.squadId || !s.squadName) continue;
    const row = bySquad.get(s.squadId) ?? {
      squadId: s.squadId,
      squadName: s.squadName,
      pending: 0,
    };
    row.pending += 1;
    bySquad.set(s.squadId, row);
  }

  return {
    items,
    summary: {
      total: scoped.length,
      pending: pendingVisible.length,
      classifiedToday: scoped.filter(
        (s) =>
          s.status === "Classified" &&
          s.classification?.classifiedAt === todayIso()
      ).length,
      pendingBySquad: [...bySquad.values()].sort(
        (a, b) => b.pending - a.pending
      ),
      excludedWithoutIdentity,
    },
  };
}

export const backlogHandlers = [
  http.get(QUEUE_URL, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json(
      computeBacklogQueue(
        {
          squadId: url.searchParams.get("squadId"),
          personId: url.searchParams.get("personId"),
          status: url.searchParams.get("status"),
        },
        vistaDe(request).ve
      )
    );
  }),

  http.get(CATALOGS_URL, () => {
    const catalogs: BacklogCatalogsDto = {
      initiatives: initiativeCatalog(),
      bauCategories: BAU_CATEGORIES,
      rejectReasons: REJECT_REASONS,
    };
    return HttpResponse.json(catalogs);
  }),

  http.post(`${ITEM_URL}/classify`, async ({ params, request }) => {
    const story = stories.find((s) => s.id === params.id);
    if (!story)
      return HttpResponse.json(
        { message: "Historia no encontrada" },
        { status: 404 }
      );
    const body = (await request.json()) as ClassifyRequest;
    if (
      body.kind === "Initiative" &&
      !initiativeCatalog().some((i) => i.id === body.initiativeId)
    ) {
      return HttpResponse.json(
        { message: "Selecciona la iniciativa" },
        { status: 400 }
      );
    }
    if (
      body.kind === "Bau" &&
      !BAU_CATEGORIES.includes(body.bauCategory ?? "")
    ) {
      return HttpResponse.json(
        { message: "Selecciona la categoría BAU" },
        { status: 400 }
      );
    }
    if (!["Initiative", "Bau", "Discard"].includes(body.kind)) {
      return HttpResponse.json(
        { message: "Clasificación inválida" },
        { status: 400 }
      );
    }
    story.status = "Classified";
    story.classification = {
      kind: body.kind,
      initiativeId: body.kind === "Initiative" ? body.initiativeId! : null,
      bauCategory: body.kind === "Bau" ? body.bauCategory! : null,
      classifiedAt: todayIso(),
    };
    // Clasificar confirma que es de quien DevOps dice: el aviso de cambio se apaga.
    story.previousAssignedTo = null;
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${ITEM_URL}/skip`, ({ params }) => {
    const story = stories.find((s) => s.id === params.id);
    if (!story)
      return HttpResponse.json(
        { message: "Historia no encontrada" },
        { status: 404 }
      );
    story.order = nextOrder++;
    // Saltar también la saca del grupo "volvió a curación": ya la vio.
    story.previousAssignedTo = null;
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${ITEM_URL}/undo`, ({ params }) => {
    const story = stories.find((s) => s.id === params.id);
    if (!story)
      return HttpResponse.json(
        { message: "Historia no encontrada" },
        { status: 404 }
      );
    if (story.status === "Pending") {
      return HttpResponse.json(
        { message: "La historia no está clasificada" },
        { status: 409 }
      );
    }
    story.status = "Pending";
    story.classification = null;
    story.rejectReason = null;
    story.rejectDetail = null;
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${ITEM_URL}/reject`, async ({ params, request }) => {
    const story = stories.find((s) => s.id === params.id);
    if (!story)
      return HttpResponse.json(
        { message: "Historia no encontrada" },
        { status: 404 }
      );
    const body = (await request.json()) as RejectRequest;
    if (!REJECT_REASONS.some((r) => r.value === body.reason)) {
      return HttpResponse.json(
        { message: "Selecciona el motivo" },
        { status: 400 }
      );
    }
    story.status = "Rejected";
    story.classification = null;
    story.rejectReason = body.reason;
    story.rejectDetail = body.detail ?? null;
    story.previousAssignedTo = null;
    if (body.reassignToPersonId) {
      const identity = getDevOpsIdentitiesSnapshot().find(
        (i) => i.personId === body.reassignToPersonId
      );
      if (!identity) {
        return HttpResponse.json(
          { message: "Esa persona no tiene identidad DevOps" },
          { status: 400 }
        );
      }
      // La integración es sólo lectura (RN-47): la historia nueva es una copia
      // local a nombre de la otra persona, pendiente de su propia curación.
      stories.push({
        ...story,
        id: `wi-${nextNumber}`,
        number: nextNumber++,
        assignedTo: identity.userName,
        previousAssignedTo: story.assignedTo,
        status: "Pending",
        classification: null,
        rejectReason: null,
        rejectDetail: null,
        order: nextOrder++,
      });
    }
    return HttpResponse.json({ ok: true });
  }),
];
