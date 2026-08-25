import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Tres cosas que la hoja publicada tiene que cumplir y que compilar no garantiza.
 *
 * 1. **La paleta nativa sigue cerrada.** El sistema documenta su vocabulario de
 *    color como un conjunto cerrado, y eso se sostiene reemplazando la paleta de
 *    Tailwind en vez de extenderla. Si esa configuración se pierde, nada falla:
 *    simplemente vuelve a compilar toda la paleta por defecto, y el primero que
 *    tenga apuro escribe `bg-blue-500` y le funciona.
 *
 * 2. **Las utilidades publicadas no se componen con las del consumidor.** El
 *    paquete distribuye su CSS ya generado y la app genera además el suyo, así
 *    que una misma clase puede quedar definida dos veces. Mientras las dos
 *    definiciones sean iguales, aplicarlas dos veces da lo mismo que una. Si
 *    difieren, se suman: fue lo que pasó con `-translate-x/y-1/2`, que el
 *    paquete resolvía con `transform` (Tailwind 3) y la app con `translate`
 *    (Tailwind 4). El modal quedaba desplazado el doble —medio alto y medio
 *    ancho de más— sin un solo error en ningún lado.
 *
 * 3. **La base de cursor sigue ahí.** Preflight de Tailwind 3 daba
 *    `cursor: pointer` a lo accionable y el de la 4 dejó de hacerlo. El
 *    catálogo lo daba por hecho, así que al migrar se perdió en la mitad de
 *    los componentes sin que nada fallara.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const outDir = join(packageRoot, "dist");

let failures = 0;
function fail(mensaje: string) {
  failures++;
  console.error(mensaje);
}

