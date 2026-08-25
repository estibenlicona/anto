import { Alert } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const alertContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para comunicar un problema, una advertencia o una confirmación dentro del flujo de la pantalla, encima de lo que afecta.",
      "Cuando hay algo que la persona puede hacer al respecto: la acción va dentro de la propia alerta, no en otro lugar de la pantalla.",
    ],
    whenNotToUse: [
      "Para confirmar una acción puntual del usuario de forma efímera (\"Cambios guardados\"): eso corresponde a un Toast, no a Alert — Alert vive en el flujo hasta que la condición se resuelve, no desaparece solo.",
      "Como notificación flotante: Alert nunca flota ni se superpone al contenido; si necesitás eso, no es este componente.",
    ],
    pairs: [
      {
        do: "Elegir la severidad según la urgencia real: danger para lo que rompe algo, warning para lo que conviene revisar, info para contexto neutral.",
        dont: "Usar danger para llamar la atención sobre algo que no es un problema.",
        why: "Igual que las variantes de Badge, el significado de cada severidad se aprende una vez y se aplica en todo el producto — reasignarlo por conveniencia visual rompe esa correspondencia.",
      },
      {
        do: "Pasar un `Button` real como `action` cuando hay algo que hacer.",
        dont: "Escribir la acción como texto plano dentro de la descripción.",
        why: "Alert no sabe qué hace la acción ni la ejecuta — reusa `Button` para foco, teclado y estados, en vez de que Alert reimplemente un control interactivo.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex flex-col gap-3">
        <Alert
          variant="danger"
          title="No se pudo sincronizar con Azure DevOps"
          action={<span className="cursor-pointer text-body-sm font-medium">Reintentar</span>}
        >
          Último intento hoy a las 02:00. Los datos que ves son del sprint anterior.
        </Alert>
        <Alert variant="warning">
          Tres capacidades no tienen usuario de DevOps vinculado: sus ítems no cuentan en los
          informes.
        </Alert>
        <Alert variant="info">
          La estimación se recalcula cada noche. Los cambios de hoy se verán mañana.
        </Alert>
      </div>
    ),
    partsCaption: "ícono + título opcional + descripción + acción opcional",
    partsDescription:
      "Alert es una sola pieza, no partes compuestas: a diferencia de Table o Tabs, su contenido tiene una forma fija — ícono, título opcional, descripción y acción opcional — sin heterogeneidad real que una prop de más no resuelva.",
    parts: [
      {
        name: "Ícono",
        measure: "20px, fijo por variante",
        note: "No es una prop: cada severidad trae el suyo, para que el color nunca sea el único canal.",
      },
      {
        name: "Borde de acento",
        measure: "border-l-2",
        note: "Único borde de color; el resto del contorno lo da el fondo sutil.",
      },
      {
        name: "Radio",
        measure: "rounded-r-control",
        note: "Solo en las esquinas derechas — el borde de acento izquierdo se mantiene recto, como un acento pegado al borde de la pantalla o la tarjeta que contiene la alerta.",
      },
      {
        name: "Título y descripción",
        measure: "text-body-sm",
        note: "El título usa el color de la severidad; la descripción usa texto neutral, para que la severidad no compita con el contenido en volumen.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Warning") {
        return <Alert variant="warning">Revisá esto antes de continuar.</Alert>;
      }
      if (state.name === "Success") {
        return <Alert variant="success">Los cambios se guardaron correctamente.</Alert>;
      }
      if (state.name === "Info") {
        return <Alert variant="info">Esto es solo información de contexto.</Alert>;
      }
      return <Alert variant="danger">No se pudo completar la acción.</Alert>;
    },
    states: [
      { name: "Danger", note: "Un problema que rompe algo." },
      { name: "Warning", note: "Algo que conviene revisar, sin bloquear." },
      { name: "Success", note: "Una confirmación que vive en el flujo, no un Toast efímero." },
      { name: "Info", note: "Contexto neutral, sin urgencia." },
    ],
    statesCaption: "Las cuatro severidades — Alert no tiene otro estado más que la variante",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: 'role="alert"',
      explanation:
        "Marca el contenedor como una región de alerta estándar, reconocida por tecnologías de asistencia sin roles inventados.",
    },
    {
      aspect: "Color",
      value: "no es el único canal",
      explanation:
        "Cada severidad tiene un ícono propio y distinto; alguien que no distingue el color de fondo igual identifica la severidad por el ícono y el texto.",
    },
    {
      aspect: "Ícono",
      value: "decorativo (aria-hidden)",
      explanation:
        "El ícono acompaña texto que ya nombra la severidad, así que se oculta a tecnologías de asistencia para no anunciarse dos veces.",
    },
    {
      aspect: "Acción",
      value: "control real, propio foco",
      explanation:
        "Al ser un slot que recibe un `Button` u otro control real, la acción entra en el orden de tabulación con su propia semántica — Alert no la reimplementa.",
    },
  ],
};
