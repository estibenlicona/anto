import { semanticColorsDark, semanticColorsLight, type SemanticColorPalette } from "./semantic-colors";
import { shadow } from "./shadow";

export interface ElevationSurface {
  background: string;
  boxShadow: string;
}

export interface ElevationPalette {
  surface: {
    raised: ElevationSurface;
    overlay: ElevationSurface;
    sunken: ElevationSurface;
  };
}

/**
 * Named elevation pairs a background with a shadow so components never
 * combine `shadow.*` and `color.background.*` ad hoc and risk an
 * inconsistent surface (e.g. a dark shadow floating over a dark background).
 */
function buildElevation(colors: SemanticColorPalette): ElevationPalette {
  return {
    surface: {
      raised: { background: colors.background.neutral.subtle, boxShadow: shadow.sm },
      overlay: { background: colors.background.neutral.default, boxShadow: shadow.lg },
      sunken: { background: colors.background.neutral.subtlest, boxShadow: shadow.none },
    },
  };
}

export const elevationLight: ElevationPalette = buildElevation(semanticColorsLight);
export const elevationDark: ElevationPalette = buildElevation(semanticColorsDark);
