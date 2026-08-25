import { Chip } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const chipContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Removible: para representar un filtro activo que el usuario puede quitar de uno en uno, típicamente en la barra de controles sobre una Table.",
      "Seleccionable (`selectable`): para un puñado de filtros que deben quedar a la vista y se encienden y apagan en su lugar — las células de una cola, con su contador.",
      "Cuando el valor mostrado es una elección reversible del usuario, no un estado del sistema.",
    ],
    whenNotToUse: [
      "Para comunicar un estado que el usuario no controla (activo, pendiente, error): usa Badge, que no es removible y no implica una acción.",
      "Para una opción dentro de un formulario que se envía: eso es un Checkbox o un RadioGroup, no un Chip.",
      "Para muchas opciones o multi-selección que pueden vivir en un menú: FilterButton; el Chip seleccionable es para las pocas que conviene ver.",
    ],
    pairs: [
      {
        do: "Quitar el Chip de la lista de filtros activos en cuanto `onRemove` se dispara.",
        dont: "Dejar el Chip visible esperando una confirmación aparte.",
        why: "Chip no se remueve a sí mismo — si el consumidor no actúa sobre `onRemove`, el filtro parece removido pero sigue aplicado.",
      },
      {
        do: "Dejar el Chip seleccionable encendido en neutro intenso.",
        dont: "Pintarlo con el color de marca.",
        why: "Un filtro activo es un estado; la marca es para la acción principal de la pantalla, y repetirla en cada chip hace ruido.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <Chip onRemove={() => {}}>Estado: 2</Chip>,
    partsCaption: "etiqueta + botón de cierre",
    partsDescription:
      "El botón de cierre es un `<button>` real dentro del Chip, no una región clicable simulada — recibe foco de teclado de forma independiente del resto del contenido.",
    parts: [
      {
        name: "Relleno",
        measure: "bg-neutral-selected",
        note: "Mismo tono que ya usa el chip de selección múltiple de Combobox, para no introducir un segundo lenguaje visual de \"etiqueta removible\".",
      },
      {
        name: "Ícono de cierre",
        measure: "16px",
        note: "Cambia de color en hover, independiente del texto de la etiqueta.",
      },
    ],
    renderState: (state) => (
      <Chip onRemove={() => {}} className={state.className}>
        Estado: 2
      </Chip>
    ),
    states: [
      { name: "Reposo" },
      {
        name: "Foco en cierre",
        className: "ring-focus ring-border-brand-focus",
        note: "El anillo real aparece sobre el botón de cierre al enfocarlo con teclado, no sobre el Chip completo.",
      },
    ],
    statesCaption: "Removible: el único control es el botón de cierre. Seleccionable: el Chip entero es un botón con aria-pressed",
  },

  accessibility: [
    {
      aspect: "Modo seleccionable",
      value: "<button aria-pressed>",
      explanation:
        "El Chip entero es un botón de alternancia; el contador entra en el nombre accesible (\"Backend Platform, 5\") y no se lee como texto suelto.",
    },
    {
      aspect: "Control de cierre",
      value: "<button>",
      explanation:
        "Un botón nativo, no un `<span role=\"button\">` — recibe foco de teclado y responde a Enter/Espacio sin manejo escrito a mano.",
    },
    {
      aspect: "Nombre accesible del cierre",
      value: 'aria-label="Quitar <etiqueta>"',
      explanation:
        "Se genera a partir del texto del Chip cuando es una cadena simple, para que un lector de pantalla anuncie qué se remueve, no solo \"botón\".",
    },
  ],
};
