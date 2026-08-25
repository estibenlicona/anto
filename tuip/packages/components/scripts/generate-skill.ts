import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Generates the Tuya UI design-system Claude Skill from the sources that
 * already exist: dist/registry.json (props/API), apps/docs' curated usage
 * guidance and its live examples. Regenerated on every build so the Skill
 * can never drift from the real catalogue.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const repoRoot = join(packageRoot, "../..");
const docsSrc = join(repoRoot, "apps/docs/src");

interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

interface RegistryComponentApi {
  displayName: string;
  props: RegistryProp[];
}

interface RegistryComponent {
  name: string;
  category: string;
  status: "stable" | "beta" | null;
  description: string;
  api: RegistryComponentApi[];
}

const registryPath = join(packageRoot, "dist/registry.json");
if (!existsSync(registryPath)) {
  throw new Error(
    `No se encontró ${registryPath}. Corré "pnpm run generate:registry" antes de generar la Skill.`,
  );
}
const registry: RegistryComponent[] = JSON.parse(readFileSync(registryPath, "utf8"));

const CATEGORY_LABELS: Record<string, string> = {
  actions: "Acciones",
  forms: "Formularios",
  layout: "Estructura",
  feedback: "Feedback",
  navigation: "Navegación",
  overlays: "Superposiciones",
};

interface DoDontPair {
  do: string;
  dont: string;
  why: string;
}

interface UsageGuidance {
  whenToUse: string[];
  whenNotToUse: string[];
  pairs: DoDontPair[];
}

/**
 * Content files (apps/docs/src/content/<name>.tsx) mix plain usage data with
 * JSX built at module scope (e.g. icons inside option lists) that only
 * renders correctly under a bundler's JSX runtime, not a bare tsx import. The
 * `usage` field itself is always plain string/array data, so extracting just
 * that balanced-brace substring and evaluating it sidesteps JSX entirely.
 */
