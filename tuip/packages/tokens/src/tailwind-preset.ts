import {
  accentColor,
  attentionColor,
  borderWidth,
  breakpoint,
  color,
  componentSize,
  controlHeight,
  focusRing,
  gradient,
  identityColor,
  layer,
  maxWidth,
  motion,
  motionRecipe,
  overlayWidth,
  radius,
  shadow,
  spaceAlias,
  spacing,
  touchTarget,
  typography,
  type AccentColorPalette,
  type AttentionColorPalette,
} from "./tokens";
import { toKebabCase } from "./css-var-name";

/**
 * One map per colour property instead of a single shared `colors` theme. The
 * shared theme forced the property into every key, so a background utility read
 * `bg-background-neutral-default`; keyed per property, the same token is
 * `bg-neutral-default` and the utility matches the variable that backs it
 * (`--color-bg-neutral-default`) segment for segment.
 */
function propertyVars(property: "bg" | "text" | "border" | "icon", group: unknown) {
  function walk(pathSegments: string[], value: unknown): Array<[string, string]> {
    if (typeof value === "string") {
      const path = pathSegments.map(toKebabCase).join("-");
      return [[path, `var(--color-${property}-${path})`]];
    }
    if (typeof value === "object" && value !== null) {
      return Object.entries(value).flatMap(([key, nested]) => walk([...pathSegments, key], nested));
    }
    return [];
  }
  return Object.fromEntries(walk([], group));
}

/**
 * Igual que `propertyVars` pero para el vocabulario de identidad, que vive un
 * segmento más adentro (`--color-identity-bg-cranberry`) y se pide con el
 * prefijo puesto (`bg-identity-cranberry`). El prefijo es lo que impide
 * confundir "esta persona es cranberry" con "este estado es danger".
 */
function identityVars(property: "bg" | "text", group: Record<string, string>) {
  return Object.fromEntries(
    Object.keys(group).map((name) => [
      `identity-${toKebabCase(name)}`,
      `var(--color-identity-${property}-${toKebabCase(name)})`,
    ]),
  );
}

/**
 * El vocabulario de acento. Sólo alimenta `backgroundColor`: su único paso es
 * un relleno de gráficos, y no hay un paso de texto ni de borde que mapear —
 * donde el color va sobre texto, lo que corresponde es la capa semántica.
 *
 * Los pasos van con el prefijo puesto (`bg-accent-blue-fill`) por el mismo
 * motivo que en identidad: sin él, `bg-blue-fill` competiría con las familias
 * semánticas por el mismo espacio de nombres.
 */
/**
 * Sólo fondo: la escala tiñe la superficie que pide atención y nunca el texto.
 * El prefijo va puesto (`bg-attention-high-fill`) por el mismo motivo que en
 * identidad y acento — dice a qué vocabulario pertenece el token.
 */
function attentionVars(group: AttentionColorPalette) {
  return Object.fromEntries(
    Object.entries(group).flatMap(([level, stops]) =>
      Object.keys(stops).map((stop) => [
        `attention-${toKebabCase(level)}-${toKebabCase(stop)}`,
        `var(--color-attention-${toKebabCase(level)}-${toKebabCase(stop)})`,
      ]),
    ),
  );
}

function accentVars(group: AccentColorPalette) {
  return Object.fromEntries(
    Object.entries(group).flatMap(([hue, stops]) =>
      Object.keys(stops).map((stop) => [
        `accent-${toKebabCase(hue)}-${toKebabCase(stop)}`,
        `var(--color-accent-${toKebabCase(hue)}-${toKebabCase(stop)})`,
      ]),
    ),
  );
}

/**
 * Each style of the scale becomes one utility (`text-display`, `text-body-sm`)
 * rather than three classes that can be combined into a pairing the scale never
 * defined — Tailwind's `fontSize` accepts exactly the shape a style already has.
 */
function fontSizeScale() {
  return Object.fromEntries(
    Object.entries(typography.textStyle).map(([name, style]) => [
      toKebabCase(name),
      [
        style.fontSize,
        {
          lineHeight: style.lineHeight,
          fontWeight: style.fontWeight,
          ...("letterSpacing" in style ? { letterSpacing: style.letterSpacing } : {}),
        },
      ],
    ]),
  );
}

/**
 * `transparent` and `current` are CSS primitives, not brand colours — the
 * catalogue leans on both (Button's transparent border that keeps the solid
 * variants at the same box height, `bg-current`/`border-current` for icons and
 * spinners) and replacing a colour theme drops them unless they are named
 * explicitly. `white` and `black` are deliberately absent: unlike the two
 * primitives above, they are a competing colour vocabulary, not CSS mechanics.
 */
const cssColorPrimitives = { transparent: "transparent", current: "currentColor" };

/**
 * Las medidas de la capa de token de componente, con el nombre del componente
 * puesto (`w-seniority-card`, `h-seniority-card-compact`). El nombre es lo que
 * evita que se las lea como un paso de una escala general y que el próximo
 * componente las tome prestadas porque "quedaban bien".
 */
const componentWidths = {
  "seniority-card": componentSize.seniorityCard.width,
  "seniority-card-narrow": componentSize.seniorityCard.widthNarrow,
};

const componentHeights = {
  "seniority-card": componentSize.seniorityCard.height,
  "seniority-card-compact": componentSize.seniorityCard.heightCompact,
};

