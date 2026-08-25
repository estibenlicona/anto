import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  semanticColorsLight,
  semanticColorsDark,
  identityColorsLight,
  identityColorsDark,
  identityColorNames,
  accentColorsLight,
  accentColorsDark,
  accentColorNames,
  attentionColorsLight,
  attentionColorsDark,
  attentionLevelNames,
  primitives,
  type SemanticColorPalette,
  type IdentityColorPalette,
  type AccentColorPalette,
  type AttentionColorPalette,
} from "../src/tokens";
import { flattenTokens } from "../src/css-var-name";
import { contrastRatio } from "../src/wcag-contrast";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = join(__dirname, "..", "dist", "tokens.css");
const css = readFileSync(cssPath, "utf8");

let failures = 0;

function checkCssInSync(label: string, pairs: Array<[string, string]>) {
  for (const [name, value] of pairs) {
    const expected = `${name}: ${value};`;
    if (!css.includes(expected)) {
      failures++;
      console.error(`[${label}] Missing or stale token in generated CSS: ${expected}`);
    }
  }
}

checkCssInSync("color/light", flattenTokens(["color"], semanticColorsLight));
checkCssInSync("color/dark", flattenTokens(["color"], semanticColorsDark));
checkCssInSync("accent/light", flattenTokens(["color", "accent"], accentColorsLight));
checkCssInSync("accent/dark", flattenTokens(["color", "accent"], accentColorsDark));
checkCssInSync(
  "attention/light",
  flattenTokens(["color", "attention"], attentionColorsLight),
);
checkCssInSync(
  "attention/dark",
  flattenTokens(["color", "attention"], attentionColorsDark),
);

interface ContrastCheck {
  label: string;
  text: string;
  background: string;
  minRatio: number;
}

const STATUS_ROLES = ["danger", "warning", "success", "info", "discovery"] as const;

/**
 * Explicit allowlist of text/background pairings actually used by Tuya UI
 * components. Not exhaustive over every semantic combination on purpose —
 * see design.md, "Verificación de contraste WCAG AA".
 */
