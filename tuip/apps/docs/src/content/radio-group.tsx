import { RadioGroup } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const SAMPLE_OPTIONS = [
  { value: "transformacion", label: "Transformación" },
  { value: "bau", label: "BAU" },
  { value: "sin-clasificar", label: "Sin clasificar" },
];

export const radioGroupContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para elegir una entre pocas opciones mutuamente excluyentes, cuando todas caben visibles sin abrir nada.",
      "Cuando ver las alternativas de una sola vez ayuda a decidir — a diferencia de un desplegable, no hace falta abrir nada para comparar.",
    ],
    whenNotToUse: [
      "Con más de 6 u 7 opciones: usa Select. Un grupo de radios largo ocupa más espacio vertical del que vale la pena gastar.",
      "Para selección independiente, no excluyente: usa Checkbox. RadioGroup fuerza una única elección; si el usuario puede marcar varias, no es este componente.",
    ],
    pairs: [
      {
        do: "Compartir un mismo name generado entre todas las opciones del grupo, dejando que RadioGroup lo maneje.",
        dont: "Armar los radios a mano y coordinar el name entre ellos por separado.",
        why: "Es exactamente el error silencioso que agrupar en un solo componente evita: un name mal compartido rompe la exclusión mutua sin ningún aviso visible.",
      },
      {
        do: "Dejar la primera opción sin selección cuando ninguna es un default razonable.",
        dont: "Forzar una opción marcada por defecto solo para que el grupo no se vea vacío.",
        why: "Una opción premarcada que el usuario no eligió es una respuesta falsa; mejor un grupo sin selección que una incorrecta.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <RadioGroup label="Clasificación" options={SAMPLE_OPTIONS} defaultValue="bau" />,
    partsCaption: "fieldset con legend y tres opciones",
    partsDescription:
      "Cada opción es un <input type=\"radio\"> real compartiendo name; el navegador se encarga del foco por flechas y de la exclusión mutua entre ellas, sin una sola línea de JavaScript que lo reimplemente.",
    parts: [
      {
        name: "Tamaño del punto",
        measure: "1rem × 1rem (h-4 w-4)",
        note: "Misma escala visual que Checkbox, para que ambos controles se lean como parte de la misma familia.",
      },
      {
        name: "Radio de la casilla",
        measure: "radius.pill",
        note: "Circular, a diferencia del radius.control cuadrado de Checkbox — la forma redonda distingue de un vistazo cuál admite selección múltiple y cuál no.",
      },
      {
        name: "Separación entre opciones",
        measure: "space.hug (gap-1.5) entre opciones, space.condensed (gap-2) entre legend y lista",
        note: "Las opciones se leen como una lista compacta de alternativas de la misma pregunta.",
      },
    ],
    renderState: (state) => (
      <RadioGroup
        label="Clasificación"
        options={SAMPLE_OPTIONS}
        defaultValue="bau"
        className={state.className}
        disabled={state.disabled}
      />
    ),
    states: [
      { name: "Reposo" },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Reposo y deshabilitado — la deshabilitación por opción individual se documenta en Uso",
  },

  accessibility: [
    {
      aspect: "Elemento base",
      value: '<fieldset> + <input type="radio"> compartiendo name',
      explanation: "El agrupamiento semántico lo da el propio HTML: un lector de pantalla anuncia el grupo por su legend antes de leer cada opción.",
    },
    {
      aspect: "Etiqueta del grupo",
      value: "<legend>",
      explanation: "Asociada automáticamente por el navegador a todo el fieldset, no a una sola opción.",
    },
    {
      aspect: "Teclado",
      value: "Tab enfoca el grupo una vez, ↓/↑ mueve foco y selección juntos",
      explanation: "Roving focus nativo: el navegador nunca detiene el Tab en cada opción individual, solo en el grupo.",
    },
    {
      aspect: "Exclusión mutua",
      value: "name compartido, generado con useId cuando no se pasa uno",
      explanation: "La marca de una opción desmarca automáticamente las demás del mismo grupo — comportamiento nativo, no lógica del componente.",
    },
  ],
};
