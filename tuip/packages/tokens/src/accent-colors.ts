/**
 * Colores de acento: sirven para distinguir los pasos de una escala ordinal
 * —el nivel de dominio de alguien, la criticidad de un sistema, la madurez de
 * un proceso— y no significan nada más. Un paso `violet` no está sano ni en
 * riesgo: simplemente es el tercero.
 *
 * Viven aparte de la paleta semántica a propósito, igual que los colores de
 * identidad. Las siete familias de `semantic-colors.ts` responden a "qué es
 * esto"; las de `identity-colors.ts` a "quién es"; éstas responden a "cuánto".
 * Mezclarlas dejaría que un estado pidiera "purple" y que un nivel pidiera
 * "success", dos cosas que no queremos. `accent.*` NO reemplaza a `success`,
 * `warning`, `danger` ni `info`, y donde el color sí signifique estado hay que
 * usar aquéllos.
 *
 * Los cuatro matices se eligieron como una sola progresión, no como cuatro
 * familias sueltas: comparten tratamiento justamente para que la distancia
 * entre el primero y el segundo se lea igual que la del tercero al cuarto. Por
 * eso `blue` no es un alias de la familia `info` aunque se le parezca:
 * prestarlo ataría la paridad de esta escala a decisiones que se toman por
 * otros motivos.
 *
 * La escala se lee celeste → azul → violeta → magenta, con la referencia
 * `#93C5FD · #2563EB · #7C3AED · #A21CAF`.
 *
 * **`sky` responde a un piso distinto que los otros tres.** El mínimo de 3:1
 * protege un elemento gráfico del que depende entender el contenido; en el
 * medidor de nivel el contenido es cuántos segmentos están llenos, y el vacío
 * ya se distingue por su aro. Ahí el matiz es codificación redundante, y
 * exigirle ese piso obligaba a bajar el celeste hasta `#0A8FD0`, que cumplía
 * la regla y fallaba el propósito: el paso que debería leerse como "apenas
 * empieza" pesaba casi tanto como el siguiente.
 *
 * Su piso es **1,5:1 contra el cuerpo de un segmento vacío** —la superficie—,
 * y `verify-tokens.ts` lo comprueba en cada build igual que a los otros tres:
 * la excepción se verifica, no se apaga. Con ese piso el celeste de la
 * referencia pasa con 1,64:1 en su superficie más ajustada y el siguiente paso
 * más claro (`#B3D7FE`, 1,36:1) falla.
 *
 * **Lo que esto le pide a quien consuma la escala:** una pieza que quiera usar
 * un matiz de acento como **único** portador de una distinción tiene que
 * resolver su propio contraste. Esta paleta no se lo garantiza — `sky` queda
 * por debajo de 3:1 contra las superficies claras, y es una decisión tomada a
 * propósito para un consumidor cuya lectura no depende del color.
 *
 * **Un solo paso por matiz.** La definición documenta tres —`ink 600` para
 * texto, `fill 400` para gráficos, `surface 50` para fondos— y acá entra uno,
 * porque uno es el que algo usa: la pieza que consume esta escala no tiene
 * fondo teñido ni texto teñido. Publicar los otros dos "porque la tabla los
 * lista" dejaría tres cuartas partes de una paleta que nadie ejercita, sin
 * nadie que note si su valor deja de servir. Los valores descartados quedan
 * registrados en el proposal del change por si aparece el patrón que los pida.
 *
 * El nombre conserva el rol del paso (`--color-accent-blue-fill`, no
 * `--color-accent-blue`): es la convención del sistema —el nombre dice para
 * qué sirve— y evita que agregar `ink` mañana obligue a renombrar lo que ya
 * está distribuido.
 *
 * **Un valor por tema.** Hasta la escala anterior un mismo valor pasaba el
 * mínimo de 3:1 de un componente de interfaz en las cuatro superficies. Con
 * ésta no: `magenta` claro da 2,83:1 sobre la fila oscura. Por eso hay dos
 * paletas, como en la capa semántica, y cada una se verifica contra las
 * superficies de su tema (`verify-tokens.ts` falla el build si un cambio
 * futuro baja un paso del piso):
 *
 *                    fila      lienzo   fila sel.   |   fila oscura
 *     sky            1.80:1    1.73:1    1.64:1     |   8.34:1     (piso 1,5)
 *     blue           5.17:1    4.95:1    4.70:1     |   7.03:1
 *     violet         5.70:1    5.46:1    5.19:1     |   6.57:1
 *     magenta        6.32:1    6.06:1    5.76:1     |   7.26:1
 *
 * De los tres que responden al piso de 3:1, `blue` sobre la fila seleccionada
 * es el más ajustado, con 1.70 de margen. `sky` ya no se compara con ellos:
 * mide contra su propio piso, y ahí su margen más chico es 0.14 en la fila
 * seleccionada.
 */

/** Los pasos de un matiz, nombrados por lo que hacen. Hoy hay uno. */
export interface AccentStops {
  /** Relleno de gráficos y segmentos. Nunca texto: para eso está la capa semántica. */
  fill: string;
}

/**
 * El orden es el de la escala, no alfabético: quien recorra esta lista está
 * recorriendo la progresión de menor a mayor. Reordenarla cambia qué tono le
 * toca a cada paso en todo el sistema.
 */
const accentScaleLight = {
  // El celeste de la referencia, no el bajado: ver el piso propio de `sky`
  // arriba.
  sky: { fill: "#93C5FD" },
  blue: { fill: "#2563EB" },
  violet: { fill: "#7C3AED" },
  magenta: { fill: "#A21CAF" },
} as const satisfies Record<string, AccentStops>;

export type AccentColorName = keyof typeof accentScaleLight;

export const accentColorNames = Object.keys(accentScaleLight) as AccentColorName[];

export type AccentColorPalette = Record<AccentColorName, AccentStops>;

/** Sobre la fila oscura los matices claros no llegan a 3:1: se aclaran un paso. */
const accentScaleDark: AccentColorPalette = {
  sky: { fill: "#38BDF8" },
  blue: { fill: "#60A5FA" },
  violet: { fill: "#A78BFA" },
  magenta: { fill: "#E879F9" },
};

export const accentColorsLight: AccentColorPalette = accentScaleLight;
export const accentColorsDark: AccentColorPalette = accentScaleDark;

/** Alias de la paleta clara, para quien sólo necesite los nombres y el orden. */
export const accentColors: AccentColorPalette = accentColorsLight;
