import { primitives } from "./primitives";

/**
 * The semantic layer: the only layer a component may reference. Every value
 * here is a lookup into the primitive palette, never a standalone hex.
 *
 * Light and dark are written as two explicit assignments over the same
 * primitives rather than one function applied to two mirrored ramps. The dark
 * theme is not the light theme inverted — surfaces separate by lightness
 * instead of by shadow, accents lighten to hold contrast, and text stops short
 * of pure white — so the two assignments genuinely differ and pretending
 * otherwise is what made the previous mirrored-ramp approach need per-mode
 * exceptions to stay legible.
 */

const p = primitives;

/**
 * A primitive at partial opacity, so a translucent token stays a lookup into
 * the palette instead of becoming a standalone hex.
 *
 * Translucency earns its place where a value has to work over more than one
 * surface: it composites onto whatever sits behind it, so one value covers both
 * themes rather than two that have to be kept in step. An opaque grey picked
 * for a light canvas disappears on a dark one.
 */
function alpha(hex: string, amount: number): string {
  const channel = Math.round(amount * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `${hex}${channel}`;
}

export interface NeutralBackground {
  default: string;
  subtlest: string;
  subtle: string;
  subtleHover: string;
  subtlePressed: string;
  /** The mid-gray step between `subtlePressed` and `bold` — the only one in the scale that clears 3:1 against a white or near-black fill, for a neutral surface that must read as a boundary on its own (e.g. an off-state control) rather than as a tint. */
  strong: string;
  bold: string;
  boldHover: string;
  boldPressed: string;
  disabled: string;
  inverse: string;
  selected: string;
  /**
   * The page canvas and the breadcrumb bar specifically — a dedicated tone
   * one notch cooler than `subtlest`, not a general-purpose surface. Reach
   * for `subtlest` for everything else that wants "the almost-white step."
   */
  canvas: string;
}

export interface BrandBackground {
  default: string;
  subtle: string;
  /**
   * The mid step between the tint (`subtle`) and the action (`bold`): a brand
   * fill that must read as "brand, but less" — the middle rung of an intensity
   * scale, never a surface for text. It composites to roughly 2.3:1 against
   * white, so it is not an interface boundary on its own; it belongs inside a
   * sequence (a segmented bar) read next to its legend.
   */
  strong: string;
  bold: string;
  boldHover: string;
  boldPressed: string;
  disabled: string;
}

export interface StatusBackground {
  subtle: string;
  bold: string;
}

/** Status role that also backs interactive controls, so it carries hover/pressed. */
export interface InteractiveStatusBackground extends StatusBackground {
  boldHover: string;
  boldPressed: string;
}

export interface NeutralText {
  default: string;
  subtle: string;
  subtlest: string;
  disabled: string;
  inverse: string;
  onBold: string;
}

export interface BrandText {
  default: string;
  onBold: string;
}

export interface StatusText {
  default: string;
  bold: string;
  onBold: string;
}

export interface NeutralBorder {
  default: string;
  /**
   * The softest stroke in the set: translucent, for hinting at the edge of a
   * control or a container rather than declaring it.
   *
   * NOT suitable as an accessible component boundary — it composites to roughly
   * 1.2:1, well under the 3:1 a boundary needs. Reach for `bold` when the edge
   * has to be perceivable, and for this one when it only has to be present.
   */
  soft: string;
  bold: string;
  disabled: string;
  focus: string;
  /** Translucent halo for a focused control whose base colour is neutral. */
  focusRing: string;
}

export interface BrandBorder {
  default: string;
  focus: string;
  /** Translucent halo for a focused control whose base colour is the brand. */
  focusRing: string;
}

export interface StatusBorder {
  default: string;
}

/** Status role that also backs interactive controls, so it carries a focus halo. */
export interface InteractiveStatusBorder extends StatusBorder {
  focusRing: string;
}

export interface NeutralIcon {
  default: string;
  subtle: string;
  disabled: string;
  inverse: string;
}

export interface BrandIcon {
  default: string;
}

export interface StatusIcon {
  default: string;
}

type StatusRole = "danger" | "warning" | "success" | "info" | "discovery";

export interface SemanticColorPalette {
  background: {
    neutral: NeutralBackground;
    brand: BrandBackground;
    danger: InteractiveStatusBackground;
    warning: StatusBackground;
    success: StatusBackground;
    info: StatusBackground;
    discovery: StatusBackground;
  };
  text: {
    neutral: NeutralText;
    brand: BrandText;
    danger: StatusText;
    warning: StatusText;
    success: StatusText;
    info: StatusText;
    discovery: StatusText;
  };
  border: {
    neutral: NeutralBorder;
    brand: BrandBorder;
    danger: InteractiveStatusBorder;
    warning: StatusBorder;
    success: StatusBorder;
    info: StatusBorder;
    discovery: StatusBorder;
  };
  icon: {
    neutral: NeutralIcon;
    brand: BrandIcon;
    danger: StatusIcon;
    warning: StatusIcon;
    success: StatusIcon;
    info: StatusIcon;
    discovery: StatusIcon;
  };
}

/**
 * Text sitting on a solid status fill. Warning's bold tone is an amber light
 * enough that only dark text reads on it; the rest take light text. This is
 * fixed per role, not per theme, because the fill itself is the same in both.
 */
function onBold(role: StatusRole): string {
  return role === "warning" ? p.neutral[900] : p.neutral[0];
}

/**
 * In the light theme a status reads as its bold tone on its subtle tint, with
 * the deeper step reserved for text — the pairing the definition documents for
 * chips, alerts and table cells alike.
 */
function statusLight(role: StatusRole) {
  return {
    background: { subtle: p[role][100], bold: p[role][600] } satisfies StatusBackground,
    text: { default: p[role][800], bold: p[role][800], onBold: onBold(role) } satisfies StatusText,
    border: {
      default: p[role][600],
      ...(role === "danger" ? { focusRing: alpha(p[role][600], 0.3) } : {}),
    } as StatusBorder,
    icon: { default: p[role][600] } satisfies StatusIcon,
  };
}

/**
 * On a dark canvas the tint darkens and the text lightens, which is the whole
 * of the inversion: the bold fill stays the same tone, because it is a solid
 * surface and carries its own contrast in either theme. The definition
 * documents a single legible text tone per family in dark, so `default` and
 * `bold` resolve to it both.
 */
function statusDark(role: StatusRole) {
  return {
    background: { subtle: p[role][900], bold: p[role][600] } satisfies StatusBackground,
    text: { default: p[role][400], bold: p[role][400], onBold: onBold(role) } satisfies StatusText,
    border: {
      default: p[role][400],
      ...(role === "danger" ? { focusRing: alpha(p[role][400], 0.35) } : {}),
    } as StatusBorder,
    icon: { default: p[role][400] } satisfies StatusIcon,
  };
}

function assemble(
  status: (role: StatusRole) => ReturnType<typeof statusLight>,
  rest: {
    background: { neutral: NeutralBackground; brand: BrandBackground };
    text: { neutral: NeutralText; brand: BrandText };
    border: { neutral: NeutralBorder; brand: BrandBorder };
    icon: { neutral: NeutralIcon; brand: BrandIcon };
    dangerBoldHover: string;
    dangerBoldPressed: string;
  },
): SemanticColorPalette {
  const danger = status("danger");
  const warning = status("warning");
  const success = status("success");
  const info = status("info");
  const discovery = status("discovery");

  return {
    background: {
      neutral: rest.background.neutral,
      brand: rest.background.brand,
      danger: {
        ...danger.background,
        boldHover: rest.dangerBoldHover,
        boldPressed: rest.dangerBoldPressed,
      },
      warning: warning.background,
      success: success.background,
      info: info.background,
      discovery: discovery.background,
    },
    text: {
      neutral: rest.text.neutral,
      brand: rest.text.brand,
      danger: danger.text,
      warning: warning.text,
      success: success.text,
      info: info.text,
      discovery: discovery.text,
    },
    border: {
      neutral: rest.border.neutral,
      brand: rest.border.brand,
      danger: danger.border as InteractiveStatusBorder,
      warning: warning.border,
      success: success.border,
      info: info.border,
      discovery: discovery.border,
    },
    icon: {
      neutral: rest.icon.neutral,
      brand: rest.icon.brand,
      danger: danger.icon,
      warning: warning.icon,
      success: success.icon,
      info: info.icon,
      discovery: discovery.icon,
    },
  };
}

export const semanticColorsLight: SemanticColorPalette = assemble(statusLight, {
  background: {
    neutral: {
      // The card surface. The page canvas is `subtlest`, one step down —
      // except the page body and breadcrumb bar, which want `canvas` instead.
      default: p.neutral[0],
      subtlest: p.neutral[25],
      subtle: p.neutral[50],
      subtleHover: p.neutral[100],
      subtlePressed: p.neutral[200],
      strong: p.neutral[500],
      bold: p.neutral[800],
      boldHover: p.neutral[900],
      boldPressed: p.neutral[1000],
      disabled: p.neutral[100],
      inverse: p.neutral[900],
      // Selection and active row come from the lightest brand steps.
      selected: p.brand[50],
      canvas: p.neutralCanvas,
    },
    brand: {
      default: p.brand[50],
      subtle: p.brand[50],
      strong: p.brand[300],
      /**
       * The primary action — one per view. Step 600 rather than the 500 the
       * definition names, because white on 500 measures 4.38:1 and the same
       * definition sets AA as a non-negotiable floor. The two statements cannot
       * both hold; the floor wins, and the whole interaction sequence shifts one
       * step down with it. Step 500 keeps its brand role everywhere it carries
       * no text — the focus ring, the brand border, the active-nav rail — where
       * the 3:1 floor for non-text elements applies and 4.38:1 clears it.
       */
      bold: p.brand[600],
      boldHover: p.brand[700],
      boldPressed: p.brand[800],
      disabled: p.neutral[200],
    },
  },
  text: {
    neutral: {
      default: p.neutral[800],
      subtle: p.neutral[600],
      // The lightest step still legible on white.
      subtlest: p.neutral[500],
      disabled: p.neutral[400],
      inverse: p.neutral[0],
      onBold: p.neutral[0],
    },
    brand: {
      // Red text on white takes the deeper step; 500 does not hold contrast.
      default: p.brand[600],
      onBold: p.neutral[0],
    },
  },
  border: {
    neutral: {
      default: p.neutral[200],
      // El trazo que pidió el diseño: gris de paleta al 18%. Compuesto sobre
      // blanco da #E6E6E8 — a 1.02:1 del #8080802E propuesto, o sea el mismo
      // a ojo, pero derivado de la paleta y con su matiz frío.
      soft: alpha(p.neutral[500], 0.18),
      // A bold border is a UI boundary, so it has to clear 3:1 against the
      // surface behind it — which the lighter steps do not.
      bold: p.neutral[500],
      disabled: p.neutral[100],
      focus: p.brand[500],
      focusRing: alpha(p.neutral[500], 0.3),
    },
    brand: { default: p.brand[500], focus: p.brand[500], focusRing: alpha(p.brand[500], 0.3) },
  },
  icon: {
    neutral: {
      default: p.neutral[600],
      subtle: p.neutral[500],
      disabled: p.neutral[400],
      inverse: p.neutral[0],
    },
    brand: { default: p.brand[500] },
  },
  dangerBoldHover: p.danger[800],
  dangerBoldPressed: p.danger[900],
});

export const semanticColorsDark: SemanticColorPalette = assemble(statusDark, {
  background: {
    neutral: {
      // Surface sits above the canvas by being lighter, not by casting a shadow.
      default: p.neutral[900],
      subtlest: p.neutral[1000],
      subtle: p.neutral[800],
      subtleHover: p.neutral[700],
      subtlePressed: p.neutral[600],
      strong: p.neutral[500],
      bold: p.neutral[100],
      boldHover: p.neutral[50],
      boldPressed: p.neutral[25],
      disabled: p.neutral[800],
      inverse: p.neutral[0],
      selected: p.brand[900],
      // No dark-theme spec exists yet for this tone — falls back to the same
      // step `subtlest` already uses in dark, so dark mode is unchanged.
      canvas: p.neutral[1000],
    },
    brand: {
      default: p.brand[900],
      subtle: p.brand[900],
      // "Less intense" on a dark canvas goes towards the ground, not the white:
      // bold is 400 here, so the mid step is the deeper 700.
      strong: p.brand[700],
      // The brand red lightens on a dark canvas to hold its contrast.
      bold: p.brand[400],
      boldHover: p.brand[300],
      boldPressed: p.brand[200],
      disabled: p.neutral[800],
    },
  },
  text: {
    neutral: {
      // Never pure white: light text on a dark ground reads heavier than it is.
      default: p.neutral[25],
      subtle: p.neutral[400],
      subtlest: p.neutral[500],
      disabled: p.neutral[600],
      inverse: p.neutral[900],
      onBold: p.neutral[900],
    },
    brand: { default: p.brand[400], onBold: p.neutral[900] },
  },
  border: {
    neutral: {
      default: p.neutral[700],
      // Mismo valor conceptual que en claro: al ser translúcido se compone
      // sobre la superficie que tenga debajo, así que un solo tono sirve para
      // los dos modos. En oscuro se aclara para que siga presente.
      soft: alpha(p.neutral[0], 0.14),
      // Same 3:1 floor as in light, reached from the other direction.
      bold: p.neutral[400],
      disabled: p.neutral[800],
      focus: p.brand[400],
      focusRing: alpha(p.neutral[400], 0.35),
    },
    brand: { default: p.brand[400], focus: p.brand[400], focusRing: alpha(p.brand[400], 0.35) },
  },
  icon: {
    neutral: {
      default: p.neutral[400],
      subtle: p.neutral[500],
      disabled: p.neutral[600],
      inverse: p.neutral[900],
    },
    brand: { default: p.brand[400] },
  },
  dangerBoldHover: p.danger[800],
  dangerBoldPressed: p.danger[900],
});