function buildContrastChecks(
  mode: "light" | "dark",
  colors: SemanticColorPalette,
): ContrastCheck[] {
  return [
    {
      label: `${mode}: body text on page background`,
      text: colors.text.neutral.default,
      background: colors.background.neutral.default,
      minRatio: 4.5,
    },
    {
      label: `${mode}: subtle text on page background`,
      text: colors.text.neutral.subtle,
      background: colors.background.neutral.default,
      minRatio: 4.5,
    },
    {
      label: `${mode}: subtlest text on page background (UI-scale text)`,
      text: colors.text.neutral.subtlest,
      background: colors.background.neutral.default,
      minRatio: 3,
    },
    {
      label: `${mode}: link/brand text on page background`,
      text: colors.text.brand.default,
      background: colors.background.neutral.default,
      minRatio: 4.5,
    },
    {
      label: `${mode}: danger text on page background`,
      text: colors.text.danger.default,
      background: colors.background.neutral.default,
      minRatio: 4.5,
    },
    {
      label: `${mode}: primary button label on brand.bold background`,
      text: colors.text.brand.onBold,
      background: colors.background.brand.bold,
      minRatio: 4.5,
    },
    {
      label: `${mode}: danger badge label on danger.bold background`,
      text: colors.text.danger.onBold,
      background: colors.background.danger.bold,
      minRatio: 4.5,
    },
    {
      label: `${mode}: destructive button label on danger.bold hover background`,
      text: colors.text.danger.onBold,
      background: colors.background.danger.boldHover,
      minRatio: 4.5,
    },
    {
      label: `${mode}: destructive button label on danger.bold pressed background`,
      text: colors.text.danger.onBold,
      background: colors.background.danger.boldPressed,
      minRatio: 4.5,
    },
    {
      label: `${mode}: success badge label on success.bold background`,
      text: colors.text.success.onBold,
      background: colors.background.success.bold,
      minRatio: 4.5,
    },
    {
      label: `${mode}: warning badge label on warning.bold background`,
      text: colors.text.warning.onBold,
      background: colors.background.warning.bold,
      minRatio: 4.5,
    },
    {
      label: `${mode}: discovery badge label on discovery.bold background`,
      text: colors.text.discovery.onBold,
      background: colors.background.discovery.bold,
      minRatio: 4.5,
    },
    {
      label: `${mode}: info text on page background`,
      text: colors.text.info.default,
      background: colors.background.neutral.default,
      minRatio: 4.5,
    },
    {
      label: `${mode}: info badge label on info.bold background`,
      text: colors.text.info.onBold,
      background: colors.background.info.bold,
      minRatio: 4.5,
    },

    /**
     * A status role on its own tint — the chip, the callout, the table cell.
     * This is the pairing the definition documents for all five roles, and the
     * one the previous palette never checked: warning sat at 4.44:1 on its own
     * tint for as long as nobody measured it.
     */
    ...STATUS_ROLES.map((role) => ({
      label: `${mode}: ${role} text on ${role}.subtle background`,
      text: colors.text[role].default,
      background: colors.background[role].subtle,
      minRatio: 4.5,
    })),

    /** Selection and active-row surfaces carry ordinary body text. */
    {
      label: `${mode}: body text on selected background`,
      text: colors.text.neutral.default,
      background: colors.background.neutral.selected,
      minRatio: 4.5,
    },
    {
      label: `${mode}: brand text on selected background`,
      text: colors.text.brand.default,
      background: colors.background.neutral.selected,
      minRatio: 4.5,
    },

    /**
     * Non-text contrast. The definition sets the floor for borders and icons at
     * 3:1 against the adjacent background, and the focus ring has to clear it
     * on every surface it can land on.
     */
    {
      label: `${mode}: focus ring against page background`,
      text: colors.border.neutral.focus,
      background: colors.background.neutral.default,
      minRatio: 3,
    },
    {
      label: `${mode}: focus ring against subtle background`,
      text: colors.border.neutral.focus,
      background: colors.background.neutral.subtle,
      minRatio: 3,
    },
    {
      label: `${mode}: bold border against page background`,
      text: colors.border.neutral.bold,
      background: colors.background.neutral.default,
      minRatio: 3,
    },
    {
      label: `${mode}: neutral icon against page background`,
      text: colors.icon.neutral.default,
      background: colors.background.neutral.default,
      minRatio: 3,
    },
    {
      label: `${mode}: header text on subtlest background`,
      text: colors.text.neutral.default,
      background: colors.background.neutral.subtlest,
      minRatio: 4.5,
    },

    /** Switch: the white thumb has to read against its track in both states. */
    {
      label: `${mode}: switch thumb against switch track (off)`,
      text: colors.background.neutral.default,
      background: colors.background.neutral.strong,
      minRatio: 3,
    },
    {
      label: `${mode}: switch thumb against switch track (on)`,
      text: colors.background.neutral.default,
      background: colors.background.brand.bold,
      minRatio: 3,
    },
  ];
}

/**
 * Las iniciales del avatar son texto pequeño (12px), así que el par de cada
 * color de identidad debe llegar al mínimo de texto normal, no al de texto
 * grande.
 *
 * Los dos modos dan números distintos: el claro usa el tono vivo diluido al 7%
 * como fondo y el oscuro lo usa entero, así que no alcanza con verificar uno
 * solo. Es también el chequeo que atrapa un `LIGHT_FILL_STRENGTH` subido de
 * más, que junta el fondo con el texto hasta volverlo ilegible.
 */
function buildIdentityContrastChecks(
  mode: "light" | "dark",
  colors: IdentityColorPalette,
): ContrastCheck[] {
  return identityColorNames.map((name) => ({
    label: `${mode}: avatar initials on ${name} fill`,
    text: colors.text[name],
    background: colors.background[name],
    minRatio: 4.5,
  }));
}

