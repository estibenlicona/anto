import type {
  InitiativeDto,
  RejectReason,
} from "@features/backlog/services/backlogService";
import { getInitiativesSnapshot } from "./initiatives.handlers";

/**
 * Datos de ejemplo del backlog. Los work items de DevOps, las iniciativas
 * activas y las categorías BAU no existen en el dominio todavía: son ficción
 * hasta que exista backend. Las historias referencian usuarios DevOps (no
 * personas): la persona se resuelve por la identidad vinculada en el mock de
 * detalle de persona, así que vincular una identidad hace aparecer sus
 * historias sin tocar estas semillas.
 */

/**
 * Catálogo de iniciativas del backlog: derivado del mock de iniciativas (misma
 * fuente de ids y nombres, incluidas las creadas en la sesión). Función y no
 * constante porque ese estado se reasigna con cada mutación.
 */
export function initiativeCatalog(): InitiativeDto[] {
  return getInitiativesSnapshot().map((i) => ({
    id: i.id,
    name: i.name,
    squadId: i.squadId,
  }));
}

/** Catálogo de categorías BAU del MVP v6. */
export const BAU_CATEGORIES = [
  "Soporte y operación en producción",
  "Mantenimiento correctivo",
  "Mantenimiento preventivo / mejoras",
  "Documentación técnica",
  "Gestión de conocimiento / onboarding",
  "Ceremonias y reuniones de equipo",
  "Soporte a otros equipos / consultoría interna",
  "Seguridad y compliance",
  "Otro BAU",
];

export const REJECT_REASONS: Array<{ value: RejectReason; label: string }> = [
  { value: "OtherPerson", label: "Es de otra persona" },
  { value: "DevOpsMistake", label: "Error de asignación en DevOps" },
  { value: "Duplicate", label: "Duplicado" },
  { value: "OtherTeam", label: "Trabajo de otro equipo" },
  { value: "Other", label: "Otro" },
];

export const TODAY = "2026-08-22";
const YESTERDAY = "2026-08-21";
const LAST_WEEK = "2026-08-15";

export interface SeedStory {
  number: number;
  title: string;
  description: string;
  points: number;
  devOpsState: "New" | "Active" | "Resolved" | "Closed";
  board: string;
  sprint: string;
  epicTitle: string | null;
  epicInitiativeId: string | null;
  assignedTo: string;
  previousAssignedTo?: string;
  ingestedAt: string;
  /** Ya clasificada al arrancar (para la vista Clasificadas). */
  classified?: {
    kind: "Initiative" | "Bau" | "Discard";
    initiativeId?: string;
    bauCategory?: string;
    at: string;
  };
}

const KAFKA = "Migración plataforma Kafka";

