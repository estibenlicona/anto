import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { CategoricalColor } from "@/lib/categorical-color";

/**
 * The shared categorical vocabulary — hue names, not status roles, so asking
 * for a color never doubles as asserting a meaning. Kept as a named alias
 * because `Tag` was the first component to expose it and consumers import it
 * by this name; `Slider`'s segments now draw on the same set.
 */
export type TagColor = CategoricalColor;

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Which color sets this item apart from the others in its set. It carries no
   * meaning of its own — pick one per member and keep it stable, so a category
   * wears the same color everywhere it appears. Defaults to "gray".
   *
   * `brand` is not on offer: that role is reserved for the primary action of a
   * view, the same reason Badge excludes it.
   */
  color?: TagColor;
}

/**
 * Each hue resolves to one of the palette's existing scales. The role name
 * stays behind the hue-named prop on purpose: it keeps the palette
 * single-sourced without the consumer-facing vocabulary picking up the
 * meaning we are trying to shed.
 *
 * The pairing is the tint (`subtle`, step 100) under the deep text step
 * (`default`, step 800). The intermediate 600 was tried first for the text and
 * dropped: it is not exposed as a text token at all — only as `border` and
 * `icon` — and against the tint it measures 3.28:1 on `warning`, under the
 * 4.5:1 that `verify-tokens.ts` enforces. Step 800 clears it on all six
 * (7.06:1 at worst), so no color here needs an exception.
 */
const colorClasses: Record<TagColor, string> = {
  gray: "bg-neutral-subtle text-neutral-default",
  green: "bg-success-subtle text-success-default",
  blue: "bg-info-subtle text-info-default",
  amber: "bg-warning-subtle text-warning-default",
  red: "bg-danger-subtle text-danger-default",
  purple: "bg-discovery-subtle text-discovery-default",
};

/**
 * A short label marking an item as a member of a set — a size, a category, a
 * track. Where Badge reports a status, Tag reports nothing: no indicator dot
 * and no `role="status"`, so assistive technology reads it as plain text.
 *
 * The text is what identifies the item and the color only reinforces it, which
 * is why there is no color-only form — and why running out of the six colors
 * on a large set costs at-a-glance grouping but never meaning.
 *
 * It is a pill where Badge is square — a shape difference Badge's own docs
 * already promised readers ("se distinguen también por forma, píldora en vez
 * de cuadrada"). Since both now sit on the same tint, shape and the absent dot
 * are what tell them apart, so neither is decoration.
 *
 * A minimum width keeps a set of short labels the same size as each other:
 * "XS" and "L" would otherwise render as differently sized pills down a table
 * column, which reads as though the two meant different kinds of thing. The
 * label centers inside it, and a longer one still grows past it rather than
 * being clipped.
 */
export function Tag({ color = "gray", className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        // Medium, el mismo peso que Badge: el texto identifica, no enfatiza.
        // En bold una fila con varios tags gritaba más que el nombre de la
        // persona a la que califican.
        "inline-flex min-w-10 items-center justify-center rounded-pill px-2.5 py-0.5 text-body-sm font-medium",
        colorClasses[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
