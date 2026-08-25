/**
 * IBM Plex Sans carries the whole interface, numbers included: open shapes that
 * hold up at 12px in a dense table, and enough weights to build hierarchy
 * without turning generic. IBM Plex Mono is reserved for literal strings — IDs,
 * branches, code — where fixed width actually means something.
 *
 * The system serves both itself rather than assuming they are installed; the
 * stacks below name a fallback only for the moment before the fonts load.
 */
export const fontFamily = {
  sans: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Consolas, monospace',
} as const;

/**
 * Four weights in use: body, interface emphasis, titles, and the figure that
 * headlines an indicator. Every weight here answers to a role — a weight kept
 * around without one is what opens the door to arbitrary pairings, not the
 * size of the set.
 */
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export interface TextStyle {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
}

/**
 * The system's type scale: seven styles, and no eighth. A screen that seems to
 * need a size this scale does not have almost always has a hierarchy problem
 * rather than a missing step — the fix is to change level, not to invent a size.
 *
 * `metric` was the most recent addition, and it is worth being precise about
 * why it is not a counter-example to that rule. This scale is named by role,
 * not by size, and the role it fills — the figure that headlines an indicator —
 * was one the system already claimed to cover while nothing actually defined
 * it: consumers were borrowing `display`, whose role is the screen title.
 * Adding a step because a screen wants a size between two others is still what
 * this rule forbids.
 *
 * Each style bundles size, leading and weight, so they cannot be combined into
 * a pairing nobody approved.
 */
export const textStyle = {
  /** Screen title. One per view, top left. */
  display: { fontSize: "34px", lineHeight: "40px", fontWeight: fontWeight.semibold },
  /** Section, or panel title. */
  headingLg: { fontSize: "24px", lineHeight: "32px", fontWeight: fontWeight.semibold },
  /** Card title. */
  headingMd: { fontSize: "18px", lineHeight: "26px", fontWeight: fontWeight.semibold },
  /**
   * The default: paragraphs, table cells, form values. 16px because the readers
   * include occasional and external users — this is not optimised for the expert.
   */
  body: { fontSize: "16px", lineHeight: "26px", fontWeight: fontWeight.regular },
  /** Help text, metadata, content inside compact tables. */
  bodySm: { fontSize: "14px", lineHeight: "22px", fontWeight: fontWeight.regular },
  /** Column heading and other small caps rubrics. */
  label: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: fontWeight.semibold,
    letterSpacing: "0.09em",
  },
  /**
   * The figure that headlines an indicator: the value a summary card exists to
   * show, not a number inside a table — that one is `body` with `numeric`.
   * Sits outside the title-to-label hierarchy on purpose; it is a different
   * axis, which is why it closes the list instead of opening it by size.
   *
   * Leading is set to the size itself: a headline figure is one line, and any
   * extra leading only pushes it off the optical centre of its card. The
   * negative tracking keeps the digits from drifting apart at this size. Pair
   * it with `numeric` so a column of these still compares vertically.
   */
  metric: {
    fontSize: "40px",
    lineHeight: "40px",
    fontWeight: fontWeight.bold,
    letterSpacing: "-0.04em",
  },
} as const satisfies Record<string, TextStyle>;

/**
 * Business figures. Tabular numerals give every digit the same width, so a
 * column of numbers compares vertically at a glance — which is the whole reason
 * one would otherwise reach for a monospaced family, without the terminal look
 * that comes with it.
 */
export const numeric = {
  fontVariantNumeric: "tabular-nums",
} as const;
