export type ClassValue = string | number | false | null | undefined;

/** Joins conditional class names, skipping falsy values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter((value) => typeof value === "string" && value.length > 0).join(" ");
}
