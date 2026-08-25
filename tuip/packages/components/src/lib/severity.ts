/**
 * Status severity of a 0–100 percentage, shared by Progress, Meter and
 * CapacityBar so a bar and the figure next to it never disagree.
 *
 * Over 100 is always `danger` (saturated, never overflowing). `warningFrom`
 * turns on an early-warning band: from that threshold up to and including
 * 100 the severity is `warning`. Without it there is no band — `success` all
 * the way to 100, the way Progress has always read.
 */
export type Severity = "success" | "warning" | "danger";

export function severityFor(value: number, warningFrom?: number): Severity {
  if (value > 100) return "danger";
  if (warningFrom !== undefined) {
    const threshold = Math.min(Math.max(warningFrom, 0), 100);
    if (value >= threshold) return "warning";
  }
  return "success";
}

// Written literal: Tailwind's JIT needs the full class name in source.
export const severityFillClasses: Record<Severity, string> = {
  success: "bg-success-bold",
  warning: "bg-warning-bold",
  danger: "bg-danger-bold",
};

export const severityTextClasses: Record<Severity, string> = {
  success: "text-success-default",
  warning: "text-warning-default",
  danger: "text-danger-default",
};
