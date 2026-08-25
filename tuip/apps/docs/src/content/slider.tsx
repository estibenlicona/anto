import { Slider } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const bandas = [
  { label: "XS", color: "gray" },
  { label: "S", color: "green" },
  { label: "M", color: "blue" },
  { label: "L", color: "amber" },
  { label: "XL", color: "red" },
] as const;

export const sliderContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para fijar un valor sobre un continuo donde importa más la posición relativa que el número exacto: un umbral, una tolerancia, un porcentaje.",
      "Para repartir un rango en tramos contiguos —bandas de esfuerzo, escalones de un baremo— donde mover un límite tiene que mover los dos tramos que separa.",
    ],
    whenNotToUse: [
      "Para mostrar una distribución que nadie va a editar: eso es `SegmentedBar`, que es la misma figura sin interacción.",
      "Para elegir entre opciones discretas con nombre: eso es `SegmentedControl` o `RadioGroup`, donde no hay continuo que recorrer.",
      "Como única forma de escribir un número exacto: arrastrar es impreciso. Si hay que clavar un valor, se compone un `Input` al lado.",
    ],
    pairs: [
      {
        do: "Modelar una partición como los límites entre tramos, un valor por límite.",
        dont: "Modelarla como un rango `{min, max}` por tramo y sincronizarlos a mano.",
        why: "Con un valor por límite, que un tramo crezca cuando el vecino se achica no es una regla que haya que mantener: es lo que un límite compartido es. Con dos números por tramo, los huecos y los solapes se vuelven representables y hay que salir a prohibirlos.",
      },
      {
        do: "Dar una separación mínima cuando un tramo de tamaño cero no significa nada.",
        dont: "Dejar que dos límites se junten y una banda desaparezca.",
        why: "Una banda de 0% sigue existiendo en los datos pero ya no se puede ver ni volver a agarrar con el mouse; la separación mínima evita ese estado sin salida.",
      },
      {
        do: "Nombrar cada pulgar por lo que separa.",
        dont: "Dejar que los cuatro se anuncien solo con su número.",
        why: "Una tecnología de asistencia encuentra un control por pulgar. Sin nombre, son cuatro deslizadores idénticos y hay que adivinar cuál es cuál.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full flex-col gap-7">
        <Slider value={[35]} aria-label="Umbral" />
        <Slider
          value={[20, 40, 60, 80]}
          segments={bandas.map((b) => ({ label: b.label, color: b.color }))}
          minDistance={5}
        />
      </div>
    ),
    partsCaption: "un pulgar sin segmentos · cuatro pulgares que parten la pista en cinco tramos",
    partsDescription:
      "El mismo control en sus dos formas: lo único que cambia es el largo de `value`. Los tramos no se definen, se describen — ya existen como los espacios entre pulgares, y lo único que el componente no puede saber es cómo se llama cada uno y de qué color va. Por eso `segments` lleva un elemento más que `value`: los extremos del rango también cierran un tramo.",
    parts: [
      {
        name: "Pista",
        measure: "h-2 sin segmentos · h-10 con segmentos",
        note: "Crece cuando hay tramos porque cada uno lleva su rótulo adentro; sin ellos solo tiene que ser visible.",
      },
      {
        name: "Pulgar",
        measure: "círculo de 16px · barra de 8×48px con segmentos",
        note: "Contra una pista de bandas, una barra vertical se lee como el límite que es; sobre la pista fina, un círculo.",
      },
      {
        name: "Color de tramo",
        measure: "bg-*-subtle + text-*-default",
        note: "El mismo par que usa `Tag`, y a propósito: la banda M es del mismo azul en su etiqueta dentro de la tabla que en su tramo dentro del editor.",
      },
      {
        name: "Separación mínima",
        measure: "en unidades del rango",
        note: "No en píxeles: lo que se quiere evitar es un tramo sin sentido, y eso es una condición sobre los datos, no sobre el ancho con el que se renderiza.",
      },
      {
        name: "Alcance de un movimiento",
        measure: "exactamente dos tramos",
        note: "Un pulgar se detiene contra su vecino en vez de empujarlo, tanto al arrastrar como con el teclado. Mover un límite nunca cambia el tamaño de un tramo que no toca.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Con segmentos") {
        return (
          <Slider
            value={[20, 40, 60, 80]}
            segments={bandas.map((b) => ({ label: b.label, color: b.color }))}
            minDistance={5}
            disabled={state.disabled}
          />
        );
      }
      return <Slider value={[35]} aria-label="Umbral" disabled={state.disabled} />;
    },
    states: [
      { name: "Sin segmentos", note: "Un solo valor: la pista fina con su tramo recorrido." },
      { name: "Con segmentos", note: "Los pulgares parten la pista y cada tramo se pinta y se rotula." },
      { name: "Deshabilitado", disabled: true, note: "No recibe foco ni responde al arrastre." },
    ],
    statesCaption: "La forma la decide el largo de `value` y la presencia de `segments`",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: 'role="slider" por pulgar, vía Radix',
      explanation:
        "Cada pulgar es un control propio con su valor actual y sus límites, en vez de un único control que devuelve varios números.",
    },
    {
      aspect: "Nombre del pulgar",
      value: "thumbLabels, o derivado de los tramos",
      explanation:
        "Con `segments` y sin `thumbLabels`, cada pulgar se anuncia como el límite entre los dos tramos que separa, que es lo que efectivamente mueve.",
    },
    {
      aspect: "Teclado",
      value: "Flechas, Home y End",
      explanation:
        "Mover con el teclado respeta los mismos límites y la misma separación mínima que el arrastre — no es un camino degradado, es el mismo control.",
    },
    {
      aspect: "Orden preservado",
      value: "Los pulgares no se cruzan",
      explanation:
        "Lo resuelve el primitivo: un pulgar se detiene contra su vecino, así que los valores nunca quedan desordenados ni hay que reordenarlos después.",
    },
    {
      aspect: "El color del tramo no informa",
      value: "Rótulo siempre presente",
      explanation:
        "Cada tramo lleva su nombre adentro, así que quien no distinga los colores igual sabe qué banda está tocando.",
    },
  ],
};