/**
 * Un matiz de acento no trae superficie propia: tiñe segmentos que se apoyan en
 * lo que sea que haya debajo. Así que no alcanza con medirlo contra una
 * superficie elegida como representativa — se lo mide contra **todas** las que
 * el sistema puede poner debajo de la pieza, y un matiz que sólo pasara sobre
 * el fondo más favorable no estaría verificado.
 *
 * Las cuatro son las que un listado produce: la superficie de la fila, el
 * lienzo de la página, la fila seleccionada (que en tema claro lleva el tinte
 * de marca, el fondo más oscuro de los tres claros) y la fila en tema oscuro.
 * El piso es 3:1, el de un componente de interfaz: los segmentos son gráficos,
 * no texto.
 *
 * El aro del segmento vacío entra al mismo barrido. Su color es el borde neutro
 * fuerte, que ya cambia solo entre temas, pero el par contra cada superficie
 * sigue siendo lo que hay que medir.
 */
interface AccentSurface {
  label: string;
  value: string;
  /** El aro del segmento vacío toma el borde neutro del tema de esa superficie. */
  ring: string;
}

const ACCENT_SURFACES: AccentSurface[] = [
  {
    label: "row surface (light)",
    value: semanticColorsLight.background.neutral.default,
    ring: semanticColorsLight.border.neutral.bold,
  },
  {
    label: "page canvas (light)",
    value: semanticColorsLight.background.neutral.subtlest,
    ring: semanticColorsLight.border.neutral.bold,
  },
  {
    label: "selected row (light)",
    value: semanticColorsLight.background.neutral.selected,
    ring: semanticColorsLight.border.neutral.bold,
  },
  {
    label: "row surface (dark)",
    value: semanticColorsDark.background.neutral.default,
    ring: semanticColorsDark.border.neutral.bold,
  },
];

/**
 * El piso propio de `sky`, el primer paso de la escala.
 *
 * El mínimo de 3:1 protege un elemento gráfico del que depende entender el
 * contenido. En el medidor de nivel el contenido es **cuántos segmentos están
 * llenos**, y el vacío ya se distingue por su aro: ahí el matiz es
 * codificación redundante, y lo que su lectura necesita es seguir separándose
 * del cuerpo de un segmento vacío —la superficie—, no alcanzar el piso de un
 * componente portador de significado.
 *
 * No se apaga: se comprueba en cada build contra este piso. Sacar a `sky` del
 * verificador es exactamente como una paleta se reabre sin que nadie se
 * entere — nadie mira un valor que ninguna comprobación toca.
 *
 * El número está medido, no estimado: con 1.5 el celeste de la referencia
 * (#93C5FD) pasa con 1.64:1 en la fila seleccionada, que es su superficie más
 * ajustada, y el siguiente paso más claro (#B3D7FE, 1.36:1) ya falla.
 *
 * Y la comparación es contra el cuerpo del segmento vacío y no contra su aro:
 * medido contra el aro ningún matiz de la escala llega a 1.5 en el tema
 * oscuro —`blue` da 1.02— así que sería una regla que rechaza colores que
 * este change no toca.
 */
const SKY_MIN_RATIO = 1.5;

function buildAccentContrastChecks(
  mode: "light" | "dark",
  colors: AccentColorPalette,
): ContrastCheck[] {
  const surfaces = ACCENT_SURFACES.filter((surface) =>
    mode === "dark" ? surface.label.includes("(dark)") : surface.label.includes("(light)"),
  );
  return surfaces.flatMap((surface) => [
    ...accentColorNames.map((name) => ({
      label:
        name === "sky"
          ? `accent/${mode} sky filled segment vs empty segment on ${surface.label}`
          : `accent/${mode} ${name} filled segment on ${surface.label}`,
      text: colors[name].fill,
      background: surface.value,
      minRatio: name === "sky" ? SKY_MIN_RATIO : 3,
    })),
    {
      label: `empty segment ring on ${surface.label}`,
      text: surface.ring,
      background: surface.value,
      minRatio: 3,
    },
  ]);
}

