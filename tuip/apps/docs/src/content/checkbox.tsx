import { Checkbox } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const checkboxContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para marcar o desmarcar una opción independiente, dentro o fuera de un grupo, cuyo efecto no se aplica hasta que el formulario se envía.",
      "Cuando la selección puede ser parcial dentro de un grupo — el estado indeterminado existe justo para eso.",
    ],
    whenNotToUse: [
      "Para un ajuste que toma efecto de inmediato al tocarlo: usa Switch. La diferencia no es visual, es de cuándo pasa el efecto.",
      "Para elegir una entre varias opciones mutuamente excluyentes: usa RadioGroup. Checkbox es para selección independiente, no para elegir una de varias.",
    ],
    pairs: [
      {
        do: "Envolver el texto que describe la opción dentro de la misma etiqueta que el checkbox.",
        dont: "Poner el texto al lado sin asociarlo, dependiendo de que el usuario acierte el clic sobre la casilla.",
        why: "Con la etiqueta asociada, el área clickeable incluye el texto — más fácil de acertar y correcto para quien usa un lector de pantalla.",
      },
      {
        do: "Usar el estado indeterminado solo para representar una selección parcial de un grupo, nunca como un tercer valor caprichoso.",
        dont: "Fijar indeterminate para indicar \"cargando\" o cualquier otro estado que no sea selección parcial.",
        why: "El navegador ya anuncia indeterminado como \"mixed\" a tecnologías de asistencia; usarlo para otra cosa rompe esa expectativa.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <Checkbox label="Acepto los términos" />,
    partsCaption: "casilla con label asociada",
    partsDescription:
      "El input real queda en el documento pero invisible; la casilla que se ve es un decorado que seis clases de CSS pintan a partir del estado real del input (:checked, :indeterminate, :disabled, :focus-visible) — nunca a partir de un segundo estado en React.",
    parts: [
      {
        name: "Tamaño de la casilla",
        measure: "1rem × 1rem (h-4 w-4)",
        note: "Fijo: a diferencia de Input o Select, Checkbox no tiene escala small/medium/large en la definición.",
      },
      {
        name: "Radio",
        measure: "radius.control",
        note: "Mismo radio que el resto de los controles del sistema.",
      },
      {
        name: "Anillo de foco",
        measure: "focusRing",
        note: "Aplicado sobre la casilla decorativa cuando el input real recibe foco de teclado, vía peer-focus-visible.",
      },
    ],
    renderState: (state) => (
      <Checkbox label="Acepto los términos" className={state.className} disabled={state.disabled} />
    ),
    states: [
      { name: "Desmarcado" },
      { name: "Marcado", className: "peer-checked:opacity-100" },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Desmarcado, marcado y deshabilitado — el indeterminado se documenta en Uso porque depende de un ref, no de una prop declarativa por sí sola",
  },

  accessibility: [
    {
      aspect: "Elemento base",
      value: '<input type="checkbox">',
      explanation: "Semántica, foco y tecla Espacio los resuelve el navegador — nada de esto está reimplementado.",
    },
    {
      aspect: "Estado indeterminado",
      value: 'aria-checked="mixed" (automático)',
      explanation: "El navegador expone un checkbox con la propiedad DOM indeterminate como mixed sin que el componente declare nada extra.",
    },
    {
      aspect: "Etiqueta",
      value: "<label> envolvente con htmlFor",
      explanation: "Un id generado con useId asocia la etiqueta al input cuando no se pasa uno explícito, así el área clickeable siempre incluye el texto.",
    },
    {
      aspect: "Teclado",
      value: "Tab enfoca, Espacio alterna",
      explanation: "Comportamiento nativo del input; no depende de un manejador de teclado escrito a mano.",
    },
  ],
};
