import { Button, Icon } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const drawerContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para ver el detalle de una fila o un elemento sin perder la tabla o lista que lo originó — la posición de scroll y la selección siguen ahí cuando se cierra.",
      "Cuando la acción disponible en el detalle es secundaria a la vista principal: consultar antes de decidir en otro lado, no bloquear hasta obtener una respuesta.",
    ],
    whenNotToUse: [
      "Para una decisión que bloquea el flujo: eso es Modal, que oscurece la página hasta que el usuario responde.",
      "Como reemplazo de una página de detalle completa: si el contenido no cabe cómodo en un panel angosto, es mejor navegar a una vista propia.",
    ],
    pairs: [
      {
        do: "Abrir el Drawer al hacer clic en una fila, sin desmontar la tabla detrás.",
        dont: "Navegar a otra ruta para mostrar el mismo detalle.",
        why: "El Drawer nunca toca el DOM de lo que hay detrás — al cerrarlo, la tabla sigue exactamente en el mismo estado de scroll y selección que tenía, algo que una navegación de página completa no puede garantizar.",
      },
      {
        do: "Usar `eyebrow` en `DrawerHeader` para la categoría del detalle (\"Capacidad\") sobre el nombre del elemento.",
        dont: "Meter la categoría y el nombre en el mismo texto del título.",
        why: "Separarlos dinámicamente entre eyebrow y título es lo que permite escanear muchos detalles seguidos sin releer el título completo cada vez.",
      },
    ],
  },

  anatomy: {
    // Drawer es `position: fixed`, igual que Modal — se ilustra con una
    // réplica de las mismas clases de superficie en vez del componente real,
    // que taparía la página de documentación por completo al forzarlo abierto.
    renderParts: () => (
      <div className="flex h-[320px] w-drawer-sm flex-col border-l border-neutral-default bg-neutral-default shadow-lg">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-default px-6 py-5">
          <div className="flex-1">
            <div className="mb-1.5 text-label uppercase text-neutral-subtle">
              Capacidad
            </div>
            <div className="text-heading-md text-neutral-default">María González</div>
          </div>
          <Icon name="close" size={20} className="shrink-0 text-neutral-subtle" />
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex justify-between text-body-sm">
            <span className="text-neutral-subtle">Célula</span>
            <span className="font-medium text-neutral-default">Backend Platform</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-neutral-subtle">Asignación</span>
            <span className="font-semibold text-danger-default">110%</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-neutral-subtle">Horas sprint 16</span>
            <span className="font-medium text-neutral-default">38.5</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-3 border-t border-neutral-default px-6 py-4">
          <Button variant="primary">Rebalancear</Button>
        </div>
      </div>
    ),
    partsCaption: "header (eyebrow + título + cerrar) + body con scroll propio + footer",
    partsDescription:
      "Mismo vocabulario que Modal, con dos diferencias: DrawerHeader admite un eyebrow sobre el título, y el panel ocupa toda la altura disponible en vez de ajustarse a su contenido — DrawerBody es la única parte que hace scroll.",
    parts: [
      {
        name: "Ancho",
        measure: "w-drawer-sm (480px), w-drawer-lg (720px)",
        note: "Del mismo token overlayWidth que Modal, con sus propios pasos — un drawer nunca necesita tres anchos porque no aloja un formulario extenso, solo detalle.",
      },
      {
        name: "Posición",
        measure: "fixed inset-y-0 right-0",
        note: "Pegado al borde derecho, a diferencia del Modal que se centra — así deja ver el resto de la página a los costados.",
      },
      {
        name: "Cuerpo con scroll propio",
        measure: "DrawerBody: flex-1 overflow-y-auto",
        note: "El panel entero ocupa la altura de la ventana; solo el cuerpo crece o se recorta, header y footer quedan siempre visibles.",
      },
      {
        name: "Capa",
        measure: "z-overlay (400)",
        note: "La misma capa que Modal, por debajo de z-menu (600) — un Select abierto desde dentro del Drawer flota por encima sin ajuste especial.",
      },
    ],
    renderState: (state) => (
      <div className="flex h-[180px] w-drawer-sm flex-col border-l border-neutral-default bg-neutral-default shadow-lg">
        <div className="shrink-0 border-b border-neutral-default px-6 py-5 text-heading-md text-neutral-default">
          Detalle
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 text-body-sm text-neutral-subtle">Contenido del panel.</div>
        <div className="shrink-0 border-t border-neutral-default px-6 py-4">
          <Button variant="primary" disabled={state.disabled}>
            Acción
          </Button>
        </div>
      </div>
    ),
    states: [{ name: "Único estado", note: "Drawer no tiene variantes visuales — solo abierto, en uno de sus dos anchos." }],
    statesCaption: "Drawer no tiene más estado visual que \"abierto\", deslizado desde el borde derecho",
  },

  accessibility: [
    {
      aspect: "Foco atrapado",
      value: "Tab no sale del contenido del Drawer",
      explanation: "Igual que Modal, resuelto por `@radix-ui/react-dialog`: la navegación por teclado queda contenida mientras el Drawer está abierto.",
    },
    {
      aspect: "Cierre",
      value: "Escape, clic en el fondo, o el botón de cerrar — el foco vuelve a quien lo abrió",
      explanation: "La fila o el botón que abrió el Drawer recupera el foco al cerrarse, sin lógica adicional del consumidor.",
    },
    {
      aspect: "Título obligatorio",
      value: "`DrawerHeader` siempre renderiza `Dialog.Title`",
      explanation: "El eyebrow es decorativo; el título — el nombre del elemento cuyo detalle se muestra — es lo único que un lector de pantalla necesita para identificar qué se abrió.",
    },
  ],
};
