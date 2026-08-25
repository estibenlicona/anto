/**
 * Raw color primitives, taken from the design system definition in
 * `design-system/Fundamentos Tuya DS`. Never consumed directly by components —
 * only the semantic tokens in `semantic-colors.ts` reference these.
 *
 * Primitives are theme-independent: there is one palette, and the dark theme is
 * a different assignment of these same values, made in the semantic layer. That
 * is why there is no `primitivesDark` — a second ramp would let the two themes
 * drift apart while claiming to share a palette.
 */

/** Brand and neutral are documented as full ramps. */
export type BrandScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
export type NeutralScale = Record<
  0 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000,
  string
>;

/**
 * Semantic families are documented at the steps the system actually uses, not
 * as full ramps: the subtle background, the light-theme text, the bold tone
 * that carries the meaning, and the two steps the dark theme needs. Filling the
 * gaps by interpolation would invent values the definition never approved.
 */
export type SemanticScale = Record<100 | 400 | 600 | 800 | 900, string>;

export interface PrimitivePalette {
  neutral: NeutralScale;
  /** See `neutralCanvas`'s own comment below — not part of the ramp. */
  neutralCanvas: string;
  brand: BrandScale;
  danger: SemanticScale;
  warning: SemanticScale;
  success: SemanticScale;
  info: SemanticScale;
  discovery: SemanticScale;
}

export const primitives: PrimitivePalette = {
  /**
   * Slightly cool greys, so the warm brand red stands out by temperature
   * contrast. 90% of the interface lives here. Step 1000 exists only as the
   * dark theme's canvas, one step below the darkest surface.
   */
  neutral: {
    0: "#FFFFFF",
    25: "#FAFAFB",
    50: "#F4F4F5",
    100: "#EFEFF0",
    200: "#E3E3E6",
    300: "#C9C9CE",
    400: "#A0A0A8",
    500: "#74747E",
    600: "#55555E",
    700: "#3C3C44",
    800: "#26262C",
    900: "#17171B",
    1000: "#0E0E11",
  },

  /**
   * A one-off, slightly cooler off-white outside the documented ramp above —
   * not a step nobody else needs, added for the page canvas and the
   * breadcrumb bar specifically. Sits between 25 and 50 but is deliberately
   * not fit into that numbering: unlike the ramp, this value has exactly two
   * consumers, both of which want this exact tone rather than the nearest
   * documented step.
   */
  neutralCanvas: "#F6F6F7",

  /** Tuya Red. 500 is the primary action — one per view. */
  brand: {
    50: "#FFF1F2",
    100: "#FFE1E3",
    200: "#FFC4C8",
    300: "#FF9AA1",
    400: "#F8626C",
    500: "#ED1C29",
    600: "#C9151F",
    700: "#A21018",
    800: "#7A0C12",
    900: "#52080C",
  },

  /**
   * A deep red, deliberately distinct from the brand red: error must never be
   * confused with the primary action, and never communicates by hue alone.
   */
  danger: {
    100: "#FBE9EA",
    400: "#E8646E",
    600: "#8E0F18",
    800: "#700C13",
    900: "#331416",
  },

  warning: {
    100: "#FBF2DE",
    400: "#D9A032",
    600: "#B57A00",
    800: "#6E4B00",
    900: "#302509",
  },

  success: {
    100: "#E7F3EC",
    400: "#3FB985",
    600: "#116B4B",
    800: "#0D5239",
    900: "#12291F",
  },

  info: {
    100: "#E8F0FC",
    400: "#5A94EC",
    600: "#1B5FBF",
    800: "#154A96",
    900: "#14213A",
  },

  /**
   * The definition documents discovery only in the light theme (subtle #EFEAFB,
   * bold #5B3FC4, text #3D2894). Steps 400 and 900 are derived here by the same
   * relationship the other four families follow — 400 lightens the bold tone for
   * dark surfaces, 900 is the dark subtle background — and are the only colour
   * values in this file that the source document does not state.
   */
  discovery: {
    100: "#EFEAFB",
    400: "#9B84E4",
    600: "#5B3FC4",
    800: "#3D2894",
    900: "#221A3D",
  },
};
