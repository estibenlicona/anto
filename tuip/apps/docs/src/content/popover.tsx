import { Button, Checkbox, Icon, Popover, PopoverContent, PopoverTrigger } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const popoverContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para consultar u operar sobre algo sin bloquear el resto de la pantalla — un filtro de columna, un selector múltiple, una vista previa breve.",
      "Cuando el contenido es demasiado grande o interactivo para un Tooltip (que es solo una frase), pero no necesita bloquear el flujo hasta que la persona responda.",
    ],
    whenNotToUse: [
      "Para una decisión que debe resolverse antes de continuar: eso sigue siendo Modal, que sí bloquea la página hasta que la persona responde.",
      "Para una lista fija de acciones sobre un elemento (Editar, Duplicar, Eliminar): eso es Menu, que ya trae la navegación por teclado que ese patrón necesita.",
    ],
    pairs: [
      {
        do: "Usar Popover para un panel de filtros que la persona puede cerrar en cualquier momento sin perder nada.",
        dont: "Poner dentro de un Popover un formulario largo que, si se cierra sin querer, hace perder el progreso.",
        why: "Popover se cierra con un clic afuera o con Escape — un contenido que no tolera perderse por un cierre accidental pertenece a Modal, que exige una acción explícita para cerrarse.",
      },
      {
        do: "Anclar Popover a un control visible y con su propio nombre accesible, como un botón de filtro.",
        dont: "Abrir un Popover automáticamente, sin que la persona lo haya disparado.",
        why: "Popover devuelve el foco a su disparador al cerrarse — sin un disparador real, no hay a dónde volver.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Popover defaultOpen>
        <PopoverTrigger>
          <Button variant="secondary">
            <Icon name="filter" size={16} />
            Estado
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-body-sm text-neutral-default">
              <Checkbox defaultChecked /> Activo
            </label>
            <label className="flex items-center gap-2 text-body-sm text-neutral-default">
              <Checkbox /> Pausado
            </label>
            <label className="flex items-center gap-2 text-body-sm text-neutral-default">
              <Checkbox /> Archivado
            </label>
          </div>
        </PopoverContent>
      </Popover>
    ),
    partsCaption: "PopoverTrigger anclado a PopoverContent — la superficie se abre y cierra desde el propio disparador",
    partsDescription:
      "Las tres partes son un espejo directo de Root, Trigger y Content de Radix — la misma primitiva que ya usan Combobox y DateField internamente, ahora expuesta para contenido propio. No hay una prop de datos: PopoverContent acepta cualquier JSX, igual que ModalBody.",
    parts: [
      {
        name: "Ancho por defecto",
        measure: "w-popover-min (280px)",
        note: "Ancho mínimo de la definición. Ensanchable hasta 360px (w-popover-max) por className cuando el contenido lo requiere.",
      },
      {
        name: "Padding interior",
        measure: "p-4 (16px)",
        note: "Valor exacto que indica la definición para Popover.",
      },
      {
        name: "Capa de apilamiento",
        measure: "z-menu",
        note: "Compartida con Menu, tal como agrupa la propia definición (\"Popover y menú\").",
      },
    ],
    renderState: (state) => (
      <Popover defaultOpen={!state.disabled}>
        <PopoverTrigger>
          <Button variant="secondary" disabled={state.disabled}>
            <Icon name="filter" size={16} />
            Estado
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-body-sm text-neutral-default">
              <Checkbox defaultChecked /> Activo
            </label>
            <label className="flex items-center gap-2 text-body-sm text-neutral-default">
              <Checkbox /> Pausado
            </label>
          </div>
        </PopoverContent>
      </Popover>
    ),
    states: [
      { name: "Cerrado", note: "El disparador solo, sin la superficie montada." },
      { name: "Abierto", note: "Ilustrado en el diagrama de partes de arriba." },
      { name: "Disparador deshabilitado", disabled: true, note: "El disparador no responde a mouse ni teclado." },
    ],
    statesCaption: "Cerrado, abierto y con el disparador deshabilitado",
  },

  accessibility: [
    {
      aspect: "Patrón",
      value: "aria-expanded / aria-controls en el disparador",
      explanation:
        "Resuelto por @radix-ui/react-popover: el disparador anuncia si la superficie está abierta y a qué contenido controla, sin roles ARIA agregados a mano.",
    },
    {
      aspect: "Cerrar",
      value: "Escape o clic afuera",
      explanation: "Ambos cierran la superficie y devuelven el foco al disparador, igual que Modal y Drawer.",
    },
    {
      aspect: "Foco al abrir",
      value: "se mueve al contenido",
      explanation: "El foco entra a la superficie al abrirse, para que la navegación por teclado continúe dentro de ella.",
    },
    {
      aspect: "Foco al cerrar",
      value: "vuelve al disparador",
      explanation: "Sin importar el medio de cierre (Escape, clic afuera), el foco vuelve exactamente al control que abrió el Popover.",
    },
  ],
};
