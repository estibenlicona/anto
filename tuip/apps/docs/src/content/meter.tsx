import { Meter } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const meterContent: ComponentContent = {
  usage: {
    whenToUse: [
      "En una celda de tabla donde un porcentaje tiene que verse de un vistazo (la barra) y leerse exacto (la cifra): la dedicación de una persona en una célula, su utilización en el listado de Personas.",
      'Con `warningFrom={100}` cuando el 100 % es "al tope" y no un error: la barra avisa en warning y sólo por encima satura a danger.',
      "Con `warningFrom` más bajo cuando hay que avisar antes del límite.",
      "Con `tone` cuando la cifra es una cantidad y no un estado: la barra va en el tono de acento sobre la pista neutra y no cambia de color al tope; el número es la señal.",
    ],
    whenNotToUse: [
      "Fuera de una fila, como único indicador de una card: ahí la cifra va grande y la barra es Progress suelto; Meter es la pareja compacta de una celda.",
      "Para una distribución entre categorías: eso es SegmentedBar, y con cifras por categoría, DistributionCard.",
      "Para capacidad asignada sobre disponible con partes: eso es CapacityBar, que además muestra lo libre.",
    ],
    pairs: [
      {
        do: "Pasar el valor real aunque supere 100.",
        dont: 'Recortarlo a 100 para que la barra "se vea bien".',
        why: "La barra ya se satura sola; la cifra es justamente lo que deja ver cuánto se pasó.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Meter value={80} warningFrom={100} label="Dedicación" />
        <Meter value={100} warningFrom={100} label="Dedicación" />
        <Meter value={120} warningFrom={100} label="Dedicación" />
        <Meter value={100} tone="blue" label="Utilización" />
      </div>
    ),
    partsCaption: "Con espacio · al tope · sobreasignado",
    partsDescription:
      "Una fila flex con Progress ocupando el ancho disponible y la cifra a la derecha, en cifras tabulares para que las filas alineen. El ancho mínimo evita que la barra colapse en una celda estrecha.",
    parts: [
      {
        name: "Barra",
        measure: "Progress · h-1.5",
        note: "Mismo umbral que la cifra: ambos salen del mismo valor.",
      },
      {
        name: "Cifra",
        measure: "text-body-sm · font-semibold · tabular-nums",
        note: "Siempre el valor real, también por encima de 100.",
      },
      { name: "Ancho mínimo", measure: "7rem", note: "Configurable con `minWidth`." },
    ],
    renderState: (state) =>
      state.name === "Al tope" ? (
        <Meter value={100} warningFrom={100} />
      ) : state.name === "Sobreasignado" ? (
        <Meter value={120} />
      ) : (
        <Meter value={45} />
      ),
    states: [
      { name: "Normal" },
      { name: "Al tope", note: "Sólo con `warningFrom`; sin él, 100 es success." },
      { name: "Sobreasignado", note: "La barra satura a danger; la cifra no se recorta." },
    ],
    statesCaption: "El color es una función pura del valor y del umbral",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: 'role="progressbar" + cifra visible',
      explanation:
        "La barra hereda el rol y los `aria-value*` de Progress; la cifra al lado es texto normal, así que el valor se lee sin depender del color.",
    },
    {
      aspect: "Nombre accesible",
      value: "label",
      explanation: "Se pasa a Progress; sin él, la barra se anuncia sin decir de qué es.",
    },
  ],
};
