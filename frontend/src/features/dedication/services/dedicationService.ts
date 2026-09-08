import { httpClient } from "@shared/services/httpClient";
import type { PagedResult } from "@shared/services/pagination";

/**
 * Balance de carga: si un colaborador da señales de estar sub o sobreasignado.
 *
 * El tablero no responde "cuánto FTE tiene asignado esta persona" —ese dato lo
 * reporta la célula y no es una medición—, sino: dada la capacidad que tenía,
 * el trabajo que recibió, lo que históricamente suele manejar y lo que
 * realmente ocurrió, ¿hay señales de desbalance?
 *
 * Tres unidades, sin conversiones entre ellas:
 * - **FTE** = capacidad, y sólo capacidad (contractual y disponible del sprint).
 * - **SP** = demanda, comparada contra el histórico del propio colaborador.
 * - **Señal** = el veredicto, sintetizado de evidencias concurrentes.
 *
 * El listado responde **un sprint a la vez**: `GET /dedication/collaborators`
 * acepta `sprint` y todas sus filas hablan de ese sprint, con sus vecinos para
 * el navegador. El sprint no filtra las filas, cambia de qué se está hablando.
 *
 * PENDIENTE DE BACKEND. El contrato lo fija el mock y el backend real deberá
 * honrarlo. Cuatro piezas no existen todavía del lado del servidor:
 *
 * 1. **El job que sella el snapshot al cierre del sprint.** El carry-over y el
 *    cumplimiento sólo son ciertos si se miden antes de que los equipos limpien
 *    y cierren las HUs; después, los estados de Azure DevOps ya no reflejan lo
 *    que ocurrió. El momento del sellado sale de la fecha de fin del sprint más
 *    `sprintCloseTime` del Calendario de sprints. Ver `SnapshotStatus`.
 * 2. **El origen de festivos y otras indisponibilidades** que descuentan del
 *    FTE disponible. Las vacaciones y ausencias ya salen del módulo de
 *    Ausencias; festivos y "otras" viajan en `CapacityBreakdownDto` sin que la
 *    plataforma los administre todavía.
 * 3. **El historial de estados de work item** del que sale el WIP (cuántas HUs
 *    estuvieron a la vez en estado activo). Azure lo da por revisiones; si el
 *    backend no puede reconstruirlo, `MultitaskingDto.wip` viaja en `null` y la
 *    evidencia de multitarea queda sin evaluar.
 * 4. **Las horas de la capacidad** (`CapacityDto.availableHours`) se derivan de
 *    `hoursPerSprint` del Calendario y del FTE disponible. Es un factor de
 *    lectura y **nunca un parte de trabajo**: el backend no debe pedirlas ni
 *    guardarlas, y si algún día existe un registro de horas real, no es este.
 */

// ---------------------------------------------------------------------------
// Señal de balance
// ---------------------------------------------------------------------------

/**
 * El veredicto del tablero: dos señales accionables, la carga habitual, y "no
 * evaluable" cuando falta el dato. Ningún indicador individual determina la
 * categoría: ver `balanceSignal.ts`.
 *
 * No hay estado intermedio a propósito. Una señal que no pide una decisión de
 * carga y tampoco dice "está bien" deja la fila sin resolver, y el listado se
 * lee de una pasada o no se lee.
 */
export type BalanceSignal =
  "Usual" | "PossibleOverload" | "PossibleUnderload" | "NotEvaluable";

/** Orden de presentación: primero lo que pide una decisión de carga. */
export const BALANCE_SIGNALS: BalanceSignal[] = [
  "PossibleOverload",
  "PossibleUnderload",
  "Usual",
  "NotEvaluable",
];

/** Por qué un colaborador no se puede evaluar. */
export type NotEvaluableReason =
  | "NoIdentity"
  | "NoSprint"
  /**
   * El sprint que se está mirando cerró sin que el job sellara su snapshot:
   * sus cifras de cierre no existen. Nunca le pasa al sprint en curso, así que
   * el resumen del listado sigue contando sólo los otros tres motivos.
   */
  | "MissingSnapshot"
  | "InsufficientHistory";