/**
 * Autoprueba de los dos pisos de la escala de acento, con el mismo criterio
 * que la de atención: un guardia que nunca rechaza nada no es un guardia. Es
 * lo que demuestra que la excepción de `sky` se comprueba y no se apagó.
 */
function checkAccentScale(): void {
  const rechazaSky = !buildAccentContrastChecks("light", {
    ...accentColorsLight,
    // Un paso más claro que el celeste de la referencia: 1.36:1 sobre la fila
    // seleccionada, por debajo del piso propio de `sky`.
    sky: { fill: "#B3D7FE" },
  }).every((check) => contrastRatio(check.text, check.background) >= check.minRatio);
  if (!rechazaSky) {
    failures++;
    console.error(
      `[accent] El piso propio de sky no está rechazando #B3D7FE, que queda por debajo de ${SKY_MIN_RATIO}:1 sobre la fila seleccionada`,
    );
  }

  // Y el piso de los otros tres sigue siendo el de un componente de interfaz:
  // aflojar el de `sky` no puede aflojar el de la escala entera.
  const rechazaBlue = !buildAccentContrastChecks("light", {
    ...accentColorsLight,
    blue: { fill: "#93C5FD" },
  }).every((check) => contrastRatio(check.text, check.background) >= check.minRatio);
  if (!rechazaBlue) {
    failures++;
    console.error(
      "[accent] El piso de 3:1 no está rechazando un blue de 1.80:1 sobre la fila; la excepción de sky no puede alcanzar a los otros tres",
    );
  }
}

checkAccentScale();

/**
 * La escala de atención se mide como el acento y contra las mismas superficies:
 * su relleno es un elemento gráfico que tiene que despegarse del fondo de la
 * tabla que lo contiene, con el piso de 3:1 de un componente de interfaz.
 *
 * Es esta verificación la que fijó los valores de la escala: los pasos 400 de
 * `warning` y `danger` —los candidatos obvios— quedan en 2.12:1 y 2.95:1
 * sobre la fila seleccionada. Ver attention-colors.ts.
 */
function buildAttentionContrastChecks(
  mode: "light" | "dark",
  colors: AttentionColorPalette,
): ContrastCheck[] {
  const surfaces = ACCENT_SURFACES.filter((surface) =>
    mode === "dark" ? surface.label.includes("(dark)") : surface.label.includes("(light)"),
  );
  return surfaces.flatMap((surface) =>
    attentionLevelNames.map((level) => ({
      label: `attention/${mode} ${level} fill on ${surface.label}`,
      text: colors[level].fill,
      background: surface.value,
      minRatio: 3,
    })),
  );
}

// Informativo, no assertion: brand.strong es el peldaño medio de una escala de
// intensidad que se lee por posición y junto a su leyenda, no un elemento que
// deba reconocerse solo, así que el piso 3:1 de un límite de interfaz no le
// aplica. Se imprime para que quien cambie la escala de marca vea cuánto se
// separa del fondo.
for (const [mode, colors] of [
  ["light", semanticColorsLight],
  ["dark", semanticColorsDark],
] as const) {
  const ratio = contrastRatio(colors.background.brand.strong, colors.background.neutral.default);
  console.log(
    `[contrast] ${mode}: brand.strong segment on row surface: ${ratio.toFixed(2)}:1 (informational)`,
  );
}

/**
 * La escala de atención no se sostiene sólo por contraste: su orden y su
 * parentesco con el rol de peligro son parte de lo que promete. Estas
 * comprobaciones cuidan lo que un número de contraste no ve.
 */
