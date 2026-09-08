/**
 * Los chapters: el catálogo, quién lidera cada uno, y el recorte de "Mi Línea".
 *
 * A qué agrupación pertenece una persona y quién la lidera es un dato que la
 * ficha muestra. Lo que **no** hace es decidir por su cuenta qué alcanza a ver
 * nadie: las pantallas muestran todo lo registrado salvo que la petición pida
 * lo contrario (change `quitar-acotamiento-por-lider`).
 *
 * El recorte volvió con "Mi Línea", pero **explícito**: la pantalla manda
 * `?scope=mine` y sólo entonces se resuelve el titular del token. Una petición
 * sin ese parámetro responde igual que antes, sin mirar quién pregunta. Esa es
 * toda la diferencia con el acotamiento que se quitó, que era invisible y
 * aplicaba a pantallas que se leían como generales.
 *
 * La advertencia que hay que respetar al usarlo: al cruzar personas con algo
 * indexado por persona hay que filtrar **las dos puntas**. Acotar las personas
 * y dejar entrar las asignaciones de todo el mundo no esconde nada; convierte
 * a la gente de afuera en personas de 0 FTE, y entonces la célula aparece al
 * tope, el FTE libre da negativo y los porcentajes pasan de 100.
 */

export interface Chapter {
  id: string;
  name: string;
  /** Nombre de quien lo lidera; las semillas de personas lo resuelven a id. */
  leadName: string;
  /**
   * El `oid` del lead en Entra. El simulador emite exactamente éste, así que
   * sigue siendo la llave con la que se reconoce a un lead — hoy sólo para
   * mostrarlo, y de nuevo para acotar cuando exista la vista personal.
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
  // Recién creado y todavía sin gente. Ya no es el fixture del estado vacío
  // —sin acotamiento no hay forma de llegar a él por esa vía—, pero se
  // conserva para que haya más de dos y la ficha de persona muestre valores
  // distintos. El vacío se cubre desde las pruebas y desde "sin resultados".
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
 * El chapter al que hay que acotar esta petición, o `null` para no acotar.
 *
 * Devuelve un chapter **sólo** si se dan las dos condiciones: la petición pide
 * el recorte (`?scope=mine`) y quien la firma lidera un chapter. Sin el
 * parámetro no se mira el token siquiera — una pantalla que no pidió recorte
 * jamás lo recibe por accidente, que es la falla que tenía el acotamiento
 * anterior. Con el parámetro pero sin liderar nada (el administrador, o una
 * petición sin token) el resultado es un conjunto vacío, no "todo": pedir
 * "mi gente" sin tener gente responde nada, no la organización entera.
 */
export function scopedChapterId(request: Request): string | null {
  const url = new URL(request.url);
  if (url.searchParams.get("scope") !== "mine") return null;
  const oid = holderObjectId(request);
  return CHAPTERS.find((c) => c.leadEntraObjectId === oid)?.id ?? EMPTY_SCOPE;
}

/**
 * El chapter imposible con el que se responde "no tenés gente a cargo": ningún
 * `Person.chapterId` lo lleva, así que filtrar por él da vacío. Es distinto de
 * `null`, que significa "no acotes".
 */
export const EMPTY_SCOPE = "ch000000-0000-0000-0000-000000000000";

/**
 * Las personas que le tocan a esta petición. `scopedChapterId` decide; acá
 * sólo se aplica. Cualquier handler que sirva gente —o cifras derivadas de
 * gente— debería pasar por acá en vez de repetir el filtro.
 */
export function scopePeople<T extends { chapterId: string | null }>(
  request: Request,
  people: T[]
): T[] {
  const chapterId = scopedChapterId(request);
  return chapterId ? people.filter((p) => p.chapterId === chapterId) : people;
}
