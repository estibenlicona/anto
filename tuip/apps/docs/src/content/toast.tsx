import { Icon } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const toastContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para confirmar una acción puntual que el propio usuario acaba de hacer — \"Horas enviadas\", \"Cambios guardados\" — de forma efímera, sin que tenga que descartarla a mano.",
      "Cuando la confirmación puede llevar una acción de deshacer inmediata: la duración por defecto se extiende sola a 10 segundos apenas el toast trae `action`.",
    ],
    whenNotToUse: [
      "Para informar un error o un estado del sistema: eso es Alert. Un Toast desaparece solo a los pocos segundos; un error necesita quedarse en pantalla hasta que la persona lo resuelva, no desvanecerse mientras todavía es relevante.",
      "Como notificación persistente o de fondo (algo cambió mientras el usuario no miraba): Toast confirma acciones que el propio usuario disparó, no eventos que pasaron por su cuenta.",
    ],
    pairs: [
      {
        do: "Montar un único `ToastProvider` cerca de la raíz de la app, una sola vez.",
        dont: "Montar un `ToastProvider` por página o por componente que necesite disparar un toast.",
        why: "La cola de un solo toast a la vez vive en el estado del Provider — con más de una instancia montada, cada una tendría su propia cola y su propio viewport, rompiendo la regla de \"uno a la vez\" en toda la app.",
      },
      {
        do: "Dejar que la duración se extienda sola a 10 segundos cuando el toast trae una acción de deshacer.",
        dont: "Pasar `duration` a mano solo para replicar esa misma regla en cada llamado.",
        why: "El comportamiento por defecto de `toast()` ya aplica la regla de la definición; pasar `duration` es para el caso excepcional que necesita otro valor, no para el caso común.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex items-center gap-3 rounded-control bg-neutral-bold px-4 py-3.5 text-neutral-inverse shadow-md">
        <Icon name="status-success" size={20} className="shrink-0" />
        <span className="flex-1 text-body-sm">Horas del sprint 16 enviadas</span>
        <span className="shrink-0 text-body-sm font-medium underline underline-offset-2">Deshacer</span>
      </div>
    ),
    partsCaption: "ícono opcional + mensaje + acción opcional, en una fila",
    partsDescription:
      "El toast en sí es una sola pieza — no hay una versión \"con acción\" y otra \"sin acción\" que difieran en estructura, solo en si la tercera parte está presente. La pieza visible es siempre la misma sin importar cuántos toasts se dispararon: `ToastProvider` monta un único `Toast.Root` a la vez con el primero de su cola interna.",
    parts: [
      {
        name: "Superficie",
        measure: "bg-neutral-bold + text-neutral-inverse",
        note: "El mismo par que ya usa Avatar para una superficie que siempre se lee invertida respecto del canvas — oscura en modo claro, clara en modo oscuro.",
      },
      {
        name: "Acción",
        measure: "text-neutral-inverse subrayado",
        note: "No usa el color de marca: contra `bg-neutral-bold` da 2.6:1 en las dos direcciones de tema, por debajo del piso de 4.5:1 para texto — se prefirió el mismo tono del mensaje, diferenciado por subrayado en vez de color.",
      },
      {
        name: "Posición",
        measure: "fixed bottom-4 right-4, z-notification",
        note: "La misma capa (`layer.notification`) que ya estaba reservada para esto en la escala de capas, sin usarla hasta este componente.",
      },
      {
        name: "Ancho",
        measure: "w-80 (320px)",
        note: "Coincide exacto con el ancho mínimo de la definición, sin necesitar un valor arbitrario.",
      },
    ],
    renderState: () => (
      <div className="flex items-center gap-3 rounded-control bg-neutral-bold px-4 py-3.5 text-neutral-inverse shadow-md">
        <span className="flex-1 text-body-sm">Cambios guardados</span>
      </div>
    ),
    states: [{ name: "Único estado", note: "Toast no tiene variantes ni severidades — solo confirma, nunca alerta." }],
    statesCaption: "Toast no tiene más estado visual que \"visible\", con o sin acción",
  },

  accessibility: [
    {
      aspect: "Anuncio",
      value: "región viva (aria-live), sin robar foco",
      explanation: "Resuelto por @radix-ui/react-toast: el toast se anuncia a un lector de pantalla sin mover el foco del teclado, así que no interrumpe lo que la persona estaba haciendo.",
    },
    {
      aspect: "Teclado",
      value: "F8 enfoca el viewport, Escape cierra, la acción es tabulable",
      explanation: "El atajo para saltar al viewport y el cierre con Escape vienen de la propia primitiva de Radix; la acción (\"Deshacer\") es un botón real dentro del orden de tabulación, no un texto con solo `onClick`.",
    },
    {
      aspect: "`useToast` no es un componente",
      value: "hook, no `<Toast />`",
      explanation: "La tabla de API de esta página lista `useToast` junto a `ToastProvider` porque la herramienta que la genera detecta cualquier export, no solo componentes — `useToast()` se usa como hook dentro de un componente, nunca se renderiza.",
    },
  ],
};
