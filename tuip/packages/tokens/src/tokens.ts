/**
 * Single source of truth for Tuya CA brand design tokens, following a
 * two-layer architecture (primitives -> semantic) equivalent to Atlassian
 * Design Tokens. Components only ever consume the semantic layer.
 */

import { primitives } from "./primitives";
import { semanticColorsDark, semanticColorsLight } from "./semantic-colors";
import { identityColorsDark, identityColorsLight } from "./identity-colors";
import { accentColorsDark, accentColorsLight } from "./accent-colors";
import { attentionColorsDark, attentionColorsLight } from "./attention-colors";
import { componentSize } from "./component-tokens";
import { fontFamily, fontWeight, numeric, textStyle } from "./typography";
import { shadow } from "./shadow";
import { elevationDark, elevationLight } from "./elevation";
import { motion } from "./motion";
import { borderWidth, focusRing } from "./border";
import { gradient } from "./gradient";
import {
  breakpoint,
  breakpointBehaviour,
  controlHeight,
  layer,
  maxWidth,
  overlayWidth,
  shell,
  touchTarget,
} from "./layout";

export { primitives } from "./primitives";
export { semanticColorsLight, semanticColorsDark } from "./semantic-colors";
export type { SemanticColorPalette } from "./semantic-colors";
export { identityColorsLight, identityColorsDark, identityColorNames } from "./identity-colors";
export type { IdentityColorPalette, IdentityColorName } from "./identity-colors";
export {
  accentColors,
  accentColorsLight,
  accentColorsDark,
  accentColorNames,
} from "./accent-colors";
export type { AccentColorPalette, AccentColorName, AccentStops } from "./accent-colors";
export {
  attentionColors,
  attentionColorsLight,
  attentionColorsDark,
  attentionLevelNames,
} from "./attention-colors";
export type {
  AttentionColorPalette,
  AttentionLevelName,
  AttentionStops,
} from "./attention-colors";
export { componentSize, seniorityCard } from "./component-tokens";
export type { PrimitivePalette } from "./primitives";
export { textStyle, numeric } from "./typography";
export type { TextStyle } from "./typography";
export { elevationLight, elevationDark } from "./elevation";
export type { ElevationPalette } from "./elevation";
export { motion, motionRecipe } from "./motion";
export type { MotionRecipe, MotionRecipeName, MotionFrames } from "./motion";
export { borderWidth, focusRing } from "./border";
export { gradient } from "./gradient";
export {
  breakpoint,
  breakpointBehaviour,
  controlHeight,
  layer,
  maxWidth,
  overlayWidth,
  shell,
  touchTarget,
} from "./layout";
export { shadow } from "./shadow";
// La razón de contraste se publica junto a los tokens porque la documentación
// tiene que poder medir un par y mostrar el número, en vez de transcribirlo a
// mano y que quede viejo en el próximo cambio de paleta.
export { contrastRatio } from "./wcag-contrast";

/** Semantic color tokens, keyed by mode. This is what components consume. */
export const color = {
  light: semanticColorsLight,
  dark: semanticColorsDark,
} as const;

/**
 * Colores de identidad, keyed by mode. Vocabulario aparte del semántico: no
 * describen estado ni acción, sólo distinguen personas. Ver identity-colors.ts.
 */
export const identityColor = {
  light: identityColorsLight,
  dark: identityColorsDark,
} as const;

/**
 * Colores de acento. Tercer vocabulario, aparte del semántico y del de
 * identidad: no describen estado ni persona, sólo distinguen los pasos de una
 * escala ordinal.
 *
 * Agrupado por modo como `identityColor`: desde la escala celeste→magenta los
 * matices claros no alcanzan 3:1 sobre la fila oscura. Ver accent-colors.ts.
 */
export const accentColor = {
  light: accentColorsLight,
  dark: accentColorsDark,
};

/**
 * La escala de atención, agrupada por modo por el mismo motivo que el acento:
 * el escalón alto es casi negro y no se despega de la fila oscura.
 * Ver attention-colors.ts.
 */
export const attentionColor = {
  light: attentionColorsLight,
  dark: attentionColorsDark,
};

// The primitive palette is theme-independent and re-exported above; the dark
// theme is a different assignment of it, made in the semantic layer.

export const typography = {
  fontFamily,
  fontWeight,
  textStyle,
  numeric,
} as const;

/**
 * The spacing scale: a 4px base, every step a multiple, no intermediate values.
 * This is the inventory — what to reach for is the alias below.
 */
export const spacing = {
  100: "4px",
  200: "8px",
  300: "12px",
  400: "16px",
  500: "24px",
  600: "32px",
  700: "48px",
  800: "64px",
  900: "96px",
} as const;

/**
 * A number does not say when to use it; the alias does. Laying out means
 * picking the relationship, not the pixel — which is also what lets the whole
 * system's rhythm be recalibrated without touching a single screen.
 *
 * The rule that settles most doubts: space communicates belonging, so the gap
 * inside a group is always smaller than the gap between groups. When they are
 * equal, nobody can tell where one idea ends.
 */
export const spaceAlias = {
  /** Touching: a status dot and its text, a digit and its unit. */
  hug: spacing[100],
  /** Within a row: icon and label inside a button, buttons of a group. */
  inline: spacing[200],
  /** Between parts of one component: a label and its field. */
  stack: spacing[300],
  /** Between related siblings: two fields of the same block. */
  group: spacing[400],
  /** Inner padding of cards, panels, modals, comfortable table cells. */
  inset: spacing[500],
  /** Between distinct blocks of one section. */
  block: spacing[600],
  /** Between sections. The jump that says "another topic starts here". */
  section: spacing[700],
  /** Air between the top bar and the page header. */
  pageTop: spacing[800],
  /** Bottom close, so the last block is not stuck to the end of the scroll. */
  pageBottom: spacing[900],
} as const;

/**
 * The difference in radius hints at what is clickable — control stays under
 * surface — but both were scaled up together for a more pronounced rounding.
 */
export const radius = {
  none: "0px",
  /**
   * Small controls — 16 px a side or under, such as the checkbox.
   *
   * A radius does not scale: at 32 px, `control` reads as a rounded corner;
   * at 16 px the same 8 px is half the side, which is the definition of a
   * circle. A checkbox drawn that way says "pick one" while it accepts many.
   */
  compact: "4px",
  /** Controls and fields. */
  control: "8px",
  /** Cards, modals and menus. */
  surface: "12px",
  /** Chips and avatars only — never a control. */
  pill: "9999px",
} as const;

export const elevation = {
  light: elevationLight,
  dark: elevationDark,
} as const;

export const tokens = {
  color,
  identityColor,
  accentColor,
  attentionColor,
  componentSize,
  primitives,
  typography,
  gradient,
  spacing,
  spaceAlias,
  radius,
  shadow,
  breakpoint,
  elevation,
  motion,
  borderWidth,
  focusRing,
  controlHeight,
  touchTarget,
  maxWidth,
  overlayWidth,
  shell,
  layer,
} as const;

export type ColorMode = "light" | "dark";
export type Tokens = typeof tokens;
