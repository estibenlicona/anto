import type { DevOpsUserDto } from "@features/people/services/personDetailService";

/**
 * Datos de ejemplo del detalle de persona que NO existen en el dominio todavía
 * (identidades DevOps, capacidades, chapter). Son ficción hasta que exista
 * backend: los tests verifican derivaciones, no estas cifras. No hay horas:
 * la plataforma no las registra.
 */

export const MARIA = "p1111111-1111-1111-1111-111111111111";
export const CARLOS = "p3333333-3333-3333-3333-333333333333";
export const LAURA = "p2222222-2222-2222-2222-222222222222";
export const VALENTINA = "pddddddd-dddd-dddd-dddd-dddddddddddd";
export const CAMILA = "pfffffff-ffff-ffff-ffff-ffffffffffff";
export const DIEGO = "pccccccc-cccc-cccc-cccc-cccccccccccc";
export const JULIAN = "pggggggg-gggg-gggg-gggg-gggggggggggg";
export const DANIELA = "plllllll-llll-llll-llll-llllllllllll";
export const ANDRES = "paaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const PAULA = "pbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
export const SEBASTIAN = "peeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
export const ISABELLA = "phhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh";
export const MATEO = "piiiiiii-iiii-iiii-iiii-iiiiiiiiiiii";
export const SOFIA = "pjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj";
// La letra sale del orden en el listado de personas (`people.handlers.ts`):
// Tomás es el 11.º, Emilio el 13.º y Nicolás el 15.º.
export const TOMAS = "pkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk";
export const EMILIO = "pmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm";
export const NICOLAS = "pooooooo-oooo-oooo-oooo-oooooooooooo";

/** Lo que el mock guarda de una identidad vinculada: el usuario de DevOps y cuándo. */
export interface SeedIdentity {
  /** Identificador del usuario en Azure DevOps. */
  id: string;
  /** Su correo: la clave con la que se lo busca en el directorio. */
  userName: string;
  linkedAt: string;
}

/**
 * Los usuarios de Azure DevOps que la búsqueda por correo puede encontrar. La
 * dedicación real (dedication.seeds.ts) se siembra por el `id` de estos
 * usuarios, así que vincular una identidad hace aparecer sus sprints sin
 * tocar aquellas semillas.
 */
export const DEVOPS_USERS: DevOpsUserDto[] = [
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a61",
    displayName: "María González",
    email: "maria.gonzalez@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Backend Platform"],
    boards: ["Backend Core"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a62",
    displayName: "Carlos López",
    email: "carlos.lopez@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Backend Platform"],
    boards: ["Backend Core"],
  },
  // Andrés, Isabella, Sebastián y Paula completan dos células con más de un
  // colaborador medido. Hace falta: la mediana de la célula sólo dice algo
  // cuando hay varios, y el modificador de "la célula se comporta igual" no se
  // puede ver con una célula de una sola persona.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a66",
    displayName: "Andrés Martínez",
    email: "andres.martinez@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Backend Platform"],
    boards: ["Backend Core"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a67",
    displayName: "Isabella Moreno",
    email: "isabella.moreno@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Backend Platform"],
    boards: ["Frontend Web"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a68",
    displayName: "Sebastián Cárdenas",
    email: "sebastian.cardenas@tuya.com",
    avatarUrl: null,
    projects: ["Analítica"],
    teams: ["Plataforma de Datos"],
    boards: ["Data Platform"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a6a",
    displayName: "Paula Ramírez",
    email: "paula.ramirez@tuya.com",
    avatarUrl: null,
    projects: ["Analítica"],
    teams: ["Plataforma de Datos"],
    boards: ["Data Platform"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a63",
    displayName: "Valentina Ospina",
    email: "valentina.ospina@tuya.com",
    avatarUrl: null,
    projects: ["Canales Digitales"],
    teams: ["Fraude Tarjetas"],
    boards: ["Fraude Board"],
  },
  // Julián: vinculado y sin célula, con historias a su nombre. Es el caso
  // "Sin célula" de la dedicación real: hay comprometido pero nada asignado
  // contra qué leerlo.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a64",
    displayName: "Julián Peña",
    email: "julian.pena@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Backend Platform"],
    boards: ["Backend Core"],
  },
  // Daniela: vinculada, pero DevOps no le devuelve sprints. Es el caso "Sin
  // sprint": la identidad existe y no hay nada que leer todavía.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a65",
    displayName: "Daniela Castaño",
    email: "daniela.castano@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: [],
    boards: [],
  },
  // Camila: la persona sin identidad del detalle; su correo corporativo es el
  // que el drawer trae prellenado, así que buscar sin tocar nada la encuentra.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a69",
    displayName: "Camila Restrepo",
    email: "camila.restrepo@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario", "Canales Digitales"],
    teams: ["Pagos Instantáneos", "Fraude Tarjetas"],
    boards: ["Pagos · Stories", "Fraude · Backlog"],
  },
  // Diego: sin identidad, con sprints sembrados a su nombre que aparecen en
  // la dedicación real en cuanto se lo vincula.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a6b",
    displayName: "Diego Salazar",
    email: "diego.salazar@tuya.com",
    avatarUrl: null,
    projects: ["Canales Digitales"],
    teams: ["Canales Digitales"],
    boards: ["Canales"],
  },
  // Laura, Mateo y Sofía completan el cuadro de sobreasignación del chapter:
  // con una sola fila en peligro no se ve si la tabla se lee cuando son
  // varias, ni si el indicador que las nombra aguanta más de un puñado.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a6c",
    displayName: "Laura Ruiz",
    email: "laura.ruiz@tuya.com",
    avatarUrl: null,
    projects: ["Canales Digitales"],
    teams: ["Canales Digitales"],
    boards: ["Canales · QA"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a6d",
    displayName: "Mateo Vargas",
    email: "mateo.vargas@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Plataforma de Datos"],
    boards: ["Datos · Analítica"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a6e",
    displayName: "Sofía Herrera",
    email: "sofia.herrera@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Backend Platform"],
    boards: ["Backend Core"],
  },
  // Los tres que faltaban de las células con gente asignada. Sin usuario de
  // DevOps, una persona asignada al 100 % quedaba fuera del balance de carga
  // de su célula, y la célula se leía sobre la mitad de su gente.
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a6f",
    displayName: "Nicolás Betancur",
    email: "nicolas.betancur@tuya.com",
    avatarUrl: null,
    projects: ["Canales Digitales"],
    teams: ["Canales Digitales"],
    boards: ["Canales · Móvil"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a70",
    displayName: "Emilio Naranjo",
    email: "emilio.naranjo@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Fraude Tarjetas"],
    boards: ["Fraude Board"],
  },
  {
    id: "7f0a1c2e-9b3d-4e5f-8a6b-1c2d3e4f5a71",
    displayName: "Tomás Giraldo",
    email: "tomas.giraldo@tuya.com",
    avatarUrl: null,
    projects: ["Core Bancario"],
    teams: ["Fraude Tarjetas"],
    boards: ["Fraude Board"],
  },
];

