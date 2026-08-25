import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * El registro del lenguaje de la interfaz, comprobado sobre el código.
 *
 * Antes esta prueba enumeraba las formas prohibidas —`Elegí`, `Probá`,
 * `Creá`…— y esa lista se quedó corta tres veces seguidas: el barrido inicial
 * contó 12 ocurrencias, el reemplazo encontró 56, esta prueba encontró 24 más,
 * y aun así `Registrá` sobrevivió en Iniciativas hasta que alguien lo leyó en
 * pantalla. Una lista deja fuera todo verbo que nadie pensó en escribir, y el
 * hueco sólo se descubre mirando.
 *
 * Ahora reconoce la **forma**: el imperativo del voseo es una palabra
 * terminada en `á`, `é` o `í` acentuada, con o sin pronombre pegado
 * (`Asignáselo`), y sus presentes terminan igual más una `s` (`querés`). El
 * problema es que muchas palabras corrientes terminan así también —está, acá,
 * aquí, además—, y por eso hay una lista de EXCEPCIONES.
 *
 * La diferencia entre una lista de casos y una de excepciones es el modo de
 * fallo: una excepción que falta produce un falso positivo, que se ve y se
 * corrige en el momento; un caso que falta produce un falso negativo, que
 * nadie ve. Es exactamente el error que se cometió tres veces.
 */

/**
 * Palabra terminada en vocal acentuada `á`/`é`/`í`, con la `s` del presente o
 * un pronombre pegado detrás. Es la forma del voseo — y también la de unas
 * cuantas palabras corrientes, que van en EXCEPCIONES.
 */
// Sin `\b` en los extremos: el límite de palabra se define sobre [A-Za-z0-9_],
// así que no cierra después de una vocal acentuada — es el error que dejó
// pasar la mitad de los hallazgos la primera vez. Se usan lookarounds sobre el
// alfabeto real del idioma. Las alternativas largas van primero para que
// `Asignáselo` no se corte en `Asignáse`.
const FORMA_VOSEO =
  /(?<![a-zñáéíóú])[a-zñáéíóú]*[a-zñ][áéí](selos|selas|selo|sela|melo|mela|telo|tela|nos|los|las|les|lo|la|le|me|te|se|s)?(?![a-zñáéíóú])/gi;

/**
 * Palabras corrientes del español que terminan como el voseo pero no lo son.
 * Cada una lleva por qué está: sin el motivo, esta lista se vuelve el lugar
 * donde esconder los hallazgos incómodos.
 */
const EXCEPCIONES = new Map<string, string>([
  // Adverbios y demostrativos de lugar y modo.
  ["acá", "adverbio de lugar"],
  ["allá", "adverbio de lugar"],
  ["aquí", "adverbio de lugar"],
  ["ahí", "adverbio de lugar"],
  ["allí", "adverbio de lugar"],
  ["así", "adverbio de modo"],
  ["atrás", "adverbio de lugar"],
  ["detrás", "adverbio de lugar"],
  ["además", "conector"],
  ["quizás", "adverbio de duda"],
  ["jamás", "adverbio de tiempo"],
  ["más", "comparativo"],
  ["demás", "cuantificador"],
  // Verbos y partículas de uso corriente.
  ["está", "tercera persona de estar"],
  ["dé", "presente de dar con tilde diacrítica"],
  ["sé", "primera persona de saber"],
  ["té", "sustantivo"],
  ["café", "sustantivo"],
  ["qué", "interrogativo"],
  ["porqué", "sustantivo"],
  ["fue", "pretérito de ser/ir"],
  ["esté", "subjuntivo de estar"],
  ["sí", "afirmación"],
  ["después", "adverbio de tiempo"],
  ["comité", "sustantivo"],
  // El futuro de tercera persona termina en `á` como el imperativo del voseo
  // —`contará` y `registrá` se escriben igual de terminadas—, y no hay forma
  // de separarlos sin un diccionario: `contar`+`á` y `registr`+`á`. Van uno
  // por uno, y si esta parte de la lista se hace larga es la señal de que el
  // patrón necesita otra idea, no más permisos.
  ["contará", "futuro de contar"],
  ["saldrá", "futuro de salir"],
  ["aparecerá", "futuro de aparecer"],
  ["empezará", "futuro de empezar"],
  // Nombres propios de las semillas: se muestran en pantalla, y terminar en
  // vocal acentuada no los convierte en un verbo.
  ["andrés", "nombre propio sembrado"],
  ["tomás", "nombre propio sembrado"],
  ["nicolás", "nombre propio sembrado"],
  ["inés", "nombre propio sembrado"],
  ["josé", "nombre propio sembrado"],
]);

