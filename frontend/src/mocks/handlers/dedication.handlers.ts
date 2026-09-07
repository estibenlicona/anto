import { delay, http, HttpResponse } from "msw";
import type {
  ActivityDayDto,
  BalanceSignal,
  CapacityDto,
  CollaboratorDedicationDetailDto,
  CollaboratorDedicationListDto,
  CollaboratorDedicationRowDto,
  CollaboratorDedicationSummaryDto,
  ConcurrentInitiativeDto,
  DedicationAllocationDto,
  DedicationPersonDto,
  ListSprintDto,
  MultitaskingDto,
  ReferenceDto,
  SelectedSprintDto,
  SprintExecutionDto,
  SprintRefDto,
  SprintTrendPointDto,
  UnplannedWorkDto,
  WorkItemDto,
} from "@features/dedication/services/dedicationService";
import {
  absenceDaysInSprint,
  computeAvailableFte,
  pointsPerAvailableFte,
  sprintBusinessDays,
} from "@features/dedication/adapters/capacityFte";
import {
  buildReference,
  median,
  type HistorySprint,
} from "@features/dedication/adapters/history";
import { computeBalanceSignal } from "@features/dedication/adapters/balanceSignal";
import type { CurrentSprintBalanceDto } from "@features/people/services/personDetailService";
import type { PersonDto } from "@features/people/services/personService";
import { parseIsoDate } from "@features/absences/services/businessDays";
import { clampPagination, paginate } from "@shared/services/pagination";
// Lectura en un solo sentido de los otros mocks (ver chapter.handlers.ts): la
// persona y su FTE contractual salen de personas; la célula, lo que declara y
// su reparto, de asignaciones y células; la iniciativa activa, de iniciativas;
// las ausencias aprobadas, de ausencias; la ventana de histórico y el mínimo
// para evaluar, de la configuración de sprints; y a quién pertenece cada
// usuario de DevOps, de las identidades del detalle de persona. Con el detalle
// de persona la dependencia es de ida y vuelta —su ficha lee de acá la señal
// del sprint en curso—; los dos módulos sólo se llaman dentro de funciones,
// nunca al cargar, así que el ciclo es inofensivo.
import { getApprovedAbsencesInRange } from "./absences.handlers";
import { getAllocationsSnapshot } from "./allocations.handlers";
import { getInitiativesSnapshot } from "./initiatives.handlers";
import { getPeopleSnapshot } from "./people.handlers";
import { getDevOpsIdentitiesSnapshot } from "./personDetail.handlers";
import { DEVOPS_USERS } from "./personDetail.seeds";
import { vistaDe } from "./scope";
import { getDedicationSettings } from "./sprint-config.handlers";
import { getSquadsSnapshot } from "./squads.handlers";
import {
  DEDICATION_BY_USER,
  holidaysOf,
  sprintByName,
  TODAY,
  type SeedActivity,
  type SeedStory,
  type SeedUserSprint,
} from "./dedication.seeds";

const COLLABORATORS_URL = "/dedication/collaborators";
const COLLABORATOR_URL = "/dedication/collaborators/:personId";
/** Lo que tarda DevOps en responder: suficiente para que "Actualizando…" exista. */
const SYNC_DELAY_MS = 600;
const DEVOPS_ORG_URL = "https://dev.azure.com/tuya";

/** Al arrancar, la última actualización fue hace un rato: la franja tiene algo que decir. */
const initialSyncedAt = () => new Date(Date.now() - 12 * 60_000).toISOString();

let lastSyncedAt = initialSyncedAt();
let syncedAtByPerson: Record<string, string> = {};

export function resetDedicationMock() {
  lastSyncedAt = initialSyncedAt();
  syncedAtByPerson = {};
}

type Allocation = ReturnType<typeof getAllocationsSnapshot>[number];

