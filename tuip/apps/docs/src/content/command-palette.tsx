import type { ComponentContent } from "./types";

// CommandPalette is `position: fixed` by design (it's a Dialog overlay) — the
// real component would take over the whole documentation page instead of
// sitting in the figure. This replica uses the exact same surface classes
// (rounded-surface, shadow-lg, w-modal-md) without the fixed positioning, the
// same trade-off Modal's and Toast's anatomy figures already make.
function PaletteReplica({ empty }: { empty?: boolean }) {
  return (
    <div className="w-modal-md overflow-hidden rounded-surface border border-neutral-default bg-neutral-default shadow-lg">
      <div className="border-b border-neutral-default px-4 py-3 text-body-sm text-neutral-subtle">
        {empty ? "xyz" : "Escribe un comando o buscá…"}
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {empty ? (
          <div className="px-3 py-6 text-center text-body-sm text-neutral-subtle">Sin resultados.</div>
        ) : (
          <>
            <div className="px-2 py-1.5 text-label text-neutral-subtle">Navegación</div>
            <div className="rounded-control bg-neutral-selected px-3 py-2 text-body-sm text-neutral-default">
              Ir a Capacidad
            </div>
            <div className="rounded-control px-3 py-2 text-body-sm text-neutral-default">Ir a Facturación</div>
            <div className="mt-1 px-2 py-1.5 text-label text-neutral-subtle">Acciones</div>
            <div className="rounded-control px-3 py-2 text-body-sm text-neutral-default">Crear célula</div>
            <div className="rounded-control px-3 py-2 text-body-sm text-neutral-default">Exportar reporte</div>
          </>
        )}
      </div>
    </div>
  );
}

export const commandPaletteContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Como el buscador global de la aplicación: navegar a cualquier sección o disparar una acción frecuente sin usar el mouse.",
      "Cuando `Navbar` necesita un `onSearch` real: la propia definición de Navbar da por hecho que la búsqueda global abre este mismo componente.",
    ],
    whenNotToUse: [
      "Para una lista de acciones sobre un elemento puntual de la pantalla (una fila, una tarjeta): eso es Menu, anclado a un disparador visible, no un overlay global.",
      "Para un formulario o una decisión que requiere varios campos: CommandPalette es de una sola línea de búsqueda, no un contenedor de formulario — eso es Modal.",
    ],
    pairs: [
      {
        do: "Montar un único CommandPalette por aplicación, en el nivel más alto del árbol.",
        dont: "Montar una instancia por página o por sección.",
        why: "Dos instancias montadas a la vez responden ambas al mismo atajo ⌘K, así que solo tiene sentido una por aplicación — igual que la propia definición de Navbar asume un command palette (singular) por producto.",
      },
      {
        do: "Agrupar los comandos por categoría (Navegación, Acciones) con CommandPaletteGroup.",
        dont: "Volcar todos los comandos en una lista plana sin agrupar.",
        why: "Sin agrupar, una lista larga se vuelve difícil de escanear incluso filtrada — los encabezados de grupo orientan antes de escribir nada.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <PaletteReplica />,
    partsCaption: "CommandPaletteInput + CommandPaletteList (con CommandPaletteGroup y CommandPaletteItem) dentro de CommandPalette",
    partsDescription:
      "CommandPalette combina @radix-ui/react-dialog (el mismo overlay centrado y con foco atrapado que ya usa Modal) con cmdk (la misma lista filtrable que ya usa Combobox) a través de Command.Dialog, que cmdk expone justo para este caso. El atajo ⌘K/Ctrl+K se registra y se quita solo mientras el componente está montado — no hace falta un listener aparte.",
    parts: [
      {
        name: "Overlay",
        measure: "z-overlay, bg-neutral-bold/40",
        note: "Misma capa y el mismo fondo que ya usa Modal para oscurecer detrás.",
      },
      {
        name: "Ancho del panel",
        measure: "w-modal-md (640px)",
        note: "Reutiliza el mismo paso de ancho que Modal en su tamaño intermedio.",
      },
      {
        name: "Atajo de apertura",
        measure: "⌘K / Ctrl+K",
        note: "Registrado a nivel de documento mientras CommandPalette está montado — funciona sin importar qué tenga el foco.",
      },
    ],
    renderState: (state) => <PaletteReplica empty={state.disabled} />,
    states: [
      { name: "Con resultados", note: "Ilustrado en el diagrama de partes de arriba." },
      { name: "Sin resultados", disabled: true, note: "El texto escrito no coincide con ningún ítem — CommandPaletteEmpty lo indica en vez de dejar la lista vacía." },
    ],
    statesCaption: "Con resultados y sin resultados",
  },

  accessibility: [
    {
      aspect: "Patrón",
      value: "Dialog modal con lista filtrable",
      explanation:
        "Resuelto por @radix-ui/react-dialog vía Command.Dialog de cmdk: foco atrapado dentro del overlay, igual que Modal.",
    },
    {
      aspect: "Cerrar",
      value: "Escape",
      explanation: "Cierra CommandPalette y devuelve el foco al elemento que lo tenía antes de abrirse.",
    },
    {
      aspect: "Nombre accesible",
      value: "prop label",
      explanation: "CommandPalette recibe un label no visible que identifica el overlay para tecnologías de asistencia.",
    },
    {
      aspect: "Sin resultados",
      value: "anunciado, no una lista vacía silenciosa",
      explanation: "CommandPaletteEmpty se renderiza en el lugar de la lista, así que una tecnología de asistencia lo anuncia igual que cualquier otro contenido.",
    },
  ],
};
