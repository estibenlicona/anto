import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { CategoricalColor } from "@/lib/categorical-color";
import type { AccentTone } from "@/lib/accent-tone";
import { severityFillClasses, severityFor } from "@/lib/severity";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. Values above 100 saturate to the danger color instead of overflowing the bar. */
  value: number;
  /** Accessible label for the progress bar. */
  label?: string;
  /**
   * Fills with the brand gradient instead of the status color. Decorative
   * only: it says nothing about the value, so reach for it where the bar is
   * there to be looked at rather than to warn — and never where the reader is
   * meant to notice something is over its limit, since the gradient does not
   * saturate to danger the way the default fill does.
   */
  brandFill?: boolean;
  /**
   * Early-warning threshold (0–100). From here up to and including 100 the
   * fill is `warning`; above 100 it stays `danger`. Omit it and the fill is
   * `success` all the way to 100, as it has always been. `warningFrom={100}`
   * flags "exactly at the limit" without calling it an error.
   */
  warningFrom?: number;
  /**
   * Fills with a step of the accent scale — the same class LevelMeter and
   * SegmentedBar use for that tone — for a bar that shows a quantity without
   * claiming a state. With a tone the fill never turns to warning or danger:
   * `warningFrom` is ignored, because a quantity painted in accent makes no
   * claim about being over a limit. Takes precedence over `brandFill`.
   */
  tone?: AccentTone;
}

