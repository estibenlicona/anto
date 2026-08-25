import { Textarea } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const textareaContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para texto libre de más de una línea: una descripción, el detalle de un motivo, una nota.",
      "Cuando el valor se va a leer después tal como se escribió — con sus saltos de línea.",
    ],
    whenNotToUse: [
      "Para un valor corto de una línea (nombre, correo, cifra): es Input.",
      "Para texto con formato (negritas, listas): eso pide un editor, que el catálogo no tiene todavía.",
    ],
    pairs: [
      {
        do: "Fijar `rows` según lo que se espera escribir: 3 para una nota, 6 para una descripción.",
        dont: "Dejar un Textarea de una sola línea o uno enorme vacío.",
        why: "La altura inicial le dice al usuario cuánto se espera de él; el redimensionado vertical cubre el resto.",
      },
      {
        do: "Usar `hint` para decir qué va ahí y `error` para decir qué falta.",
        dont: "Poner la instrucción dentro del `placeholder`.",
        why: "El placeholder desaparece al escribir; la ayuda y el error se quedan y se anuncian.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="w-80">
        <Textarea label="Detalle" hint="Qué pasó y desde cuándo" rows={3} defaultValue="Lo reasignaron por error al cerrar el sprint." />
      </div>
    ),
    partsCaption: "etiqueta + campo multilínea + ayuda",
    partsDescription:
      "La misma anatomía que Input, armada con las mismas piezas (`FieldLabel`, `FieldHint`, el borde por estado): un formulario que mezcla los dos se lee como una sola familia de controles. Crece sólo hacia abajo.",
    parts: [
      { name: "Altura inicial", measure: "rows", note: "Tres filas por defecto; el usuario puede estirarlo en vertical." },
      { name: "Borde", measure: "neutral-default / danger-default", note: "Las mismas clases de estado que Input, compartidas, no copiadas." },
    ],
    renderState: (state) => (
      <div className="w-80">
        <Textarea
          label="Detalle"
          hint="Qué pasó y desde cuándo"
          error={state.name === "Error" ? "Contá qué pasó" : undefined}
          disabled={state.disabled}
          className={state.className}
          defaultValue="Lo reasignaron por error."
        />
      </div>
    ),
    states: [
      { name: "Reposo" },
      { name: "Foco", className: "ring-focus ring-neutral-focus-ring" },
      { name: "Error", note: "El mensaje reemplaza a la ayuda y el campo queda marcado como inválido." },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Los mismos cuatro estados de Input",
  },

  accessibility: [
    {
      aspect: "Etiqueta",
      value: "<label for>",
      explanation: "Asociada por id al `<textarea>`, como en Input; el asterisco de obligatorio va acompañado de `aria-required`.",
    },
    {
      aspect: "Error",
      value: 'aria-invalid + aria-describedby',
      explanation: "El mensaje de error reemplaza a la ayuda en la descripción accesible, y el campo se marca inválido.",
    },
    {
      aspect: "Redimensionado",
      value: "resize-y",
      explanation: "Sólo vertical: un campo que crece de lado rompe la columna en la que está y el orden de lectura.",
    },
  ],
};
