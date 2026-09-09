import type { SnapshotStatus } from "@features/dedication/services/dedicationService";
import { devOpsUserByEmail } from "./personDetail.seeds";

/**
 * Lo que Azure DevOps y el job de cierre traerían de cada usuario: sus
 * sprints, la procedencia del snapshot de cada uno, las historias que
 * comprometió —con su épica, sus puntos, su estado y si entró después de
 * arrancar el sprint—, cuántas HUs tuvo a la vez en curso y su actividad por
 * día. Es ficción hasta que exista backend.
 *
 * Se siembra **por usuario de DevOps**, no por persona: la persona se resuelve
 * por la identidad vinculada en el mock de detalle, así que vincular a alguien
 * hace aparecer su balance sin tocar estas semillas.
 *
 * Lo que NO se siembra acá, porque ya es de otro mock: la asignación y lo que
 * la célula declara (allocations), el FTE contractual (people), la célula y su
 * iniciativa activa (squads, initiatives), las ausencias aprobadas (absences)
 * y la ventana de histórico (sprint-config). El handler junta todo y calcula
 * capacidad, referencia, ejecución, no planificado, multitarea y señal con los
 * módulos de `features/dedication/adapters`.
 *
 * **Casos que cubren estas semillas** (ver `__test__/dedication.seeds.test.ts`):
 * carga habitual · posible sobreasignación · posible subasignación con la
 * célula que la acompaña · sin identidad · sin sprints · histórico
 * insuficiente · sin célula · tiempo parcial · sprint con festivo y ausencia ·
 * sprint cerrado sin snapshot · sprint en curso provisional · historias
 * entradas tarde · épicas mapeadas y sin mapear · sprint sin actividad.
 */

/** El "hoy" del mock es fijo para que el sprint en curso sea determinista. */
export const TODAY = "2026-08-22";

export interface SeedSprint {
  name: string;
  /** ISO date, lunes. */
  startDate: string;
  /** ISO date, domingo. */
  endDate: string;
}

/** Sprints de dos semanas —10 días hábiles—; S18 es el en curso (contiene a TODAY). */
export const SPRINTS: SeedSprint[] = [
  { name: "S12", startDate: "2026-05-25", endDate: "2026-06-07" },
  { name: "S13", startDate: "2026-06-08", endDate: "2026-06-21" },
  { name: "S14", startDate: "2026-06-22", endDate: "2026-07-05" },
  { name: "S15", startDate: "2026-07-06", endDate: "2026-07-19" },
  { name: "S16", startDate: "2026-07-20", endDate: "2026-08-02" },
  { name: "S17", startDate: "2026-08-03", endDate: "2026-08-16" },
  { name: "S18", startDate: "2026-08-17", endDate: "2026-08-30" },
];

/**
 * Festivos que caen dentro de cada sprint. Son de calendario, no de persona:
 * descuentan capacidad a todo el mundo por igual. La plataforma no administra
 * el calendario todavía (ver la nota de backend en `dedicationService.ts`), así
 * que viajan sembrados: S16 lleva el 20 de julio y S18 la Asunción del 17 de
 * agosto.
 */
export const HOLIDAYS_BY_SPRINT: Record<string, number> = {
  S16: 1,
  S18: 1,
};

export function sprintByName(name: string): SeedSprint | undefined {
  return SPRINTS.find((s) => s.name === name);
}

export function holidaysOf(sprintName: string): number {
  return HOLIDAYS_BY_SPRINT[sprintName] ?? 0;
}

export type SeedTag = "Initiative" | "Bau" | null;
export type SeedState = "New" | "Active" | "Resolved" | "Closed";

/**
 * Una épica de DevOps. `initiativeId` es `null` mientras la épica no esté
 * vinculada a una iniciativa: la multitarea igual la cuenta —fragmenta la
 * atención lo mismo—, pero la pantalla sólo puede mostrar su título.
 */
export interface SeedEpic {
  id: string;
  title: string;
  initiativeId: string | null;
}

const KAFKA: SeedEpic = {
  id: "ep-kafka",
  title: "Migración plataforma Kafka",
  initiativeId: "ini-kafka",
};
const LEGACY: SeedEpic = {
  id: "ep-legacy",
  title: "Conectores legacy",
  initiativeId: "ini-kafka",
};
const PAYMENTS: SeedEpic = {
  id: "ep-payments",
  title: "Motor de pagos v2",
  initiativeId: "ini-payments",
};
const FRAUD: SeedEpic = {
  id: "ep-fraud",
  title: "Fraud Scoring v3",
  initiativeId: "ini-fraud",
};
const ONBOARDING: SeedEpic = {
  id: "ep-onboarding",
  title: "Onboarding App",
  initiativeId: "ini-onboarding",
};
const LAKEHOUSE: SeedEpic = {
  id: "ep-lakehouse",
  title: "Lakehouse · ingesta",
  initiativeId: "ini-lakehouse",
};
/**
 * La iniciativa activa de Plataforma de Datos. El sprint en curso cuelga de
 * acá y no de Lakehouse: aquélla ya está cerrada en el catálogo, y comprometer
 * trabajo de hoy contra una iniciativa cerrada deja al balance de carga
 * diciendo algo que el backlog contradice.
 */
const DATA_MESH: SeedEpic = {
  id: "ep-data-mesh",
  title: "Data Mesh · gobierno",
  initiativeId: "ini-mesh",
};
/** Épica sin iniciativa mapeada: cuenta como iniciativa simultánea sin nombre. */
const PAGOS_F1: SeedEpic = {
  id: "ep-pagos-f1",
  title: "Pagos instantáneos · fase 1",
  initiativeId: null,
};

export interface SeedStory {
  number: number;
  title: string;
  /** La etiqueta con la que llega de DevOps; `null` cuando no trae ninguna. */
  tag: SeedTag;
  points: number;
  state: SeedState;
  board: string;
  /** `null` en el trabajo que no cuelga de ninguna épica (típicamente BAU). */
  epic: SeedEpic | null;
  /** Entró al sprint después de su fecha de inicio: trabajo no planificado. */
  addedAfterSprintStart: boolean;
}

/**
 * Actividad del sprint por día: la clave es el día dentro del sprint (0 = el
 * lunes en que arranca) y el valor `[commits, releases, features creadas]`.
 */
export type SeedActivity = Record<
  number,
  readonly [commits: number, releases?: number, features?: number]
>;

