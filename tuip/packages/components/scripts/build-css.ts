import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SUBCAPA_UTILIDADES, cuerpoDeCapa, partirUtilidades } from "./css-layers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const outDir = join(packageRoot, "dist");
mkdirSync(outDir, { recursive: true });

const tokensCssPath = join(packageRoot, "../tokens/dist/tokens.css");
const baseCssPath = join(packageRoot, "src/base.css");
const utilitiesInput = join(outDir, ".tailwind-input.css");
const utilitiesOutput = join(outDir, ".tailwind-output.css");

/**
 * Tokens meant for app-level consumers rather than any tuip component itself —
 * content scanning only sees classes written inside this package's own `src/`,
 * so a class with no in-repo user here would otherwise get purged from the
 * published stylesheet before an app ever gets to use it.
 *
 * La escala de atención es el caso más claro: es un vocabulario de color entero
 * pensado para las pantallas —un mapa de calor de brechas, una grilla de
 * alertas—, y ningún componente de acá la usa. Sin esto, el paquete publicaría
 * las variables `--color-attention-*` y ninguna clase que las lea.
 *
 * The type scale belongs here wholesale rather than style by style: it is a
 * closed, named set meant to be consumed by screens, and which of its steps a
 * component in this package happens to use is unrelated to which ones an app
 * needs. `metric` is the case that exposed this — a style defined for summary
 * cards, which live in apps, so nothing here would ever reference it.
 */
const SCREEN_ONLY_TOKENS = [
  "bg-neutral-canvas",
  "bg-attention-low-fill",
  "bg-attention-medium-fill",
  "bg-attention-high-fill",
  "text-display",
  "text-heading-lg",
  "text-heading-md",
  "text-body",
  "text-body-sm",
  "text-label",
  "text-metric",
];

/**
 * Muestra del vocabulario propio, una por familia de token. Es lo que se
 * comprueba después de compilar.
 *
 * No es paranoia: cuando la configuración no se carga, Tailwind compila igual
 * —con su vocabulario por defecto y sin una sola utilidad de tuip— y termina
 * diciendo "Done". Sin esta comprobación, el paquete se publica vacío de
 * vocabulario y el fallo aparece mucho más tarde, en una pantalla sin colores.
 */
const VOCABULARY_PROBE = [
  "bg-brand-bold",
  "text-neutral-default",
  "border-neutral-default",
  "bg-accent-sky-fill",
  "bg-attention-low-fill",
  "bg-identity-blue",
  "rounded-control",
  "shadow-md",
  "h-md",
  "z-menu",
  "text-metric",
];

// Generated in isolation from `@tuya-ui/tokens/css` (concatenated below) so the
// Tailwind CLI never needs to resolve a workspace package's subpath export —
// its bundled import resolver only understands relative/file imports.
//
// Las rutas son relativas a este archivo, que vive en `dist/`.
//
// `@source inline(...)` es lo que reemplaza al `safelist` de la v3, que la v4
// no tiene.
writeFileSync(
  utilitiesInput,
  [
    // `source(none)` apaga la detección automática de la v4, que sube desde
    // este archivo buscando la raíz del proyecto y termina escaneando todo el
    // monorepo —incluida la app de documentación, cuyas clases no tienen por
    // qué viajar en el paquete—. Con ella apagada, lo que se compila es
    // exactamente lo que estas dos líneas declaran.
    `@import "tailwindcss" source(none);`,
    `@config "../tailwind.config.js";`,
    `@source "../src/**/*.{ts,tsx}";`,
    `@source inline("${SCREEN_ONLY_TOKENS.join(" ")}");`,
    "",
  ].join("\n"),
);

execSync(
  `npx @tailwindcss/cli -i "${utilitiesInput}" -o "${utilitiesOutput}" --minify`,
  { cwd: packageRoot, stdio: "inherit" },
);

const tokensCss = readFileSync(tokensCssPath, "utf8");
const utilitiesCss = readFileSync(utilitiesOutput, "utf8");

const missing = VOCABULARY_PROBE.filter((cls) => !utilitiesCss.includes(`.${cls}`));
if (missing.length > 0) {
  rmSync(utilitiesInput, { force: true });
  rmSync(utilitiesOutput, { force: true });
  console.error(
    `\nLa hoja compiló sin el vocabulario de tuip. No salieron: ${missing.join(", ")}.\n` +
      `Casi siempre significa que la configuración no se cargó — Tailwind no lo dice, ` +
      `compila con su vocabulario por defecto y termina sin error.\n`,
  );
  process.exit(1);
}

