import type {
  BacklogStory,
  BacklogSummary,
} from "../../adapters/BacklogAdapter";
import type { BacklogCatalogsDto } from "../../services/backlogService";

export const catalogs: BacklogCatalogsDto = {
  initiatives: [
    { id: "ini-kafka", name: "Kafka Migration", squadId: "s1" },
    { id: "ini-fraud", name: "Fraud Scoring v3", squadId: "s2" },
  ],
  bauCategories: ["Soporte y operación en producción", "Documentación técnica"],
  rejectReasons: [
    { value: "OtherPerson", label: "Es de otra persona" },
    { value: "Duplicate", label: "Duplicado" },
  ],
};

export const story: BacklogStory = {
  id: "wi-1",
  number: 12401,
  title: "Consumer group: rebalanceo",
  description: "Como plataforma, necesito…",
  type: "UserStory",
  points: 5,
  devOpsState: "Active",
  board: "Backend Core",
  sprint: "S16",
  epicTitle: "Migración plataforma Kafka",
  epicInitiativeId: "ini-kafka",
  assignedTo: "clopez@tuya",
  previousAssignedTo: null,
  personId: "p1",
  personName: "Carlos López",
  personPosition: "Arquitecto",
  squadId: "s1",
  squadName: "Backend Platform",
  ingestedAt: "2026-08-22",
  status: "Pending",
  classification: null,
  rejectReason: null,
  rejectDetail: null,
  order: 0,
  initials: "CL",
  devOpsStateLabel: "Activa",
  ingestedLabel: "22 ago 2026",
  changedAssignee: false,
  suggestedInitiativeId: "ini-kafka",
  outcomeLabel: null,
};

export const changed: BacklogStory = {
  ...story,
  id: "wi-2",
  number: 12318,
  title: "Ajuste reporte contable",
  epicTitle: null,
  epicInitiativeId: null,
  previousAssignedTo: "jpena@tuya",
  changedAssignee: true,
  suggestedInitiativeId: null,
  order: 1,
};

export const summary: BacklogSummary = {
  total: 10,
  pending: 8,
  classifiedToday: 2,
  pendingBySquad: [
    { squadId: "s1", squadName: "Backend Platform", pending: 5 },
    { squadId: "s2", squadName: "Fraude Tarjetas", pending: 3 },
  ],
  excludedWithoutIdentity: 3,
  progressPercentage: 20,
};