/** Hacia dónde apunta una evidencia. `Unknown` = no se pudo evaluar. */
export type EvidenceDirection = "Over" | "Under" | "Neutral" | "Unknown";

/** Las seis evidencias que se evalúan, siempre en este orden. */
export type EvidenceId =
  | "demandVsOwnHistory"
  | "demandPerAvailableFte"
  | "completion"
  | "carryOver"
  | "unplannedWork"
  | "multitasking";

/**
 * Una evidencia evaluada. `value` y `threshold` viajan para que la pantalla
 * pueda mostrar la cifra junto a su umbral sin recalcular nada.
 */
export interface BalanceEvidenceDto {
  id: EvidenceId;
  direction: EvidenceDirection;
  /** La cifra observada; `null` cuando la evidencia no se pudo evaluar. */
  value: number | null;
  /** El umbral que se cruzó (o el más cercano); `null` si no aplica. */
  threshold: number | null;
  /** Desviación de intensidad fuerte: una sola basta para una señal accionable. */
  strong: boolean;
}

/** Cómo se comportó la célula frente a su propio histórico, como contexto de la señal. */
export type SquadContext = "SameDirection" | "Different" | "NoSquad";

export interface BalanceSignalDto {
  signal: BalanceSignal;
  /** Evidencias concordantes en cada dirección. */
  overCount: number;
  underCount: number;
  /**
   * `SameDirection` = la célula se desvía igual que el colaborador. Se anota
   * junto a la señal sin atenuarla: el problema deja de ser de la persona sin
   * dejar de ser un problema.
   */
  squadContext: SquadContext;
  /** Sólo cuando `signal` es `NotEvaluable`. */
  notEvaluableReason: NotEvaluableReason | null;
  /** Las seis, siempre, incluidas las neutras y las no evaluadas. */
  evidences: BalanceEvidenceDto[];
}

// ---------------------------------------------------------------------------
// Capacidad
// ---------------------------------------------------------------------------

/**
 * De dónde sale el FTE disponible del sprint. Viaja completo para que el
 * número nunca sea opaco: la pantalla siempre puede mostrar el desglose.
 */
export interface CapacityBreakdownDto {
  /** Días hábiles (L–V) dentro de las fechas del sprint. */
  businessDays: number;
  holidays: number;
  /** Días hábiles de vacaciones aprobadas que caen en el sprint. */
  vacationDays: number;
  /** Días hábiles de otras ausencias aprobadas; admite medias jornadas. */
  absenceDays: number;
  otherUnavailableDays: number;
}

export interface CapacityDto {
  /** Dedicación de contrato: 1.0 jornada completa, 0.5 medio tiempo. */
  contractualFte: number;
  /** Lo que efectivamente tuvo disponible en el sprint, dos decimales. */
  availableFte: number;
  breakdown: CapacityBreakdownDto;
  /**
   * La misma capacidad en horas, para leerla en la unidad con la que el lead
   * habla con su gente: `availableFte × horas por sprint` y lo que se fue en
   * festivos, vacaciones y ausencias. Se calculan acá y no en la pantalla para
   * que la ficha, el listado y el dashboard no puedan discrepar.
   *
   * Son capacidad, no esfuerzo: nadie las reporta y la plataforma no las
   * guarda; salen de los días que ya se miden y del parámetro del Calendario.
   */
  availableHours: number;
  deductedHours: number;
}

// ---------------------------------------------------------------------------
// Sprint y ejecución
// ---------------------------------------------------------------------------

/**
 * De dónde salen las métricas de ejecución de un sprint.
 *
 * - `Sealed`: snapshot tomado al cierre, antes de la limpieza de HUs. Es el
 *   único que alimenta el histórico y la tendencia.
 * - `Provisional`: sprint en curso o sin sellar; se calcula en vivo y cambia.
 * - `Missing`: el sprint cerró sin sellarse. Lo que DevOps responde hoy ya no
 *   es confiable, así que no se muestra como medida ni entra al histórico.
 */
