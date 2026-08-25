import { Button, Icon, Tooltip } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const tooltipContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para aclarar un ícono o una abreviatura sin texto propio — un botón de solo ícono, un valor truncado — con una frase corta.",
      "Cuando la información es útil pero no imprescindible: alguien que nunca ve el Tooltip (foco que nunca se detiene, dispositivo táctil sin hover) debe poder completar la tarea igual.",
    ],
    whenNotToUse: [
      "Para una acción: un Tooltip no es tabulable ni clickeable en su contenido — eso es Menu, o un botón visible.",
      "Para información imprescindible para completar una tarea: un mensaje de error de campo, una instrucción obligatoria. Eso va en texto siempre visible, no detrás de un hover.",
      "Para un texto largo o con varias frases: el ancho máximo de 240px existe para forzar frases cortas, no para envolver un párrafo.",
    ],
    pairs: [
      {
        do: "Envolver un único elemento interactivo con `Tooltip`, sin montar nada aparte.",
        dont: "Buscar un `TooltipProvider` para envolver la app, como con `ToastProvider`.",
        why: "El estado de un Tooltip — abierto, cerrado, el temporizador de 500ms — es local a cada instancia; no hay cola ni posición compartida que coordinar entre varios Tooltips a la vez.",
      },
      {
        do: "Usar `Tooltip` para una aclaración que la persona puede ignorar y seguir usando el control igual.",
        dont: "Meter la única pista de qué hace un botón dentro de un Tooltip que nunca se ve en táctil.",
        why: "Quien navega por teclado sin detenerse en foco, o desde un dispositivo táctil, no siempre dispara el Tooltip — el control debe seguir siendo usable sin haberlo leído.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Tooltip content="Editar iniciativa" side="top">
        <Button variant="secondary">
          <Icon name="edit" size={16} />
        </Button>
      </Tooltip>
    ),
    partsCaption: "disparador + burbuja de una frase corta",
    partsDescription:
      "Tooltip no tiene partes internas configurables: recibe el elemento disparador como `children` y el texto como `content`. La burbuja es siempre la misma pieza, posicionada por Radix contra el disparador.",
    parts: [
      {
        name: "Superficie",
        measure: "bg-neutral-bold + text-neutral-inverse",
        note: "El mismo par que ya usan Avatar y Toast para una superficie que siempre se lee invertida respecto del canvas.",
      },
      {
        name: "Ancho máximo",
        measure: "max-w-[240px]",
        note: "Valor arbitrario porque ningún paso de la escala de anchos del sistema corresponde a una burbuja de tooltip — 240px es la propia regla de legibilidad de la definición, no una medida aproximable.",
      },
      {
        name: "Retraso",
        measure: "delayDuration=500 (aparece), instantáneo (desaparece)",
        note: "Resuelto por `@radix-ui/react-tooltip`: el cierre nunca copia el retraso de la apertura.",
      },
      {
        name: "Capa",
        measure: "z-menu",
        note: "Misma capa que ya usa el popover de Combobox para flotar sobre el contenido de la página.",
      },
    ],
    renderState: () => (
      <Tooltip content="Guardado hace 2 minutos">
        <Button variant="secondary">Estado</Button>
      </Tooltip>
    ),
    states: [{ name: "Único estado", note: "Tooltip no tiene variantes ni severidades — solo aclara, nunca alerta ni confirma." }],
    statesCaption: "Tooltip no tiene más estado visual que \"visible\", posicionado contra su disparador",
  },

  accessibility: [
    {
      aspect: "Activación",
      value: "hover y foco de teclado, ambos con el mismo retraso",
      explanation: "Resuelto por `@radix-ui/react-tooltip`: el Tooltip aparece igual al posicionar el puntero que al tabular hasta el disparador, sin lógica propia.",
    },
    {
      aspect: "Cierre",
      value: "Escape, o el puntero/foco saliendo del disparador",
      explanation: "El contenido nunca retiene el foco — el disparador sigue siendo el elemento activo mientras el Tooltip está abierto.",
    },
    {
      aspect: "No reemplaza al texto",
      value: "el contenido nunca es imprescindible",
      explanation: "Un lector de pantalla que no navega en modo de exploración, o una persona en un dispositivo táctil, puede nunca activar el Tooltip — el control debe explicarse por sí mismo igual.",
    },
  ],
};
