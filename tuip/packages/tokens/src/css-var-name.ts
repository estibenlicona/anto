export function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Segments whose written form differs from the property they name. The naming
 * scheme is meant to be said out loud — `--color-bg-brand-bold` — and `bg` is
 * how the property is actually spoken and written in every stylesheet, while
 * the TypeScript model keeps the full word so the code reads as prose.
 */
const SEGMENT_ALIASES: Record<string, string> = {
  background: "bg",
};

function segment(value: string): string {
  const kebab = toKebabCase(value);
  return SEGMENT_ALIASES[kebab] ?? kebab;
}

/**
 * Recursively walks a nested token object and flattens it into CSS Variable
 * declarations. The first path segment is the variable's prefix, so the caller
 * decides which vocabulary a group belongs to: primitives are emitted under
 * `tuya` because they are the system's own inventory, and everything a
 * component may consume is emitted under the name of what it controls —
 * `color`, `space`, `radius` — which is what makes a variable's name
 * predictable from what you want.
 *
 * Numeric keys (primitive scale steps like `600`) are kept as-is.
 */
export function flattenTokens(pathSegments: string[], value: unknown): Array<[string, string]> {
  if (typeof value === "string") {
    return [[`--${pathSegments.map(segment).join("-")}`, value]];
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenTokens([...pathSegments, key], nested),
    );
  }
  return [];
}
