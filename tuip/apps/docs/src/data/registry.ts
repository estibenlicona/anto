import registryData from "@tuya-ui/components/registry.json";

export interface RegistryFile {
  target: string;
  content: string;
}

export interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

/** Props of one exported component. A single entry can export several (e.g. card). */
export interface RegistryComponentApi {
  displayName: string;
  props: RegistryProp[];
}

export type ComponentStatus = "stable" | "beta";

export interface RegistryComponent {
  name: string;
  category: string;
  /** Null for utility entries, which are never shown. */
  status: ComponentStatus | null;
  description: string;
  dependencies: string[];
  npmDependencies: string[];
  /** Native HTML element whose attributes the component also accepts, if any. */
  extendsElement: string | null;
  api: RegistryComponentApi[];
  files: RegistryFile[];
}

export const registry = registryData as RegistryComponent[];

export const displayableComponents = registry.filter((component) => component.category !== "utility");

export function findComponent(name: string): RegistryComponent | undefined {
  return registry.find((component) => component.name === name);
}

/**
 * A component's registry name is a lowercase, hyphen-separated identifier
 * (`button`, `radio-group`). This turns it into the label people read. It is
 * the only place the site changes the case of anything: every other label is
 * shown as it was written, because a blanket CSS `capitalize` cannot tell a
 * proper noun from a preposition and would mangle names that are not meant
 * to be title-cased.
 */
export function componentLabel(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** The file that holds the component's own implementation (as opposed to a shared dependency file). */
export function primaryFile(component: RegistryComponent): RegistryFile {
  return component.files[0];
}

export function componentsByCategory(): Array<{ category: string; components: RegistryComponent[] }> {
  const groups = new Map<string, RegistryComponent[]>();
  for (const component of displayableComponents) {
    const list = groups.get(component.category) ?? [];
    list.push(component);
    groups.set(component.category, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, components]) => ({ category, components }));
}
