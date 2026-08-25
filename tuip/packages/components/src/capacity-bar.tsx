import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { AccentTone } from "@/lib/accent-tone";
import type { CategoricalColor } from "@/lib/categorical-color";
import { severityFor, severityTextClasses } from "@/lib/severity";
import { SegmentedBar, segmentFillClass } from "./progress";

interface CapacityPartBase {
  label: string;
  value: number;
}

/**
 * A part declares **one** colour vocabulary, never both — same contract as a
 * `SegmentedBar` segment, and for the same reason: a part carrying two colours
 * has no obvious meaning, and letting it through only pushes the ambiguity out
 * to the screen.
 *
 * Which one to reach for is a question about the parts, not about the bar:
 *
 * - `tone` when the parts are **steps of one scale**, ordered against each
 *   other. That is what the accent vocabulary distinguishes.
 * - `color` when they are **categories** that do not order against each other.
 *
 * The distinction is not academic. This component used to force `tone`, and a
 * screen splitting capacity into BAU and Transformación — two categories, not
 * two steps — ended up borrowing the very tones the seniority scale uses, and
 * reading as if it were that scale.
 */
export type CapacityPart =
  | (CapacityPartBase & { tone: AccentTone; color?: never })
  | (CapacityPartBase & { color: CategoricalColor; tone?: never });

export interface CapacityBarProps extends HTMLAttributes<HTMLDivElement> {
  /** What is already committed. */
  allocated: number;
  /** What there is to commit against. 0 is allowed: the occupancy reads 0 and the parts size against their own sum. */
  available: number;
  /** Breakdown of the allocated amount, drawn as a stacked bar over `available`. */
  parts: CapacityPart[];
  /** Unit shown after the figures, e.g. "FTE". */
  unit?: string;
  /** Occupancy from which the percentage turns to warning. Defaults to 85. At or over 100 it is danger. */
  warningFrom?: number;
  /** Word after the free amount — "1.1 libre". */
  freeLabel?: string;
  /** Replaces the free reading once there is nothing left. */
  atCapacityLabel?: string;
  /** Shown instead of the percentage and legend when nothing is allocated. */
  emptyLabel?: string;
  /** Decimals for every figure. Defaults to 1. */
  decimals?: number;
  /**
   * Draw BAU and Transformación as separate pieces instead of one continuous
   * bar — the reading SegmentedBar gives to categories that merely share a
   * total. The free remainder stays visible as track either way.
   */
  separated?: boolean;
}

/**
 * Allocated against available, read three ways at once: the figures (how
 * much over how much), the occupancy percentage coloured by severity (is
 * there room left), and a stacked bar whose empty track is the room itself.
 * Knows nothing about the domain: parts are labels with a tone, the unit is
 * a string, the readings are configurable.
 */
export function CapacityBar({
  allocated,
  available,
  parts,
  unit,
  warningFrom = 85,
  freeLabel = "libre",
  atCapacityLabel = "Al tope",
  emptyLabel = "Sin capacidad asignada",
  decimals = 1,
  separated = false,
  className,
  ...props
}: CapacityBarProps) {
  const fmt = (n: number) => n.toFixed(decimals);
  const empty = allocated === 0 && parts.length === 0;
  const pct = available > 0 ? Math.round((allocated / available) * 100) : 0;
  const atCapacity = pct >= 100;
  // At the limit there is no room left: that is danger for a capacity, even
  // though Progress (a 0–100 bar) only calls danger what goes past 100.
  const severity = atCapacity ? "danger" : severityFor(pct, warningFrom);
  const free = Math.max(available - allocated, 0);

  if (empty) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)} {...props}>
        <span className="font-semibold tabular-nums leading-5 text-neutral-subtle">
          {fmt(0)}
          {unit && <span className="font-normal"> {unit}</span>}
        </span>
        <SegmentedBar size="sm" total={1} segments={[]} />
        <span className="text-label font-normal tracking-normal text-neutral-subtle">
          {emptyLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold tabular-nums leading-5 text-neutral-default">
          {fmt(allocated)}
          <span className="font-normal text-neutral-subtle">
            {" "}
            / {fmt(available)}
            {unit && ` ${unit}`}
          </span>
        </span>
        <span
          className={cn("text-label tracking-normal tabular-nums", severityTextClasses[severity])}
          aria-label={`${pct}% de ocupación`}
        >
          {pct}%
        </span>
      </div>
      <SegmentedBar
        size="sm"
        separated={separated}
        total={available}
        segments={parts.map((part) =>
          part.tone !== undefined
            ? { value: part.value, label: part.label, tone: part.tone }
            : { value: part.value, label: part.label, color: part.color },
        )}
      />
      <div className="flex items-center gap-3 text-label font-normal tracking-normal tabular-nums text-neutral-subtle">
        {parts.map((part) => (
          <span key={part.label} className="inline-flex items-center gap-1">
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-pill",
                // El mismo origen que el tramo, para que el punto de la
                // leyenda y su tramo no puedan quedar de colores distintos.
                segmentFillClass(part),
              )}
            />
            {part.label}{" "}
            <span className="font-semibold text-neutral-default">{fmt(part.value)}</span>
          </span>
        ))}
        {atCapacity ? (
          <span className="ml-auto font-semibold text-danger-default">{atCapacityLabel}</span>
        ) : (
          <span className="ml-auto">
            {fmt(free)} {freeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
