import { Button, Icon } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const modalContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para una confirmación destructiva o irreversible — eliminar, descartar cambios — donde el usuario debe responder antes de seguir.",
      "Para un formulario corto que no amerita una pantalla propia, siempre que quepa completo sin scroll interminable.",
    ],
    whenNotToUse: [
      "Para consultar el detalle de algo sin decidir nada: eso es Drawer, que deja ver la tabla o lista detrás.",
      "Para encadenar una segunda confirmación desde dentro de un Modal ya abierto: un Modal no abre otro Modal — la confirmación adicional se resuelve dentro del mismo Modal.",
    ],
    pairs: [
      {
        do: "Manejar el estado `open` desde donde se dispara la apertura — un `MenuItem`, una fila de Table, un flujo async — y pasarlo a `Modal`.",
        dont: "Buscar un prop `trigger` en Modal como el que tiene Menu.",
        why: "La confirmación que Modal resuelve casi nunca dispara desde un botón pegado al lado; forzar un trigger embebido obligaría a artificios para los casos reales de uso.",
      },
      {
        do: "Dejar que `ModalHeader` reciba el `title` como prop.",
        dont: "Armar el título a mano con un `<h2>` dentro de `ModalBody`.",
        why: "`ModalHeader` lo expone como `Dialog.Title` de Radix, el elemento que un lector de pantalla necesita para anunciar el modal al abrirse — un `<h2>` suelto no lo conecta.",
      },
    ],
  },

  anatomy: {
    // Modal is `position: fixed` by design — the real component would take
    // over the whole documentation page instead of sitting in the figure.
    // This replica uses the exact same surface classes (rounded-surface,
    // shadow-lg, w-modal-sm) without the fixed positioning, the same
    // trade-off Toast's anatomy figure already makes for the same reason.
    renderParts: () => (
      <div className="flex max-h-[85vh] w-modal-sm flex-col rounded-surface border border-neutral-default bg-neutral-default shadow-lg">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="flex-1 text-lg font-semibold text-neutral-default">¿Eliminar la iniciativa?</div>
          <Icon name="close" size={20} className="shrink-0 text-neutral-subtle" />
        </div>
        <div className="overflow-y-auto px-6 py-3 text-body-sm text-neutral-subtle">
          «Migración Kafka» tiene 3.2 FTE asignados en dos células. Se liberarán al eliminarla. Esta acción no se
          puede deshacer.
        </div>
        <div className="flex shrink-0 justify-end gap-3 rounded-b-surface border-t border-neutral-default bg-neutral-subtle px-6 py-4">
          <Button variant="secondary">Cancelar</Button>
          <Button variant="danger">Eliminar iniciativa</Button>
        </div>
      </div>
    ),
    partsCaption: "header (título + cerrar) + body + footer",
    partsDescription:
      "Mismo vocabulario que Card: Modal es la superposición, ModalHeader/ModalBody/ModalFooter son sus tres franjas. El botón de cerrar y el título accesible viven dentro de ModalHeader — no hay que ensamblarlos aparte.",
    parts: [
      {
        name: "Ancho",
        measure: "w-modal-sm (480px), w-modal-md, w-modal-lg",
        note: "Del token overlayWidth, recién conectado al preset de Tailwind — antes de este componente no existía ninguna clase para estos anchos.",
      },
      {
        name: "Superficie",
        measure: "rounded-surface + border-neutral-default + bg-neutral-default + shadow-lg",
        note: "El par de elevación que ya nombra `elevation.overlay` en los tokens, más el trazo estándar: la sombra eleva pero se proyecta hacia abajo, así que el borde superior lo define el contorno. Tooltip y Toast no lo llevan porque su superficie oscura ya los recorta.",
      },
      {
        name: "Fondo",
        measure: "bg-neutral-bold/40",
        note: "El mismo tono oscuro que ya validan Toast y Tooltip, a una opacidad baja — el mockup no dibuja el fondo, así que se reusa en vez de declarar un color nuevo.",
      },
      {
        name: "Capa",
        measure: "z-overlay (400)",
        note: "Por debajo de z-menu (600): un Select o Combobox abierto desde dentro del Modal sigue flotando por encima, sin ajuste especial.",
      },
    ],
    renderState: (state) => (
      <div className="flex w-modal-sm flex-col rounded-surface bg-neutral-default shadow-lg">
        <div className="px-6 pt-6 text-lg font-semibold text-neutral-default">Guardar cambios</div>
        <div className="px-6 py-3 text-body-sm text-neutral-subtle">Hay cambios sin guardar en este formulario.</div>
        <div className="flex justify-end gap-3 rounded-b-surface border-t border-neutral-default bg-neutral-subtle px-6 py-4">
          <Button variant="secondary" disabled={state.disabled}>
            Descartar
          </Button>
          <Button variant="primary">Guardar</Button>
        </div>
      </div>
    ),
    states: [{ name: "Único estado", note: "Modal no tiene variantes visuales — solo abierto, con el tamaño elegido por `size`." }],
    statesCaption: "Modal no tiene más estado visual que \"abierto\", en uno de sus tres anchos",
  },

  accessibility: [
    {
      aspect: "Foco atrapado",
      value: "Tab no sale del contenido del Modal",
      explanation: "Resuelto por `@radix-ui/react-dialog`: mientras el Modal está abierto, la navegación por teclado queda contenida dentro de él.",
    },
    {
      aspect: "Cierre",
      value: "Escape, clic en el fondo, o el botón de cerrar — el foco vuelve a quien lo abrió",
      explanation: "Las tres formas de cerrar devuelven el foco al elemento que abrió el Modal, sin que el consumidor tenga que guardarlo ni restaurarlo a mano.",
    },
    {
      aspect: "Título obligatorio",
      value: "`ModalHeader` siempre renderiza `Dialog.Title`",
      explanation: "Un Modal sin título accesible deja a un lector de pantalla sin nada que anunciar al abrirse — `ModalHeader` lo resuelve por dentro, así que no puede omitirse por descuido.",
    },
  ],
};
