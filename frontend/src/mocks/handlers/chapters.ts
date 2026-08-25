/**
 * Los chapters: el catálogo, quién lidera cada uno, y a quién alcanza a ver
 * ese lead.
 *
 * El acotado por responsabilidad lo hace el **servidor**, y estos mocks
 * implementan ese contrato para que la app se pueda ver y probar antes de que
 * el backend exista. La interfaz no filtra nada: recibe ya acotado lo que le
 * corresponde ver a quien pidió.
 *
 * Cómo se resuelve el titular: el token trae el `oid` de Entra, y cada chapter
 * declara el de su lead. No hace falta mirar las personas para saber qué
 * chapter lidera alguien — por eso este módulo no importa a nadie y no hay
 * ciclo con people.handlers, que sí lo importa a él.
 *
 * Sin token no hay a quién resolverle la responsabilidad y la respuesta va sin
 * acotar. Es deliberado y es lo que hace que la suite existente —que ejercita
 * los servicios sin montar sesión— siga viendo el conjunto completo. Un
 * backend de verdad responde 401 ahí; el mock de la puerta de enlace también,
 * cuando se lo enciende (ver gateway.handlers).
 *
 * ── La revisión de los totales, una por una ──────────────────────────────
 *
 * Cada cifra que la interfaz presenta como "del chapter" se miró por separado,
 * porque no es mecánico: una capacidad objetivo o un catálogo pueden ser del
 * sistema y no cambiar, y confundirlos hace que un número diga otra cosa sin
 * que nada falle. El resultado, para no tener que volver a preguntárselo:
 *
 * SE ACOTAN — son cifras de la gente a cargo:
 * - Personas: personas activas, FTE disponible, el reparto por seniority, la
 *   muestra de avatares y los stacks sin respaldo.
 * - Torre de control: FTE del chapter, BAU, Transformación, libre, total de
 *   personas, sin asignar, parciales, células al tope y sin equipo.
 * - Células: el FTE del chapter y el asignado, el equipo de cada célula y sus
 *   recuentos de expertos y principiantes.
 * - Competencias: la matriz, las personas evaluadas, las brechas, el resumen
 *   y los roles sin nivel declarado —los roles salen de la gente a cargo—.
 * - Ausencias: el calendario del mes, las que esperan aprobación y el impacto
 *   en capacidad. La cola de aprobación es trabajo de ese lead.
 * - Asignaciones: el listado de cada célula.
 * - Facturación: las prefacturas, que son una por persona externa.
 * - Backlog: la cola. Ojo: la identidad de cada historia se resuelve contra el
 *   conjunto completo, si no una historia ajena se contaría como "sin
 *   identidad DevOps", que es otro problema y mandaría a alguien a resolverlo
 *   en vano.
 * - Ficha de una persona: la cobertura de sus stacks ("nadie más lo cubre"),
 *   calculada sobre el chapter de ella y no sobre el de quien mira, para que
 *   diga lo mismo la abra quien la abra.
 *
 * NO SE ACOTAN, y es una decisión, no un olvido:
 * - El Administrador de plataforma: no lidera ningún chapter, así que ve todo.
 * - Las pantallas de /app/admin. El catálogo de habilidades incluye la tabla
 *   "Nivel esperado por rol", cuyos roles se derivan de las personas: se deja
 *   sobre el conjunto completo a propósito, porque el catálogo es un artefacto
 *   del sistema y un rol no debe desaparecer de él porque un chapter no tenga
 *   hoy a nadie con ese rol. Las líneas de expertise son el maestro con el que
 *   se reparte a la gente: acotarlo impediría repartir.
 * - Los catálogos del sistema: stacks, los cuatro niveles de seniority —salen
 *   siempre, aunque queden en cero—, modalidades, proveedores, criticidades y
 *   bandas de talla. No son cifras de personas.
 * - El listado de células: las células son del chapter, no de una persona. Lo
 *   que se acota es su equipo y las cifras que salen de él.
 * - Resolver una persona por id (su ficha, su evaluación): lo que la regla
 *   acota es enumerar y contar, no la lectura puntual a la que sólo se llega
 *   desde el propio listado.
 *
 * UN CASO QUE NO SE PUEDE ACOTAR, y por eso queda como está: el conteo de
 * "historias de personas sin identidad DevOps" del backlog. Son justamente las
 * historias que no se pudieron atribuir a nadie, así que no tienen chapter al
 * que pertenecer: acotarlas sería inventar. Cada lead ve el mismo número, y es
 * el único de esa pantalla que no habla sólo de su gente.
 *
 * QUEDA ANOTADO COMO DEUDA: `ASSUMED_FTE_TARGET` en people.handlers es una
 * capacidad objetivo fija de 12 que viaja en el DTO y que hoy no muestra
 * ninguna pantalla. Con un chapter de cinco personas, un objetivo de 12 no
 * significa nada. Cuando alguna pantalla lo use habrá que decidir si se acota
 * o si el backend lo calcula por chapter.
 */

