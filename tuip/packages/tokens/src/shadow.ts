/**
 * Every step reads as light from above: more offset than blur spreads sideways,
 * plus a negative spread that pulls the sides in so nothing shows above the top
 * edge. A step whose blur bleeds as far sideways as it falls downward is not
 * elevation — it is a smudge tracing the outline.
 *
 * `sm` used to be `0 1px 2px 0`: a 2px blur reaches about 1px in every
 * direction while the offset was only 1px, so it stood ~1px proud at the sides
 * against ~2px below. At 1:2 it read as a halo. It now matches the family: ~1px
 * at the sides against ~3px below, and nothing above.
 *
 * `edge` is the one step that does not read as light from above, because it is
 * not elevation: it is the seam of a frozen column, cast sideways onto the
 * content sliding under it. It is `sm`'s exact recipe turned onto the
 * horizontal axis, so the two never look like different materials.
 */
export const shadow = {
  none: "none",
  sm: "0 2px 4px -1px rgb(0 0 0 / 0.08)",
  md: "0 4px 8px -2px rgb(0 0 0 / 0.10)",
  lg: "0 12px 24px -4px rgb(0 0 0 / 0.14)",
  edge: "2px 0 4px -1px rgb(0 0 0 / 0.08)",
} as const;