function loadUsage(componentName: string): UsageGuidance | null {
  const path = join(docsSrc, "content", `${componentName}.tsx`);
  if (!existsSync(path)) return null;
  const source = readFileSync(path, "utf8");

  const marker = /usage:\s*\{/.exec(source);
  if (!marker) return null;
  const start = marker.index + marker[0].length - 1;

  let depth = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;

  try {
    return new Function(`return (${source.slice(start, end + 1)});`)();
  } catch (error) {
    console.warn(`No se pudo leer "usage" de ${path}: ${(error as Error).message}`);
    return null;
  }
}

interface Example {
  title: string;
  description: string;
  code: string;
}

/** Meta is a flat object literal; evaluating just that substring avoids importing the whole example module (and its @tuya-ui/components import) just to read a title. */
function extractMeta(source: string): { title: string; description: string } | null {
  const match = /export const meta = (\{[\s\S]*?\n\});/m.exec(source);
  if (!match) return null;
  try {
    const meta = new Function(`return ${match[1]}`)();
    return { title: meta.title, description: meta.description ?? "" };
  } catch {
    return null;
  }
}

/** Mirrors apps/docs/src/examples/load.ts stripMeta: the snippet a reader would copy excludes the meta export. */
function stripMeta(source: string): string {
  return source.replace(/^export const meta = \{[\s\S]*?\n\};\n\n?/m, "").trimStart();
}

function loadExamples(componentName: string): Example[] {
  const dir = join(docsSrc, "examples", componentName);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .sort()
    .map((file) => {
      const source = readFileSync(join(dir, file), "utf8");
      const meta = extractMeta(source);
      return {
        title: meta?.title ?? file,
        description: meta?.description ?? "",
        code: stripMeta(source),
      };
    });
}

/**
 * A table cell must be one line with no bare `|`: collapses embedded newlines
 * from wrapped JSDoc comments and escapes `|` so a union type (e.g. `"a" | "b"`)
 * doesn't get read as a column separator.
 */
function escapeCell(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
}

function renderProps(api: RegistryComponentApi[]): string {
  const blocks = api
    .filter((entry) => entry.props.length > 0)
    .map((entry) => {
      const rows = entry.props
        .map(
          (p) =>
            `| \`${escapeCell(p.name)}\` | \`${escapeCell(p.type)}\` | ${p.required ? "sí" : "no"} | ${
              p.defaultValue ? `\`${escapeCell(p.defaultValue)}\`` : "—"
            } | ${escapeCell(p.description)} |`,
        )
        .join("\n");
      return `**${entry.displayName}**\n\n| Prop | Tipo | Requerida | Default | Descripción |\n| --- | --- | --- | --- | --- |\n${rows}`;
    });
  return blocks.join("\n\n");
}

function renderUsage(usage: UsageGuidance | null): string {
  if (!usage) return "";
  const { whenToUse, whenNotToUse, pairs } = usage;
  const parts: string[] = [];
  if (whenToUse.length) {
    parts.push(`**Cuándo usarlo**\n\n${whenToUse.map((t) => `- ${t}`).join("\n")}`);
  }
  if (whenNotToUse.length) {
    parts.push(`**Cuándo no usarlo**\n\n${whenNotToUse.map((t) => `- ${t}`).join("\n")}`);
  }
  if (pairs.length) {
    const rows = pairs.map((p) => `- ✅ ${p.do}\n  ❌ ${p.dont}\n  Por qué: ${p.why}`).join("\n");
    parts.push(`**Recomendado vs. desaconsejado**\n\n${rows}`);
  }
  return parts.join("\n\n");
}

function renderExamples(examples: Example[]): string {
  return examples
    .map(
      (example) =>
        `**${example.title}**${example.description ? ` — ${example.description}` : ""}\n\n\`\`\`tsx\n${example.code.trim()}\n\`\`\``,
    )
    .join("\n\n");
}

/** "date-range-field" -> "DateRangeField" */
function kebabToPascalCase(kebab: string): string {
  return kebab.replace(/(^|-)([a-z])/g, (_match, _sep, letter: string) => letter.toUpperCase());
}

/**
 * `component.api` order does not reliably put the file's main component
 * first: react-docgen-typescript groups `forwardRef`-wrapped exports
 * separately from plain-function exports and concatenates the two groups,
 * regardless of their order in the source file (e.g. a file whose main
 * component uses `forwardRef` alongside a plain-function atomic part lists
 * the plain part first). `component.name` (the registry's own kebab-case
 * identity, e.g. "date-range-field") is unaffected by that and is the
 * reliable source for which export is "the" component.
 */
function renderComponent(component: RegistryComponent): string {
  const primaryName = kebabToPascalCase(component.name);
  const importName =
    component.api.find((entry) => entry.displayName === primaryName)?.displayName ??
    component.api[0]?.displayName ??
    component.name;
  const usage = loadUsage(component.name);
  const examples = loadExamples(component.name);
  const sections = [
    `## ${importName}`,
    component.status ? `_Estado: ${component.status}_` : "",
    component.description,
    `\`\`\`tsx\nimport { ${importName} } from "@tuya-ui/components";\n\`\`\``,
    renderProps(component.api),
    renderUsage(usage),
    renderExamples(examples),
  ].filter((section) => section.length > 0);
  return sections.join("\n\n");
}

const outDir = join(packageRoot, "dist/skill");
mkdirSync(join(outDir, "references"), { recursive: true });

const byCategory = new Map<string, RegistryComponent[]>();
for (const component of registry) {
  if (component.category === "utility") continue;
  const list = byCategory.get(component.category) ?? [];
  list.push(component);
  byCategory.set(component.category, list);
}

for (const [category, components] of byCategory) {
  const label = CATEGORY_LABELS[category] ?? category;
  const body = components.map(renderComponent).join("\n\n---\n\n");
  writeFileSync(
    join(outDir, "references", `${category}.md`),
    `# ${label}\n\nComponentes de \`@tuya-ui/components\` en esta categoría.\n\n${body}\n`,
  );
  console.log(`  references/${category}.md (${components.length} componentes)`);
}

try {
  const iconsUrl = pathToFileURL(join(packageRoot, "src/icons/paths.ts")).href;
  const { iconFamily } = await import(iconsUrl);
  const iconsBody = Object.entries(iconFamily as Record<string, string[]>)
    .map(([family, names]) => `## ${family}\n\n${names.map((n) => `- \`${n}\``).join("\n")}`)
    .join("\n\n");
  writeFileSync(
    join(outDir, "references/icons.md"),
    `# Iconografía\n\nNombres válidos para el prop \`name\` de \`Icon\`, agrupados por familia. Usar siempre uno de estos — un nombre inventado no existe en el catálogo.\n\n${iconsBody}\n`,
  );
  console.log("  references/icons.md");
} catch (error) {
  console.warn(`No se pudo generar references/icons.md: ${(error as Error).message}`);
}

