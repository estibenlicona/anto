import { CapacityBar } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const parts = [
  { label: "BAU", value: 1.7, tone: "sky" as const },
  { label: "Transf.", value: 1.0, tone: "blue" as const },
];

export const capacityBarContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Con `separated` cuando la card de resumen de al lado ya dibuja BAU y Transformación como piezas: la columna y la card deben leerse igual. Por defecto la barra es continua.",
      "En una columna de listado donde cada fila tiene algo asignado sobre algo disponible y el lector quiere saber, de un vistazo, cuánto queda: la capacidad de una célula, el presupuesto de un frente.",
      "Cuando lo asignado se reparte en partes que vale la pena distinguir (BAU y Transformación): cada parte es un tramo con su color y su cifra en la leyenda.",
      "Eligiendo el vocabulario de color según lo que las partes sean: `tone` si son pasos de una misma escala, ordenados entre sí; `color` si son categorías que no se ordenan. Una parte declara uno de los dos, nunca los dos.",
      "Con `warningFrom` cuando el aviso tiene que llegar antes del tope — por defecto al 85 %.",
    ],
    whenNotToUse: [
      "`tone` para partes que son categorías. El acento distingue pasos de una escala ordinal, y usarlo para dos categorías las hace tomar prestados los tonos de las escalas que sí lo son. Pasó con BAU y Transformación: se coloreaban con los mismos tonos que la escala de seniority y se leían como si fueran esa escala.",
      "Para un solo porcentaje sin partes ni disponible: eso es Meter.",
      'Para una distribución entre categorías que no son "lo asignado" de un total: eso es SegmentedBar o DistributionCard.',
      "Con partes que significan estados (sano / en riesgo): las partes son tramos de un todo y van en tonos de acento. Un estado se dice con Badge al lado.",
      "Pegada al ancho de la columna: limitá el ancho desde el consumidor (`max-w`), la barra no se frena sola.",
    ],
    pairs: [
      {
        do: "Pasar lo disponible real aunque sea 0.",
        dont: 'Inventar un disponible para que el porcentaje "salga".',
        why: "Con disponible 0 el porcentaje es 0 sin dividir por cero y los tramos se dimensionan sobre su propia suma; el dato sigue siendo honesto.",
      },
      {
        do: "Usar los mismos tonos para las mismas partes en todas las CapacityBar de la app.",
        dont: "Cambiar el tono de BAU según la pantalla.",
        why: "El tono se aprende una vez: en la columna, en la card del detalle y en la leyenda tiene que ser el mismo.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="w-full max-w-xs">
        <CapacityBar allocated={2.7} available={3.8} parts={parts} unit="FTE" />
      </div>
    ),
    partsCaption: "Cabecera · porcentaje · barra apilada sobre el disponible · leyenda · libre",
    partsDescription:
      "Tres lecturas del mismo dato: las cifras (cuánto sobre cuánto), el porcentaje coloreado por severidad (queda margen o no) y la barra, cuyo track vacío es lo libre. La leyenda repite el tono de cada tramo en su punto, por la misma clase de relleno.",
    parts: [
      {
        name: "Cifras",
        measure: "font-semibold · tabular-nums",
        note: "Lo disponible y la unidad en tono subtle.",
      },
      {
        name: "Porcentaje",
        measure: "text-label · tracking-normal",
        note: "success / warning (desde `warningFrom`) / danger (al tope).",
      },
      {
        name: "Barra",
        measure: "SegmentedBar size sm con total",
        note: "Tramos en tonos de acento; el vacío es el track.",
      },
      {
        name: "Leyenda",
        measure: "text-label · font-normal",
        note: "Punto de 6 px con la clase del tramo, etiqueta y cifra.",
      },
      {
        name: "Lectura final",
        measure: "ml-auto",
        note: '"N libre" o el texto de tope en danger.',
      },
    ],
    renderState: (state) =>
      state.name === "Al tope" ? (
        <CapacityBar
          allocated={2}
          available={2}
          parts={[
            { label: "BAU", value: 1, tone: "sky" },
            { label: "Transf.", value: 1, tone: "blue" },
          ]}
          unit="FTE"
        />
      ) : state.name === "Vacía" ? (
        <CapacityBar allocated={0} available={0} parts={[]} unit="FTE" />
      ) : (
        <CapacityBar
          allocated={1}
          available={2}
          parts={[{ label: "BAU", value: 1, tone: "sky" }]}
          unit="FTE"
        />
      ),
    states: [
      { name: "Con espacio" },
      { name: "Al tope", note: "El porcentaje y la lectura final pasan a danger." },
      { name: "Vacía", note: "Sin porcentaje ni leyenda; el texto de vacío es configurable." },
    ],
    statesCaption: "Los textos (libre, tope, vacío) y el umbral se configuran por props",
  },

  accessibility: [
    {
      aspect: "Porcentaje",
      value: "aria-label",
      explanation:
        'La cifra coloreada lleva "N % de ocupación" como nombre, para que el estado no dependa sólo del color.',
    },
    {
      aspect: "Tramos",
      value: "texto oculto por segmento",
      explanation:
        'Cada parte lleva el texto oculto de SegmentedBar ("BAU: 1.7"); la leyenda visible repite las cifras.',
    },
  ],
};
