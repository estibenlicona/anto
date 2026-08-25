import { Sparkline } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const SERIE = [
  { label: "2024-S1", value: 12 },
  { label: "2024-S2", value: 11 },
  { label: "2025-S1", value: 8 },
  { label: "2025-S2", value: 9 },
  { label: "2026-S1", value: 6 },
  { label: "2026-S2", value: 5 },
];

export const sparklineContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Junto a una cifra que ya está escrita, para decir cómo viene cambiando: un delta contra el período anterior sin la forma de la serie no distingue una caída sostenida de un rebote.",
      "Con series cortas de períodos discretos —semestres, meses, sprints—, donde cada barra es un período medido.",
      "Cuando el lector necesita la tendencia de un vistazo y el número exacto ya lo tiene al lado.",
    ],
    whenNotToUse: [
      "Como único dato: la serie es contexto, no la cifra. Sin un número al lado, obliga a estimar alturas.",
      "Para comparar dos series entre sí: cada Sparkline escala contra su propio máximo, así que dos cards no son comparables.",
      "Para un reparto entre categorías: eso es SegmentedBar, y con cifras por categoría, DistributionCard.",
      "Cuando hacen falta ejes, cuadrícula o valores escritos: eso ya no es un sparkline, es un gráfico.",
    ],
    pairs: [
      {
        do: "Poner la cifra del período actual al lado, grande.",
        dont: "Dejar la serie sola en la card.",
        why: "La escala es relativa al mayor de la serie: la forma dice la variación, nunca cuánto.",
      },
      {
        do: "Elegir el `tone` según lo que la pantalla sabe.",
        dont: "Esperar que el componente pinte de verde una mejora.",
        why: "La serie no sabe si bajar es bueno: en brechas es mejorar, en entregas es lo contrario.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Sparkline points={SERIE} label="Brechas por ciclo" />
        <Sparkline points={SERIE} label="Brechas por ciclo" tone="violet" />
      </div>
    ),
    partsCaption: "Seis ciclos, con el presente destacado en azul y en violeta",
    partsDescription:
      "Una fila de barras alineadas abajo, del período más viejo al más reciente. La altura de cada una es su proporción contra el mayor de la serie; el último punto —el presente— va en el tono de acento y el resto en el gris pisado.",
    parts: [
      {
        name: "Barra",
        measure: "flex-1 · rounded-t-control",
        note: "Una por período, en el orden recibido.",
      },
      {
        name: "Presente",
        measure: "bg-accent-{tone}-fill",
        note: "Siempre el último punto; el tono lo elige quien la usa.",
      },
      {
        name: "Piso",
        measure: "2px",
        note: "Un cero medido se sigue viendo: desaparecer es lo que hace un dato faltante.",
      },
      { name: "Alto", measure: "2rem", note: "Configurable con `height`." },
    ],
    renderState: (state) =>
      state.name === "Sin historial" ? (
        <Sparkline points={[{ label: "2026-S2", value: 5 }]} label="Brechas por ciclo" />
      ) : state.name === "Con un cero" ? (
        <Sparkline
          points={[
            { label: "2025-S1", value: 4 },
            { label: "2025-S2", value: 0 },
            { label: "2026-S1", value: 3 },
          ]}
          label="Brechas por ciclo"
        />
      ) : (
        <Sparkline points={SERIE} label="Brechas por ciclo" />
      ),
    states: [
      { name: "Serie completa" },
      { name: "Con un cero", note: "La barra se queda en su piso visible." },
      { name: "Sin historial", note: "Un solo punto se dibuja igual; vacía no dibuja nada." },
    ],
    statesCaption: "La forma no miente cuando el dato es corto o es cero",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: 'role="img" en el contenedor',
      explanation:
        "La serie se anuncia una sola vez. Seis barras sin texto no dicen nada, y recorrerlas convierte un apoyo visual en un obstáculo.",
    },
    {
      aspect: "Nombre accesible",
      value: "label",
      explanation:
        "Obligatorio: sin él la imagen se anuncia sin decir de qué serie se trata.",
    },
    {
      aspect: "Valor por período",
      value: "title de cada barra",
      explanation:
        "Disponible al pasar el puntero. El dato exacto nunca vive sólo ahí: la cifra del período actual está escrita en la card.",
    },
  ],
};
