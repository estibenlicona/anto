import { primitives } from "./primitives";

/**
 * Decorative brand fills. Both ends are steps of the brand scale rather than
 * two hexes of their own, so the gradient follows the palette instead of
 * drifting away from it the first time brand red is retuned.
 *
 * Reserved for decoration, and the distinction matters: a gradient reads as a
 * surface treatment, not as a signal. Anything whose colour carries meaning —
 * within capacity, over budget, failed — uses the status roles, which say the
 * same thing everywhere in the product. A gradient that stands in for one of
 * those is a state nobody can name.
 */
export const gradient = {
  /** Left to right, the brand's primary step easing into its lighter one. */
  brand: `linear-gradient(90deg, ${primitives.brand[500]}, ${primitives.brand[400]})`,
} as const;