/** El usuario de DevOps con ese correo; las semillas se escriben por correo porque se leen mejor. */
export function devOpsUserByEmail(email: string): DevOpsUserDto {
  const user = DEVOPS_USERS.find((u) => u.email === email);
  if (!user) throw new Error(`No hay usuario de DevOps sembrado con ${email}`);
  return user;
}

function linkedFrom(email: string, linkedAt: string): SeedIdentity {
  const user = devOpsUserByEmail(email);
  return { id: user.id, userName: user.email, linkedAt };
}

/** Identidades ya vinculadas, por persona. */
export const LINKED_IDENTITIES: Record<string, SeedIdentity> = {
  [MARIA]: linkedFrom("maria.gonzalez@tuya.com", "2026-07-25"),
  [CARLOS]: linkedFrom("carlos.lopez@tuya.com", "2026-07-25"),
  [VALENTINA]: linkedFrom("valentina.ospina@tuya.com", "2026-07-28"),
  [JULIAN]: linkedFrom("julian.pena@tuya.com", "2026-08-03"),
  [DANIELA]: linkedFrom("daniela.castano@tuya.com", "2026-08-19"),
  [ANDRES]: linkedFrom("andres.martinez@tuya.com", "2026-07-25"),
  [ISABELLA]: linkedFrom("isabella.moreno@tuya.com", "2026-07-20"),
  [SEBASTIAN]: linkedFrom("sebastian.cardenas@tuya.com", "2026-07-25"),
  [PAULA]: linkedFrom("paula.ramirez@tuya.com", "2026-07-25"),
  [LAURA]: linkedFrom("laura.ruiz@tuya.com", "2026-07-25"),
  [MATEO]: linkedFrom("mateo.vargas@tuya.com", "2026-07-27"),
  [SOFIA]: linkedFrom("sofia.herrera@tuya.com", "2026-07-27"),
  // Toda persona con asignación en una célula está vinculada: si no lo
  // estuviera, la célula declararía su dedicación y el balance de carga no
  // podría decir nada de ella, que es la contradicción que hay que evitar.
  // El caso "sin identidad" lo sostiene Camila, que no tiene célula.
  [DIEGO]: linkedFrom("diego.salazar@tuya.com", "2026-07-25"),
  [NICOLAS]: linkedFrom("nicolas.betancur@tuya.com", "2026-07-27"),
  [EMILIO]: linkedFrom("emilio.naranjo@tuya.com", "2026-07-28"),
  [TOMAS]: linkedFrom("tomas.giraldo@tuya.com", "2026-07-20"),
};

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

/** Bandas de costo mensual por nivel (escala Tuya 1–4), en COP. */
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
