import { Icon, SegmentedControl } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const densityOptions = [
  { value: "comfortable", label: "Cómoda", icon: <Icon name="density-comfortable" size={16} /> },
  { value: "compact", label: "Compacta", icon: <Icon name="density-compact" size={16} /> },
];

export const segmentedControlContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para elegir entre dos o tres opciones excluyentes cuyo efecto se ve de inmediato, como la densidad de una Table.",
      "Cuando todas las opciones caben visibles a la vez — SegmentedControl no colapsa ni pagina sus opciones.",
    ],
    whenNotToUse: [
      "Para más de un puñado de opciones: a partir de ahí, un grupo de radios o un Select comunican mejor la lista completa.",
      "Para un ajuste que necesita un paso de guardado: eso vuelve a la distinción ya conocida entre Switch y Checkbox — SegmentedControl se comporta como Switch, aplica al instante.",
    ],
    pairs: [
      {
        do: "Usarlo controlado, con `value` en el estado del consumidor.",
        dont: "Tratarlo como un grupo de botones independientes sin estado compartido.",
        why: "Exactamente una opción está seleccionada en todo momento — sin un `value` externo no hay forma de garantizar eso.",
      },
      {
        do: "Dejar `joined` (el default) para un conmutador compacto embebido en una barra de herramientas, y elegir `separated` cuando el control es un campo más dentro de un formulario.",
        dont: "Alternar entre variantes dentro de la misma pantalla según el gusto de cada formulario.",
        why: "La variante es forma, no jerarquía: `joined` se lee como un conmutador de una pieza y `separated` como opciones tocables alineadas con los demás campos. Mezclarlas en un mismo contexto hace pensar que la diferencia significa algo que no significa.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <SegmentedControl
        label="Densidad"
        options={densityOptions}
        value="comfortable"
        onValueChange={() => {}}
      />
    ),
    partsCaption: "opciones contiguas, una seleccionada",
    partsDescription:
      "Cada opción es un `<input type=\"radio\">` nativo oculto detrás de su segmento visible — el navegador mueve el foco y aplica la exclusión mutua entre opciones, igual que ya hace RadioGroup con sus círculos.",
    parts: [
      {
        name: "Segmento seleccionado",
        measure: "bg-neutral-bold + text-neutral-inverse",
        note: "Mismo tratamiento visual que la página actual de Pagination — un fondo sólido para el estado activo en toda esta familia de controles.",
      },
      {
        name: "Separador entre segmentos (variant joined)",
        measure: "border-l",
        note: "Solo entre opciones, nunca en el primer segmento. En `joined` la caja la dibuja el contenedor y cada segmento la divide desde adentro.",
      },
      {
        name: "Segmento suelto (variant separated)",
        measure: "rounded-control + border-default por segmento, gap-1.5 entre ellos",
        note: "En `separated` la caja baja del contenedor a cada segmento, que pasa a tener borde y radio propios. Cambia la forma, no la semántica: sigue siendo un solo `<fieldset>` con un `name` compartido, así que el grupo y el recorrido por teclado son idénticos.",
      },
      {
        name: "Opción con icono",
        measure: "icon reemplaza al texto",
        note: "Cuando una opción trae `icon`, se renderiza en vez de `label`; `label` pasa a ser el nombre accesible del input en vez de texto visible — como en las opciones de densidad de este mismo ejemplo.",
      },
    ],
    renderState: (state) => (
      <SegmentedControl
        label="Densidad"
        options={densityOptions}
        variant={state.name.startsWith("Separada") ? "separated" : "joined"}
        value={state.name.endsWith("compacta") ? "compact" : "comfortable"}
        onValueChange={() => {}}
      />
    ),
    states: [
      { name: "Unida, cómoda" },
      { name: "Unida, compacta" },
      {
        name: "Separada, cómoda",
        note: "Misma semántica que `joined`: un `<fieldset>`, un `name`, exclusión mutua nativa.",
      },
      { name: "Separada, compacta" },
    ],
    statesCaption:
      "Las dos variantes, cada una con una opción marcada — exactamente una en todo momento, nunca ninguna, nunca ambas",
  },

  accessibility: [
    {
      aspect: "Elemento base",
      value: '<input type="radio">',
      explanation:
        "Semántica, foco y navegación con flechas los resuelve el navegador para un grupo de radios que comparten `name` — nada de esto está reimplementado a mano.",
    },
    {
      aspect: "Teclado",
      value: "Flechas mueven selección",
      explanation:
        "El mismo comportamiento nativo que RadioGroup: las flechas mueven el foco y la selección juntos dentro del grupo, sin depender de Tab entre cada opción.",
    },
    {
      aspect: "Etiqueta del grupo",
      value: "<legend> (visualmente oculta)",
      explanation:
        "Cuando se pasa `label`, queda disponible para tecnologías de asistencia aunque el diseño no muestre un título visible sobre el control.",
    },
    {
      aspect: "Opción representada solo por icono",
      value: "aria-label en el <input>",
      explanation:
        "El texto de `label` no desaparece: pasa de texto visible a nombre accesible del input, para que un lector de pantalla siga anunciando qué representa la opción aunque en pantalla solo se vea el icono.",
    },
  ],
};