export type SnapshotStatus = "Sealed" | "Provisional" | "Missing";

export interface SprintRefDto {
  name: string;
  /** ISO date. */
  startDate: string;
  /** ISO date. */
  endDate: string;
  snapshotStatus: SnapshotStatus;
  /** ISO datetime del sellado; `null` salvo en `Sealed`. */
  sealedAt: string | null;
}

/**
 * Lo que ocurrió en el sprint. En `Missing` todo lo derivado del cierre viaja
 * en `null`: no hay cifra que mostrar, y fingir una sería peor que el hueco.
 */
export interface SprintExecutionDto {
  committedPoints: number;
  /** `null` cuando el snapshot falta. */
  completedPoints: number | null;
  notCompletedPoints: number | null;
  /** Completados sobre comprometidos, 0–100 con un decimal. */
  completionRate: number | null;
  carryOverPoints: number | null;
  /** Carry-over sobre comprometidos, 0–100 con un decimal. */
  carryOverRate: number | null;
}

/**
 * Lo comprometido al inicio frente a lo que entró después. Sin esto, "se
 * comprometió a 22 y entregó 20" se lee como incumplimiento cuando en realidad
 * recibió 8 SP más en el camino.
 */
export interface UnplannedWorkDto {
  committedAtStartPoints: number;
  addedDuringSprintPoints: number;
  totalWorkedPoints: number;
  /** Agregado sobre comprometido al inicio, 0–100 con un decimal. */
  unplannedRate: number;
}

/** Una épica que toca el sprint, con la iniciativa mapeada si la hay. */
export interface ConcurrentInitiativeDto {
  epicId: string;
  epicTitle: string;
  /** `null` mientras la épica no esté vinculada a una iniciativa. */
  initiativeId: string | null;
  initiativeName: string | null;
  points: number;
}

/**
 * 28 SP en una iniciativa y 28 SP en cuatro no describen la misma carga: la
 * segunda tiene mayor riesgo de fragmentación de atención.
 */
export interface MultitaskingDto {
  /** Épicas distintas que tocan las historias del sprint. */
  concurrentInitiatives: number;
  initiatives: ConcurrentInitiativeDto[];
  committedWorkItems: number;
  /** Máximo de HUs a la vez en estado activo; `null` si no se pudo reconstruir. */
  wip: number | null;
}

// ---------------------------------------------------------------------------
// Referencia histórica
// ---------------------------------------------------------------------------

/**
 * Contra qué se compara la demanda. El histórico del propio colaborador es la
 * referencia; el de la célula es contexto —nunca sustituto—, y es lo que
 * distingue "este colaborador está bajo" de "esta célula está baja".
 */
export interface ReferenceDto {
  /** Mediana de SP comprometidos en sus sprints sellados; `null` sin histórico. */
  ownMedian: number | null;
  /** Mediana por colaborador de su célula; `null` sin célula o sin histórico. */
  squadMedian: number | null;
  /** Cuántos sprints sellados sostienen `ownMedian`. */
  sealedSprintCount: number;
  /** `sealedSprintCount >= minHistorySprints`. */
  sufficient: boolean;
  /** Sprint actual menos `ownMedian`, en SP y en % relativo; `null` sin histórico. */
  ownDeviationPoints: number | null;
  ownDeviationRate: number | null;
  /** Lo mismo para la célula frente a su propio histórico. */
  squadDeviationRate: number | null;
}

// ---------------------------------------------------------------------------
// Listado
// ---------------------------------------------------------------------------

export interface DedicationPersonDto {
  id: string;
  name: string;
  position: string;
  levelLabel: string;
  avatarUrl: string | null;
  /** Su dedicación de contrato. Es capacidad, no una referencia de carga. */
  contractualFte: number;
}

/**
 * La asignación vigente. Viaja como **contexto**, no como referencia: la
 * dedicación declarada es un reporte de la célula y no evalúa la carga.
 */
