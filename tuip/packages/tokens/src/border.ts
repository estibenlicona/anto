export const borderWidth = {
  default: "1px",
  bold: "2px",
} as const;

/**
 * The focus ring, defined once here so every control shows the same one instead
 * of each resolving it on its own. Its colour is the brand border token, which
 * is where the brand red keeps its role on a surface that carries no text.
 */
export const focusRing = {
  /**
   * Wider than a border because the ring is translucent: at 2px a 30% tint
   * barely registers, and the ring has to read as the control lit up.
   */
  width: "3px",
  /**
   * No gap: the ring sits against the control's edge.
   *
   * The gap was not just space — it is painted in its own colour, white by
   * default, so on any surface that is not white it inserted a band belonging
   * to nothing. Removing it takes that with it, and the ring stops reading as
   * something stuck on top of the control.
   */
  offset: "0px",
} as const;
