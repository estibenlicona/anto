import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  primitives,
  semanticColorsLight,
  semanticColorsDark,
  identityColorsLight,
  identityColorsDark,
  accentColorsLight,
  accentColorsDark,
  attentionColorsLight,
  attentionColorsDark,
  componentSize,
  typography,
  spacing,
  radius,
  shadow,
  elevationLight,
  elevationDark,
  motion,
  motionRecipe,
  borderWidth,
  focusRing,
  spaceAlias,
  controlHeight,
  touchTarget,
  maxWidth,
  overlayWidth,
  shell,
  layer,
  breakpoint,
  gradient,
} from "../src/tokens";
import { flattenTokens, toKebabCase } from "../src/css-var-name";

const __dirname = dirname(fileURLToPath(import.meta.url));

function toDeclarations(pairs: Array<[string, string]>): string[] {
  return pairs.map(([name, value]) => `  ${name}: ${value};`);
}

/**
 * The primitive layer, emitted under its own prefix. It is published so the
 * palette is inspectable, not so components consume it — that is what the
 * semantic layer below is for.
 */
const primitiveLines = toDeclarations(flattenTokens(["tuya"], primitives));

const modeIndependentLines = [
  ...toDeclarations(flattenTokens(["space"], spacing)),
  // The aliases are what a stylesheet should reach for, so they sit right
  // after the scale they point into.
  ...toDeclarations(flattenTokens(["space"], spaceAlias)),
  ...toDeclarations(flattenTokens(["size-control"], controlHeight)),
  ...toDeclarations(flattenTokens(["width"], maxWidth)),
  ...toDeclarations(flattenTokens(["width-overlay"], overlayWidth)),
  ...toDeclarations(flattenTokens(["size-shell"], shell)),
  // La capa de token de componente, bajo el mismo prefijo `size` que el resto
  // de las medidas: lo que la distingue no es el prefijo sino el segmento del
  // componente que la reclama (`--size-seniority-card-width`).
  ...toDeclarations(flattenTokens(["size"], componentSize)),
  ...toDeclarations(flattenTokens(["layer"], layer)),
  ...toDeclarations(flattenTokens(["breakpoint"], breakpoint)),
  ...toDeclarations(flattenTokens(["focus-ring"], focusRing)),
  `  --size-touch-target: ${touchTarget};`,
  ...toDeclarations(flattenTokens(["radius"], radius)),
  ...toDeclarations(flattenTokens(["shadow"], shadow)),
  ...toDeclarations(flattenTokens(["border-width"], borderWidth)),
  ...toDeclarations(flattenTokens(["motion"], motion)),
  ...toDeclarations(flattenTokens(["font-weight"], typography.fontWeight)),
  ...toDeclarations(flattenTokens(["text"], typography.textStyle)),
  `  --font-sans: ${typography.fontFamily.sans};`,
  `  --font-mono: ${typography.fontFamily.mono};`,
  `  --numeric-tabular: ${typography.numeric.fontVariantNumeric};`,
  ...toDeclarations(flattenTokens(["gradient"], gradient)),
];

const lightLines = [
  ...toDeclarations(flattenTokens(["color"], semanticColorsLight)),
  // Bajo su propio segmento `identity`, para que no se confundan con las
  // familias semánticas que viven en `--color-bg-*` / `--color-text-*`.
  ...toDeclarations(flattenTokens(["color", "identity"], identityColorsLight)),
  // Bajo `accent`, por el mismo motivo que identidad tiene el suyo: el prefijo
  // dice el vocabulario. Por tema, porque los matices claros no llegan a 3:1
  // sobre la fila oscura. Ver accent-colors.ts.
  ...toDeclarations(flattenTokens(["color", "accent"], accentColorsLight)),
  // Bajo `attention`, su propio vocabulario: gradúa un estado que ya se
  // afirmó, y no es ni un rol semántico ni un paso de acento.
  // Ver attention-colors.ts.
  ...toDeclarations(flattenTokens(["color", "attention"], attentionColorsLight)),
  ...toDeclarations(flattenTokens(["elevation"], elevationLight)),
];

const darkLines = [
  ...toDeclarations(flattenTokens(["color"], semanticColorsDark)),
  ...toDeclarations(flattenTokens(["color", "identity"], identityColorsDark)),
  ...toDeclarations(flattenTokens(["color", "accent"], accentColorsDark)),
  ...toDeclarations(flattenTokens(["color", "attention"], attentionColorsDark)),
  ...toDeclarations(flattenTokens(["elevation"], elevationDark)),
];

/**
 * The motion recipes as `@keyframes`, prefixed so they never collide with a
 * consumer's own. The reduced-motion variants redefine the same names inside
 * the media query: a later `@keyframes` of the same name wins, so every
 * `animate-*` utility swaps its travel for a fade under that preference
 * without the component that uses it having to know the preference exists.
 */
function keyframeBlock(name: string, frames: { from: Record<string, string>; to: Record<string, string> }, indent = "") {
  const declarations = (step: Record<string, string>) =>
    Object.entries(step)
      .map(([property, value]) => `${property}: ${value}`)
      .join("; ");
  return [
    `${indent}@keyframes tuya-${toKebabCase(name)} {`,
    `${indent}  from { ${declarations(frames.from)}; }`,
    `${indent}  to { ${declarations(frames.to)}; }`,
    `${indent}}`,
  ].join("\n");
}

const keyframeLines = Object.entries(motionRecipe).map(([name, recipe]) =>
  keyframeBlock(name, recipe.frames),
);

const reducedKeyframeLines = Object.entries(motionRecipe)
  .filter(([, recipe]) => "reduced" in recipe && recipe.reduced)
  .map(([name, recipe]) => keyframeBlock(name, recipe.reduced!, "  "));

const css = `/* Generated by @tuya-ui/tokens — do not edit by hand. */
:root {
${primitiveLines.join("\n")}
${modeIndependentLines.join("\n")}
${lightLines.join("\n")}
}

:root[data-theme="dark"] {
${darkLines.join("\n")}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkLines.map((line) => `  ${line}`).join("\n")}
  }
}

${keyframeLines.join("\n\n")}

@media (prefers-reduced-motion: reduce) {
${reducedKeyframeLines.join("\n\n")}
}
`;

const outDir = join(__dirname, "..", "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "tokens.css"), css, "utf8");

console.log(`Generated ${join(outDir, "tokens.css")}`);
