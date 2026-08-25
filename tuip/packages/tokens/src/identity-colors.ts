/**
 * Colores de identidad: sirven para distinguir a una persona de otra, y no
 * significan nada más. Un avatar cranberry no está en peligro ni destacado —
 * simplemente le tocó cranberry.
 *
 * Viven aparte de la paleta semántica a propósito. Las siete familias de
 * `semantic-colors.ts` (brand, neutral, danger, warning, success, info,
 * discovery) responden a "qué es esto"; éstas responden a "quién es". Mezclarlas
 * dejaría que un estado pidiera "cranberry" y que una persona pidiera "danger",
 * dos cosas que no queremos.
 *
 * Los valores salen de la paleta de personas de Fluent UI (la que usa Teams),
 * tomados de su fuente y no aproximados:
 *
 *     tema claro:  fondo = el tono al 15% sobre blanco,  texto = shade20
 *     tema oscuro: fondo = shade20,                      texto = tint60
 *
 * El texto de color sobre fondo tenue es el look de Teams, y no el que usa el
 * Avatar de Fluent v9 —que va con `tint40`/`shade30`—. Es una desviación
 * deliberada del componente de Fluent.
 *
 * El fondo claro se calcula en vez de tomarse de la escala porque el paso que
 * se quería no existe en ella: entre `tint60` (casi blanco) y `tint50` no hay
 * nada. Es el único valor calculado acá; todo lo demás sale tal cual de Fluent.
 *
 * El texto es `shade20` y no `shade10` por el 15%: a esa intensidad de fondo,
 * `shade10` deja cinco de los doce colores por debajo del mínimo de contraste.
 * Un paso más oscuro los devuelve a todos por encima con margen.
 *
 * Como consecuencia, los dos temas dejan de ser el mismo par con los roles
 * intercambiados: el claro usa el 7% y el oscuro el tono vivo entero. Cada uno
 * se verifica por separado en `verify-tokens.ts`, que ya no puede apoyarse en
 * que el contraste sea simétrico entre temas.
 *
 * Se toman 12 de los 28 de Fluent, elegidos por separación de tono. Con 12 las
 * repeticiones son raras en equipos de decenas de personas sin cuadruplicar la
 * paleta para alimentar un solo componente. Quedan afuera los casi duplicados
 * (darkRed junto a cranberry, peach junto a pumpkin) y los neutros (beige,
 * mink, platinum, anchor), que distinguen mal.
 *
 * `gold` y `seafoam` también quedaron afuera, y por un motivo distinto: son tan
 * claros que con este par no llegan al mínimo de contraste (2.52:1 y 3.09:1
 * contra el 4.5:1 que necesita texto pequeño). En su lugar entran `brown` y
 * `darkGreen`, que ocupan una franja de tono parecida y sí llegan.
 */

/** Los dos extremos de cada color, nombrados por su rol en Fluent. */
interface IdentityColorPair {
  /** `tint60`: el paso casi blanco. Texto en tema oscuro. */
  tint: string;
  /** `shade20`: el paso de color. Texto en tema claro, fondo en tema oscuro. */
  shade: string;
}

/**
 * Cuánto del tono lleva el fondo en tema claro. Subirlo da avatares más
 * sólidos, pero el texto es ese mismo tono, así que acercar los dos los junta:
 * por encima de ~12% con `shade10` de texto varios colores caen por debajo del
 * mínimo, y por eso este 15% viene con el texto un paso más oscuro.
 * `verify-tokens.ts` es lo que atrapa el próximo intento de subirlo de más.
 */
const LIGHT_FILL_STRENGTH = 0.15;

/** Mezcla un color con blanco. Sale un hex sólido y no un alpha a propósito:
 *  un fondo translúcido se compondría contra la fila, que cambia en hover. */
function overWhite(color: string, strength: number): string {
  const channels = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return `#${channels
    .map((value) =>
      Math.round(value * strength + 255 * (1 - strength))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

const fluentPersonaColors = {
  cranberry: { tint: "#fdf3f4", shade: "#960b18" },
  pumpkin: { tint: "#fdf7f4", shade: "#9a3d0c" },
  brown: { tint: "#faf7f4", shade: "#6c4123" },
  brass: { tint: "#fbf8f2", shade: "#745408" },
  forest: { tint: "#f6faf0", shade: "#376304" },
  darkGreen: { tint: "#f0f9f0", shade: "#085108" },
  teal: { tint: "#f0fafa", shade: "#026467" },
  steel: { tint: "#eff7f9", shade: "#004555" },
  blue: { tint: "#f3f9fd", shade: "#005ba1" },
  cornflower: { tint: "#f7f9fe", shade: "#3c51b4" },
  purple: { tint: "#f7f4fb", shade: "#46236e" },
  magenta: { tint: "#fcf2f9", shade: "#91005a" },
} as const satisfies Record<string, IdentityColorPair>;

export type IdentityColorName = keyof typeof fluentPersonaColors;

/**
 * El orden es el del reparto: quien asigna colores recorre esta lista, así que
 * cambiarlo le cambia el color a todo el mundo. No reordenar sin querer hacer
 * exactamente eso.
 */
export const identityColorNames = Object.keys(
  fluentPersonaColors,
) as IdentityColorName[];

export interface IdentityColorPalette {
  background: Record<IdentityColorName, string>;
  text: Record<IdentityColorName, string>;
}

function assemble(mode: "light" | "dark"): IdentityColorPalette {
  const background = {} as Record<IdentityColorName, string>;
  const text = {} as Record<IdentityColorName, string>;
  for (const name of identityColorNames) {
    const { tint, shade } = fluentPersonaColors[name];
    background[name] =
      mode === "light" ? overWhite(shade, LIGHT_FILL_STRENGTH) : shade;
    text[name] = mode === "light" ? shade : tint;
  }
  return { background, text };
}

export const identityColorsLight: IdentityColorPalette = assemble("light");
export const identityColorsDark: IdentityColorPalette = assemble("dark");