export function Progress({
  value,
  label,
  brandFill,
  warningFrom,
  tone,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.max(value, 0);
  const width = Math.min(clamped, 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-control bg-neutral-subtle", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-control",
          tone !== undefined
            ? accentToneClasses[tone]
            : brandFill
              ? "bg-gradient-brand"
              : severityFillClasses[severityFor(clamped, warningFrom)],
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export type SegmentedBarRole = "info" | "warning" | "success" | "danger";

/**
 * An ordinal intensity scale over the brand, from the most severe step to the
 * least: deep danger → brand → the brand's mid step → neutral. For
 * distributions ordered by gravity, where the color sums up "how much of this
 * is serious" without asserting the state of any one member.
 */
export type SegmentedBarHeat = "max" | "high" | "mid" | "low";

interface SegmentedBarSegmentBase {
  /** Weight of this segment relative to the others — the bar shows it as a share of the total, not an absolute width. */
  value: number;
  /** Announced to assistive technology alongside the value; not shown visually. */
  label?: string;
}

export type SegmentedBarSegment =
  | (SegmentedBarSegmentBase & {
      /** Status role this segment's color comes from — the same palette Badge and Alert use. */
      role: SegmentedBarRole;
      color?: never;
      tone?: never;
      heat?: never;
    })
  | (SegmentedBarSegmentBase & {
      role?: never;
      /** Categorical fill, same six-hue vocabulary as Avatar and Tag — no status meaning. */
      color: CategoricalColor;
      tone?: never;
      heat?: never;
    })
  | (SegmentedBarSegmentBase & {
      role?: never;
      color?: never;
      /**
       * Accent fill, the same ordinal four-hue vocabulary LevelMeter uses. For
       * distributions whose segments are the steps of an ordered scale, so the
       * same step wears the same hue here and in the meter that shows it
       * elsewhere. Not for states (use `role`) nor for unordered categories
       * (use `color`).
       */
      tone: AccentTone;
      heat?: never;
    })
  | (SegmentedBarSegmentBase & {
      role?: never;
      color?: never;
      tone?: never;
      /**
       * Intensity step, see `SegmentedBarHeat`. Not for the state of one
       * member (use `role`), nor for an ordered scale with no gravity to it
       * (use `tone`).
       */
      heat: SegmentedBarHeat;
    });

export interface SegmentedBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Segments rendered left to right, each sized proportionally to its value against the total. */
  segments: SegmentedBarSegment[];
  /**
   * Draws each segment as its own rounded piece with a gap between them,
   * instead of one continuous bar. Use it when the segments are independent
   * categories: read edge to edge, they suggest a continuum the data does not
   * have. Leave it off when they really are parts of one whole.
   */
  separated?: boolean;
  /**
   * Size the segments against this total instead of their own sum, leaving
   * the remainder as empty track — the unassigned part of a capacity. A total
   * below the sum is ignored (the segments never overflow the bar).
   */
  total?: number;
  /** `sm` is Progress's 6 px height, for a table row; `md` (default) is 8 px. */
  size?: "sm" | "md";
}

const roleClasses: Record<SegmentedBarRole, string> = {
  info: "bg-info-bold",
  warning: "bg-warning-bold",
  success: "bg-success-bold",
  danger: "bg-danger-bold",
};

// Same solid-fill treatment as `colorClasses` in avatar.tsx, written literal
// for the same reason: Tailwind's JIT needs the full class name in source.
const categoricalColorClasses: Record<CategoricalColor, string> = {
  gray: "bg-neutral-bold",
  green: "bg-success-bold",
  blue: "bg-info-bold",
  amber: "bg-warning-bold",
  red: "bg-danger-bold",
  purple: "bg-discovery-bold",
};

// The same fill step LevelMeter uses, written literal for the same JIT
// reason as the two maps above. Sharing the class — not just the hue — is
// the point: the meter and the bar stay the same color by construction.
const accentToneClasses: Record<AccentTone, string> = {
  sky: "bg-accent-sky-fill",
  blue: "bg-accent-blue-fill",
  violet: "bg-accent-violet-fill",
  magenta: "bg-accent-magenta-fill",
};

const heatClasses: Record<SegmentedBarHeat, string> = {
  max: "bg-danger-bold",
  high: "bg-brand-bold",
  mid: "bg-brand-strong",
  low: "bg-neutral-subtle-pressed",
};

/**
 * The fill class a segment resolves to, whichever of the four vocabularies it
 * declares. Exported so a legend next to the bar can paint its dot with the
 * very same class — same color by construction, not by lookalike.
 */
export function segmentFillClass(
  segment: Pick<SegmentedBarSegment, "role" | "color" | "tone" | "heat">,
): string {
  if (segment.heat) return heatClasses[segment.heat];
  if (segment.tone) return accentToneClasses[segment.tone];
  if (segment.color) return categoricalColorClasses[segment.color];
  return roleClasses[segment.role as SegmentedBarRole];
}

/**
 * The system's default chart: a proportional bar, not a charting library.
 * Each segment colors itself one of three ways: a status role (the same
 * palette Badge and Alert use, for when the distribution genuinely means
 * something like health or severity), a categorical color (the same
 * six-hue vocabulary as Avatar and Tag, for telling categories apart with
 * no status meaning attached), or an accent tone (the ordinal vocabulary
 * LevelMeter uses, for when the segments are the steps of an ordered
 * scale). Never more than one on the same segment.
 *
 * `separated` switches the same data between the two readings the shape can
 * carry: one continuous bar for parts of a whole, or discrete pieces for
 * categories that merely share a total.
 */
export function SegmentedBar({
  segments,
  separated,
  total,
  size = "md",
  className,
  ...props
}: SegmentedBarProps) {
  const sum = segments.reduce((acc, segment) => acc + segment.value, 0);
  const denominator = (total !== undefined ? Math.max(total, sum) : sum) || 1;

  return (
    <div
      className={cn(
        "flex w-full",
        size === "sm" ? "h-1.5" : "h-2",
        // Separated, the rounding moves to each piece and the container must
        // stop clipping — its own `overflow-hidden` would cut the inner
        // corners right back off.
        separated ? "gap-hug" : "overflow-hidden rounded-control",
        // With a total, the unfilled remainder has to be visible as track.
        total !== undefined && "bg-neutral-subtle",
        className,
      )}
      {...props}
    >
      {segments.map((segment, index) => (
        <div
          key={index}
          className={cn(segmentFillClass(segment), separated && "rounded-pill")}
          style={{ width: `${(segment.value / denominator) * 100}%` }}
        >
          {segment.label && <span className="sr-only">{`${segment.label}: ${segment.value}`}</span>}
        </div>
      ))}
    </div>
  );
}
