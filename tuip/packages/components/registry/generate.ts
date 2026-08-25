import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { componentDefinitions, type ComponentDefinition } from "./definitions";
import { extractComponentApi, type ExtractedComponentApi } from "./extract-props";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");

const knownNames = new Set(componentDefinitions.map((component) => component.name));

for (const component of componentDefinitions) {
  for (const dependency of component.dependencies) {
    if (!knownNames.has(dependency)) {
      throw new Error(
        `Component "${component.name}" declares unknown dependency "${dependency}"`,
      );
    }
  }
}

/**
 * Utility entries (like the `cn` helper) export no React component, so parsing
 * them yields nothing and that is correct. For every real component we require
 * at least one parsed export — otherwise a broken extraction would silently
 * ship as an empty props table that looks like "this component has no props".
 */
function apiFor(component: ComponentDefinition): ExtractedComponentApi[] {
  if (component.category === "utility") return [];

  const api = component.files.flatMap((file) => extractComponentApi(file.source));
  if (api.length === 0) {
    throw new Error(
      `Could not extract any component API from "${component.name}" (${component.files
        .map((file) => file.source)
        .join(", ")}). Check that the component is exported and has a displayName.`,
    );
  }
  return api;
}

const registry = componentDefinitions.map((component) => {
  const api = apiFor(component);
  const ownPropCount = api.reduce((total, entry) => total + entry.props.length, 0);
  if (component.category !== "utility") {
    console.log(
      `  ${component.name}: ${api.length} exported component(s), ${ownPropCount} own prop(s)`,
    );
  }

  return {
    name: component.name,
    category: component.category,
    status: component.status ?? null,
    description: component.description,
    dependencies: component.dependencies,
    npmDependencies: component.npmDependencies,
    extendsElement: component.extendsElement ?? null,
    api,
    files: component.files.map((file) => ({
      target: file.target,
      content: readFileSync(join(packageRoot, file.source), "utf8"),
    })),
  };
});

const outDir = join(packageRoot, "dist");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "registry.json");
writeFileSync(outPath, JSON.stringify(registry, null, 2), "utf8");

console.log(`Generated ${outPath} (${registry.length} components)`);