/** Compila una hoja con la CLI y devuelve su texto. */
function compile(source: string, nombre: string): string {
  mkdirSync(outDir, { recursive: true });
  const input = join(outDir, `.verify-${nombre}-in.css`);
  const output = join(outDir, `.verify-${nombre}-out.css`);
  writeFileSync(input, source);
  try {
    execSync(`npx @tailwindcss/cli -i "${input}" -o "${output}" --minify`, {
      cwd: packageRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return readFileSync(output, "utf8");
  } catch (err) {
    const detalle = (err as { stderr?: Buffer }).stderr?.toString() ?? String(err);
    throw new Error(`No se pudo compilar la hoja "${nombre}":\n${detalle}`);
  } finally {
    rmSync(input, { force: true });
    rmSync(output, { force: true });
  }
}

/**
 * Selector → declaraciones. Recorre carácter a carácter en vez de con una
 * expresión regular porque la v4 anida las utilidades dentro de `@layer`, y una
 * regla que sólo mire `}` como separador se pierde la primera de cada capa.
 */
function rules(css: string): Map<string, string> {
  const out = new Map<string, string>();
  let selector = "";
  let body = "";
  let inBody = false;

  for (const ch of css) {
    if (ch === "{") {
      if (selector.trim().startsWith("@")) {
        selector = "";
      } else {
        inBody = true;
        body = "";
      }
      continue;
    }
    if (ch === "}") {
      if (inBody) {
        for (const s of selector.split(",")) {
          const t = s.trim();
          if (t.startsWith(".")) out.set(t, body.trim());
        }
        inBody = false;
      }
      selector = "";
      body = "";
      continue;
    }
    if (inBody) body += ch;
    else selector += ch;
  }
  return out;
}

const publishedRules = rules(readFileSync(join(outDir, "styles.css"), "utf8"));

// ── 1. La paleta nativa sigue cerrada ────────────────────────────────────────

const NATIVE = ["bg-blue-500", "text-purple-600", "border-red-300", "bg-slate-50", "text-emerald-700"];
const CSS_PRIMITIVES = ["bg-transparent", "text-current"];
const OWN = ["bg-brand-bold", "text-neutral-default", "border-neutral-default"];

const paletteCss = compile(
  [
    `@import "tailwindcss" source(none);`,
    `@config "../tailwind.config.js";`,
    `@source inline("${[...NATIVE, ...CSS_PRIMITIVES, ...OWN].join(" ")}");`,
    "",
  ].join("\n"),
  "palette",
);

for (const cls of NATIVE) {
  if (paletteCss.includes(`.${cls}`)) {
    fail(
      `[paleta] \`${cls}\` compiló. La paleta nativa de Tailwind volvió a estar abierta: ` +
        `el vocabulario de color se documenta como cerrado y dejó de serlo.`,
    );
  }
}
for (const cls of [...CSS_PRIMITIVES, ...OWN]) {
  if (!paletteCss.includes(`.${cls}`)) {
    fail(
      `[paleta] \`${cls}\` dejó de compilar, y debería: cerrar la paleta nativa no puede ` +
        `llevarse puesto el vocabulario propio.`,
    );
  }
}
if (failures === 0) {
  console.log(
    `[paleta] cerrada: ${NATIVE.length} colores nativos no compilan, y el vocabulario propio sí.`,
  );
}

// ── 2. Las utilidades no se componen con las del consumidor ──────────────────

// Lo que genera un proyecto consumidor: Tailwind a secas, escaneando el mismo
// código. Sin el preset no tiene el vocabulario de tuip, así que sólo va a
// coincidir en las utilidades estándar — que son justo las que pueden chocar.
//
// Se escanea el código en vez de reconstruir los nombres de clase desde los
// selectores publicados: deshacer los escapes de un selector es una fuente de
// errores propia, y esto además es lo que la app hace de verdad — compilar a
// partir de las clases que aparecen en el código que usa los componentes.
const consumerRules = rules(
  compile(
    [`@import "tailwindcss" source(none);`, `@source "../src/**/*.{ts,tsx}";`, ""].join("\n"),
    "consumer",
  ),
);

/**
 * Los nombres de propiedad que declara un bloque, sin sus valores.
 *
 * Lo que se compara es el conjunto de propiedades y no las declaraciones
 * enteras, porque un mismo nombre de clase con **otro valor** no es un
 * problema: la cascada elige una y listo — es justamente lo que hace que el
 * vocabulario de tuip gane sobre el de Tailwind, y por eso `shadow-md` mide
 * lo que el sistema dice y no lo que Tailwind trae de fábrica. El problema es
 * el mismo nombre con **otras propiedades**: ahí no hay nada que elegir, se
 * aplican las dos y se suman.
 */
function properties(decls: string): string {
  return decls
    .split(";")
    .map((d) => d.slice(0, d.indexOf(":")).trim())
    .filter(Boolean)
    .sort()
    .join(",");
}

let compartidas = 0;
const conflictos: string[] = [];
for (const [selector, decls] of publishedRules) {
  const delConsumidor = consumerRules.get(selector);
  if (delConsumidor === undefined) continue;
  compartidas++;
  const a = properties(decls);
  const b = properties(delConsumidor);
  if (a !== b) {
    conflictos.push(`  ${selector}
    publicada:  ${a}
    consumidor: ${b}`);
  }
}

if (conflictos.length > 0) {
  fail(
    `[hojas] ${conflictos.length} clase(s) resuelven a propiedades distintas en la hoja ` +
      `publicada y en la del consumidor. Las dos se aplican al mismo elemento y se componen:\n` +
      conflictos.join("\n"),
  );
} else {
  console.log(
    `[hojas] ${compartidas} clase(s) están definidas en las dos hojas, y todas declaran lo mismo.`,
  );
}

// ── 3. Autoprueba: la comparación tiene que saber fallar ─────────────────────

// Un guardia que nunca rechaza nada no es un guardia. Se comprueba con el caso
// real que motivó todo esto: la implementación de Tailwind 3 para el mismo
// desplazamiento que la 4 resuelve con `translate`.
const VIEJA = "--tw-translate-y:-50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y))";
const NUEVA = "--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)";
if (properties(VIEJA) === properties(NUEVA)) {
  fail(
    "[autoprueba] La comparación no distingue `transform` de `translate`, que es el " +
      "caso que dejó al modal desplazado el doble. Con eso, la comprobación de arriba " +
      "no rechazaría nada.",
  );
} else {
  console.log("[autoprueba] la comparación distingue las dos implementaciones del mismo desplazamiento.");
}

// ── 4. La base de cursor sigue publicada ─────────────────────────────────────

// Preflight de Tailwind 3 traía `button, [role="button"] { cursor: pointer }` y
// el de la 4 lo quitó. Ningún componente lo declaraba —no hacía falta—, así que
// al migrar la mitad del catálogo se quedó sin manito y **nada falló**: no hay
// error de compilación ni prueba que mire un cursor, y en jsdom `getComputedStyle`
// devuelve lo mismo con la regla y sin ella. Lo que sí se puede afirmar es que
// la hoja que se publica la contiene.
// Sin comentarios: el bloque base explica de dónde viene la regla citando la
// que Preflight traía, con sus llaves y todo, y un lector ingenuo la tomaría
// por la regla publicada.
const publishedCss = readFileSync(join(outDir, "styles.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** La primera regla del bloque base que declara `prop`. */
function baseRuleWith(prop: string): { selector: string; body: string } | null {
  const layer = publishedCss.match(/@layer\s+base\s*\{([\s\S]*)\}/);
  if (layer === null) return null;
  for (const m of layer[1].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (m[2].includes(prop)) return { selector: m[1].trim(), body: m[2].trim() };
  }
  return null;
}

const fallosPrevios = failures;
const puntero = baseRuleWith("cursor: pointer");
const noPermitido = baseRuleWith("cursor: not-allowed");

if (puntero === null) {
  fail(
    "[cursor] La hoja publicada no da `cursor: pointer` a lo accionable desde `@layer base`. " +
      "Es lo que Preflight de Tailwind 4 dejó de traer: sin esta regla, un botón se ve igual " +
      "que un párrafo hasta que el usuario lo prueba.",
  );
} else {
  const partes = puntero.selector.split(",").map((s) => s.trim());
  if (!partes.some((s) => s.startsWith("button"))) {
    fail(`[cursor] La regla de puntero ya no alcanza a \`button\`: \`${puntero.selector}\`.`);
  }
  if (!partes.some((s) => s.startsWith('[role="button"]'))) {
    fail(`[cursor] La regla de puntero ya no alcanza a \`[role="button"]\`: \`${puntero.selector}\`.`);
  }
  // Parte por parte, no sobre la lista entera: con un solo `:not(:disabled)` en
  // cualquier lugar de la lista, mirar el texto completo daría por buena una
  // regla que dejó de excluir la mitad de sus selectores.
  //
  // Y la exclusión va en el selector y no en una regla posterior que "gane":
  // dos reglas de igual especificidad se resuelven por orden, y ese orden es lo
  // que se rompe cuando alguien reordena el archivo.
  const sinExcluir = partes.filter((s) => !s.includes(":not(:disabled)"));
  if (sinExcluir.length > 0) {
    fail(
      `[cursor] ${sinExcluir.length} selector(es) de la regla de puntero dejaron de excluir lo ` +
        `deshabilitado en su propio texto (${sinExcluir.join(", ")}), y pasan a depender del ` +
        `orden de las reglas.`,
    );
  }
}

if (noPermitido === null) {
  fail("[cursor] La hoja publicada dejó de dar `cursor: not-allowed` a lo deshabilitado.");
} else if (!noPermitido.selector.includes("[aria-disabled")) {
  // Los componentes construidos sobre Radix deshabilitan sus ítems sin el
  // atributo nativo, y `:disabled` no los alcanza.
  fail(
    `[cursor] La regla de no permitido ya no alcanza a \`[aria-disabled]\`: \`${noPermitido.selector}\`.`,
  );
}

if (failures === fallosPrevios) {
  console.log("[cursor] la hoja publicada da puntero a lo accionable y no permitido a lo deshabilitado.");
}

// ── 5. Las utilidades publicadas van en una subcapa de `utilities` ───────────

// La comprobación 2 mira la MISMA clase definida en las dos hojas. Esto mira lo
// otro: clases DISTINTAS que compiten por la misma propiedad. `w-full` de acá
// contra un `lg:w-80` del consumidor — misma capa, misma especificidad (0,1,0),
// gana el que aparezca último, y el último siempre es este paquete porque su
// hoja se concatena después. El elemento medía el ancho completo también en
// pantallas grandes.
//
// Tailwind ordena las variantes después de las utilidades base DENTRO de una
// hoja; con dos hojas concatenadas ese orden no existe. La subcapa lo repone:
// lo que el consumidor genera llega suelto dentro de `utilities` y, por las
// reglas de capas en cascada, lo suelto es una última subcapa implícita que le
// gana a `tuya-ui`. En `scripts/build-css.ts` está por qué va anidada y no en
// una capa de nivel superior.

const SUBCAPA = "tuya-ui";

/** El tramo `[inicio, fin)` del cuerpo de `@layer <nombre>` en `css`. */
function cuerpoDeCapa(css: string, nombre: string): { inicio: number; fin: number } | null {
  const apertura = new RegExp(`@layer\\s+${nombre}\\s*\\{`).exec(css);
  if (apertura === null) return null;
  const inicio = apertura.index + apertura[0].length;
  let profundidad = 1;
  let i = inicio;
  for (; i < css.length && profundidad > 0; i++) {
    if (css[i] === "{") profundidad++;
    else if (css[i] === "}") profundidad--;
  }
  return profundidad === 0 ? { inicio, fin: i - 1 } : null;
}

const fallosDeSubcapa = failures;

const utilidadesPublicadas = cuerpoDeCapa(publishedCss, "utilities");
if (utilidadesPublicadas === null) {
  fail("[subcapa] La hoja publicada no tiene un bloque `@layer utilities` que se pueda leer.");
} else {
  const cuerpo = publishedCss.slice(utilidadesPublicadas.inicio, utilidadesPublicadas.fin);
  const subcapa = cuerpoDeCapa(cuerpo, SUBCAPA);
  // Que envuelva TODO el cuerpo y no una parte: una utilidad que quede fuera de
  // la subcapa vuelve a ganarle a las variantes del consumidor, y es justo la
  // que nadie va a mirar.
  const envuelveTodo =
    subcapa !== null &&
    subcapa.inicio === `@layer ${SUBCAPA}{`.length &&
    subcapa.fin === cuerpo.length - 1;
  if (!envuelveTodo) {
    fail(
      `[subcapa] Las utilidades publicadas no están —todas— dentro de \`@layer utilities { ` +
        `@layer ${SUBCAPA} { … } }\`. Sin eso le ganan a las variantes del consumidor por orden ` +
        `de aparición: \`w-full\` de acá pisa un \`lg:w-80\` de la app.`,
    );
  }
}

// Lo de arriba mira el archivo que este paquete escribe. Esto mira lo que queda
// después de que el consumidor lo importe y su propio Tailwind reescriba la
// hoja entera: es ahí donde una versión futura podría aplanar o descartar la
// subcapa, y aplanarla no rompe nada visible hasta que alguien mide un ancho.
const VARIANTE = "lg:w-[321px]";
const SELECTOR_VARIANTE = ".lg\\:w-\\[321px\\]";

const consumidorCss = compile(
  [
    `@import "tailwindcss" source(none);`,
    `@source inline("w-full ${VARIANTE}");`,
    `@import "./styles.css";`,
    "",
  ].join("\n"),
  "subcapa",
);

/** ¿Quedaron el consumidor afuera de la subcapa y el paquete adentro? */
function fronteraSana(css: string): { ok: boolean; motivo: string } {
  const utilidades = cuerpoDeCapa(css, "utilities");
  if (utilidades === null) return { ok: false, motivo: "no hay `@layer utilities`" };
  const cuerpo = css.slice(utilidades.inicio, utilidades.fin);
  const subcapa = cuerpoDeCapa(cuerpo, SUBCAPA);
  if (subcapa === null) {
    return { ok: false, motivo: `la subcapa \`${SUBCAPA}\` no sobrevivió al import` };
  }
  const dentro = cuerpo.slice(subcapa.inicio, subcapa.fin);
  if (!dentro.includes(".w-full")) {
    return { ok: false, motivo: `\`w-full\` del paquete quedó fuera de \`${SUBCAPA}\`` };
  }
  if (dentro.includes(SELECTOR_VARIANTE)) {
    return { ok: false, motivo: `\`${VARIANTE}\` del consumidor quedó dentro de \`${SUBCAPA}\`` };
  }
  if (!css.includes(SELECTOR_VARIANTE)) {
    return { ok: false, motivo: `\`${VARIANTE}\` no compiló, así que no se comprobó nada` };
  }
  return { ok: true, motivo: "" };
}

const frontera = fronteraSana(consumidorCss);
if (!frontera.ok) {
  fail(
    `[subcapa] Después de que el consumidor importe la hoja, ${frontera.motivo}. Las utilidades ` +
      `del paquete y las del consumidor tienen que quedar a los dos lados de la subcapa: si ` +
      `comparten nivel, la del paquete gana por venir después y \`w-full\` vuelve a pisar a ` +
      `\`${VARIANTE}\`.`,
  );
}

// Autoprueba: sin la subcapa, la comprobación de arriba tiene que rechazar. Es
// exactamente la hoja que se publicaba antes — una sola capa `utilities` con
// todo adentro.
const sinSubcapa = consumidorCss.replace(new RegExp(`@layer\\s+${SUBCAPA}\\s*\\{`), "");
if (fronteraSana(sinSubcapa).ok) {
  fail(
    "[autoprueba] La comprobación de subcapa da por buena una hoja sin subcapa, que es la que " +
      "tenía el defecto. Con eso no rechazaría nada.",
  );
}

if (failures === fallosDeSubcapa) {
  console.log(
    `[subcapa] las utilidades publicadas viven en \`utilities > ${SUBCAPA}\`, y las del ` +
      `consumidor quedan por encima.`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} comprobación(es) fallaron.`);
  process.exit(1);
}
