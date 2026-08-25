/**
 * "Sin valores de estilo embebidos que no provengan de un token" dejó de ser
 * una regla que alguien tiene que recordar en la revisión.
 *
 * Es un script y no una regla de ESLint por la misma razón que
 * `verify-tokens.ts` lo es: la config de ESLint del repositorio es deliberadamente
 * mínima, y montar un plugin local para una sola regla cuesta más que esto.
 * Corre con `pnpm --filter @tuya-ui/components test`, así que un color literal
 * rompe el build igual que rompería un tipo.
 *
 * Mira el código y no los comentarios. Un comentario que cita el valor de un
 * token para explicar una decisión —"el fondo del navbar oscuro (neutral.800,
 * #26262C) queda un paso más claro que…"— es documentación útil y no pinta
 * nada; la regla persigue el color que se renderiza, no el que se menciona.
 * Las cadenas SÍ se miran, porque es exactamente ahí donde aparecería el color
 * que buscamos: dentro de un `className` o de un `style`.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const sourceRoot = join(packageRoot, "src");

/**
 * Hex de 3, 4, 6 u 8 dígitos, y las funciones de color de CSS. El límite `\b`
 * al final evita marcar el prefijo de un hex más largo, y el `#` de apertura
 * evita confundirlo con un fragmento de URL.
 */
const COLOR_PATTERNS: Array<{ what: string; pattern: RegExp }> = [
  { what: "hexadecimal", pattern: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g },
  { what: "función de color CSS", pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/g },
];

/**
 * Reemplaza cada comentario por espacios, conservando los saltos de línea para
 * que el número de línea reportado siga siendo el del archivo original. Las
 * cadenas se dejan intactas: son parte del código a estos efectos.
 */
function blankComments(source: string): string {
  const out = source.split("");
  let state: "code" | "line" | "block" | "'" | '"' | "`" = "code";

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (state === "code") {
      if (char === "/" && next === "/") {
        state = "line";
        out[i] = " ";
      } else if (char === "/" && next === "*") {
        state = "block";
        out[i] = " ";
      } else if (char === "'" || char === '"' || char === "`") {
        state = char;
      }
      continue;
    }

    if (state === "line") {
      if (char === "\n") state = "code";
      else out[i] = " ";
      continue;
    }

    if (state === "block") {
      if (char !== "\n") out[i] = " ";
      if (char === "*" && next === "/") {
        out[i + 1] = " ";
        i++;
        state = "code";
      }
      continue;
    }

    // Dentro de una cadena: sólo hay que saber dónde termina.
    if (char === "\\") {
      i++;
    } else if (char === state) {
      state = "code";
    }
  }

  return out.join("");
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

let failures = 0;

for (const file of sourceFiles(sourceRoot)) {
  const lines = blankComments(readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, index) => {
    for (const { what, pattern } of COLOR_PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        failures++;
        console.error(
          `[color literal] ${relative(packageRoot, file)}:${index + 1} — ${what} \`${match[0]}\`. ` +
            `Todo color llega por token: usá la utilidad de Tailwind que lo expone.`,
        );
      }
    }
  });
}

if (failures > 0) {
  console.error(`\n${failures} color(es) literal(es) en el código de los componentes.`);
  process.exit(1);
}

console.log("No hay colores literales en el código de los componentes.");
