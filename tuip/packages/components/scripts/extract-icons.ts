/**
 * Extracts the icon library from the design system's iconography document into
 * `src/icons/paths.ts`.
 *
 * The icons are not described by that document — they are drawn in it. Redrawing
 * them by hand would introduce differences from what was approved, and "a
 * correct icon is invisible within the set" is a property that does not survive
 * a redraw. So the drawings are read from the source.
 *
 * Each entry in the document is a cell holding the `<svg>` and, right after it,
 * the icon's name in the mono face. Pairing is therefore structural, never
 * positional: a drawing whose name cannot be read is reported rather than
 * matched to whatever came next.
 *
 * Run with: pnpm --filter @tuya-ui/components extract:icons
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Overridable so the rejection rules can be exercised against a doctored copy
// of the document without touching the real one, and without the check writing
// over the real module. Unset in every normal run.
const SOURCE =
  process.env.TUIP_ICON_SOURCE ??
  join(__dirname, "..", "..", "..", "design-system", "Iconografia Tuya.dc.html");
const OUT = process.env.TUIP_ICON_OUT ?? join(__dirname, "..", "src", "icons", "paths.ts");

/** The families the document declares, with the count it states for each. */
const FAMILIES: Array<{ heading: string; id: string; expected: number }> = [
  { heading: "Navegación y estructura", id: "navigation", expected: 12 },
  { heading: "Acciones", id: "actions", expected: 16 },
  { heading: "Estado y feedback", id: "status", expected: 10 },
  { heading: "Datos y análisis", id: "data", expected: 12 },
  { heading: "Dominio Tuya TI", id: "domain", expected: 16 },
  { heading: "Personas, tiempo y objetos", id: "objects", expected: 10 },
];

const html = readFileSync(SOURCE, "utf8");

/**
 * A cell is an `<svg>` immediately followed by the element carrying its name.
 * Anything that does not match this shape is not a library entry — the document
 * also draws grids, guides and worked examples.
 */
/**
 * The body must not contain another `<svg>`. Without that guard the lazy match
 * backtracks past a drawing that has no name after it and swallows everything
 * up to the next one that does — silently pairing one icon's name with a
 * different icon's geometry.
 */
const CELL =
  /<svg[^>]*viewBox="0 0 24 24"[^>]*>((?:(?!<svg)[\s\S])*?)<\/svg>\s*<div[^>]*>([a-z][a-z0-9-]*)<\/div>/g;

/**
 * What an icon body is allowed to contain.
 *
 * Derived by scanning the icons the library already publishes rather than
 * written from memory: the set in use is exactly `circle`, `path` and `rect`,
 * with the attributes `cx cy d height r rx stroke-dasharray width x y`. The
 * list below is that set, widened only with the other inert drawing primitives
 * this script already named as geometry (`line`, `polyline`, `polygon`) and
 * their own coordinate attributes, so adding one of those later is not blocked
 * for no reason.
 *
 * Everything else is refused — `script`, `style`, `image`, `use` and
 * `foreignObject` above all, since this markup is injected verbatim into every
 * consuming application. Note what is *not* here: `fill` and `stroke`. The
 * Icon component applies colour itself, and the iconography spec requires that
 * an icon never carry a colour of its own, so leaving them out enforces that
 * rule at extraction time instead of trusting each drawing to respect it.
 */
const ALLOWED_ELEMENTS = new Set(["circle", "line", "path", "polygon", "polyline", "rect"]);

const ALLOWED_ATTRIBUTES = new Set([
  "cx",
  "cy",
  "d",
  "height",
  "points",
  "r",
  "rx",
  "ry",
  "stroke-dasharray",
  "width",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
]);

/**
 * Reports everything in `body` that falls outside the allowed set. Returns an
 * empty array for a clean icon.
 *
 * The check refuses rather than strips: the source document is edited by hand,
 * and something unexpected in it is a problem worth seeing. Quietly removing it
 * would turn a compromised document into a green build, which is precisely the
 * signal we want to keep.
 */
