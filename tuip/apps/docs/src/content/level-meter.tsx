import { LevelMeter } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const levelMeterContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Cuando el dato es una posición dentro de una escala ordinal cerrada — el nivel de dominio de alguien, la criticidad de un sistema, la madurez de un proceso.",
      "Cuando esa escala tiene pocos pasos y todos valen lo mismo: lo que comunica el medidor es cuántos están llenos, no cuánto ocupa cada uno.",
      "Como pieza suelta, cuando estás construyendo tu propio patrón de nivel. Si lo que necesitás es el nivel de seniority de una persona, eso ya existe armado: SeniorityCard.",
      "Sobre cualquier superficie del sistema: el medidor no dibuja fondo propio y su contraste está verificado contra la fila, el lienzo, la fila seleccionada y la fila en tema oscuro.",
      "Con `steps` distinto de 4, cuando tu escala tiene otra longitud. Es la razón por la que la prop existe.",
    ],
    whenNotToUse: [
      "Para una distribución entre categorías: eso es SegmentedBar. Allá el ancho de cada segmento es el dato; acá los anchos son iguales a propósito.",
      "Para un avance hacia una meta (un 73% de capacidad usada): eso es Progress. Un medidor de pasos discretos redondearía el dato sin decirlo.",
      "Como único canal de la información. El medidor dice \"3 de 4\" a una tecnología de asistencia, pero a la vista es sólo color y forma: acompañalo siempre de la etiqueta del nivel.",
      "Con una escala de más de cinco o seis pasos: a esa altura contar segmentos deja de ser más rápido que leer un número.",
    ],
    pairs: [
      {
        do: "Pasar `label` con el nombre de la escala que el medidor representa.",
        dont: "Dejarlo sin nombre porque \"se entiende por el contexto visual\".",
        why: "Sin `label`, un lector de pantalla anuncia \"3 de 4\" sin decir de qué — el número solo no dice nada. La única excepción es cuando el contenedor ya nombra el dato, como hace SeniorityCard.",
      },
      {
        do: "Usar el mismo matiz para el mismo nivel en todas las pantallas.",
        dont: "Elegir el tono por cómo queda en esa pantalla en particular.",
        why: "El valor de una escala de color es que se aprende una vez. Si el tercer paso es violeta en un listado y morado en otro, no hay escala: hay dos decoraciones.",
      },
      {
        do: "Dejar que el medidor recorte un valor fuera de rango.",
        dont: "Calcular el recorte antes de pasarlo, o pasar un `steps` que dé lugar al valor que tenés.",
        why: "El recorte está para que un dato sucio no rompa el layout, no para acomodar la escala al dato. Si el valor no entra en la escala, el problema es el dato.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full max-w-xs flex-col gap-4">
        <LevelMeter value={1} tone="sky" label="Primer paso" />
        <LevelMeter value={2} tone="blue" label="Segundo paso" />
        <LevelMeter value={3} tone="violet" label="Tercer paso" />
        <LevelMeter value={4} tone="magenta" label="Cuarto paso" />
        <LevelMeter value={3} steps={5} tone="blue" label="Escala de cinco pasos" />
      </div>
    ),
    partsCaption: "Los cuatro pasos de la escala, y abajo una escala de cinco con `steps`",
    partsDescription:
      "Una fila de segmentos de igual ancho. Los llenos toman el paso `fill` del matiz; los vacíos son la superficie neutra con su aro. El medidor no dibuja fondo ni borde propios: se apoya en lo que lo contenga, que es lo que le permite ir dentro de otra pieza sin recortarla.",
    parts: [
      {
        name: "Alto del segmento",
        measure: "h-1.5",
        note: "El mismo que la pista de Progress, para que dos medidas del sistema no se vean de distinto peso en la misma pantalla.",
      },
      {
        name: "Separación",
        measure: "gap-hug (space.hug, 4px)",
        note: "El alias de \"pegado\": los segmentos son partes de una misma pieza, no elementos hermanos.",
      },
      {
        name: "Segmento lleno",
        measure: "bg-accent-<matiz>-fill",
        note: "El único paso que la paleta de acento publica, y el único elemento de la pieza que toma el color del nivel.",
      },
      {
        name: "Segmento vacío",
        measure: "bg-neutral-default + border-neutral-bold",
        note: "El aro es lo único que lo hace visible: su relleno es la misma superficie neutra que tiene debajo, así que sin trazo no habría nada que ver. Llega a 4.21:1 o más contra las cuatro superficies del sistema.",
      },
      {
        name: "Ancho de cada segmento",
        measure: "flex-1",
        note: "Todos iguales, cualquiera sea la cantidad de pasos. Un segmento más ancho que otro diría que un paso vale más que el siguiente.",
      },
    ],
    renderState: (state) => {
      const value = state.name === "Escala vacía" ? 0 : state.name === "Escala completa" ? 4 : 2;
      return <LevelMeter value={value} tone="blue" label={state.name} />;
    },
    states: [
      { name: "Parcial" },
      { name: "Escala vacía", note: "Ningún segmento lleno — el nivel más bajo, no la ausencia de dato." },
      { name: "Escala completa" },
    ],
    statesCaption:
      "El medidor no tiene estados de interacción: no es un control, y su aspecto es una función pura del valor",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: 'role="meter"',
      explanation:
        "El rol correcto para un valor dentro de un rango conocido. No es `progressbar`: esto no avanza hacia una meta, marca una posición.",
    },
    {
      aspect: "Valor anunciado",
      value: 'aria-valuenow · aria-valuemin · aria-valuemax · aria-valuetext="3 de 4"',
      explanation:
        "`aria-valuetext` va además de los tres números para que el anuncio sea \"3 de 4\" y no un valor suelto, incluso donde el rol `meter` no termine de mapearse.",
    },
    {
      aspect: "Nombre accesible",
      value: "label",
      explanation:
        "Nombra de qué escala es el valor. Se omite sólo cuando el contenedor ya lo nombra — SeniorityCard lo hace, y duplicarlo haría que el lector anuncie el nivel dos veces.",
    },
    {
      aspect: "Segmentos",
      value: 'aria-hidden="true"',
      explanation:
        "Los segmentos son la representación visual del valor que el medidor ya anuncia. Sin ocultarlos, un lector de pantalla recorrería cuatro divs vacíos después de haber dicho el valor.",
    },
    {
      aspect: "Contraste",
      value: "≥ 3:1 los segmentos y su aro contra la superficie",
      explanation:
        "Verificado automáticamente en `verify-tokens.ts` contra las cuatro superficies del sistema donde el medidor puede caer, no sólo contra una. El relleno del segmento vacío no se distingue por sí solo del fondo que tiene debajo, y por eso el aro no es decorativo.",
    },
    {
      aspect: "Color como único canal",
      value: "no",
      explanation:
        "El medidor comunica por cantidad de segmentos llenos además de por color, y el valor viaja en ARIA. Aun así no se basta solo: quien lo use debe mostrar la etiqueta del nivel al lado.",
    },
  ],
};