export interface DedicationAllocationDto {
  id: string;
  squadId: string;
  squadName: string;
  /** Las activas de la célula (varias a la vez, change estado-asignacion-celulas). */
  activeInitiatives: Array<{ id: string; name: string; talla: string }>;
  /** Lo que la célula declara. No participa en ninguna evidencia. */
  declaredDedicationPercentage: number;
  /**
   * Su reparto declarado. Viaja para que el drawer de reasignación abra con lo
   * que hay hoy, como en la Torre de control; tampoco evalúa nada.
   */
  declaredBauPercentage: number;
  declaredTransformationPercentage: number;
}

export interface CollaboratorDedicationRowDto {
  person: DedicationPersonDto;
  allocation: DedicationAllocationDto | null;
  hasIdentity: boolean;
  /** El sprint del listado, para este colaborador; `null` sin sprints. */
  sprint: SprintRefDto | null;
  capacity: CapacityDto;
  /** Del sprint elegido; en cero sin identidad o sin sprint. */
  execution: SprintExecutionDto;
  reference: ReferenceDto;
  multitasking: MultitaskingDto;
  /**
   * Las iniciativas que sus historias tocaron en el sprint, no la activa de su
   * célula: dice en qué anduvo la persona, no en qué anda su equipo. La fila
   * muestra las primeras y colapsa el resto en "+N".
   */
  sprintInitiatives: ConcurrentInitiativeDto[];
  balance: BalanceSignalDto;
}

export interface CollaboratorDedicationSummaryDto {
  total: number;
  possibleOverload: number;
  possibleUnderload: number;
  usual: number;
  notEvaluable: number;
  /** Desglose de `notEvaluable` por motivo. */
  noIdentity: number;
  noSprint: number;
  insufficientHistory: number;
  /** Quiénes están en cada señal fuerte, para nombrarlos en los indicadores. */
  overloadPeople: Array<{ id: string; name: string }>;
  underloadPeople: Array<{ id: string; name: string }>;
}

/** La configuración vigente que gobierna el histórico, la señal y las horas. */
export interface DedicationSettingsDto {
  historyWindowSprints: number;
  minHistorySprints: number;
  hoursPerSprint: number;
}

/**
 * El sprint del que habla **todo** el listado, con sus vecinos para el
 * navegador de la franja. El sprint no filtra las filas: cambia de qué se está
 * hablando, y por eso vive acá y no en los filtros.
 */
export interface ListSprintDto {
  name: string;
  /** ISO date. */
  startDate: string;
  /** ISO date. */
  endDate: string;
  isCurrent: boolean;
  /**
   * Los vecinos por nombre y no por un booleano: el cliente no conoce el
   * calendario de sprints, así que si sólo supiera *que* hay anterior no
   * sabría cuál pedir.
   */
  previousName: string | null;
  /** `null` en el sprint en curso: no se mira hacia adelante. */
  nextName: string | null;
}

export interface CollaboratorDedicationListDto extends PagedResult<CollaboratorDedicationRowDto> {
  /** Del sprint elegido, sobre toda la gente a cargo; no cambia con los filtros. */
  summary: CollaboratorDedicationSummaryDto;
  /** `null` cuando el chapter no tiene ningún sprint que mostrar. */
  sprint: ListSprintDto | null;
  settings: DedicationSettingsDto;
  /** ISO datetime de la última actualización desde DevOps; `null` si nunca. */
  lastSyncedAt: string | null;
}

// ---------------------------------------------------------------------------
// Detalle
// ---------------------------------------------------------------------------

export interface SprintActivityTotalsDto {
  commits: number;
  releases: number;
  features: number;
}

/** Un punto de la tendencia: un sprint de la ventana de histórico. */
export interface SprintTrendPointDto extends SprintRefDto {
  isCurrent: boolean;
  execution: SprintExecutionDto;
  activity: SprintActivityTotalsDto;
}

/** Etiqueta de la historia en DevOps; `null` cuando no trae ninguna. */
export type WorkItemTag = "Initiative" | "Bau" | null;