export interface Chapter {
  id: string;
  name: string;
  /** Nombre de quien lo lidera; las semillas de personas lo resuelven a id. */
  leadName: string;
  /**
   * El `oid` del lead en Entra: la llave con la que el servidor resuelve la
   * responsabilidad a partir del token. El simulador emite exactamente éste.
   */
  leadEntraObjectId: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "ch111111-1111-1111-1111-111111111111",
    name: "Core y Datos",
    leadName: "Tomás Giraldo",
    leadEntraObjectId: "22222222-2222-2222-2222-222222222222",
  },
  {
    id: "ch222222-2222-2222-2222-222222222222",
    name: "Canales Digitales",
    leadName: "Isabella Moreno",
    leadEntraObjectId: "44444444-4444-4444-4444-444444444444",
  },
  // Recién creado y todavía sin gente: es el estado en el que un chapter
  // arranca, y sin uno así no se ve nunca el vacío de las pantallas del rol.
  // Su lead pertenece a otro chapter porque nadie se movió aún — el requisito
  // pide que toda persona tenga chapter, no que el lead esté en el suyo.
  {
    id: "ch333333-3333-3333-3333-333333333333",
    name: "Datos Avanzados",
    leadName: "Paula Ramírez",
    leadEntraObjectId: "55555555-5555-5555-5555-555555555555",
  },
];

const CORE = CHAPTERS[0].id;
const CANALES = CHAPTERS[1].id;

/**
 * A qué chapter pertenece cada persona sembrada, por nombre — mismo criterio
 * que `EXTERNAL_PROVIDERS` y el reparto de líneas: los ids de las semillas se
 * construyen con un truco de letras repetidas y no se copia acá.
 *
 * El reparto es por disciplina, y deja los dos chapters con volumen distinto a
 * propósito: si uno tuviera una o dos personas, un error de acotado pasaría
 * por diferencia de redondeo.
 */
export const CHAPTER_BY_PERSON_NAME: Record<string, string> = {
  // Core y Datos
  "María González": CORE,
  "Laura Ruiz": CORE,
  "Carlos López": CORE,
  "Paula Ramírez": CORE,
  "Diego Salazar": CORE,
  "Sebastián Cárdenas": CORE,
  "Camila Restrepo": CORE,
  "Julián Peña": CORE,
  "Mateo Vargas": CORE,
  "Sofía Herrera": CORE,
  "Tomás Giraldo": CORE,
  "Daniela Castaño": CORE,
  "Emilio Naranjo": CORE,
  // Canales Digitales
  "Andrés Martínez": CANALES,
  "Valentina Ospina": CANALES,
  "Isabella Moreno": CANALES,
  "Lucía Arango": CANALES,
  "Nicolás Betancur": CANALES,
};

export function findChapter(id: string | null): Chapter | undefined {
  return id ? CHAPTERS.find((c) => c.id === id) : undefined;
}

/** El `entraObjectId` que le toca a una persona sembrada: sólo los leads tienen. */
export function leadEntraObjectIdOf(personName: string): string {
  return (
    CHAPTERS.find((c) => c.leadName === personName)?.leadEntraObjectId ?? ""
  );
}

/**
 * El `oid` del titular del token. Acepta las dos formas que llegan en
 * desarrollo: el token del simulador (`simulated.<oid>.token`) y un JWT real,
 * del que se lee el `oid` de su carga. Cualquier otra cosa no identifica a
 * nadie.
 */
function holderObjectId(request: Request): string | null {
  const header = request.headers.get("Authorization");
  const token = header?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const simulado = /^simulated\.([^.]+)\.token$/.exec(token);
  if (simulado) return simulado[1];

  const carga = token.split(".")[1];
  if (!carga) return null;
  try {
    const json = JSON.parse(
      atob(carga.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { oid?: unknown };
    return typeof json.oid === "string" ? json.oid : null;
  } catch {
    return null;
  }
}

/**
 * El chapter que lidera el titular del token, o `null` si no lidera ninguno
 * —el Administrador, o una petición sin token—. `null` significa "sin acotar",
 * y es distinto de un chapter sin personas, que acota a cero.
 */
export function holderChapterId(request: Request): string | null {
  const oid = holderObjectId(request);
  if (!oid) return null;
  return CHAPTERS.find((c) => c.leadEntraObjectId === oid)?.id ?? null;
}