export interface SeedUserSprint {
  sprint: string;
  /**
   * De dónde salen sus cifras de ejecución. Sólo `Sealed` alimenta el
   * histórico y la tendencia; `Missing` es un sprint que cerró sin que el job
   * lo sellara y del que ya no se puede afirmar nada.
   */
  snapshotStatus: SnapshotStatus;
  /**
   * Días hábiles de ausencia aprobada dentro del sprint. Las ausencias reales
   * viven en el módulo de Ausencias y el handler las suma a esto; el campo
   * existe porque las semillas de aquel módulo cuelgan del mes corriente y este
   * mock vive en un agosto fijo, así que no se tocan. Sirve para que el caso
   * "sprint con festivo y ausencia" se vea sin depender de la fecha real.
   */
  absenceDays: number;
  /**
   * Días hábiles del sprint que la persona no tuvo disponibles por algo que no
   * es festivo ni ausencia aprobada —formación, soporte a otra célula, una
   * guardia—. El backend real los traerá de su propio origen.
   */
  otherUnavailableDays: number;
  stories: SeedStory[];
  /**
   * HUs a la vez en estado activo, un valor por día hábil transcurrido. Sale
   * del historial de revisiones de work item en Azure; el WIP del sprint es el
   * máximo de la serie.
   */
  wipSeries: number[];
  /**
   * SP no completados que efectivamente pasaron al sprint siguiente. No es lo
   * mismo que "comprometidos menos completados": lo que se descarta al cierre
   * no se arrastra, y por eso el snapshot lo declara aparte.
   */
  carryOverPoints: number;
  activity: SeedActivity;
}

/** Días hábiles de un sprint de dos semanas (lunes a viernes de cada semana). */
const WORKDAYS = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11];

/**
 * Reparte una cantidad de commits entre los días hábiles del sprint de forma
 * determinista (un generador lineal a partir de `seed`), con las releases al
 * cierre de cada semana y las features creadas al arrancarla. Para los sprints
 * pasados alcanza; el en curso se escribe a mano para que el calendario que
 * revisa el lead diga algo.
 */
function spread(
  seed: number,
  commits: number,
  releases = 0,
  features = 0
): SeedActivity {
  let x = (seed * 2654435761) % 2147483647;
  const next = () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x;
  };
  const days: Record<number, [number, number, number]> = {};
  const bump = (day: number, i: 0 | 1 | 2) => {
    days[day] ??= [0, 0, 0];
    days[day][i] += 1;
  };
  for (let i = 0; i < commits; i += 1)
    bump(WORKDAYS[next() % WORKDAYS.length], 0);
  const releaseDays = [11, 4];
  for (let i = 0; i < releases; i += 1) bump(releaseDays[i % 2], 1);
  const featureDays = [0, 7];
  for (let i = 0; i < features; i += 1) bump(featureDays[i % 2], 2);
  return days;
}

/**
 * Una historia, en la forma en que se leen mejor las semillas: puntos, estado,
 * épica y —cuando aplica— la marca de que entró con el sprint ya arrancado.
 */
type StorySeed = readonly [
  title: string,
  tag: SeedTag,
  points: number,
  state: SeedState,
  epic?: SeedEpic | null,
  addedAfterSprintStart?: boolean,
];

interface SprintSeed {
  /** Por defecto `Sealed` en los cerrados; el en curso se marca a mano. */
  snapshot?: SnapshotStatus;
  absence?: number;
  other?: number;
  carryOver?: number;
  wip?: number[];
  activity?: SeedActivity;
  stories: readonly StorySeed[];
}

/**
 * Arma los sprints de un colaborador. Los números de work item se derivan de
 * la base y del sprint, así que no hay que llevarlos a mano y no colisionan
 * entre personas.
 */
function collaborator(
  board: string,
  numberBase: number,
  sprints: Record<string, SprintSeed>
): SeedUserSprint[] {
  return Object.entries(sprints).map(([sprint, seed]) => {
    const index = SPRINTS.findIndex((s) => s.name === sprint);
    if (index < 0)
      throw new Error(`Sprint sin fechas en las semillas: ${sprint}`);
    return {
      sprint,
      snapshotStatus: seed.snapshot ?? "Sealed",
      absenceDays: seed.absence ?? 0,
      otherUnavailableDays: seed.other ?? 0,
      carryOverPoints: seed.carryOver ?? 0,
      wipSeries: seed.wip ?? [],
      activity: seed.activity ?? {},
      stories: seed.stories.map(
        ([title, tag, points, state, epic, added], i): SeedStory => ({
          number: numberBase + index * 20 + i,
          title,
          tag,
          points,
          state,
          board,
          epic: epic ?? null,
          addedAfterSprintStart: added ?? false,
        })
      ),
    };
  });
}