function findDisallowed(body: string): string[] {
  const problems: string[] = [];
  const tagPattern = /<\s*(\/?)\s*([a-zA-Z][\w-]*)([^>]*?)\/?>/g;
  let consumedUpTo = 0;
  let match: RegExpExecArray | null;

  function reportStrayText(text: string) {
    const trimmed = text.trim();
    if (trimmed) {
      problems.push(`content outside any element: ${JSON.stringify(trimmed.slice(0, 40))}`);
    }
  }

  while ((match = tagPattern.exec(body)) !== null) {
    reportStrayText(body.slice(consumedUpTo, match.index));
    consumedUpTo = match.index + match[0].length;

    const [, closing, element, attributeBlob] = match;
    if (!ALLOWED_ELEMENTS.has(element)) {
      problems.push(`<${element}> is not an allowed drawing element`);
      continue;
    }
    if (closing) continue;

    for (const attribute of attributeBlob.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=/g)) {
      const attributeName = attribute[1].toLowerCase();
      // Checked on its own even though no `on*` attribute is in the allowed
      // set: this is the guard that still holds if someone widens that set
      // without thinking about event handlers.
      if (attributeName.startsWith("on")) {
        problems.push(`attribute "${attribute[1]}" on <${element}> is an event handler`);
        continue;
      }
      if (!ALLOWED_ATTRIBUTES.has(attributeName)) {
        problems.push(`attribute "${attribute[1]}" on <${element}> is not an allowed drawing attribute`);
      }
    }
  }

  reportStrayText(body.slice(consumedUpTo));
  return problems;
}

interface Extracted {
  name: string;
  body: string;
  index: number;
}

const extracted: Extracted[] = [];
for (const match of html.matchAll(CELL)) {
  extracted.push({
    name: match[2],
    body: match[1].trim(),
    index: match.index ?? 0,
  });
}

/** Where each family's heading starts, so a cell can be attributed to one. */
const familyStarts = FAMILIES.map((family) => ({
  ...family,
  start: html.indexOf(family.heading),
})).sort((a, b) => a.start - b.start);

function familyOf(index: number): string | undefined {
  let current: string | undefined;
  for (const family of familyStarts) {
    if (family.start >= 0 && family.start < index) current = family.id;
  }
  return current;
}

const byName = new Map<string, { body: string; family: string }>();
const problems: string[] = [];

for (const item of extracted) {
  const family = familyOf(item.index);
  if (!family) {
    problems.push(`"${item.name}" sits before any family heading — not attributed.`);
    continue;
  }
  const existing = byName.get(item.name);
  if (existing) {
    if (existing.body !== item.body) {
      problems.push(`"${item.name}" appears twice with different drawings.`);
    }
    continue;
  }
  byName.set(item.name, { body: item.body, family });
}

// Every drawing must carry geometry, and *only* geometry. The previous check
// asked whether a drawable element was present, which a body could satisfy
// while also carrying anything else alongside it.
for (const [name, { body }] of byName) {
  if (!/<(path|circle|rect|line|polyline|polygon)/.test(body)) {
    problems.push(`"${name}" has no drawable geometry.`);
  }
  for (const disallowed of findDisallowed(body)) {
    problems.push(`"${name}": ${disallowed}`);
  }
}

console.log(`Cells matched: ${extracted.length}`);
console.log(`Unique icons: ${byName.size}`);

for (const family of FAMILIES) {
  const found = [...byName.values()].filter((icon) => icon.family === family.id).length;
  const mark = found === family.expected ? "ok" : `EXPECTED ${family.expected}`;
  console.log(`  ${family.id.padEnd(12)} ${String(found).padStart(2)}  ${mark}`);
}

if (problems.length > 0) {
  console.error("\nProblems:");
  for (const problem of problems) console.error(`  - ${problem}`);
  // Stop before writing. A rejected icon must never reach the generated
  // module, and a failure that only prints would be invisible inside a build.
  console.error("\nNo module was written.");
  process.exit(1);
}

const total = FAMILIES.reduce((sum, family) => sum + family.expected, 0);
if (byName.size !== total) {
  console.error(`\nExtracted ${byName.size} icons, document declares ${total}.`);
}

const sorted = [...byName.entries()].sort(([a], [b]) => a.localeCompare(b));

const file = `// Generated by scripts/extract-icons.ts from the design system's
// iconography document. Do not edit by hand — redraw in the source and re-run.
//
// Each value is the inner geometry of a 24x24 icon. Stroke width, caps, joins
// and colour are applied by the Icon component, not baked in here, so an icon
// cannot carry a colour or a weight of its own.

export const iconFamily = {
${FAMILIES.map(
  (family) =>
    `  ${family.id}: [${sorted
      .filter(([, icon]) => icon.family === family.id)
      .map(([name]) => `"${name}"`)
      .join(", ")}],`,
).join("\n")}
} as const;

export const iconPaths = {
${sorted.map(([name, icon]) => `  ${JSON.stringify(name)}: ${JSON.stringify(icon.body)},`).join("\n")}
} as const;

export type IconName = keyof typeof iconPaths;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, file, "utf8");
console.log(`\nWrote ${OUT}`);
