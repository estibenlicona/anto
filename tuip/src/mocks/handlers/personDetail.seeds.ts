import type {
  DevOpsCandidateDto,
  DevOpsIdentityDto,
  HoursReportStatus,
} from "@features/people/services/personDetailService";

/**
 * Datos de ejemplo del detalle de persona que NO existen en el dominio todavía
 * (horas por sprint, identidades DevOps, capacidades, chapter). Son ficción
 * hasta que exista backend: los tests verifican derivaciones, no estas cifras.
 */

export const MARIA = "p1111111-1111-1111-1111-111111111111";
export const CARLOS = "p3333333-3333-3333-3333-333333333333";
export const LAURA = "p2222222-2222-2222-2222-222222222222";
export const VALENTINA = "pddddddd-dddd-dddd-dddd-dddddddddddd";
export const CAMILA = "pfffffff-ffff-ffff-ffff-ffffffffffff";
export const DIEGO = "pccccccc-cccc-cccc-cccc-cccccccccccc";

export const SPRINT_HOURS = 80;
export const TOLERANCE = { min: 76, max: 84 };
/** Del más antiguo al más reciente; el último es el sprint en curso. */
export const SPRINTS = ["S11", "S12", "S13", "S14", "S15", "S16"] as const;
export const CURRENT_SPRINT = "S16";
export const CURRENT_SPRINT_CLOSES_AT = "2026-08-22";
export const CURRENT_SPRINT_SUBMITTED_AT = "2026-08-08";

export interface SeedSprintHours {
  bau: number;
  initiative: number;
  free: number;
  status: HoursReportStatus;
}

/** Horas por persona y sprint, alineadas con SPRINTS. Sin entrada = sin reportes. */
export const HOURS_BY_PERSON: Record<string, SeedSprintHours[]> = {
  // María: 80 % asignado (64 h esperadas); tres últimos sprints por encima.
  [MARIA]: [
    { bau: 34, initiative: 27, free: 19, status: "Validated" },
    { bau: 40, initiative: 24, free: 16, status: "Validated" },
    { bau: 36, initiative: 30, free: 14, status: "Validated" },
    { bau: 42, initiative: 28, free: 10, status: "Validated" },
    { bau: 40, initiative: 32, free: 8, status: "Validated" },
    { bau: 42, initiative: 32, free: 4, status: "Submitted" },
  ],
  // Carlos: 100 % asignado, reporta parejo.
  [CARLOS]: [
    { bau: 48, initiative: 32, free: 0, status: "Validated" },
    { bau: 46, initiative: 34, free: 0, status: "Validated" },
    { bau: 50, initiative: 30, free: 0, status: "Validated" },
    { bau: 47, initiative: 33, free: 0, status: "Validated" },
    { bau: 48, initiative: 32, free: 0, status: "Validated" },
    { bau: 48, initiative: 30, free: 2, status: "Validated" },
  ],
  // Laura: 100 % en Canales; el sprint actual sin reportar.
  [LAURA]: [
    { bau: 24, initiative: 56, free: 0, status: "Validated" },
    { bau: 26, initiative: 54, free: 0, status: "Validated" },
    { bau: 24, initiative: 54, free: 2, status: "Validated" },
    { bau: 22, initiative: 58, free: 0, status: "Validated" },
    { bau: 24, initiative: 56, free: 0, status: "Validated" },
    { bau: 0, initiative: 0, free: 0, status: "NotReported" },
  ],
  // Valentina: 60 % asignado (48 h), reporta por debajo.
  [VALENTINA]: [
    { bau: 16, initiative: 28, free: 36, status: "Validated" },
    { bau: 14, initiative: 30, free: 36, status: "Validated" },
    { bau: 16, initiative: 26, free: 38, status: "Validated" },
    { bau: 14, initiative: 30, free: 36, status: "Validated" },
    { bau: 12, initiative: 30, free: 38, status: "Validated" },
    { bau: 14, initiative: 30, free: 36, status: "Draft" },
  ],
};

export interface SeedIdentity extends Omit<DevOpsIdentityDto, "linkedAt"> {
  linkedAt: string;
}

