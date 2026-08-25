import { primitives as p } from "./primitives";

/**
 * Escala de atención: gradúa **cuánta** atención pide algo cuando un solo paso
 * no alcanza. Tres escalones de intensidad creciente, para el caso en que hay
 * muchas cosas a la vez y no todas urgen igual — un mapa de calor de brechas,
 * una grilla de alertas, una lista de vencimientos.
 *
 * Es el cuarto vocabulario de color del sistema, y existe porque los otros
 * tres responden preguntas distintas. Las familias de `semantic-colors.ts`
 * responden "qué es esto" y afirman un estado sin graduarlo: algo está en
 * riesgo o no lo está. Las de `accent-colors.ts` responden "cuánto" pero se
 * declaran explícitamente mudas sobre el estado: un paso `violet` no está
 * peor que uno `blue`, sólo después. Ésta responde las dos a la vez: gradúa
 * un estado que ya se afirmó.
 *
 * **No hay un cuarto paso para "sin atención".** Lo que está en orden va en la
 * familia neutra. Un escalón de color para lo que no pide nada invita a pintar
 * la superficie entera, y una escala donde todo lleva color deja de señalar —
 * que es exactamente lo que estos tres pasos existen para hacer. Es la regla
 * que separa un mapa que se lee de un vistazo de una grilla de colores bonita.
 *
 * **Un solo paso por escalón, y es relleno.** Igual que el acento: la pieza que
 * consume esta escala tiñe una superficie pequeña que se lee por su color, sin
 * texto encima. Se probó publicar además el texto legible sobre cada relleno y
 * se descartó al medirlo: `low` cae en la zona muerta donde ni el texto claro
 * ni el oscuro alcanzan 4.5:1, y forzarlo habría empujado la escala a valores
 * elegidos por el texto que nadie escribe encima en vez de por la separación
 * contra el fondo, que es lo que sí importa. Una cifra dentro del cuadro va al
 * lado, no adentro.
 *
 * **Los tres derivan de los primitivos de los roles que ya expresan atención.**
 * `high` es el mismo valor que el relleno del rol `danger`: si el escalón más
 * grave de un mapa y una alerta del sistema fueran dos rojos distintos, el
 * sistema estaría diciendo dos cosas con dos rojos. En tema oscuro no se
 * puede: ese rojo da 1.90:1 sobre la fila oscura, o sea que el cuadro
 * desaparecería, así que ahí `high` toma el escalón claro de la misma familia.
 * El mínimo de contraste manda sobre la coincidencia exacta. Los otros dos no pudieron
 * ser los pasos 400 de esas familias — con el piso de 3:1 de un componente de
 * interfaz, `warning.400` da 2.12:1 sobre la fila seleccionada y `danger.400`
 * 2.95:1, los dos por debajo. La escala clara quedó así:
 *
 *                       fila     lienzo   fila sel.
 *     low   warning.600  3.65:1   3.50:1   3.33:1
 *     medium (derivado)  5.53:1   5.30:1   5.03:1
 *     high  danger.600   9.41:1   9.02:1   8.57:1
 *
 * `low` sobre la fila seleccionada es el más ajustado, con 0.33 de margen.
 *
 * **Un valor por tema.** En claro los tres escalones son oscuros para
 * despegarse de superficies claras; sobre la fila oscura ninguno se vería, así
 * que el tema oscuro usa los pasos claros de las mismas familias. Es la misma
 * decisión que tomó el acento, por el mismo motivo.
 */

/** Mezcla lineal de dos hex, para derivar un paso intermedio de una familia. */
function mix(from: string, to: string, amount: number): string {
  const channels = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [fr, fg, fb] = channels(from);
  const [tr, tg, tb] = channels(to);
  const step = (a: number, b: number) =>
    Math.round(a + (b - a) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${step(fr, tr)}${step(fg, tg)}${step(fb, tb)}`.toUpperCase();
}

/** Los pasos de un escalón, nombrados por lo que hacen. Hoy hay uno. */
export interface AttentionStops {
  /** Relleno de la superficie que pide atención. Nunca texto. */
  fill: string;
}

/**
 * El orden es el de la escala, no alfabético: quien recorra esta lista está
 * recorriendo la progresión de menor a mayor. Reordenarla cambia qué
 * intensidad le toca a cada escalón en todo el sistema.
 */
const attentionScaleLight = {
  low: { fill: p.warning[600] },
  // El punto medio entre el rojo claro y el fuerte de la familia `danger`:
  // derivado y no elegido, para que un cambio en la familia lo arrastre.
  medium: { fill: mix(p.danger[400], p.danger[600], 0.5) },
  high: { fill: p.danger[600] },
} as const satisfies Record<string, AttentionStops>;

export type AttentionLevelName = keyof typeof attentionScaleLight;

export const attentionLevelNames = Object.keys(
  attentionScaleLight,
) as AttentionLevelName[];

export type AttentionColorPalette = Record<AttentionLevelName, AttentionStops>;

/**
 * Sobre la fila oscura los tres escalones claros desaparecen: son oscuros por
 * definición. El tema oscuro usa los pasos claros de las mismas familias.
 *
 * El orden se lee distinto en cada tema y es a propósito. El matiz gradúa igual
 * en los dos —ámbar, luego rojo—, pero dentro del rojo la intensidad la marca
 * la separación del fondo: en claro se oscurece (5.53 → 9.41) y en oscuro se
 * aclara (4.03 → 5.52). `low` va aparte en los dos: es ámbar, y su lugar en la
 * escala lo dice el matiz, no la luminancia.
 */
const attentionScaleDark: AttentionColorPalette = {
  low: { fill: p.warning[400] },
  medium: { fill: mix(p.danger[400], p.danger[600], 0.3) },
  high: { fill: p.danger[400] },
};

export const attentionColorsLight: AttentionColorPalette = attentionScaleLight;
export const attentionColorsDark: AttentionColorPalette = attentionScaleDark;

/** Alias de la paleta clara, para quien sólo necesite los nombres y el orden. */
export const attentionColors: AttentionColorPalette = attentionColorsLight;