/**
 * Cuando las excepciones se pasan de esta cantidad, el patrón está marcando
 * demasiado y conviene revisarlo en vez de seguir agregando permisos. Es un
 * aviso, no un límite: quien lo cruce va a leer esta frase.
 */
const EXCEPCIONES_TOLERADAS = 40;

/**
 * El texto que alguien lee en pantalla: cadenas y contenido de JSX.
 *
 * Los comentarios quedan fuera aunque tengan comillas adentro: explicar por
 * qué no se pregunta "¿confirmás?" no es escribirlo en la interfaz.
 */
function uiStrings(source: string): string[] {
  const linea = source.trim();
  if (linea.startsWith("//") || linea.startsWith("*") || linea.startsWith("/*"))
    return [];
  const out: string[] = [];
  const patrones = [
    /"([^"\\\n]|\\.)*"/g, // "…"
    /'([^'\\\n]|\\.)*'/g, // '…'
    /`([^`\\]|\\.)*`/g, // `…`
    />([^<>{}]+)</g, // texto entre etiquetas JSX
  ];
  for (const patron of patrones) {
    for (const m of source.matchAll(patron)) out.push(m[0]);
  }
  return out;
}

/** Las formas de voseo de un texto, ya descontadas las excepciones. */
export function voseoEn(texto: string): string[] {
  return [...texto.matchAll(FORMA_VOSEO)]
    .map((m) => m[0])
    .filter((palabra) => !EXCEPCIONES.has(palabra.toLowerCase()));
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    // Las pruebas quedan fuera: sus fixtures son datos, no texto de interfaz,
    // y una copia mal escrita llega igual desde el archivo que la muestra.
    if (entry.isDirectory()) {
      if (entry.name === "__test__") continue;
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("el registro del lenguaje de la interfaz", () => {
  it("no usa formas del voseo en ningún texto de la interfaz", () => {
    const hallazgos: string[] = [];

    for (const file of sourceFiles("src")) {
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const cadena of uiStrings(line)) {
          for (const palabra of voseoEn(cadena)) {
            hallazgos.push(
              `${file}:${i + 1}  ${palabra}  →  ${line.trim().slice(0, 80)}`
            );
          }
        }
      });
    }

    expect(hallazgos).toEqual([]);
  });

  it("reconoce un verbo que nadie enumeró", () => {
    // El caso real: `Registrá` no estaba en la lista de la versión anterior y
    // sobrevivió a dos barridos. La forma lo encuentra sin que nadie lo
    // escriba.
    expect(voseoEn("Registrá la primera iniciativa")).toEqual(["Registrá"]);
    expect(voseoEn("Asignáselo a alguien desde su ficha")).toEqual([
      "Asignáselo",
    ]);
    expect(voseoEn("Si querés, podés cambiarlo")).toEqual(["querés", "podés"]);
    // Y los que la lista sí tenía siguen cayendo.
    expect(voseoEn("Elegí una célula")).toEqual(["Elegí"]);
  });

  it("no marca las palabras corrientes que terminan igual", () => {
    const corrientes =
      "Está acá, más allá; así que aquí no hay café ni té. Qué fue, además.";
    expect(voseoEn(corrientes)).toEqual([]);
  });

  it("no mira identificadores ni comentarios, sólo lo que se lee", () => {
    // Un nombre de variable o un comentario con una palabra acentuada no es
    // texto de interfaz. Acotarlo evita que la lista de excepciones crezca
    // por motivos que no tienen que ver con el idioma del producto.
    const codigo = `// Registrá acá el pendiente\nconst registrá = 1;`;
    expect(uiStrings(codigo)).toEqual([]);
  });

  it("avisa si las excepciones crecen más de la cuenta", () => {
    // Cada excepción es un permiso; muchas significan que el patrón marca de
    // más y que hay que revisarlo, no seguir agregando permisos.
    expect(EXCEPCIONES.size).toBeLessThanOrEqual(EXCEPCIONES_TOLERADAS);
    // Y ninguna sin motivo escrito.
    for (const [palabra, motivo] of EXCEPCIONES) {
      expect(motivo, `"${palabra}" sin motivo`).not.toBe("");
    }
  });

  it("el pronombre de segunda persona tampoco es el rioplatense", () => {
    const hallazgos: string[] = [];

    for (const file of sourceFiles("src")) {
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const cadena of uiStrings(line)) {
          // `vos` como palabra suelta, no dentro de otra.
          if (/(^|[^\wáéíóúñ])vos([^\wáéíóúñ]|$)/i.test(cadena)) {
            hallazgos.push(`${file}:${i + 1}  ${line.trim().slice(0, 80)}`);
          }
        }
      });
    }

    expect(hallazgos).toEqual([]);
  });
});