export const STORIES: SeedStory[] = [
  // Backend Core · Carlos (clopez), María (mgonzalez), Diego (dsalazar, sin vincular)
  {
    number: 12401,
    title: "Consumer group: rebalanceo de particiones en picos de carga",
    description:
      "Como plataforma, necesito que el consumer group redistribuya particiones sin perder offsets cuando entra o sale un consumidor, para sostener picos sin reprocesar eventos.",
    points: 5,
    devOpsState: "Active",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: KAFKA,
    epicInitiativeId: "ini-kafka",
    assignedTo: "clopez@tuya",
    ingestedAt: TODAY,
  },
  {
    number: 12405,
    title: "Test de carga de tópicos",
    description:
      "Como equipo, quiero una prueba de carga reproducible sobre los tópicos críticos para conocer el techo antes de la migración.",
    points: 2,
    devOpsState: "New",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: KAFKA,
    epicInitiativeId: "ini-kafka",
    assignedTo: "clopez@tuya",
    ingestedAt: TODAY,
  },
  {
    number: 12318,
    title: "Ajuste reporte contable",
    description:
      "El cierre contable del 20 muestra diferencias de redondeo en las comisiones; corregir la agregación.",
    points: 3,
    devOpsState: "Active",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "clopez@tuya",
    previousAssignedTo: "jpena@tuya",
    ingestedAt: YESTERDAY,
  },
  {
    number: 12299,
    title: "Spike compresión de mensajes",
    description: "Evaluar snappy vs zstd para los tópicos de eventos de pago.",
    points: 2,
    devOpsState: "Active",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "mgonzalez@tuya",
    previousAssignedTo: "clopez@tuya",
    ingestedAt: YESTERDAY,
  },
  {
    number: 12350,
    title: "Esquemas Avro en el registry",
    description:
      "Publicar los esquemas de los eventos de pago en el schema registry con compatibilidad backward.",
    points: 5,
    devOpsState: "Active",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: KAFKA,
    epicInitiativeId: "ini-kafka",
    assignedTo: "clopez@tuya",
    ingestedAt: LAST_WEEK,
    classified: {
      kind: "Initiative",
      initiativeId: "ini-kafka",
      at: LAST_WEEK,
    },
  },
  {
    number: 12344,
    title: "Productor idempotente de pagos",
    description:
      "Habilitar idempotencia en el productor para no duplicar eventos ante reintentos.",
    points: 3,
    devOpsState: "Closed",
    board: "Backend Core",
    sprint: "S15",
    epicTitle: KAFKA,
    epicInitiativeId: "ini-kafka",
    assignedTo: "clopez@tuya",
    ingestedAt: LAST_WEEK,
    classified: {
      kind: "Initiative",
      initiativeId: "ini-kafka",
      at: YESTERDAY,
    },
  },
  {
    number: 12360,
    title: "Rotación de credenciales del broker",
    description:
      "Rotar las credenciales SASL del broker según la política de seguridad.",
    points: 1,
    devOpsState: "Resolved",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "mgonzalez@tuya",
    ingestedAt: LAST_WEEK,
    classified: {
      kind: "Bau",
      bauCategory: "Seguridad y compliance",
      at: TODAY,
    },
  },
  {
    number: 12371,
    title: "Documentar runbook de reprocesamiento",
    description: "Runbook para reprocesar eventos desde un offset dado.",
    points: 2,
    devOpsState: "Active",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "mgonzalez@tuya",
    ingestedAt: YESTERDAY,
  },
  {
    number: 12388,
    title: "Conector legacy AS-400",
    description:
      "Conector de salida hacia el core AS-400 para los pagos legacy.",
    points: 8,
    devOpsState: "Active",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: "Conectores legacy",
    epicInitiativeId: "ini-kafka",
    assignedTo: "dsalazar@tuya",
    ingestedAt: TODAY,
  },
  {
    number: 12390,
    title: "Métricas de lag por consumer group",
    description: "Exponer el lag por grupo en Prometheus.",
    points: 3,
    devOpsState: "New",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: KAFKA,
    epicInitiativeId: "ini-kafka",
    assignedTo: "dsalazar@tuya",
    ingestedAt: TODAY,
  },
  {
    number: 12392,
    title: "Alerta por caída del broker",
    description: "Alerta en PagerDuty cuando un broker queda fuera del ISR.",
    points: 2,
    devOpsState: "New",
    board: "Backend Core",
    sprint: "S16",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "dsalazar@tuya",
    ingestedAt: TODAY,
  },
  {
    number: 12366,
    title: "Limpieza de tópicos sin consumidores",
    description: "Borrar tópicos huérfanos del cluster de pruebas.",
    points: 1,
    devOpsState: "Closed",
    board: "Backend Core",
    sprint: "S15",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "mgonzalez@tuya",
    ingestedAt: LAST_WEEK,
    classified: { kind: "Discard", at: YESTERDAY },
  },

  // Fraude Board · Valentina (vospina)
  {
    number: 12410,
    title: "Reglas de scoring antifraude v3",
    description:
      "Como analista, quiero configurar umbrales por segmento para reducir falsos positivos.",
    points: 8,
    devOpsState: "Active",
    board: "Fraude Board",
    sprint: "S16",
    epicTitle: "Fraud Scoring v3",
    epicInitiativeId: "ini-fraud",
    assignedTo: "vospina@tuya",
    ingestedAt: TODAY,
  },
  {
    number: 12412,
    title: "Alertas de velocidad de transacción",
    description:
      "Detectar ráfagas de transacciones por tarjeta en ventanas de 60 s.",
    points: 5,
    devOpsState: "Active",
    board: "Fraude Board",
    sprint: "S16",
    epicTitle: "Fraud Scoring v3",
    epicInitiativeId: "ini-fraud",
    assignedTo: "vospina@tuya",
    ingestedAt: YESTERDAY,
  },
  {
    number: 12415,
    title: "Pantalla de revisión manual",
    description: "Bandeja para que el analista revise los casos marcados.",
    points: 5,
    devOpsState: "New",
    board: "Fraude Board",
    sprint: "S16",
    epicTitle: "Fraud Scoring v3",
    epicInitiativeId: "ini-fraud",
    assignedTo: "vospina@tuya",
    ingestedAt: YESTERDAY,
  },
  {
    number: 12420,
    title: "Corrección de etiquetas en el dashboard",
    description: "Textos mal traducidos en el panel de fraude.",
    points: 1,
    devOpsState: "Active",
    board: "Fraude Board",
    sprint: "S16",
    epicTitle: null,
    epicInitiativeId: null,
    assignedTo: "vospina@tuya",
    ingestedAt: YESTERDAY,
  },
  {
    number: 12402,
    title: "Migrar modelo a la versión 2 del SDK",
    description: "Actualizar el SDK del motor de reglas.",
    points: 3,
    devOpsState: "Closed",
    board: "Fraude Board",
    sprint: "S15",
    epicTitle: "Fraud Scoring v3",
    epicInitiativeId: "ini-fraud",
    assignedTo: "vospina@tuya",
    ingestedAt: LAST_WEEK,
    classified: {
      kind: "Initiative",
      initiativeId: "ini-fraud",
      at: LAST_WEEK,
    },
  },
];
