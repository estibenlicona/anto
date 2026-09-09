/**
 * El reparto inicial de gente en células, y la única fuente de la dedicación
 * sembrada.
 *
 * Vive fuera de `allocations.handlers` porque `people.handlers` también lo
 * necesita: la utilización de una persona **es** la suma de la dedicación de
 * sus asignaciones (lo mismo que hace `PersonDerivedData.Build` en el
 * backend), y antes estaba escrita a mano en las semillas de personas, donde
 * se desincronizó de este archivo en 8 de 9 filas. Un módulo de datos puros
 * —sin estado ni handlers— lo pueden importar los dos sin romper la regla de
 * que `people.handlers` no importa a ningún mock con estado.
 *
 * El reparto se declara **por nombre de persona**, igual que
 * `initialMembershipByName` en expertise-lines.seeds: los ids sembrados se
 * construyen con un truco de letras repetidas y copiarlo acá sería tenerlo en
 * dos lugares. El handler los resuelve contra el snapshot de personas.
 *
 * Una persona pertenece a una sola célula (el POST rechaza la segunda), así
 * que la utilización nunca pasa de 100: la barra del listado de Personas no
 * puede tener un caso >100 sin inventar un dato que el dominio no admite.
 */

export const SQUAD_IDS = {
  backendPlatform: "11111111-1111-1111-1111-111111111111",
  canalesDigitales: "22222222-2222-2222-2222-222222222222",
  fraudeTarjetas: "33333333-3333-3333-3333-333333333333",
  pagosInstantaneos: "44444444-4444-4444-4444-444444444444",
  plataformaDeDatos: "55555555-5555-5555-5555-555555555555",
} as const;

export const SQUAD_NAMES: Record<string, string> = {
  [SQUAD_IDS.backendPlatform]: "Backend Platform",
  [SQUAD_IDS.canalesDigitales]: "Canales Digitales",
  [SQUAD_IDS.fraudeTarjetas]: "Fraude Tarjetas",
  [SQUAD_IDS.pagosInstantaneos]: "Pagos Instantáneos",
  [SQUAD_IDS.plataformaDeDatos]: "Plataforma de Datos",
};

export interface AllocationSeed {
  /** Nombre de la persona; el handler lo resuelve a id al sembrar. */
  personName: string;
  squadId: string;
  /** 1–100. Es también la utilización de esa persona. */
  dedication: number;
  /** Parte de la dedicación que va a BAU; el resto es transformación. */
  bau: number;
}

/**
 * Cada célula lleva perfiles del mix que le pide la talla de su iniciativa
 * activa, y le falta alguno: la brecha es lo que la herramienta existe para
 * mostrar, así que está sembrada a propósito y crece con la talla.
 *
 * · Backend Platform — Kafka Migration (M, pide 2 backend · 1 frontend ·
 *   1 QA · 1 arquitecto): tiene el arquitecto y un backend, le sobra un
 *   frontend y no tiene QA.
 * · Canales Digitales — Onboarding App (S, pide 2 backend · 1 QA): tiene el
 *   QA y un backend. Es además la única célula al tope —asignado igual a
 *   disponible—, que es el caso del indicador de células.
 * · Fraude Tarjetas — Fraud Scoring v3 (M): crítica y con un solo backend;
 *   le faltan el frontend y el QA.
 * · Plataforma de Datos — Data Mesh Gobernado (L): la más descubierta, y la
 *   que deja ver "Sub-asignada" en el listado de Células. Son exactamente dos
 *   personas medidas, que es lo que hace legible el contexto de célula del
 *   balance de carga ("la célula acompaña").
 * · Pagos Instantáneos queda sin nadie, para el estado "sin demanda".
 *
 * Cinco personas quedan sin célula, y las cinco por un motivo:
 * Julián Peña es el caso evaluable sin célula del balance; Camila Restrepo es
 * externa y el detalle de persona la necesita sin asignar; Mateo Vargas
 * dejaría de ser dos de dos en Plataforma de Datos; Sofía Herrera volvería
 * igual a su célula al arquitecto que hoy se lee distinto de ella; Lucía
 * Arango nunca se repartió. Son las cinco utilizaciones en 0 del listado.
 */
export const initialAllocationSeeds: AllocationSeed[] = [
  // Backend Platform
  {
    personName: "María González",
    squadId: SQUAD_IDS.backendPlatform,
    dedication: 80,
    bau: 50,
  },
  {
    personName: "Carlos López",
    squadId: SQUAD_IDS.backendPlatform,
    dedication: 100,
    bau: 60,
  },
  {
    personName: "Andrés Martínez",
    squadId: SQUAD_IDS.backendPlatform,
    dedication: 50,
    bau: 20,
  },
  {
    personName: "Isabella Moreno",
    squadId: SQUAD_IDS.backendPlatform,
    dedication: 50,
    bau: 30,
  },

  // Canales Digitales
  {
    personName: "Laura Ruiz",
    squadId: SQUAD_IDS.canalesDigitales,
    dedication: 100,
    bau: 30,
  },
  {
    personName: "Diego Salazar",
    squadId: SQUAD_IDS.canalesDigitales,
    dedication: 100,
    bau: 70,
  },
  {
    personName: "Nicolás Betancur",
    squadId: SQUAD_IDS.canalesDigitales,
    dedication: 100,
    bau: 40,
  },

  // Fraude Tarjetas
  {
    personName: "Valentina Ospina",
    squadId: SQUAD_IDS.fraudeTarjetas,
    dedication: 60,
    bau: 20,
  },
  {
    personName: "Daniela Castaño",
    squadId: SQUAD_IDS.fraudeTarjetas,
    dedication: 100,
    bau: 40,
  },
  {
    personName: "Emilio Naranjo",
    squadId: SQUAD_IDS.fraudeTarjetas,
    dedication: 70,
    bau: 30,
  },
  {
    personName: "Tomás Giraldo",
    squadId: SQUAD_IDS.fraudeTarjetas,
    dedication: 60,
    bau: 10,
  },

  // Plataforma de Datos
  {
    personName: "Sebastián Cárdenas",
    squadId: SQUAD_IDS.plataformaDeDatos,
    dedication: 100,
    bau: 50,
  },
  {
    personName: "Paula Ramírez",
    squadId: SQUAD_IDS.plataformaDeDatos,
    dedication: 60,
    bau: 60,
  },
];

/**
 * La utilización sembrada de una persona: la suma de la dedicación de sus
 * asignaciones, 0 si no tiene ninguna. Es la misma cuenta que hace el backend
 * en `PersonDerivedData.Build`, y por eso las dos pantallas no pueden
 * discrepar.
 */
export function seededUtilizationOf(personName: string): number {
  return initialAllocationSeeds
    .filter((a) => a.personName === personName)
    .reduce((sum, a) => sum + a.dedication, 0);
}
