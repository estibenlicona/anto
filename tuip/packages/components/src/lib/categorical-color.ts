/**
 * The system's categorical color vocabulary: names for telling members of a
 * set apart, with no meaning attached to any of them.
 *
 * Named by hue rather than by status role on purpose. A component that asks
 * for `color="red"` is asking for the red one; a `variant="danger"` would make
 * the consumer assert the item is dangerous just to pick a color. Where the
 * color genuinely means something — an error, a warning — the status roles are
 * what to reach for, not this.
 *
 * Each hue corresponds to one of the palette's existing families:
 *
 *     gray → neutral    green → success    blue → info
 *     amber → warning   red → danger       purple → discovery
 *
 * That correspondence is documented here and spelled out again as literal
 * utility classes inside each component that uses it. The repetition is
 * required, not an oversight: Tailwind generates a class only if it finds the
 * complete name in the source, so a `bg-${family}-subtle` built at runtime
 * would produce no CSS at all. What each component decides for itself is the
 * treatment — a tint under deep text, a solid fill — since that varies with
 * what the component is for.
 *
 * `brand` is deliberately absent: that family is reserved for the primary
 * action of a view.
 */
export type CategoricalColor =
  | "gray"
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "purple";