let foundationsRules = "";
try {
  const fundamentosUrl = pathToFileURL(join(docsSrc, "content/fundamentos.tsx")).href;
  const fundamentos = await import(fundamentosUrl);
  const pages = [fundamentos.colorPage, fundamentos.espaciadoPage, fundamentos.tipografiaPage].filter(
    Boolean,
  );
  const rules: string[] = [];
  for (const page of pages) {
    for (const section of page.sections) {
      for (const block of section.blocks) {
        if (block.kind === "callout") {
          rules.push(`- **${block.title}**: ${block.text}`);
        }
      }
    }
  }
  foundationsRules = rules.join("\n");
} catch (error) {
  console.warn(`No se pudieron cargar las reglas de fundamentos: ${(error as Error).message}`);
}
writeFileSync(
  join(outDir, "references/foundations.md"),
  `# Fundamentos\n\nReglas de aplicación de los tokens de marca — seguirlas evita romper la consistencia visual del sistema.\n\n${
    foundationsRules || "_Sin reglas disponibles._"
  }\n\nPara color, tipografía y espaciado, usar siempre las clases de Tailwind respaldadas por los tokens de \`@tuya-ui/components/styles.css\` (ya aplicadas dentro de cada componente), nunca un valor de color o de medida suelto.\n`,
);
console.log("  references/foundations.md");

const categoryList = [...byCategory.keys()]
  .map((category) => `- **${CATEGORY_LABELS[category] ?? category}** (\`references/${category}.md\`)`)
  .join("\n");

const skillMd = `---
name: tuya-ui-design-system
description: Construye interfaces React con el sistema de diseño Tuya UI (@tuya-ui/components). Usar cuando se pide armar una pantalla, un formulario, una tabla, un modal, o cualquier pieza de UI en un proyecto que tiene o puede tener @tuya-ui/components instalado, para reutilizar sus componentes y ejemplos en vez de generar código o estilos desde cero.
---

# Sistema de diseño Tuya UI

\`@tuya-ui/components\` trae el catálogo completo de componentes React, compilado y con estilos autocontenidos — no requiere Tailwind configurado en el proyecto consumidor.

\`\`\`bash
npm install @tuya-ui/components
\`\`\`

\`\`\`tsx
import "@tuya-ui/components/styles.css"; // una sola vez, en el entrypoint de la app
import { Button } from "@tuya-ui/components";
\`\`\`

No copiar ni reescribir el código de un componente: importarlo del paquete. No usar colores, espaciados ni tipografía sueltos en las clases — ya vienen aplicados dentro de cada componente y de \`styles.css\`.

## Qué referencia abrir según la tarea

${categoryList}
- **Fundamentos** (\`references/foundations.md\`) — reglas de aplicación de los tokens de marca
- **Iconografía** (\`references/icons.md\`) — nombres válidos para el prop \`name\` de \`Icon\`

Abrí solo el archivo de referencia de la categoría que corresponde a la tarea — no hace falta leer el catálogo completo para usar un solo componente.
`;

writeFileSync(join(outDir, "SKILL.md"), skillMd);
console.log("  SKILL.md");

console.log(`\nSkill generada en ${outDir}`);