/**
 * Reparte el cuerpo de `@layer utilities` entre una subcapa propia (las
 * utilidades base) y la capa a secas (las que llevan variante).
 *
 * El paquete publica sus utilidades ya compiladas y la aplicación compila las
 * suyas: son dos hojas que se concatenan, y las dos escriben en `@layer
 * utilities`. Dentro de una capa manda el orden de aparición cuando la
 * especificidad empata —y entre utilidades siempre empata (0,1,0)—, así que
 * todo lo del paquete le ganaba a todo lo de la aplicación por el solo hecho
 * de venir después en el archivo.
 *
 * Lo que eso rompe no son las clases repetidas —esas dicen lo mismo, y de eso
 * se ocupa la comprobación 2 de `verify-stylesheet.ts`— sino los pares de
 * clases DISTINTAS que tocan la misma propiedad. `w-full lg:w-80` medía el
 * ancho completo también en pantallas grandes: dentro de una sola hoja Tailwind
 * ordena las variantes después de las utilidades base, y al concatenar dos
 * hojas ese orden se pierde. Lo mismo con `flex-col` contra `md:flex-row`, o el
 * `p-4` de un componente contra el `p-8` que el consumidor le pasa por
 * `className`.
 *
 * Una subcapa lo resuelve porque, dentro de una capa, lo que NO está en una
 * subcapa cuenta como una última subcapa implícita: las utilidades del
 * consumidor —que llegan sueltas dentro de `utilities`— pasan a ganarle a todas
 * las de acá sin que el consumidor tenga que declarar nada.
 *
 * Pero a la subcapa sólo van las utilidades **base**. Las que llevan variante
 * (`peer-checked:opacity-100`, `md:flex-row`, `hover:bg-neutral-hover`) se
 * quedan fuera, detrás de ella: una subcapa pierde contra lo suelto de su capa
 * **sin mirar especificidad**, así que con todo anidado el `opacity-0` que la
 * aplicación generaba para una pantalla cualquiera le ganaba al
 * `peer-checked:opacity-100` del punto del radio y del check de la casilla, y
 * los controles se marcaban sin que se viera. Fuera de la subcapa, la variante
 * gana a cualquier utilidad base —del paquete o del consumidor— por
 * especificidad, que es lo que Tailwind garantiza dentro de una sola hoja. El
 * reparto vive en `css-layers.ts` porque la verificación lo usa también.
 *
 * Y va anidada dentro de `utilities` en vez de en una capa propia de nivel
 * superior: una capa aparte tendría que declararse antes que `utilities` para
 * perder contra el consumidor, y ahí quedaría también antes que `base` —donde
 * la aplicación tiene su reset universal `* { margin: 0; padding: 0 }`—. Con
 * eso, cualquier utilidad que sólo publique este paquete (un `p-4` que ningún
 * archivo de la app escribe, y que por lo tanto su Tailwind no genera) se queda
 * en cero: comprobado en el navegador, `p-4` daba `0px` y `mt-2` daba `0px`.
 * Anidada, sigue por encima de `base` y de `components`.
 */
function anidarUtilidades(css: string): string {
  const aperturas = [...css.matchAll(/@layer\s+utilities\s*\{/g)];
  if (aperturas.length !== 1) {
    throw new Error(
      `Se esperaba exactamente un bloque \`@layer utilities\` en la salida de Tailwind y ` +
        `hubo ${aperturas.length}. La forma de la salida cambió: sin anidar, las utilidades ` +
        `del paquete vuelven a pisar las variantes del consumidor.`,
    );
  }

  const apertura = aperturas[0];
  const inicioCuerpo = apertura.index + apertura[0].length;
  const cuerpo = cuerpoDeCapa(css.slice(apertura.index), "utilities");
  if (cuerpo === null) {
    throw new Error("El bloque `@layer utilities` no cierra: no se pudo anidar la subcapa.");
  }
  const finCuerpo = apertura.index + cuerpo.fin;

  const { base, variantes } = partirUtilidades(css.slice(inicioCuerpo, finCuerpo));
  if (base.length === 0 || variantes.length === 0) {
    throw new Error(
      `La salida de Tailwind trajo ${base.length} utilidades base y ${variantes.length} con ` +
        `variante. Las dos mitades tienen que existir: una hoja sin variantes es una hoja sin ` +
        `estados, y una sin base es una hoja sin componentes.`,
    );
  }

  return (
    css.slice(0, inicioCuerpo) +
    `@layer ${SUBCAPA_UTILIDADES}{` +
    base.join("") +
    "}" +
    variantes.join("") +
    css.slice(finCuerpo)
  );
}

const utilitiesAnidadas = anidarUtilidades(utilitiesCss);

// Las reglas base van después de las utilidades y no antes: son `@layer base`,
// y entre capas manda el orden que la hoja compilada declara arriba, no el de
// aparición — así que ubicarlas al final no las pone por encima de nada.
const baseCss = readFileSync(baseCssPath, "utf8");

writeFileSync(
  join(outDir, "styles.css"),
  `${tokensCss}\n${utilitiesAnidadas}\n${baseCss}`,
);

rmSync(utilitiesInput);
rmSync(utilitiesOutput);

console.log(`Generated dist/styles.css`);