function checkAttentionScale() {
  const expectedOrder = ["low", "medium", "high"];
  if (attentionLevelNames.join(",") !== expectedOrder.join(",")) {
    failures++;
    console.error(
      `[attention] La escala debe tener exactamente ${expectedOrder.join(", ")} y en ese orden; se encontró: ${attentionLevelNames.join(", ")}`,
    );
  }

  for (const [mode, colors] of [
    ["light", attentionColorsLight],
    ["dark", attentionColorsDark],
  ] as const) {
    const fills = attentionLevelNames.map((level) => colors[level].fill);
    if (new Set(fills).size !== fills.length) {
      failures++;
      console.error(
        `[attention] ${mode}: dos escalones comparten relleno (${fills.join(", ")}); una escala con pasos repetidos no gradúa nada`,
      );
    }
  }

  // El paso alto y el rol de peligro tienen que ser el mismo rojo donde el tema
  // lo permita: si el escalón más grave de un mapa y una alerta del sistema
  // fueran dos rojos distintos, el sistema diría dos cosas con dos rojos.
  const dangerLight = semanticColorsLight.background.danger.bold;
  if (attentionColorsLight.high.fill !== dangerLight) {
    failures++;
    console.error(
      `[attention] light: el paso alto (${attentionColorsLight.high.fill}) debería resolver al relleno del rol de peligro (${dangerLight})`,
    );
  }

  // En oscuro no puede: ese mismo rojo da 1.90:1 sobre la fila, o sea que el
  // cuadro desaparecería. El paso alto se toma entonces del escalón claro de la
  // misma familia, y acá queda registrado por qué.
  const dangerDark = semanticColorsDark.background.danger.bold;
  const dangerDarkRatio = contrastRatio(dangerDark, semanticColorsDark.background.neutral.default);
  if (dangerDarkRatio >= 3) {
    failures++;
    console.error(
      `[attention] dark: el relleno del rol de peligro ya alcanza ${dangerDarkRatio.toFixed(2)}:1; el paso alto debería resolver a ese valor en vez de a ${attentionColorsDark.high.fill}`,
    );
  } else if (attentionColorsDark.high.fill !== primitives.danger[400]) {
    failures++;
    console.error(
      `[attention] dark: el paso alto (${attentionColorsDark.high.fill}) debe salir de la familia de peligro; se esperaba ${primitives.danger[400]}`,
    );
  } else {
    console.log(
      `[attention] dark: el relleno del rol de peligro da ${dangerDarkRatio.toFixed(2)}:1 sobre la fila, así que el paso alto usa el escalón claro de la misma familia (informational)`,
    );
  }

  // Autoprueba del piso: con el warning.400 que esta escala descartó, la
  // verificación de contraste tiene que fallar. Un guardia que nunca rechaza
  // nada no es un guardia.
  const rejected = {
    ...attentionColorsLight,
    low: { fill: primitives.warning[400] },
  };
  const wouldPass = buildAttentionContrastChecks("light", rejected).every(
    (check) => contrastRatio(check.text, check.background) >= check.minRatio,
  );
  if (wouldPass) {
    failures++;
    console.error(
      `[attention] El piso de contraste no está rechazando ${primitives.warning[400]}, que quedó por debajo del mínimo cuando se eligió la escala`,
    );
  }
}

checkAttentionScale();

for (const check of [
  ...buildContrastChecks("light", semanticColorsLight),
  ...buildContrastChecks("dark", semanticColorsDark),
  ...buildIdentityContrastChecks("light", identityColorsLight),
  ...buildIdentityContrastChecks("dark", identityColorsDark),
  ...buildAccentContrastChecks("light", accentColorsLight),
  ...buildAccentContrastChecks("dark", accentColorsDark),
  ...buildAttentionContrastChecks("light", attentionColorsLight),
  ...buildAttentionContrastChecks("dark", attentionColorsDark),
]) {
  const ratio = contrastRatio(check.text, check.background);
  if (ratio < check.minRatio) {
    failures++;
    console.error(
      `[contrast] ${check.label}: ${ratio.toFixed(2)}:1 (needs >= ${check.minRatio}:1) — text ${check.text} on ${check.background}`,
    );
  } else {
    console.log(`[contrast] ${check.label}: ${ratio.toFixed(2)}:1 OK`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}

console.log("\nAll tokens are reflected in the generated CSS and pass WCAG AA contrast checks.");
