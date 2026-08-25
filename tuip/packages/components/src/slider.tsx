import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";
import type { CategoricalColor } from "@/lib/categorical-color";

export interface SliderSegment {
  /** Shown inside the span. This is what identifies it — the color only reinforces it. */
  label: string;
  /** Which color sets this span apart from its neighbours. Carries no meaning of its own. */
  color: CategoricalColor;
}

export interface SliderProps {
  /**
   * One thumb per entry, in ascending order. A single value is an ordinary
   * slider, two are a range, and more partition the track into spans.
   */
  value: number[];
  /** Called with the full array whenever any thumb moves. */
  onValueChange?: (value: number[]) => void;
  /** Start of the range. Defaults to 0. */
  min?: number;
  /** End of the range. Defaults to 100. */
  max?: number;
  /** Granularity of a move, in the range's units. Defaults to 1. */
  step?: number;
  /**
   * Closest two adjacent thumbs may get, in the range's own units — not in
   * pixels, so the same limit holds however wide the control renders. Defaults
   * to 0, which lets thumbs touch but never cross.
   */
  minDistance?: number;
  /**
   * Describes the spans the thumbs divide the track into, so a partition reads
   * at a glance. Takes exactly one more entry than `value`: the spans include
   * the one from `min` to the first thumb and the one from the last thumb to
   * `max`. Omit it for an ordinary slider.
   */
  segments?: SliderSegment[];
  /**
   * Accessible name per thumb, one per `value`. Without it, a slider with
   * `segments` names each thumb after the two spans it separates; otherwise
   * the thumbs fall back to the control's own `aria-label`.
   */
  thumbLabels?: string[];
  /** Names the control as a whole. */
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The tint under deep text, the same pairing `Tag` uses — so a category that
 * wears blue as a Tag in a table wears the same blue as a span here. Spelled
 * out as literal classes because Tailwind only generates a class it can find
 * whole in the source; see `lib/categorical-color.ts`.
 */
const segmentClasses: Record<CategoricalColor, string> = {
  gray: "bg-neutral-subtle text-neutral-default",
  green: "bg-success-subtle text-success-default",
  blue: "bg-info-subtle text-info-default",
  amber: "bg-warning-subtle text-warning-default",
  red: "bg-danger-subtle text-danger-default",
  purple: "bg-discovery-subtle text-discovery-default",
};

/**
 * Radix shoves neighbouring thumbs along when a drag runs into them, while its
 * own keyboard handling stops the thumb at the neighbour instead. Left as-is
 * the control would answer to mouse and keyboard differently, and worse, one
 * drag could resize a span nobody touched: pushing the XS/S boundary far
 * enough right would squeeze S, then M, then L in turn. For a partition a
 * drag has to mean exactly two spans — the two the boundary separates.
 *
 * So whatever array the primitive emits is reduced back to a single moved
 * thumb: the one the gesture is driving, clamped against where its neighbours
 * already sat, with every other thumb restored to its previous value.
 */
function clampToSingleThumb(
  previous: number[],
  next: number[],
  min: number,
  max: number,
  minDistance: number,
): number[] {
  const moved = next.reduce<number[]>(
    (indices, value, index) => (value !== previous[index] ? [...indices, index] : indices),
    [],
  );
  if (moved.length === 0) return previous;

  // A push to the right raises every displaced thumb and the leftmost of them
  // is the one under the cursor; a push to the left lowers them, and then it
  // is the rightmost.
  const risingUp = next[moved[0]] > previous[moved[0]];
  const driving = risingUp ? moved[0] : moved[moved.length - 1];

  const floor = driving > 0 ? previous[driving - 1] + minDistance : min;
  const ceiling = driving < previous.length - 1 ? previous[driving + 1] - minDistance : max;

  const settled = [...previous];
  settled[driving] = Math.min(Math.max(next[driving], floor), ceiling);
  return settled;
}

/**
 * Sets one or more values along a range. Where `SegmentedBar` shows a
 * distribution that cannot be touched, this is the one someone edits.
 *
 * With several thumbs it becomes a partition editor, and that is the point:
 * neighbouring spans share a boundary, so there is a single number between
 * them rather than one span's end and the next one's start. Moving a thumb
 * necessarily resizes both spans it separates — not because anything here
 * keeps them in step, but because a shared boundary has nothing to keep in
 * step with. Gaps and overlaps are not rejected; they cannot be expressed.
 *
 * Built on `@radix-ui/react-slider`: no native element does more than one
 * thumb — `<input type="range">` has exactly one — so roving focus, keyboard
 * stepping and the no-crossing constraint come from the primitive, the same
 * reasoning `Tabs` documents.
 */
export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  segments,
  thumbLabels,
  "aria-label": ariaLabel,
  disabled,
  className,
}: SliderProps) {
  // Radix counts the gap in steps; the prop above is in the range's units, so
  // a consumer never has to restate the step to express "at least 5%".
  const minStepsBetweenThumbs = step > 0 ? Math.round(minDistance / step) : 0;

  // The spans run boundary to boundary, with the range's own ends closing the
  // first and last — which is why there is one more span than there are thumbs.
  const boundaries = [min, ...value, max];
  const span = max - min || 1;

  function thumbName(index: number): string | undefined {
    if (thumbLabels?.[index]) return thumbLabels[index];
    if (segments && segments[index] && segments[index + 1]) {
      return `Límite entre ${segments[index].label} y ${segments[index + 1].label}`;
    }
    return ariaLabel;
  }

  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      value={value}
      onValueChange={
        onValueChange &&
        ((next) => onValueChange(clampToSingleThumb(value, next, min, max, minDistance)))
      }
      min={min}
      max={max}
      step={step}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative w-full grow overflow-hidden rounded-control bg-neutral-subtle",
          // Tall enough to carry a label when the spans are shown; the bare
          // track only has to be visible.
          segments ? "h-10" : "h-2",
        )}
      >
        {segments
          ? segments.map((segment, index) => (
              <div
                key={index}
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 flex items-center justify-center overflow-hidden text-body-sm font-bold",
                  segmentClasses[segment.color],
                )}
                style={{
                  left: `${((boundaries[index] - min) / span) * 100}%`,
                  width: `${((boundaries[index + 1] - boundaries[index]) / span) * 100}%`,
                }}
              >
                {segment.label}
              </div>
            ))
          : <SliderPrimitive.Range className="absolute h-full bg-brand-bold" />}
      </SliderPrimitive.Track>

      {value.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={thumbName(index)}
          className={cn(
            "block shrink-0 border-bold border-neutral-default bg-neutral-default shadow-md outline-none",
            "focus-visible:ring-focus focus-visible:ring-neutral-focus-ring",
            "disabled:cursor-not-allowed",
            // A bar against the tall banded track reads as the boundary it is;
            // a circle suits the thin one.
            segments
              ? "h-12 w-2 cursor-ew-resize rounded-control border-neutral-bold"
              : "h-4 w-4 cursor-pointer rounded-pill border-brand-bold",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