interface Collaborator {
  person: PersonDto;
  identity: { id: string; userName: string } | null;
  allocation: Allocation | null;
  /** Los sprints que DevOps devuelve, del más antiguo al más reciente. */
  sprints: SeedUserSprint[];
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function sprintDates(sprint: SeedUserSprint) {
  const ref = sprintByName(sprint.sprint);
  if (!ref)
    throw new Error(`Sprint sin fechas en las semillas: ${sprint.sprint}`);
  return ref;
}

function sprintsOf(identity: Collaborator["identity"]): SeedUserSprint[] {
  if (!identity) return [];
  return [...(DEDICATION_BY_USER[identity.id] ?? [])].sort((a, b) =>
    sprintDates(a).startDate.localeCompare(sprintDates(b).startDate)
  );
}

/** El sprint que contiene al "hoy" del mock; si ninguno, el más reciente. */
function currentSprintOf(sprints: SeedUserSprint[]): SeedUserSprint | null {
  return (
    sprints.find((s) => {
      const { startDate, endDate } = sprintDates(s);
      return startDate <= TODAY && TODAY <= endDate;
    }) ??
    sprints[sprints.length - 1] ??
    null
  );
}

function collaboratorOf(person: PersonDto): Collaborator {
  const identity =
    getDevOpsIdentitiesSnapshot().find((i) => i.personId === person.id) ?? null;
  const allocation =
    getAllocationsSnapshot().find((a) => a.personId === person.id) ?? null;
  return { person, identity, allocation, sprints: sprintsOf(identity) };
}

// ── Capacidad ───────────────────────────────────────────────────────────────

/**
 * El FTE disponible del sprint, medido: días hábiles menos festivos del
 * calendario, menos los días de ausencia aprobada que caen dentro, menos las
 * otras indisponibilidades que el sprint declara. El FTE contractual es el
 * declarado de la persona; el que la célula reporta en la asignación no entra
 * en esta cuenta ni en ninguna otra del balance.
 */
function capacityOf(
  collaborator: Collaborator,
  sprint: SeedUserSprint
): CapacityDto {
  const { startDate, endDate, name } = sprintDates(sprint);
  const start = parseIsoDate(startDate)!;
  const end = parseIsoDate(endDate)!;

  const absences = getApprovedAbsencesInRange(startDate, endDate).filter(
    (a) => a.personId === collaborator.person.id
  );
  const daysOf = (kind: "Vacation" | "other") =>
    absences
      .filter((a) =>
        kind === "Vacation" ? a.type === "Vacation" : a.type !== "Vacation"
      )
      .reduce((acc, a) => acc + absenceDaysInSprint(a, start, end), 0);

  return computeAvailableFte({
    contractualFte: collaborator.person.availableFte,
    businessDays: sprintBusinessDays(startDate, endDate),
    holidays: holidaysOf(name),
    vacationDays: daysOf("Vacation"),
    // Lo sembrado más lo que el módulo de Ausencias tenga aprobado en esas
    // fechas: el seed cubre el caso de muestra y lo real sigue entrando.
    absenceDays: sprint.absenceDays + daysOf("other"),
    otherUnavailableDays: sprint.otherUnavailableDays,
    hoursPerSprint: getDedicationSettings().hoursPerSprint,
  });
}

// ── Ejecución ───────────────────────────────────────────────────────────────

const round1 = (value: number) => Math.round(value * 10) / 10;

const committedPointsOf = (sprint: SeedUserSprint) =>
  sprint.stories.reduce((acc, s) => acc + s.points, 0);

/**
 * Lo que ocurrió en el sprint. En `Missing` todo lo derivado del cierre viaja
 * en `null`: el sprint cerró sin que el job lo sellara, los equipos ya
 * limpiaron las HUs y lo que DevOps responde hoy no es lo que ocurrió.
 * Fingir una cifra sería peor que el hueco.
 */
function executionOf(sprint: SeedUserSprint): SprintExecutionDto {
  const committedPoints = committedPointsOf(sprint);
  if (sprint.snapshotStatus === "Missing") {
    return {
      committedPoints,
      completedPoints: null,
      notCompletedPoints: null,
      completionRate: null,
      carryOverPoints: null,
      carryOverRate: null,
    };
  }
  const completedPoints = sprint.stories
    .filter((s) => s.state === "Closed")
    .reduce((acc, s) => acc + s.points, 0);
  return {
    committedPoints,
    completedPoints,
    notCompletedPoints: committedPoints - completedPoints,
    completionRate: committedPoints
      ? round1((completedPoints / committedPoints) * 100)
      : null,
    carryOverPoints: sprint.carryOverPoints,
    carryOverRate: committedPoints
      ? round1((sprint.carryOverPoints / committedPoints) * 100)
      : null,
  };
}

const EMPTY_EXECUTION: SprintExecutionDto = {
  committedPoints: 0,
  completedPoints: null,
  notCompletedPoints: null,
  completionRate: null,
  carryOverPoints: null,
  carryOverRate: null,
};

function sprintRefOf(sprint: SeedUserSprint): SprintRefDto {
  const { name, startDate, endDate } = sprintDates(sprint);
  return {
    name,
    startDate,
    endDate,
    snapshotStatus: sprint.snapshotStatus,
    // El job sella al cierre: fecha de fin del sprint más la hora del
    // Calendario. El frontend nunca decide que algo está sellado; lo lee.
    sealedAt:
      sprint.snapshotStatus === "Sealed"
        ? `${endDate}T${getDedicationSettings().sprintCloseTime}:00.000Z`
        : null,
  };
}

// ── Trabajo no planificado y multitarea ─────────────────────────────────────

function unplannedWorkOf(sprint: SeedUserSprint): UnplannedWorkDto {
  const sum = (pick: (s: SeedStory) => boolean) =>
    sprint.stories.filter(pick).reduce((acc, s) => acc + s.points, 0);
  const committedAtStartPoints = sum((s) => !s.addedAfterSprintStart);
  const addedDuringSprintPoints = sum((s) => s.addedAfterSprintStart);
  return {
    committedAtStartPoints,
    addedDuringSprintPoints,
    totalWorkedPoints: committedAtStartPoints + addedDuringSprintPoints,
    unplannedRate: committedAtStartPoints
      ? round1((addedDuringSprintPoints / committedAtStartPoints) * 100)
      : 0,
  };
}

/**
 * Las épicas distintas que tocan las historias del sprint, con el nombre de la
 * iniciativa cuando la épica está mapeada. Mientras el mapeo no exista, dos
 * épicas de la misma iniciativa se cuentan dos veces: por eso cada una se
 * muestra con sus SP, para que se vea qué se contó.
 */
function multitaskingOf(sprint: SeedUserSprint): MultitaskingDto {
  const byEpic = new Map<string, ConcurrentInitiativeDto>();
  for (const story of sprint.stories) {
    if (!story.epic) continue;
    const existing = byEpic.get(story.epic.id);
    if (existing) {
      existing.points += story.points;
      continue;
    }
    const initiative = story.epic.initiativeId
      ? getInitiativesSnapshot().find((i) => i.id === story.epic!.initiativeId)
      : undefined;
    byEpic.set(story.epic.id, {
      epicId: story.epic.id,
      epicTitle: story.epic.title,
      initiativeId: initiative?.id ?? null,
      initiativeName: initiative?.name ?? null,
      points: story.points,
    });
  }
  const initiatives = [...byEpic.values()].sort(
    (a, b) => b.points - a.points || a.epicTitle.localeCompare(b.epicTitle)
  );
  return {
    concurrentInitiatives: initiatives.length,
    initiatives,
    committedWorkItems: sprint.stories.length,
    // Sin serie de estados no se puede reconstruir: la evidencia queda sin
    // evaluar en vez de inventar un número.
    wip: sprint.wipSeries.length ? Math.max(...sprint.wipSeries) : null,
  };
}

const EMPTY_MULTITASKING: MultitaskingDto = {
  concurrentInitiatives: 0,
  initiatives: [],
  committedWorkItems: 0,
  wip: null,
};

// ── Referencia y señal ──────────────────────────────────────────────────────

/** Lo que la referencia necesita de cada sprint, con el en curso marcado. */
function historySprintsOf(
  sprints: SeedUserSprint[],
  current: SeedUserSprint | null
): HistorySprint[] {
  return sprints.map((s) => ({
    committedPoints: committedPointsOf(s),
    snapshotStatus: s.snapshotStatus,
    isCurrent: s === current,
  }));
}

/** Los colaboradores de una célula que tienen datos en DevOps. */
function squadPeersOf(collaborator: Collaborator): Collaborator[] {
  const squadId = collaborator.allocation?.squadId;
  if (!squadId) return [];
  return getAllocationsSnapshot()
    .filter((a) => a.squadId === squadId)
    .map((a) => getPeopleSnapshot().find((p) => p.id === a.personId))
    .filter((p): p is PersonDto => Boolean(p))
    .map(collaboratorOf)
    .filter((c) => c.sprints.length > 0);
}

/**
 * El histórico de la célula: los sprints sellados de todos sus colaboradores
 * medidos, agregados. Con una sola persona medida no hay célula contra la cual
 * contrastar —la mediana sería la suya— así que se devuelve `null` y el
 * modificador no aplica: mejor sin contexto que con un contexto que es la
 * propia persona.
 */
function squadHistoryOf(
  collaborator: Collaborator
): { sprints: HistorySprint[]; currentPoints: number } | null {
  const peers = squadPeersOf(collaborator);
  if (peers.length < 2) return null;
  const sprints: HistorySprint[] = [];
  const currents: number[] = [];
  for (const peer of peers) {
    const current = currentSprintOf(peer.sprints);
    sprints.push(...historySprintsOf(peer.sprints, current));
    if (current) currents.push(committedPointsOf(current));
  }
  return { sprints, currentPoints: median(currents) ?? 0 };
}

interface Balance {
  reference: ReferenceDto;
  balance: ReturnType<typeof computeBalanceSignal>;
}

/**
 * La regla compartida, alimentada con lo que este mock sabe. Los umbrales, la
 * agregación por concurrencia y el modificador de célula viven en
 * `balanceSignal.ts`: acá sólo se junta la entrada.
 */
function balanceOf(
  collaborator: Collaborator,
  sprint: SeedUserSprint | null
): Balance {
  const { historyWindowSprints, minHistorySprints } = getDedicationSettings();
  const current = currentSprintOf(collaborator.sprints);
  const own = historySprintsOf(collaborator.sprints, current);
  const squad = squadHistoryOf(collaborator);

  const execution = sprint ? executionOf(sprint) : EMPTY_EXECUTION;
  const capacity = sprint ? capacityOf(collaborator, sprint) : null;
  const committedPoints = execution.committedPoints;

  const reference = buildReference({
    sprints: own,
    currentPoints: committedPoints,
    windowSprints: historyWindowSprints,
    minSprints: minHistorySprints,
    squadSprints: squad?.sprints ?? null,
    squadCurrentPoints: squad?.currentPoints ?? null,
  });

  // Las medianas de razón y de porcentaje se calculan sobre los mismos sprints
  // sellados que la mediana de SP: sólo lo que el job selló dice la verdad.
  const sealed = collaborator.sprints
    .filter((s) => s !== current && s.snapshotStatus === "Sealed")
    .slice(-historyWindowSprints);
  const sealedPerFte = sealed
    .map((s) =>
      pointsPerAvailableFte(
        committedPointsOf(s),
        capacityOf(collaborator, s).availableFte
      )
    )
    .filter((v): v is number => v !== null);
  const sealedExecutions = sealed.map(executionOf);

  const multitasking = sprint ? multitaskingOf(sprint) : EMPTY_MULTITASKING;
  const unplanned = sprint ? unplannedWorkOf(sprint) : null;

  return {
    reference,
    balance: computeBalanceSignal({
      hasIdentity: collaborator.identity !== null,
      hasSprint: sprint !== null,
      hasSufficientHistory: reference.sufficient,

      committedPoints,
      availableFte: capacity?.availableFte ?? 0,

      ownMedianPoints: reference.ownMedian,
      ownMedianPointsPerFte: median(sealedPerFte),

      executionSealed: sprint?.snapshotStatus === "Sealed",
      executionMissing: sprint?.snapshotStatus === "Missing",
      completionRate: execution.completionRate,
      ownMedianCompletionRate: median(
        sealedExecutions
          .map((e) => e.completionRate)
          .filter((v): v is number => v !== null)
      ),

      carryOverRate: execution.carryOverRate,
      ownMedianCarryOverRate: median(
        sealedExecutions
          .map((e) => e.carryOverRate)
          .filter((v): v is number => v !== null)
      ),

      unplannedRate: unplanned?.unplannedRate ?? null,

      concurrentInitiatives: sprint ? multitasking.concurrentInitiatives : null,
      wip: multitasking.wip,

      ownDeviationRate: reference.ownDeviationRate,
      squadDeviationRate: reference.squadDeviationRate,
    }),
  };
}

// ── DTOs de persona y asignación ────────────────────────────────────────────

function personDtoOf(collaborator: Collaborator): DedicationPersonDto {
  const { person, identity } = collaborator;
  const user = identity
    ? DEVOPS_USERS.find((u) => u.id === identity.id)
    : undefined;
  return {
    id: person.id,
    name: person.name,
    position: person.position,
    levelLabel: person.levelLabel,
    avatarUrl: user?.avatarUrl ?? null,
    contractualFte: person.availableFte,
  };
}

function allocationDtoOf(
  allocation: Allocation | null
): DedicationAllocationDto | null {
  if (!allocation) return null;
  const squad = getSquadsSnapshot().find((s) => s.id === allocation.squadId);
  const active = getInitiativesSnapshot().find(
    (i) => i.squadId === allocation.squadId && i.status === "Active"
  );
  return {
    id: allocation.id,
    squadId: allocation.squadId,
    squadName: squad?.name ?? allocation.squadName,
    activeInitiative: active
      ? {
          id: active.id,
          name: active.name,
          talla: active.evaluation?.talla ?? "",
        }
      : null,
    // Lo que la célula declara. Viaja como contexto y no participa en ninguna
    // evidencia: es un reporte, no una medición.
    declaredDedicationPercentage: allocation.dedicationPercentage,
    declaredBauPercentage: allocation.bauPercentage,
    declaredTransformationPercentage: allocation.transformationPercentage,
  };
}

const EMPTY_CAPACITY = (contractualFte: number): CapacityDto => ({
  contractualFte,
  availableFte: 0,
  breakdown: {
    businessDays: 0,
    holidays: 0,
    vacationDays: 0,
    absenceDays: 0,
    otherUnavailableDays: 0,
  },
  availableHours: 0,
  deductedHours: 0,
});

// ── Listado ─────────────────────────────────────────────────────────────────

/**
 * El sprint del que habla todo el listado: el pedido si existe entre los
 * sprints del chapter, y el en curso si no. Un nombre desconocido cae al en
 * curso en vez de responder un error: es un enlace viejo, no una petición mal
 * hecha.
 */
function resolveListSprint(
  people: PersonDto[],
  requested: string | null
): { name: string | null; names: string[] } {
  // Los sprints que alguno de los colaboradores tiene, en orden cronológico.
  const seen = new Map<string, string>();
  for (const person of people) {
    for (const sprint of collaboratorOf(person).sprints) {
      const dates = sprintDates(sprint);
      seen.set(dates.name, dates.startDate);
    }
  }
  const names = [...seen.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([name]) => name);
  if (names.length === 0) return { name: null, names };

  const currentName =
    names.find((name) => {
      const ref = sprintByName(name);
      return ref ? ref.startDate <= TODAY && TODAY <= ref.endDate : false;
    }) ?? names[names.length - 1];

  const name = requested && names.includes(requested) ? requested : currentName;
  return { name, names };
}

/** El sprint de ese colaborador que corresponde al del listado. */
function sprintNamed(
  collaborator: Collaborator,
  name: string | null
): SeedUserSprint | null {
  if (!name) return null;
  return collaborator.sprints.find((s) => s.sprint === name) ?? null;
}

function rowOf(
  person: PersonDto,
  sprintName: string | null
): CollaboratorDedicationRowDto {
  const collaborator = collaboratorOf(person);
  const sprint = sprintNamed(collaborator, sprintName);
  const { reference, balance } = balanceOf(collaborator, sprint);
  return {
    person: personDtoOf(collaborator),
    allocation: allocationDtoOf(collaborator.allocation),
    hasIdentity: collaborator.identity !== null,
    sprint: sprint ? sprintRefOf(sprint) : null,
    capacity: sprint
      ? capacityOf(collaborator, sprint)
      : EMPTY_CAPACITY(person.availableFte),
    execution: sprint ? executionOf(sprint) : EMPTY_EXECUTION,
    reference,
    multitasking: sprint ? multitaskingOf(sprint) : EMPTY_MULTITASKING,
    // En qué anduvo la persona ese sprint, no en qué anda su célula.
    sprintInitiatives: sprint ? multitaskingOf(sprint).initiatives : [],
    balance,
  };
}

/**
 * Primero lo que pide una decisión de carga —sobreasignación y subasignación—,
 * luego la carga habitual y al final lo que no se pudo evaluar. A igualdad,
 * quien más se desvía de su propio histórico; después, por nombre.
 */
const SIGNAL_RANK: Record<BalanceSignal, number> = {
  PossibleOverload: 0,
  PossibleUnderload: 0,
  Usual: 1,
  NotEvaluable: 2,
};

function compareRows(
  a: CollaboratorDedicationRowDto,
  b: CollaboratorDedicationRowDto
): number {
  const rank = SIGNAL_RANK[a.balance.signal] - SIGNAL_RANK[b.balance.signal];
  if (rank !== 0) return rank;
  const distance =
    Math.abs(b.reference.ownDeviationRate ?? 0) -
    Math.abs(a.reference.ownDeviationRate ?? 0);
  if (distance !== 0) return distance;
  return a.person.name.localeCompare(b.person.name);
}

function summaryOf(
  rows: CollaboratorDedicationRowDto[]
): CollaboratorDedicationSummaryDto {
  const count = (signal: BalanceSignal) =>
    rows.filter((r) => r.balance.signal === signal).length;
  const people = (signal: BalanceSignal) =>
    rows
      .filter((r) => r.balance.signal === signal)
      .map((r) => ({ id: r.person.id, name: r.person.name }));
  const reason = (value: string) =>
    rows.filter((r) => r.balance.notEvaluableReason === value).length;
  return {
    total: rows.length,
    possibleOverload: count("PossibleOverload"),
    possibleUnderload: count("PossibleUnderload"),
    usual: count("Usual"),
    notEvaluable: count("NotEvaluable"),
    noIdentity: reason("NoIdentity"),
    noSprint: reason("NoSprint"),
    insufficientHistory: reason("InsufficientHistory"),
    // "MissingSnapshot" nunca le pasa al sprint en curso; en un sprint pasado
    // sí, y ahí cuenta como no evaluable sin desglose propio.
    overloadPeople: people("PossibleOverload"),
    underloadPeople: people("PossibleUnderload"),
  };
}

function matches(
  row: CollaboratorDedicationRowDto,
  filters: { squadIds: string[]; search: string | null }
): boolean {
  if (
    filters.squadIds.length > 0 &&
    !filters.squadIds.includes(row.allocation?.squadId ?? "")
  )
    return false;
  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    if (
      term &&
      !row.person.name.toLowerCase().includes(term) &&
      !row.person.position.toLowerCase().includes(term)
    )
      return false;
  }
  return true;
}

