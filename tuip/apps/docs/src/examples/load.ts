import type { ExampleModule, LoadedExample } from "./types";

// The same files are pulled in twice: once executed, for the live render, and
// once as raw text, for the snippet. Because both come from one file, a change
// to an example necessarily changes both — they cannot drift apart.
const modules = import.meta.glob<ExampleModule>("./*/*.tsx", { eager: true });
const sources = import.meta.glob<string>("./*/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

const EXAMPLE_PATH = /^\.\/(?<component>[^/]+)\/(?<id>[^/]+)\.tsx$/;

/**
 * Drops the `meta` export from the displayed snippet. It is how the site
 * labels the example, not part of what a reader would copy. Import statements
 * are deliberately kept — they are part of a usable snippet.
 */
function stripMeta(source: string): string {
  return source.replace(/^export const meta = \{[\s\S]*?\n\};\n\n?/m, "").trimStart();
}

function buildIndex(): Map<string, LoadedExample[]> {
  const byComponent = new Map<string, LoadedExample[]>();

  for (const [path, module] of Object.entries(modules)) {
    const match = EXAMPLE_PATH.exec(path);
    if (!match?.groups) continue;

    const { component, id } = match.groups;
    const source = sources[path];
    if (typeof source !== "string") continue;

    const list = byComponent.get(component) ?? [];
    list.push({ id, meta: module.meta, Component: module.default, source: stripMeta(source) });
    byComponent.set(component, list);
  }

  // The numeric filename prefix defines the reading order.
  for (const list of byComponent.values()) {
    list.sort((a, b) => a.id.localeCompare(b.id));
  }
  return byComponent;
}

const examplesByComponent = buildIndex();

export function getExamples(componentName: string): LoadedExample[] {
  return examplesByComponent.get(componentName) ?? [];
}