/** Identidades ya vinculadas, por persona. */
export const LINKED_IDENTITIES: Record<string, SeedIdentity> = {
  [MARIA]: {
    id: "i1",
    userName: "mgonzalez@tuya",
    linkedAt: "2026-07-25",
    activeItems: 11,
    initiativeItems: 7,
    bauItems: 4,
    pendingCuration: 2,
  },
  [CARLOS]: {
    id: "i2",
    userName: "clopez@tuya",
    linkedAt: "2026-07-25",
    activeItems: 6,
    initiativeItems: 5,
    bauItems: 1,
    pendingCuration: 0,
  },
  [VALENTINA]: {
    id: "i3",
    userName: "vospina@tuya",
    linkedAt: "2026-07-28",
    activeItems: 4,
    initiativeItems: 4,
    bauItems: 0,
    pendingCuration: 1,
  },
};

/** Identidades del espejo de Entra ID todavía sin persona, candidatas por nombre. */
export const CANDIDATE_IDENTITIES: Array<
  DevOpsCandidateDto & {
    forPersonId: string;
    items: Omit<SeedIdentity, "id" | "userName" | "linkedAt">;
  }
> = [
  {
    id: "i9",
    userName: "crestrepo@tuya",
    displayName: "Camila Restrepo",
    forPersonId: CAMILA,
    items: {
      activeItems: 3,
      initiativeItems: 3,
      bauItems: 0,
      pendingCuration: 3,
    },
  },
  {
    id: "i10",
    userName: "camila.restrepo@globant",
    displayName: "Restrepo, Camila (Globant)",
    forPersonId: CAMILA,
    items: {
      activeItems: 0,
      initiativeItems: 0,
      bauItems: 0,
      pendingCuration: 0,
    },
  },
  {
    id: "i11",
    userName: "dsalazar@tuya",
    displayName: "Diego Salazar",
    forPersonId: DIEGO,
    items: {
      activeItems: 2,
      initiativeItems: 0,
      bauItems: 2,
      pendingCuration: 2,
    },
  },
];

/**
 * Nivel SFIA que cada célula pide por capacidad principal (nombre de cargo).
 * Sin entrada: pide el nivel 2 (Competente).
 */
export const REQUIRED_SFIA_BY_SQUAD: Record<string, Record<string, number>> = {
  // Backend Platform
  "11111111-1111-1111-1111-111111111111": {
    "Backend Dev": 3,
    Arquitecto: 4,
    "Frontend Dev": 2,
  },
  // Canales Digitales
  "22222222-2222-2222-2222-222222222222": {
    "QA Engineer": 3,
    "Backend Dev": 3,
  },
  // Fraude Tarjetas
  "33333333-3333-3333-3333-333333333333": {
    "UX Designer": 3,
    "Product Owner": 4,
    "Backend Dev": 4,
  },
  // Pagos Instantáneos
  "44444444-4444-4444-4444-444444444444": {
    "Product Owner": 3,
    "Backend Dev": 3,
  },
  // Plataforma de Datos
  "55555555-5555-5555-5555-555555555555": {
    "Data Engineer": 3,
    "Data Analyst": 2,
  },
};

/**
 * Qué cargos le faltan a cada célula (motivo de la sugerencia). Se combina con
 * el equipo real en memoria: si la célula ya tiene ese cargo, deja de pedirlo.
 */
export const WANTED_POSITIONS_BY_SQUAD: Record<string, string[]> = {
  "44444444-4444-4444-4444-444444444444": ["Product Owner", "Backend Dev"],
  "33333333-3333-3333-3333-333333333333": ["Product Owner", "Backend Dev"],
  "22222222-2222-2222-2222-222222222222": ["QA Engineer"],
  "55555555-5555-5555-5555-555555555555": ["Data Analyst"],
};

/** Bandas de costo mensual por seniority (escala Tuya 1–4), en COP. */
export const COST_BANDS: Record<number, { min: number; max: number }> = {
  1: { min: 4_000_000, max: 6_500_000 },
  2: { min: 5_500_000, max: 8_500_000 },
  3: { min: 7_000_000, max: 11_000_000 },
  4: { min: 9_000_000, max: 15_000_000 },
};

/** Vigencia de contrato de externas, por persona (las demás externas: sin fecha). */
export const CONTRACT_ENDS_AT: Record<string, string> = {
  [CARLOS]: "2026-12-31",
};