export interface WorkItemDto {
  id: string;
  /** Número del work item en DevOps. */
  number: number;
  title: string;
  tag: WorkItemTag;
  epicId: string | null;
  epicTitle: string | null;
  /** Iniciativa a la que está mapeado el Epic, si lo está. */
  initiativeId: string | null;
  initiativeName: string | null;
  points: number;
  /** Estado en DevOps (New, Active, Resolved, Closed). */
  state: string;
  /** Entró al sprint después de su fecha de inicio: trabajo no planificado. */
  addedAfterSprintStart: boolean;
  board: string;
  url: string;
}

/** Actividad del colaborador en DevOps un día dado. */
export interface ActivityDayDto {
  /** ISO date. */
  date: string;
  commits: number;
  releases: number;
  features: number;
}

export interface SelectedSprintDto extends SprintRefDto {
  capacity: CapacityDto;
  execution: SprintExecutionDto;
  unplannedWork: UnplannedWorkDto;
  multitasking: MultitaskingDto;
  reference: ReferenceDto;
  balance: BalanceSignalDto;
  workItems: WorkItemDto[];
  activity: ActivityDayDto[];
}

export interface CollaboratorDedicationDetailDto {
  person: DedicationPersonDto;
  allocation: DedicationAllocationDto | null;
  hasIdentity: boolean;
  settings: DedicationSettingsDto;
  lastSyncedAt: string | null;
  /** Del más antiguo al en curso; vacío sin identidad o sin sprints. */
  sprints: SprintTrendPointDto[];
  /** El sprint pedido (o el en curso), con todo lo que lo explica. */
  selectedSprint: SelectedSprintDto | null;
}

export interface SyncResultDto {
  /** ISO datetime. */
  lastSyncedAt: string;
}

/** Los filtros son multiselección, como los del listado de Personas. */
export interface CollaboratorDedicationFilters {
  squadIds?: string[];
  search?: string;
}

export interface PageRequest {
  page: number;
  pageSize: number;
}

const COLLABORATORS_URL = "/dedication/collaborators";

export const dedicationService = {
  listCollaborators: async (
    filters: CollaboratorDedicationFilters = {},
    page: PageRequest = { page: 1, pageSize: 10 },
    sprint?: string,
    /** `"mine"` acota a los colaboradores del titular; omitido, trae todo. */
    scope?: "mine"
  ): Promise<CollaboratorDedicationListDto> => {
    // Clave repetida sin corchetes (`squadId=a&squadId=b`), como en Personas.
    const params = new URLSearchParams();
    if (scope) params.set("scope", scope);
    filters.squadIds?.forEach((id) => params.append("squadId", id));
    if (filters.search) params.set("search", filters.search);
    // El sprint no es un filtro: cambia de qué sprint habla todo el listado.
    if (sprint) params.set("sprint", sprint);
    params.set("page", String(page.page));
    params.set("pageSize", String(page.pageSize));
    const response = await httpClient.get<CollaboratorDedicationListDto>(
      COLLABORATORS_URL,
      { params }
    );
    return response.data;
  },

  getCollaborator: async (
    personId: string,
    sprint?: string
  ): Promise<CollaboratorDedicationDetailDto> => {
    const response = await httpClient.get<CollaboratorDedicationDetailDto>(
      `${COLLABORATORS_URL}/${personId}`,
      { params: sprint ? { sprint } : undefined }
    );
    return response.data;
  },

  /**
   * Actualiza desde DevOps todos los colaboradores a cargo. Sólo lectura de
   * DevOps, y sólo recalcula lo provisional: un snapshot sellado no se reescribe.
   */
  syncAll: async (): Promise<SyncResultDto> => {
    const response = await httpClient.post<SyncResultDto>(
      `${COLLABORATORS_URL}/sync`
    );
    return response.data;
  },

  /** Actualiza un solo colaborador, por el usuario de su identidad DevOps. */
  syncCollaborator: async (personId: string): Promise<SyncResultDto> => {
    const response = await httpClient.post<SyncResultDto>(
      `${COLLABORATORS_URL}/${personId}/sync`
    );
    return response.data;
  },
};