// ── María González · Backend Platform · 1.0 contractual · Carga habitual ─────
// Su mediana histórica es 22 SP y el sprint en curso va en 18: dentro de lo
// esperado. S18 le descuenta un festivo y un día de ausencia aprobada, así que
// su capacidad se lee "0.80 / 1.0 FTE" con el desglose completo. S15 cerró sin
// que el job lo sellara: no entra al histórico ni a la tendencia.
const MARIA_SPRINTS = collaborator("Backend Core", 12100, {
  S12: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 3, 3, 2, 2, 1],
    activity: spread(121, 18, 1, 1),
    stories: [
      [
        "Definir contratos de eventos de pago en Avro",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Ambiente de pruebas del cluster Kafka",
        "Initiative",
        5,
        "Closed",
        KAFKA,
      ],
      ["Parche de seguridad en la librería de logging", "Bau", 4, "Closed"],
      [
        "Atención de incidente P2 en la conciliación nocturna",
        "Bau",
        3,
        "Closed",
      ],
      ["Documentar el runbook de reprocesamiento", "Bau", 2, "Resolved"],
    ],
  },
  S13: {
    carryOver: 2,
    wip: [2, 2, 3, 3, 2, 2, 3, 2, 2, 1],
    activity: spread(122, 22, 1, 0),
    stories: [
      [
        "Productor de eventos de autorización",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Consumidor de eventos para el ledger",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      ["Corrección de timeouts en el job de extractos", "Bau", 3, "Closed"],
      ["Ajuste de alertas del bus de eventos", "Bau", 2, "Active"],
    ],
  },
  S14: {
    carryOver: 2,
    wip: [3, 3, 4, 3, 3, 3, 3, 2, 2, 1],
    activity: spread(123, 26, 2, 1),
    stories: [
      [
        "Schema registry con compatibilidad backward",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Reintentos con backoff en el productor",
        "Initiative",
        5,
        "Closed",
        KAFKA,
      ],
      [
        "Dead-letter topic para eventos rechazados",
        "Initiative",
        5,
        "Closed",
        KAFKA,
      ],
      ["Actualización de certificados del bus", "Bau", 4, "Closed"],
      ["Soporte a la auditoría de accesos al core", "Bau", 2, "Active"],
    ],
  },
  // Cerró sin sellar: lo que DevOps responde hoy ya pasó por la limpieza de
  // HUs, así que estas cifras no se muestran como medida ni entran al histórico.
  S15: {
    snapshot: "Missing",
    carryOver: 1,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(124, 15, 1, 0),
    stories: [
      [
        "Migrar el servicio de notificaciones a Kafka",
        "Initiative",
        13,
        "Closed",
        KAFKA,
      ],
      ["Ajuste de índices en la tabla de movimientos", "Bau", 5, "Closed"],
      ["Limpieza de tópicos huérfanos", "Bau", 2, "Closed"],
      ["Revisión de dependencias del build", "Bau", 2, "Active"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 3, 2, 1, 1],
    activity: spread(125, 24, 1, 2),
    stories: [
      [
        "Métricas de lag por consumer group en Prometheus",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Esquemas Avro de eventos de pago en el registry",
        "Initiative",
        5,
        "Closed",
        KAFKA,
      ],
      ["Rotación de credenciales SASL del broker", "Bau", 3, "Closed"],
      ["Corrección de redondeo en el cierre contable", "Bau", 2, "Closed"],
      [
        "Spike: compresión de mensajes snappy vs zstd",
        "Initiative",
        2,
        "New",
        KAFKA,
      ],
    ],
  },
  S17: {
    carryOver: 2,
    wip: [2, 3, 3, 3, 2, 2, 3, 2, 2, 1],
    activity: spread(126, 20, 1, 1),
    stories: [
      [
        "Migrar los consumidores de saldos al cluster nuevo",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Idempotencia en el consumidor de saldos",
        "Initiative",
        5,
        "Closed",
        KAFKA,
      ],
      ["Alertas de consumo por tópico", "Initiative", 5, "Closed", KAFKA],
      ["Atención de tickets de soporte del core", "Bau", 3, "Closed"],
      ["Revisión de vulnerabilidades del sprint", "Bau", 2, "Resolved"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    absence: 1,
    wip: [2, 3, 3, 2],
    activity: { 0: [2, 0, 1], 1: [4], 2: [3, 1], 3: [5], 4: [2], 5: [1] },
    stories: [
      [
        "Cutover de los tópicos de pago al cluster nuevo",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Replicación entre datacenters con MirrorMaker",
        "Initiative",
        5,
        "Active",
        KAFKA,
      ],
      [
        "Pruebas de resiliencia con caída de un broker",
        "Initiative",
        3,
        "Active",
        KAFKA,
      ],
      ["Soporte al cierre contable de agosto", "Bau", 2, "New"],
    ],
  },
});

// ── Carlos López · Backend Platform · 0.8 contractual · Sobreasignación ──────
// Cuatro evidencias concurrentes en S18: comprometió 30 SP contra sus 22
// habituales, la demanda por FTE disponible subió otro tanto, 8 de esos SP
// entraron con el sprint ya arrancado, y llegó a tener 4 HUs a la vez.
const CARLOS_SPRINTS = collaborator("Backend Core", 12200, {
  S12: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 3, 2, 2, 1],
    activity: spread(221, 14, 1, 1),
    stories: [
      ["Diseño de la topología de tópicos", "Initiative", 8, "Closed", KAFKA],
      [
        "Conector de entrada desde el core AS-400",
        "Initiative",
        8,
        "Closed",
        LEGACY,
      ],
      ["Revisión de arquitectura de integraciones", "Bau", 3, "Closed"],
      ["Actualización del diagrama C4 de la plataforma", "Bau", 2, "Active"],
    ],
  },
  S13: {
    carryOver: 2,
    wip: [3, 3, 3, 2, 2, 3, 3, 2, 2, 1],
    activity: spread(222, 16, 1, 1),
    stories: [
      [
        "Contrato de eventos con el core de tarjetas",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Adaptador de salida hacia el host legacy",
        "Initiative",
        8,
        "Closed",
        LEGACY,
      ],
      ["Revisión de seguridad del gateway", "Bau", 4, "Closed"],
      ["Apoyo al comité de arquitectura", "Bau", 2, "Active"],
    ],
  },
  S14: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(223, 13, 1, 0),
    stories: [
      [
        "Estrategia de particionamiento por cuenta",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Pruebas de carga del conector legacy",
        "Initiative",
        5,
        "Closed",
        LEGACY,
      ],
      ["Guía de estándares de integración", "Bau", 5, "Closed"],
      ["Atención de dudas de otros equipos", "Bau", 2, "Active"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [3, 3, 4, 3, 2, 2, 3, 2, 2, 1],
    activity: spread(224, 18, 1, 1),
    stories: [
      [
        "Migración del conector de saldos a eventos",
        "Initiative",
        13,
        "Closed",
        LEGACY,
      ],
      [
        "Definir el esquema de claves de partición",
        "Initiative",
        5,
        "Closed",
        KAFKA,
      ],
      ["Revisión del plan de contingencia", "Bau", 2, "Closed"],
      ["Soporte al equipo de canales", "Bau", 2, "Active"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [3, 3, 3, 3, 2, 2, 3, 2, 2, 1],
    activity: spread(225, 19, 1, 1),
    stories: [
      [
        "Doble escritura durante la transición",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Retiro del conector síncrono de saldos",
        "Initiative",
        8,
        "Closed",
        LEGACY,
      ],
      ["Revisión de capacidad del cluster", "Bau", 5, "Closed"],
      ["Acompañamiento a la auditoría interna", "Bau", 2, "Active"],
    ],
  },
  S17: {
    carryOver: 2,
    wip: [3, 3, 3, 2, 2, 3, 3, 2, 2, 1],
    activity: spread(226, 17, 1, 1),
    stories: [
      ["Plan de cutover por dominio", "Initiative", 8, "Closed", KAFKA],
      [
        "Reproceso histórico desde el legacy",
        "Initiative",
        8,
        "Closed",
        LEGACY,
      ],
      ["Revisión de los contratos publicados", "Bau", 4, "Closed"],
      ["Apoyo al onboarding de un proveedor", "Bau", 2, "Active"],
    ],
  },
  // 22 SP comprometidos al inicio + 8 SP que entraron después = 30 trabajados.
  S18: {
    snapshot: "Provisional",
    wip: [3, 4, 4, 3],
    activity: { 0: [3, 0, 1], 1: [5], 2: [4, 1], 3: [6], 4: [4], 5: [2] },
    stories: [
      [
        "Ejecución del cutover del dominio de pagos",
        "Initiative",
        8,
        "Closed",
        KAFKA,
      ],
      [
        "Monitoreo del reproceso en producción",
        "Initiative",
        5,
        "Active",
        KAFKA,
      ],
      [
        "Retiro del adaptador legacy de autorizaciones",
        "Initiative",
        5,
        "Active",
        LEGACY,
      ],
      ["Revisión de arquitectura del release", "Bau", 4, "Closed"],
      [
        "Incidente P1: pérdida de mensajes en un tópico",
        "Bau",
        5,
        "Active",
        null,
        true,
      ],
      ["Análisis de causa raíz del incidente", "Bau", 3, "New", null, true],
    ],
  },
});

// ── Andrés Martínez · Backend Platform · 1.0 · Posible sobreasignación ───────
// Dos evidencias concurrentes: 28 SP contra sus 22 habituales y tres épicas a
// la vez. La demanda por FTE disponible, en cambio, queda neutra: sus sprints
// anteriores llevaban dos días de formación cada uno, así que su ritmo por FTE
// siempre fue alto. Es justo lo que esa evidencia existe para separar.
const ANDRES_SPRINTS = collaborator("Backend Core", 12300, {
  S12: {
    other: 2,
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(321, 16, 1, 1),
    stories: [
      ["Formulario de alta de comercios", "Initiative", 8, "Closed", PAYMENTS],
      [
        "Validaciones del checkout embebido",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      ["Corrección de foco en el modal de pago", "Bau", 4, "Closed"],
      ["Actualización de dependencias del front", "Bau", 2, "Active"],
    ],
  },
  S13: {
    other: 2,
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(322, 15, 1, 0),
    stories: [
      ["Estados de error del checkout", "Initiative", 8, "Closed", PAYMENTS],
      [
        "Reintento de pago con tarjeta guardada",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      ["Ajuste de contraste en botones secundarios", "Bau", 3, "Closed"],
      ["Soporte a pruebas de accesibilidad", "Bau", 2, "Active"],
    ],
  },
  S14: {
    other: 2,
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(323, 17, 1, 1),
    stories: [
      ["Componente de resumen de compra", "Initiative", 8, "Closed", PAYMENTS],
      [
        "Integración con el motor de tarifas",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      ["Corrección del formato de moneda", "Bau", 4, "Closed"],
      ["Documentación del design system interno", "Bau", 2, "Active"],
    ],
  },
  S15: {
    other: 2,
    carryOver: 2,
    wip: [2, 3, 3, 3, 2, 2, 2, 2, 1, 1],
    activity: spread(324, 19, 1, 1),
    stories: [
      ["Pago diferido con cuotas", "Initiative", 13, "Closed", PAYMENTS],
      [
        "Estados vacíos del historial de pagos",
        "Initiative",
        5,
        "Closed",
        PAYMENTS,
      ],
      ["Ajuste de tipografías del checkout", "Bau", 3, "Closed"],
      ["Revisión de bundle size", "Bau", 2, "Active"],
    ],
  },
  S16: {
    other: 2,
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(325, 14, 1, 0),
    stories: [
      ["Selector de medio de pago", "Initiative", 8, "Closed", PAYMENTS],
      [
        "Confirmación de pago con biometría",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      ["Corrección de scroll en listas largas", "Bau", 4, "Closed"],
      ["Apoyo a la migración de iconos", "Bau", 2, "Active"],
    ],
  },
  S17: {
    other: 2,
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(326, 13, 1, 1),
    stories: [
      ["Historial de pagos paginado", "Initiative", 8, "Closed", PAYMENTS],
      ["Descarga del comprobante en PDF", "Initiative", 8, "Closed", PAYMENTS],
      ["Corrección de textos del checkout", "Bau", 3, "Closed"],
      ["Revisión de métricas de front", "Bau", 2, "Active"],
    ],
  },
  // Tres épicas a la vez: pagos, Kafka y conectores legacy.
  S18: {
    snapshot: "Provisional",
    wip: [2, 3, 3, 2],
    activity: { 0: [3, 0, 1], 1: [4], 2: [2], 3: [5, 1], 4: [3] },
    stories: [
      [
        "Checkout con el nuevo motor de pagos",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      [
        "Consumo de eventos de autorización en el front",
        "Initiative",
        8,
        "Active",
        KAFKA,
      ],
      [
        "Apagado del adaptador legacy del checkout",
        "Initiative",
        5,
        "Active",
        LEGACY,
      ],
      [
        "Ajustes de accesibilidad del resumen",
        "Initiative",
        5,
        "New",
        PAYMENTS,
      ],
      ["Atención de tickets del canal web", "Bau", 2, "Closed"],
    ],
  },
});

// ── Isabella Moreno · Backend Platform · 0.5 contractual · Sin histórico ─────
// Entró hace dos sprints: con 2 sellados contra un mínimo de 3, su señal es
// "No evaluable · histórico insuficiente" y la pantalla dice cuántos faltan.
// Es también el caso de tiempo parcial: su capacidad se lee "0.50 / 0.50 FTE"
// en un sprint sin descuentos, no "0.50 / 1.0". Su S17 no tiene actividad.
const ISABELLA_SPRINTS = collaborator("Frontend Web", 12400, {
  S16: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    activity: spread(421, 8, 0, 1),
    stories: [
      [
        "Migrar la vista de saldos al design system",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      ["Corrección de estilos en el menú lateral", "Bau", 3, "Closed"],
      ["Revisión de tokens de color", "Bau", 1, "Active"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: {},
    stories: [
      [
        "Tabla de movimientos con paginación",
        "Initiative",
        8,
        "Closed",
        PAYMENTS,
      ],
      [
        "Estados de carga de la vista de saldos",
        "Initiative",
        5,
        "Closed",
        PAYMENTS,
      ],
      ["Ajuste de espaciados del encabezado", "Bau", 1, "Active"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 2, 2, 1],
    activity: { 0: [1], 2: [2], 3: [1, 1] },
    stories: [
      [
        "Filtros de la vista de movimientos",
        "Initiative",
        8,
        "Active",
        PAYMENTS,
      ],
      ["Detalle de un movimiento", "Initiative", 5, "New", PAYMENTS],
      ["Corrección de tooltip en móvil", "Bau", 1, "Closed"],
    ],
  },
});

// ── Sebastián Cárdenas · Plataforma de Datos · 1.0 · La célula acompaña ──────
// Tres evidencias hacia subasignación —9 SP contra 21 habituales, la demanda
// por FTE igual de baja y todo lo comprometido ya cerrado— pero su célula
// entera cayó igual. La señal sigue siendo subasignación —el equipo no la
// desmiente— y encima va la anotación de contexto de célula: el problema es
// del equipo, no de la persona, y eso es lo que hay que ver.
const SEBASTIAN_SPRINTS = collaborator("Data Platform", 12500, {
  S12: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(521, 15, 1, 1),
    stories: [
      [
        "Ingesta de la fuente de transacciones",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Particionado por fecha en el lakehouse",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Rotación de credenciales del pipeline", "Bau", 2, "Closed"],
      ["Atención de alertas de calidad de datos", "Bau", 2, "Active"],
    ],
  },
  S13: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(522, 18, 1, 1),
    stories: [
      [
        "Catálogo de tablas del dominio de pagos",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Compactación automática de archivos",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Corrección del job de carga nocturna", "Bau", 4, "Closed"],
      ["Soporte a consultas del área de riesgo", "Bau", 2, "Active"],
    ],
  },
  S14: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(523, 16, 1, 0),
    stories: [
      [
        "Linaje de datos del dominio de tarjetas",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Reglas de calidad en la ingesta", "Initiative", 8, "Closed", LAKEHOUSE],
      ["Limpieza de tablas temporales", "Bau", 3, "Closed"],
      ["Apoyo al inventario de fuentes", "Bau", 2, "Active"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(524, 19, 1, 1),
    stories: [
      ["Modelo semántico de pagos", "Initiative", 13, "Closed", LAKEHOUSE],
      [
        "Vistas materializadas del tablero de fraude",
        "Initiative",
        5,
        "Closed",
        LAKEHOUSE,
      ],
      ["Ajuste de retención de logs", "Bau", 2, "Closed"],
      ["Soporte a la migración de un dashboard", "Bau", 2, "Active"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(525, 14, 1, 1),
    stories: [
      [
        "Ingesta incremental de movimientos",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Monitoreo de frescura de las tablas",
        "Initiative",
        5,
        "Closed",
        LAKEHOUSE,
      ],
      ["Corrección del esquema de la tabla de clientes", "Bau", 5, "Closed"],
      ["Atención de un incidente de carga", "Bau", 2, "Active"],
    ],
  },
  S17: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(526, 17, 1, 0),
    stories: [
      [
        "Exposición del modelo de pagos al BI",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Control de acceso por dominio", "Initiative", 8, "Closed", LAKEHOUSE],
      ["Revisión de costos de almacenamiento", "Bau", 3, "Closed"],
      ["Apoyo a la certificación de una fuente", "Bau", 2, "Active"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 1, 0],
    activity: { 0: [2], 1: [1], 3: [1] },
    stories: [
      [
        "Contratos de datos del dominio de comercios",
        "Initiative",
        5,
        "Closed",
        DATA_MESH,
      ],
      ["Documentar el modelo semántico", "Initiative", 4, "Closed", DATA_MESH],
    ],
  },
});

// ── Paula Ramírez · Plataforma de Datos · 1.0 · La célula acompaña ───────────
// El mismo caso que Sebastián, y por eso importa: cuando dos de dos caen a la
// vez, lo que hay que revisar es la entrada de trabajo de la célula.
const PAULA_SPRINTS = collaborator("Data Platform", 12600, {
  S12: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(621, 16, 1, 1),
    stories: [
      [
        "Tablero de conciliación de pagos",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Métricas de aprobación por franquicia",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Corrección de un cálculo del tablero", "Bau", 3, "Closed"],
      ["Atención de solicitudes de datos", "Bau", 2, "Active"],
    ],
  },
  S13: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(622, 14, 1, 0),
    stories: [
      [
        "Segmentación de clientes por uso",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Automatizar el reporte mensual", "Initiative", 8, "Closed", LAKEHOUSE],
      ["Ajuste de filtros del tablero de riesgo", "Bau", 2, "Closed"],
      ["Soporte a una consulta regulatoria", "Bau", 2, "Active"],
    ],
  },
  S14: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(623, 18, 1, 1),
    stories: [
      [
        "Modelo de propensión de uso de tarjeta",
        "Initiative",
        13,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Validación del modelo contra histórico",
        "Initiative",
        5,
        "Closed",
        LAKEHOUSE,
      ],
      ["Documentar las métricas del tablero", "Bau", 2, "Closed"],
      ["Apoyo a un análisis de campaña", "Bau", 2, "Active"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(624, 15, 1, 1),
    stories: [
      [
        "Tablero de fraude en tiempo casi real",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Alertas de desviación de aprobación",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Corrección de una métrica duplicada", "Bau", 3, "Closed"],
      ["Atención de dudas del área comercial", "Bau", 2, "Active"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(625, 13, 1, 0),
    stories: [
      [
        "Cohortes de activación de producto",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      [
        "Panel de seguimiento de la iniciativa",
        "Initiative",
        5,
        "Closed",
        LAKEHOUSE,
      ],
      ["Revisión de definiciones del glosario", "Bau", 5, "Closed"],
      ["Soporte a la carga de una fuente nueva", "Bau", 2, "Active"],
    ],
  },
  S17: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(626, 19, 1, 1),
    stories: [
      [
        "Análisis de retención por segmento",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Modelo de churn de tarjeta", "Initiative", 8, "Closed", LAKEHOUSE],
      ["Corrección del cálculo de saldo promedio", "Bau", 4, "Closed"],
      ["Apoyo a la revisión de indicadores", "Bau", 2, "Active"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 1, 1],
    activity: { 0: [1], 2: [2] },
    stories: [
      [
        "Catálogo federado del dominio de riesgo",
        "Initiative",
        5,
        "Closed",
        DATA_MESH,
      ],
      ["Revisión de las métricas del cierre", "Bau", 3, "Closed"],
    ],
  },
});

// ── Valentina Ospina · Fraude Tarjetas · 1.0 · Posible subasignación ─────────
// Es la única de su célula con datos en DevOps, así que no hay comportamiento
// de célula contra el cual contrastar: el modificador no aplica y las tres
// evidencias se sostienen. 6 SP contra 16 habituales, y ya cerró todo.
const VALENTINA_SPRINTS = collaborator("Fraude Board", 12700, {
  S12: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 1, 1, 2, 1, 1, 1],
    activity: spread(721, 12, 1, 1),
    stories: [
      [
        "Reglas de scoring para comercio no presente",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      ["Tablero de casos escalados", "Initiative", 5, "Closed", FRAUD],
      ["Ajuste de umbrales de alerta", "Bau", 3, "Active"],
    ],
  },
  S13: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    activity: spread(722, 11, 1, 0),
    stories: [
      ["Modelo de riesgo por dispositivo", "Initiative", 8, "Closed", FRAUD],
      ["Historial de decisiones del motor", "Initiative", 5, "Closed", FRAUD],
      ["Corrección de un falso positivo recurrente", "Bau", 2, "Active"],
    ],
  },
  S14: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    activity: spread(723, 13, 1, 1),
    stories: [
      ["Listas de excepción por comercio", "Initiative", 8, "Closed", FRAUD],
      [
        "Explicabilidad de la decisión al analista",
        "Initiative",
        5,
        "Closed",
        FRAUD,
      ],
      ["Ajuste del reporte de casos", "Bau", 3, "Resolved"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 1, 1, 2, 1, 1, 1],
    activity: spread(724, 14, 1, 1),
    stories: [
      [
        "Scoring en línea para transacciones internacionales",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      [
        "Simulador de reglas para el analista",
        "Initiative",
        5,
        "Closed",
        FRAUD,
      ],
      ["Corrección de latencia en el motor", "Bau", 4, "Active"],
    ],
  },
  S16: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(725, 10, 1, 0),
    stories: [
      [
        "Reentrenamiento del modelo de scoring",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      ["Métricas de precisión por segmento", "Initiative", 5, "Closed", FRAUD],
      ["Atención de un caso escalado", "Bau", 2, "Active"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    activity: spread(726, 12, 1, 1),
    stories: [
      ["Reglas para el canal de recaudo", "Initiative", 8, "Closed", FRAUD],
      ["Panel de seguimiento del motor", "Initiative", 5, "Closed", FRAUD],
      ["Revisión de los umbrales del trimestre", "Bau", 3, "Resolved"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 0, 0],
    activity: { 0: [1], 1: [2] },
    stories: [
      [
        "Ajuste de la regla de comercio recurrente",
        "Initiative",
        4,
        "Closed",
        FRAUD,
      ],
      ["Documentar el catálogo de reglas", "Initiative", 2, "Closed", FRAUD],
    ],
  },
});

// ── Julián Peña · sin célula · 1.0 · Carga habitual ─────────────────────────
// No tiene célula y sigue siendo evaluable: capacidad, demanda e histórico son
// suyos; lo único que le falta es el contexto de equipo. Sus dos épicas del
// sprint muestran los dos casos: una mapeada a iniciativa y otra sin mapear.
const JULIAN_SPRINTS = collaborator("QA Automation", 12800, {
  S12: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(821, 13, 1, 1),
    stories: [
      [
        "Suite de regresión del onboarding",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      [
        "Automatizar el flujo de alta de cliente",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Mantenimiento del ambiente de pruebas", "Bau", 2, "Active"],
    ],
  },
  S13: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(822, 15, 1, 0),
    stories: [
      [
        "Pruebas de contrato del servicio de clientes",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Datos de prueba reproducibles", "Initiative", 5, "Closed", ONBOARDING],
      ["Corrección de pruebas intermitentes", "Bau", 4, "Closed"],
      ["Revisión del reporte de cobertura", "Bau", 2, "Active"],
    ],
  },
  S14: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(823, 12, 1, 1),
    stories: [
      [
        "Pruebas end-to-end del pago instantáneo",
        "Initiative",
        8,
        "Closed",
        PAGOS_F1,
      ],
      [
        "Automatizar la validación de comprobantes",
        "Initiative",
        5,
        "Closed",
        PAGOS_F1,
      ],
      ["Actualización del runner de pruebas", "Bau", 3, "Closed"],
      ["Apoyo a la certificación de un release", "Bau", 2, "Active"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(824, 17, 1, 1),
    stories: [
      [
        "Pruebas de carga del onboarding",
        "Initiative",
        13,
        "Closed",
        ONBOARDING,
      ],
      [
        "Reporte de resultados en el pipeline",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Corrección del ambiente de datos", "Bau", 2, "Active"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(825, 11, 1, 0),
    stories: [
      [
        "Pruebas de la validación biométrica",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Escenarios negativos del alta", "Initiative", 5, "Closed", ONBOARDING],
      ["Revisión de la matriz de pruebas", "Bau", 3, "Closed"],
      ["Soporte a una prueba de carga", "Bau", 2, "Active"],
    ],
  },
  S17: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(826, 14, 1, 1),
    stories: [
      [
        "Automatizar el flujo de pago con QR",
        "Initiative",
        8,
        "Closed",
        PAGOS_F1,
      ],
      [
        "Pruebas de reversión de una transferencia",
        "Initiative",
        5,
        "Closed",
        PAGOS_F1,
      ],
      ["Corrección de los datos semilla de pruebas", "Bau", 4, "Closed"],
      ["Mantenimiento del pipeline de QA", "Bau", 2, "Active"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [2, 2, 2, 1],
    activity: { 0: [2], 1: [3], 3: [2, 1], 4: [1] },
    stories: [
      [
        "Regresión del onboarding con el motor nuevo",
        "Initiative",
        8,
        "Active",
        ONBOARDING,
      ],
      [
        "Pruebas del pago instantáneo entre bancos",
        "Initiative",
        5,
        "Active",
        PAGOS_F1,
      ],
      ["Estabilizar las pruebas intermitentes", "Bau", 4, "Closed"],
    ],
  },
});

// ── Camila Restrepo · sin identidad vinculada ────────────────────────────────
// DevOps tiene sprints a su nombre, pero nadie la vinculó: aparece como "No
// evaluable · sin identidad DevOps". Al vincularla pasa a "No evaluable ·
// histórico insuficiente", porque sólo tiene un sprint sellado.
const CAMILA_SPRINTS = collaborator("Pagos · Stories", 12900, {
  S17: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(921, 9, 1, 1),
    stories: [
      [
        "Definir el alcance de la fase 1 de pagos",
        "Initiative",
        8,
        "Closed",
        PAGOS_F1,
      ],
      [
        "Criterios de aceptación del flujo de envío",
        "Initiative",
        3,
        "Closed",
        PAGOS_F1,
      ],
      ["Atención de dudas del equipo", "Bau", 1, "Active"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 1, 1],
    activity: { 0: [1], 2: [1] },
    stories: [
      [
        "Historias del flujo de solicitud de pago",
        "Initiative",
        8,
        "Active",
        PAGOS_F1,
      ],
      ["Refinamiento del backlog de la fase 1", "Bau", 2, "Closed"],
    ],
  },
});

// ── Diego Salazar · Canales Digitales · 1.0 · Carga habitual ─────────────────
// Está asignado al 100 % en su célula, así que tiene que poder medirse: cuatro
// sprints sellados superan el mínimo de 3 que exige el Calendario. Sus
// historias cuelgan de Onboarding App, la iniciativa activa de Canales.
const DIEGO_SPRINTS = collaborator("Canales", 13000, {
  S14: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1019, 9, 1, 0),
    stories: [
      [
        "Alta de usuario desde el canal móvil",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Ajuste de mensajes de error del formulario", "Bau", 3, "Closed"],
    ],
  },
  S15: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1020, 10, 1, 1),
    stories: [
      [
        "Verificación por correo en el alta",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Corrección de un enlace roto del canal", "Bau", 2, "Closed"],
      ["Soporte a una consulta de operación", "Bau", 2, "Closed"],
    ],
  },
  S16: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1021, 8, 0, 1),
    stories: [
      [
        "Pantalla de bienvenida del canal móvil",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Corrección de textos del onboarding", "Bau", 3, "Closed"],
      ["Revisión de eventos de analítica", "Bau", 2, "Active"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1022, 10, 1, 0),
    stories: [
      [
        "Flujo de recuperación de contraseña",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      [
        "Validación de documento en el alta",
        "Initiative",
        3,
        "Closed",
        ONBOARDING,
      ],
      ["Corrección de un error de navegación", "Bau", 2, "Active"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 1, 1],
    activity: { 1: [2], 3: [1] },
    stories: [
      [
        "Notificaciones del estado del alta",
        "Initiative",
        5,
        "Active",
        ONBOARDING,
      ],
      ["Ajustes de accesibilidad del canal", "Bau", 3, "New"],
    ],
  },
});

// ── Laura Ruiz · Canales Digitales · 1.0 · Posible sobreasignación ───────────
// El caso más simple de sobrecarga y el que más se repite: no hay multitarea
// —dos frentes y tres HUs— pero el sprint pide 26 SP contra sus 15 habituales.
// La demanda sola, sostenida por la demanda por FTE, ya es una señal.
const LAURA_SPRINTS = collaborator("Canales · QA", 13100, {
  S14: {
    carryOver: 1,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1121, 11, 1, 1),
    stories: [
      ["Suite de humo del canal web", "Initiative", 8, "Closed", ONBOARDING],
      ["Automatizar el alta asistida", "Initiative", 5, "Closed", ONBOARDING],
      ["Revisión de casos de prueba del mes", "Bau", 2, "Closed"],
    ],
  },
  S15: {
    carryOver: 1,
    wip: [2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1122, 10, 1, 0),
    stories: [
      [
        "Pruebas del flujo de recuperación",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Datos de prueba reutilizables", "Initiative", 4, "Closed", ONBOARDING],
      ["Atención de un defecto de producción", "Bau", 2, "Closed"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1123, 12, 1, 1),
    stories: [
      ["Regresión del canal móvil", "Initiative", 8, "Closed", ONBOARDING],
      [
        "Reporte de cobertura por release",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Ajuste del ambiente de pruebas", "Bau", 3, "Resolved"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1124, 11, 1, 1),
    stories: [
      ["Pruebas de la nueva pasarela", "Initiative", 8, "Closed", ONBOARDING],
      [
        "Estabilizar la suite intermitente",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Soporte a la certificación del canal", "Bau", 2, "Closed"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [2, 3, 3, 2],
    activity: { 0: [3], 1: [4, 1], 3: [2] },
    stories: [
      [
        "Certificación del canal de recaudo",
        "Initiative",
        8,
        "Active",
        ONBOARDING,
      ],
      ["Automatizar el flujo de pagos", "Initiative", 8, "Active", PAGOS_F1],
      [
        "Regresión completa antes del cierre",
        "Initiative",
        5,
        "New",
        ONBOARDING,
      ],
      ["Defecto crítico del canal web", "Bau", 5, "Active", null, true],
    ],
  },
});

// ── Mateo Vargas · sin célula · 1.0 · Posible sobreasignación ────────────────
// El extremo del medidor de foco: cuatro frentes a la vez y seis HUs abiertas,
// que es el corte de desviación fuerte. Con 18 SP contra 11 habituales, la
// dispersión y la demanda dicen lo mismo desde dos lados distintos.
const MATEO_SPRINTS = collaborator("Datos · Analítica", 13200, {
  S14: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    activity: spread(1221, 9, 0, 1),
    stories: [
      [
        "Tablero de calidad de la ingesta",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Diccionario de datos del dominio", "Bau", 3, "Closed"],
    ],
  },
  S15: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1222, 8, 0, 0),
    stories: [
      [
        "Métricas de cobertura del lakehouse",
        "Initiative",
        8,
        "Closed",
        LAKEHOUSE,
      ],
      ["Depuración del reporte mensual", "Bau", 2, "Closed"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 2, 3, 2, 1, 1, 2, 1, 1, 1],
    activity: spread(1223, 10, 1, 1),
    stories: [
      ["Modelo semántico de originación", "Initiative", 8, "Closed", LAKEHOUSE],
      ["Ajustes del tablero de cartera", "Bau", 4, "Resolved"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [2, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    activity: spread(1224, 9, 0, 1),
    stories: [
      ["Linaje de las tablas de riesgo", "Initiative", 8, "Closed", LAKEHOUSE],
      ["Consulta puntual para auditoría", "Bau", 3, "Closed"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [4, 5, 6, 6],
    activity: { 0: [2], 1: [3], 2: [2, 0, 1] },
    stories: [
      [
        "Ingesta del nuevo core de tarjetas",
        "Initiative",
        5,
        "Active",
        DATA_MESH,
      ],
      ["Indicadores del motor de pagos", "Initiative", 5, "Active", PAYMENTS],
      [
        "Tablero de adopción del onboarding",
        "Initiative",
        5,
        "New",
        ONBOARDING,
      ],
      [
        "Extracto para la mesa de pagos",
        "Initiative",
        3,
        "Active",
        PAGOS_F1,
        true,
      ],
    ],
  },
});

// ── Sofía Herrera · sin célula · 1.0 · Posible sobreasignación ───────────────
// El caso del límite: 21 SP contra 16 habituales es +31 %, apenas por encima
// de la tolerancia, y son tres frentes. Dos evidencias justas, que es el
// mínimo para que la señal se encienda: sirve para ver que no grita de más.
const SOFIA_SPRINTS = collaborator("Backend Core", 13300, {
  S14: {
    carryOver: 1,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1321, 12, 1, 1),
    stories: [
      ["Acuerdos de servicio entre células", "Initiative", 8, "Closed", KAFKA],
      ["Tablero de impedimentos", "Initiative", 5, "Closed", KAFKA],
      ["Refinamiento del backlog del trimestre", "Bau", 3, "Closed"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1322, 13, 1, 1),
    stories: [
      ["Plan de liberación coordinado", "Initiative", 8, "Closed", PAYMENTS],
      ["Métricas de flujo de la célula", "Initiative", 6, "Closed", KAFKA],
      ["Facilitación de la retrospectiva", "Bau", 3, "Closed"],
    ],
  },
  S16: {
    carryOver: 1,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1323, 11, 1, 0),
    stories: [
      ["Ceremonias del tren de release", "Initiative", 8, "Closed", KAFKA],
      [
        "Seguimiento de dependencias externas",
        "Initiative",
        5,
        "Closed",
        PAYMENTS,
      ],
      ["Actualización del tablero del equipo", "Bau", 2, "Closed"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [2, 2, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1324, 12, 1, 1),
    stories: [
      ["Coordinación del corte de quarter", "Initiative", 8, "Closed", KAFKA],
      ["Riesgos del plan de migración", "Initiative", 5, "Closed", PAYMENTS],
      ["Apoyo a la planeación de la célula", "Bau", 3, "Closed"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [2, 2, 2, 2],
    activity: { 0: [2], 2: [3], 3: [1, 1] },
    stories: [
      ["Sincronización del corte de Kafka", "Initiative", 8, "Active", KAFKA],
      ["Plan de contingencia del motor", "Initiative", 8, "Active", PAYMENTS],
      ["Coordinación con la mesa de pagos", "Initiative", 5, "New", PAGOS_F1],
    ],
  },
});

/**
 * El balance de cada usuario de DevOps, por su identificador —el mismo que
 * deja la vinculación en la identidad—. Daniela está vinculada y no aparece
 * acá: DevOps no le devuelve sprints, y ese es su caso.
 */
// ── Nicolás Betancur · Canales Digitales · 1.0 · Carga habitual ──────────────
// El tercero de Canales. Con él la célula queda medida entera —Laura, Diego y
// Nicolás—, que es lo que hace comparable la lectura de la célula contra la de
// cada persona.
const NICOLAS_SPRINTS = collaborator("Canales · Móvil", 13600, {
  S14: {
    carryOver: 1,
    wip: [1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
    activity: spread(1061, 12, 1, 0),
    stories: [
      [
        "Pantalla de captura de documento",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Actualización de la librería de la app", "Bau", 3, "Closed"],
    ],
  },
  S15: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1062, 13, 1, 1),
    stories: [
      [
        "Lectura de datos del documento en el móvil",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Corrección de un cierre inesperado en Android", "Bau", 3, "Closed"],
    ],
  },
  S16: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1063, 11, 1, 0),
    stories: [
      [
        "Permisos de cámara y galería",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Soporte a una incidencia de la tienda de apps", "Bau", 3, "Closed"],
      ["Revisión de métricas de adopción", "Bau", 2, "Closed"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1064, 12, 1, 1),
    stories: [
      [
        "Estado del alta en el perfil del usuario",
        "Initiative",
        8,
        "Closed",
        ONBOARDING,
      ],
      ["Ajustes de accesibilidad en el móvil", "Bau", 3, "Closed"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 1, 1],
    activity: { 0: [2], 2: [1], 3: [1] },
    stories: [
      [
        "Reintento del alta desde el móvil",
        "Initiative",
        5,
        "Active",
        ONBOARDING,
      ],
      ["Actualización de dependencias del móvil", "Bau", 3, "New"],
    ],
  },
});

// ── Emilio Naranjo · Fraude Tarjetas · 1.0 · Carga habitual ──────────────────
// Seguridad dentro de la célula de fraude: su trabajo cuelga de la iniciativa
// activa de su célula, igual que el de Valentina.
const EMILIO_SPRINTS = collaborator("Fraude Board", 13700, {
  S14: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1071, 11, 1, 0),
    stories: [
      [
        "Reglas de bloqueo por geolocalización",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      ["Rotación de llaves del servicio de scoring", "Bau", 3, "Closed"],
    ],
  },
  S15: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1072, 12, 1, 1),
    stories: [
      [
        "Endurecimiento del canal de notificación",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      ["Atención de un hallazgo de AppSec", "Bau", 3, "Closed"],
    ],
  },
  S16: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1073, 10, 1, 0),
    stories: [
      [
        "Auditoría de accesos al motor de reglas",
        "Initiative",
        5,
        "Closed",
        FRAUD,
      ],
      ["Revisión de dependencias vulnerables", "Bau", 3, "Closed"],
      ["Soporte a una revisión de cumplimiento", "Bau", 2, "Closed"],
    ],
  },
  S17: {
    carryOver: 1,
    wip: [1, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    activity: spread(1074, 13, 1, 1),
    stories: [
      [
        "Cifrado de los datos del expediente de fraude",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      ["Atención de alertas del SIEM", "Bau", 3, "Closed"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [1, 1, 1, 1],
    activity: { 1: [2], 3: [1] },
    stories: [
      [
        "Segregación de roles del motor de reglas",
        "Initiative",
        5,
        "Active",
        FRAUD,
      ],
      ["Revisión de un incidente de acceso", "Bau", 3, "New"],
    ],
  },
});

// ── Tomás Giraldo · Fraude Tarjetas · 1.0 · Varias iniciativas ───────────────
// Es arquitecto y líder técnico, así que toca más de un frente a la vez: la
// multitarea que se le ve es la de su rol, no una señal de sobrecarga.
const TOMAS_SPRINTS = collaborator("Fraude Board", 13800, {
  S14: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(1081, 14, 1, 1),
    stories: [
      [
        "Diseño del motor de reglas de fraude",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      [
        "Revisión de arquitectura del motor de pagos",
        "Initiative",
        5,
        "Closed",
        PAYMENTS,
      ],
      ["Atención de consultas de arquitectura", "Bau", 3, "Closed"],
    ],
  },
  S15: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(1082, 15, 1, 1),
    stories: [
      [
        "Contrato de eventos del scoring",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      [
        "Guía de resiliencia para las células",
        "Initiative",
        5,
        "Closed",
        PAYMENTS,
      ],
      ["Revisión de diseños de otras células", "Bau", 3, "Closed"],
    ],
  },
  S16: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 1, 1, 1],
    activity: spread(1083, 13, 1, 0),
    stories: [
      [
        "Modelo de datos del expediente de fraude",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      ["Acompañamiento a la migración de Kafka", "Initiative", 5, "Closed", KAFKA],
      ["Atención de consultas de arquitectura", "Bau", 3, "Closed"],
    ],
  },
  S17: {
    carryOver: 2,
    wip: [2, 3, 3, 2, 2, 2, 2, 2, 1, 1],
    activity: spread(1084, 16, 1, 1),
    stories: [
      [
        "Estrategia de reintentos del scoring",
        "Initiative",
        8,
        "Closed",
        FRAUD,
      ],
      [
        "Revisión de la arquitectura del alta",
        "Initiative",
        5,
        "Closed",
        ONBOARDING,
      ],
      ["Revisión de diseños de otras células", "Bau", 3, "Closed"],
    ],
  },
  S18: {
    snapshot: "Provisional",
    wip: [2, 2, 2, 1],
    activity: { 0: [2, 0, 1], 2: [1] },
    stories: [
      [
        "Definición de los umbrales del motor",
        "Initiative",
        8,
        "Active",
        FRAUD,
      ],
      ["Acompañamiento al diseño de un frente nuevo", "Bau", 5, "New"],
      ["Revisión de un diseño de otra célula", "Bau", 3, "New"],
    ],
  },
});

export const DEDICATION_BY_USER: Record<string, SeedUserSprint[]> = {
  [devOpsUserByEmail("maria.gonzalez@tuya.com").id]: MARIA_SPRINTS,
  [devOpsUserByEmail("carlos.lopez@tuya.com").id]: CARLOS_SPRINTS,
  [devOpsUserByEmail("andres.martinez@tuya.com").id]: ANDRES_SPRINTS,
  [devOpsUserByEmail("isabella.moreno@tuya.com").id]: ISABELLA_SPRINTS,
  [devOpsUserByEmail("sebastian.cardenas@tuya.com").id]: SEBASTIAN_SPRINTS,
  [devOpsUserByEmail("paula.ramirez@tuya.com").id]: PAULA_SPRINTS,
  [devOpsUserByEmail("valentina.ospina@tuya.com").id]: VALENTINA_SPRINTS,
  [devOpsUserByEmail("julian.pena@tuya.com").id]: JULIAN_SPRINTS,
  [devOpsUserByEmail("camila.restrepo@tuya.com").id]: CAMILA_SPRINTS,
  [devOpsUserByEmail("diego.salazar@tuya.com").id]: DIEGO_SPRINTS,
  [devOpsUserByEmail("laura.ruiz@tuya.com").id]: LAURA_SPRINTS,
  [devOpsUserByEmail("mateo.vargas@tuya.com").id]: MATEO_SPRINTS,
  [devOpsUserByEmail("sofia.herrera@tuya.com").id]: SOFIA_SPRINTS,
  [devOpsUserByEmail("nicolas.betancur@tuya.com").id]: NICOLAS_SPRINTS,
  [devOpsUserByEmail("emilio.naranjo@tuya.com").id]: EMILIO_SPRINTS,
  [devOpsUserByEmail("tomas.giraldo@tuya.com").id]: TOMAS_SPRINTS,
};