// ── Detalle ─────────────────────────────────────────────────────────────────

function activityTotals(activity: SeedActivity) {
  return Object.values(activity).reduce(
    (acc, [commits, releases = 0, features = 0]) => ({
      commits: acc.commits + commits,
      releases: acc.releases + releases,
      features: acc.features + features,
    }),
    { commits: 0, releases: 0, features: 0 }
  );
}

function activityDaysOf(sprint: SeedUserSprint): ActivityDayDto[] {
  const { startDate } = sprintDates(sprint);
  return Object.entries(sprint.activity)
    .map(([offset, [commits, releases = 0, features = 0]]) => ({
      date: addDays(startDate, Number(offset)),
      commits,
      releases,
      features,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function workItemOf(story: SeedStory): WorkItemDto {
  const initiative = story.epic?.initiativeId
    ? getInitiativesSnapshot().find((i) => i.id === story.epic!.initiativeId)
    : undefined;
  return {
    id: `wi-${story.number}`,
    number: story.number,
    title: story.title,
    tag: story.tag,
    epicId: story.epic?.id ?? null,
    epicTitle: story.epic?.title ?? null,
    initiativeId: initiative?.id ?? null,
    initiativeName: initiative?.name ?? null,
    points: story.points,
    state: story.state,
    addedAfterSprintStart: story.addedAfterSprintStart,
    board: story.board,
    url: `${DEVOPS_ORG_URL}/_workitems/edit/${story.number}`,
  };
}

function trendPointOf(
  sprint: SeedUserSprint,
  current: SeedUserSprint | null
): SprintTrendPointDto {
  return {
    ...sprintRefOf(sprint),
    isCurrent: sprint === current,
    execution: executionOf(sprint),
    activity: activityTotals(sprint.activity),
  };
}

function selectedSprintOf(
  collaborator: Collaborator,
  sprint: SeedUserSprint
): SelectedSprintDto {
  const { reference, balance } = balanceOf(collaborator, sprint);
  return {
    ...sprintRefOf(sprint),
    capacity: capacityOf(collaborator, sprint),
    execution: executionOf(sprint),
    unplannedWork: unplannedWorkOf(sprint),
    multitasking: multitaskingOf(sprint),
    reference,
    balance,
    workItems: [...sprint.stories]
      .sort((a, b) => b.points - a.points || a.number - b.number)
      .map(workItemOf),
    activity: activityDaysOf(sprint),
  };
}

function detailOf(
  person: PersonDto,
  sprintName: string | null
): CollaboratorDedicationDetailDto {
  const collaborator = collaboratorOf(person);
  const current = currentSprintOf(collaborator.sprints);
  // Un enlace con un sprint que DevOps ya no devuelve cae al en curso: es un
  // enlace viejo, no un error.
  const selected =
    collaborator.sprints.find((s) => s.sprint === sprintName) ?? current;
  const personSyncedAt = syncedAtByPerson[person.id];
  return {
    person: personDtoOf(collaborator),
    allocation: allocationDtoOf(collaborator.allocation),
    hasIdentity: collaborator.identity !== null,
    settings: settingsDto(),
    lastSyncedAt:
      personSyncedAt && personSyncedAt > lastSyncedAt
        ? personSyncedAt
        : lastSyncedAt,
    sprints: collaborator.sprints.map((s) => trendPointOf(s, current)),
    selectedSprint: selected ? selectedSprintOf(collaborator, selected) : null,
  };
}

/**
 * La señal del sprint en curso de cada persona vinculada, para la ficha: la
 * misma cuenta que el listado, servida por el mock de detalle de persona.
 * `null` cuando DevOps no le devuelve sprints.
 */
export function getBalanceSignalsSnapshot(): Record<
  string,
  CurrentSprintBalanceDto | null
> {
  const out: Record<string, CurrentSprintBalanceDto | null> = {};
  const people = getPeopleSnapshot();
  for (const identity of getDevOpsIdentitiesSnapshot()) {
    const person = people.find((p) => p.id === identity.personId);
    if (!person) continue;
    const collaborator = collaboratorOf(person);
    const current = currentSprintOf(collaborator.sprints);
    if (!current) {
      out[person.id] = null;
      continue;
    }
    const { reference, balance } = balanceOf(collaborator, current);
    const capacity = capacityOf(collaborator, current);
    out[person.id] = {
      sprint: sprintRefOf(current),
      committedPoints: committedPointsOf(current),
      ownMedianPoints: reference.ownMedian,
      ownDeviationRate: reference.ownDeviationRate,
      capacity,
      signal: balance.signal,
      notEvaluableReason: balance.notEvaluableReason,
      evidenceCount: Math.max(balance.overCount, balance.underCount),
    };
  }
  return out;
}

/**
 * Lo que el contrato expone al cliente del calendario: la ventana y el mínimo.
 * La hora de cierre gobierna el job de sellado y es asunto del backend, así
 * que no viaja en la respuesta.
 */
function settingsDto() {
  const { historyWindowSprints, minHistorySprints, hoursPerSprint } =
    getDedicationSettings();
  return { historyWindowSprints, minHistorySprints, hoursPerSprint };
}

/**
 * El sprint del listado con sus vecinos, para el navegador de la franja. No se
 * avanza más allá del en curso: mirar hacia adelante no dice nada todavía.
 */
function listSprintOf(
  name: string | null,
  names: string[]
): ListSprintDto | null {
  if (!name) return null;
  const ref = sprintByName(name);
  if (!ref) return null;
  const index = names.indexOf(name);
  const isCurrent = ref.startDate <= TODAY && TODAY <= ref.endDate;
  return {
    name: ref.name,
    startDate: ref.startDate,
    endDate: ref.endDate,
    isCurrent,
    previousName: index > 0 ? names[index - 1] : null,
    nextName: !isCurrent && index < names.length - 1 ? names[index + 1] : null,
  };
}

function notFound() {
  return HttpResponse.json(
    { message: "Colaborador no encontrado" },
    { status: 404 }
  );
}

export const dedicationHandlers = [
  http.get(COLLABORATORS_URL, ({ request }) => {
    const url = new URL(request.url);
    const { page, pageSize } = clampPagination(
      Number(url.searchParams.get("page")) || null,
      Number(url.searchParams.get("pageSize")) || null
    );
    const people = vistaDe(request).people;
    // Todo el listado habla de un solo sprint: el pedido, o el en curso.
    const { name: sprintName, names } = resolveListSprint(
      people,
      url.searchParams.get("sprint")
    );
    const rows = people.map((p) => rowOf(p, sprintName)).sort(compareRows);
    // El resumen describe el sprint elegido sobre la gente a cargo, no el filtro.
    const summary = summaryOf(rows);
    const filtered = rows.filter((row) =>
      matches(row, {
        squadIds: url.searchParams.getAll("squadId"),
        search: url.searchParams.get("search"),
      })
    );
    const body: CollaboratorDedicationListDto = {
      ...paginate(filtered, page, pageSize),
      summary,
      sprint: listSprintOf(sprintName, names),
      settings: settingsDto(),
      lastSyncedAt,
    };
    return HttpResponse.json(body);
  }),

  http.get(COLLABORATOR_URL, ({ request, params }) => {
    const personId = String(params.personId);
    const { people, ve } = vistaDe(request);
    const person = people.find((p) => p.id === personId);
    if (!person || !ve(personId)) return notFound();
    const sprint = new URL(request.url).searchParams.get("sprint");
    return HttpResponse.json(detailOf(person, sprint));
  }),

  http.post(`${COLLABORATORS_URL}/sync`, async () => {
    await delay(SYNC_DELAY_MS);
    // DevOps es sólo lectura y las semillas son lo que DevOps tiene: actualizar
    // recalcula lo provisional y no toca ningún snapshot sellado, que es el
    // registro de lo que ocurrió al cierre.
    lastSyncedAt = new Date().toISOString();
    return HttpResponse.json({ lastSyncedAt });
  }),

  http.post(`${COLLABORATOR_URL}/sync`, async ({ request, params }) => {
    const personId = String(params.personId);
    const { people, ve } = vistaDe(request);
    const person = people.find((p) => p.id === personId);
    if (!person || !ve(personId)) return notFound();
    if (!getDevOpsIdentitiesSnapshot().some((i) => i.personId === personId)) {
      return HttpResponse.json(
        { message: "Esa persona no tiene identidad DevOps vinculada" },
        { status: 409 }
      );
    }
    await delay(SYNC_DELAY_MS);
    syncedAtByPerson[personId] = new Date().toISOString();
    return HttpResponse.json({ lastSyncedAt: syncedAtByPerson[personId] });
  }),
];
