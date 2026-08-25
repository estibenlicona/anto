import { Button, Icon, Menu, MenuItem, MenuSeparator } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const menuContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para las acciones secundarias de una fila o una tarjeta — Editar, Duplicar, Eliminar — ancladas a un disparador de solo ícono como \"more\".",
      "Cuando la lista de acciones es fija y conocida de antemano: cada `MenuItem` es JSX normal, no un dato que Menu interprete en tiempo de ejecución.",
    ],
    whenNotToUse: [
      "Para una única acción: un botón visible es más directo que abrir un menú de un solo ítem.",
      "Para navegar entre páginas o secciones: eso es un patrón de navegación, no una lista de acciones sobre el elemento actual.",
    ],
    pairs: [
      {
        do: "Poner el ítem destructivo último, separado por `MenuSeparator`.",
        dont: "Confiar en que `Menu` reordene o inserte el divisor automáticamente.",
        why: "`Menu` no conoce la cantidad ni el tipo de sus ítems sin iterarlos de una forma que lo volvería más rígido que componerlo en el orden correcto — el orden y el divisor son responsabilidad de quien arma el menú.",
      },
      {
        do: "Marcar el ítem destructivo con `destructive`, para que se distinga por color además de posición.",
        dont: "Dejar que el único indicio de que un ítem es peligroso sea estar al final de la lista.",
        why: "Alguien que no percibe el orden de la lista de un vistazo (una persona con baja visión leyendo con zoom, o navegando ítem por ítem con el teclado) igual necesita distinguirlo por color.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Menu
        trigger={
          <Button variant="secondary">
            <Icon name="more" size={16} />
          </Button>
        }
      >
        <MenuItem icon={<Icon name="edit" size={16} />}>Editar</MenuItem>
        <MenuItem icon={<Icon name="duplicate" size={16} />}>Duplicar</MenuItem>
        <MenuSeparator />
        <MenuItem icon={<Icon name="delete" size={16} />} destructive>
          Eliminar
        </MenuItem>
      </Menu>
    ),
    partsCaption: "disparador + lista de ítems, con un divisor antes del destructivo",
    partsDescription:
      "`Menu` es la raíz que ancla el contenido a su `trigger`; `MenuItem` es cada acción (ícono opcional + texto); `MenuSeparator` es la línea que antecede al ítem destructivo. Los tres son JSX normal, componibles en cualquier orden.",
    parts: [
      {
        name: "Ancho",
        measure: "w-[220px]",
        note: "Coincide con el ancho del mockup — sin un paso de la escala que lo aproxime, se usa como valor arbitrario, igual que el max-w de Tooltip.",
      },
      {
        name: "Ítem destructivo",
        measure: "text-danger-default",
        note: "Coincide exacto con el color del mockup — ya verificado por el resto del catálogo que usa ese rol (Alert, badges de estado).",
      },
      {
        name: "Divisor",
        measure: "border-neutral-default",
        note: "Mismo tono que ya separa filas en Table y segmentos en SegmentedControl, en vez del tono más claro que dibuja el mockup — para no introducir un segundo tono de divisor en el sistema.",
      },
      {
        name: "Capa",
        measure: "z-menu",
        note: "Misma capa que ya usa el popover de Combobox y la burbuja de Tooltip.",
      },
    ],
    renderState: (state) => (
      <Menu
        trigger={
          <Button variant="secondary">
            <Icon name="more" size={16} />
          </Button>
        }
      >
        <MenuItem icon={<Icon name="edit" size={16} />} disabled={state.disabled}>
          Editar
        </MenuItem>
        <MenuItem icon={<Icon name="duplicate" size={16} />}>Duplicar</MenuItem>
      </Menu>
    ),
    states: [
      { name: "Con foco/hover", note: "Cada MenuItem resalta con `bg-neutral-subtle` al navegarlo con flechas o el puntero." },
      { name: "Deshabilitado", disabled: true, note: "Un MenuItem individual puede deshabilitarse; queda fuera de la navegación por teclado." },
    ],
    statesCaption: "el estado vive por ítem, no en el Menu completo",
  },

  accessibility: [
    {
      aspect: "Navegación por teclado",
      value: "flechas mueven el foco entre ítems, sin Tab",
      explanation: "Resuelto por `@radix-ui/react-dropdown-menu`: abrir el menú mueve el foco al primer ítem y las flechas lo recorren, igual que un menú nativo de sistema operativo.",
    },
    {
      aspect: "Cierre",
      value: "Escape cierra y devuelve el foco al disparador",
      explanation: "El disparador nunca pierde su lugar en el orden de tabulación de la página al cerrar el menú.",
    },
    {
      aspect: "Extremos",
      value: "Home/End saltan al primer o último ítem",
      explanation: "Útil en menús largos, sin tener que recorrerlos ítem por ítem con las flechas.",
    },
    {
      aspect: "Ítem destructivo",
      value: "distinguible por color, no solo posición",
      explanation: "`text-danger-default` se aplica independientemente de dónde esté el ítem en la lista, así que un lector de pantalla o una persona con daltonismo que además usa contraste alto lo sigue distinguiendo del resto.",
    },
  ],
};
