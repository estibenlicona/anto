import { Kbd } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const kbdContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para documentar un atajo de teclado al lado de la acción que lo tiene — en el pie de un panel, en la cabecera de una OptionCard, en un tooltip.",
      "En pantallas de trabajo repetitivo (una cola de clasificación, una bandeja), donde el atajo es la forma principal de ir rápido.",
    ],
    whenNotToUse: [
      "Como botón: Kbd no es interactivo. Si la tecla debe poder clickearse, es un Button con la tecla dentro.",
      "Para resaltar una cifra o una etiqueta: eso es Badge o Tag; Kbd sólo significa \"una tecla\".",
    ],
    pairs: [
      {
        do: "Escribir la tecla como la lee el usuario: \"↵\", \"Esc\", \"Ctrl+K\".",
        dont: "Escribir el nombre del evento: \"Enter\", \"Escape\", \"KeyK\".",
        why: "La pieza documenta lo que hay que apretar, no lo que el código escucha.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <span className="inline-flex items-center gap-2 text-body-sm text-neutral-subtle">
        <Kbd>1</Kbd> elegir · <Kbd>↵</Kbd> guardar y seguir
      </span>
    ),
    partsCaption: "tecla en mono sobre fondo neutro con borde",
    partsDescription:
      "Un `<kbd>` con borde y fondo neutros, en la fuente mono para que \"1\" y \"l\" no se confundan. No recibe foco ni selección: el lector puede arrastrar sobre una línea de ayuda sin marcar las teclas.",
    parts: [
      { name: "Fondo", measure: "bg-neutral-subtle", note: "Con borde `neutral-default`: se lee como una tecla física, no como un chip." },
      { name: "Tipografía", measure: "font-mono", note: "Tamaño `label` en `sm` (pies y ayudas) y `body-sm` en `md` (junto a un título)." },
    ],
    renderState: (state) => <Kbd size={state.name === "Pequeña" ? "sm" : "md"}>Ctrl+K</Kbd>,
    states: [
      { name: "Mediana" },
      { name: "Pequeña", note: "`size=\"sm\"` para una línea de ayuda al pie de un panel." },
    ],
    statesCaption: "Sin estados de interacción: Kbd nunca es el control",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<kbd>",
      explanation: "El elemento semántico de entrada de teclado; los lectores lo anuncian como tal sin atributos extra.",
    },
    {
      aspect: "Foco",
      value: "ninguno",
      explanation: "No lleva `tabIndex` ni rol: documentar un atajo no debe sumar una parada de teclado.",
    },
  ],
};