/**
 * The motion steps as utilities (`duration-fast`, `ease-entrance`), each a
 * reference to its variable rather than the literal, so a retuned step reaches
 * every transition already shipped.
 */
function motionVars(group: "duration" | "easing") {
  return Object.fromEntries(
    Object.keys(motion[group]).map((name) => [name, `var(--motion-${group}-${toKebabCase(name)})`]),
  );
}

/**
 * One `animate-*` utility per recipe (`animate-panel-in`, `animate-float-out`),
 * naming the `@keyframes` that `@tuya-ui/tokens/css` emits and taking its
 * duration and curve from the motion variables. `both` holds the last frame
 * until the element unmounts, which is what lets a Radix surface finish its
 * exit before it is removed. The reduced-motion swap lives with the keyframes,
 * so nothing here has to know about it.
 */
function animationRecipes() {
  return Object.fromEntries(
    Object.entries(motionRecipe).map(([name, recipe]) => [
      toKebabCase(name),
      `tuya-${toKebabCase(name)} var(--motion-duration-${recipe.duration}) var(--motion-easing-${recipe.easing}) both`,
    ]),
  );
}

/**
 * Tailwind preset mapping Tuya CA semantic design tokens to utility classes
 * (e.g. `bg-brand-bold`, `text-neutral-default`) backed by
 * the CSS Variables emitted by `@tuya-ui/tokens/css`. Only the semantic
 * layer is exposed here — primitives are never Tailwind utilities, and
 * neither is Tailwind's own default colour palette: every colour-bearing key
 * below replaces the native scale instead of extending it, so a colour
 * outside this vocabulary never compiles.
 */
export const tuyaUiTailwindPreset = {
  theme: {
    /**
     * `fontSize`, and every colour-bearing key below, replace Tailwind's own
     * scale instead of extending it. Extending keeps Tailwind's default
     * function-valued theme underneath — for colours that function resolves to
     * the entire native palette — so the vocabulary would be closed in the
     * documentation and open in practice, and the first person in a hurry
     * reaches for whatever still compiles.
     */
    fontSize: fontSizeScale(),
    // Every namespace Tailwind derives from `colors` by default when it has no
    // override of its own — `ringColor`, `divideColor`, `outlineColor` among
    // them — inherits this closed set for free, with nothing to declare here.
    colors: { ...cssColorPrimitives, ...propertyVars("border", color.light.border) },
    backgroundColor: {
      ...cssColorPrimitives,
      ...propertyVars("bg", color.light.background),
      ...identityVars("bg", identityColor.light.background),
      ...accentVars(accentColor.light),
      ...attentionVars(attentionColor.light),
    },
    textColor: {
      ...cssColorPrimitives,
      ...propertyVars("text", color.light.text),
      ...identityVars("text", identityColor.light.text),
    },
    borderColor: { ...cssColorPrimitives, ...propertyVars("border", color.light.border) },
    // Icons inherit `currentColor`, so the icon role reaches them through
    // text utilities; fill and stroke are here for the rare standalone case.
    fill: { ...cssColorPrimitives, ...propertyVars("icon", color.light.icon) },
    stroke: { ...cssColorPrimitives, ...propertyVars("icon", color.light.icon) },
    extend: {
      fontFamily: {
        sans: typography.fontFamily.sans.split(", "),
        mono: typography.fontFamily.mono.split(", "),
      },
      fontWeight: typography.fontWeight,
      /**
       * Both the scale and the aliases. The alias is what laying out should
       * reach for (`p-inset`, `gap-stack`), and the numbered step stays
       * available for the cases that genuinely need a specific value.
       */
      spacing: { ...spacing, ...spaceAlias },
      // `bg-gradient-brand`. Tailwind's own `bg-gradient-to-*` helpers stay out
      // of the vocabulary on purpose: they take their stops from arbitrary
      // colour utilities, which is the open-ended version of exactly what this
      // token closes.
      backgroundImage: Object.fromEntries(
        Object.entries(gradient).map(([name, value]) => [`gradient-${toKebabCase(name)}`, value]),
      ),
      borderRadius: radius,
      borderWidth,
      boxShadow: shadow,
      screens: breakpoint,
      zIndex: layer,
      maxWidth,
      // Named overlay widths (`w-modal-sm`, `w-drawer-lg`, ...) so a
      // component picks the step it needs instead of an arbitrary pixel
      // value — the same reasoning as `maxWidth`, one level narrower.
      width: {
        ...Object.fromEntries(
          Object.entries(overlayWidth).map(([name, value]) => [toKebabCase(name), value]),
        ),
        ...componentWidths,
      },
      height: { ...controlHeight, ...componentHeights },
      // A field whose content can wrap (a combobox's chips) needs a floor, not
      // a fixed height — the same control-height steps, applied as a minimum.
      minHeight: { ...controlHeight, touch: touchTarget },
      // The focus ring comes from the token, so every control shows the same
      // one instead of each hardcoding a width that happens to match today.
      ringWidth: { focus: focusRing.width },
      ringOffsetWidth: { focus: focusRing.offset },
      transitionDuration: motionVars("duration"),
      transitionTimingFunction: motionVars("easing"),
      animation: animationRecipes(),
    },
  },
};

export default tuyaUiTailwindPreset;
