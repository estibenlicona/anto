import type { ComponentContent } from "./types";

export const notificationMenuContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Colgado de la campana de la barra superior, para eventos sobre los que la persona puede actuar de inmediato — una solicitud que espera aprobación, un umbral recién superado.",
      "Cuando el estado leído/no leído importa: la persona necesita distinguir de un vistazo qué es nuevo.",
    ],
    whenNotToUse: [
      "Para un evento meramente informativo, sin nada que hacer al respecto: eso va a un historial en otro lugar, no a la campana — la propia definición lo dice, \"si el usuario no puede hacer nada al respecto, va al historial\".",
      "Como registro completo y navegable de todo lo que pasó: para eso está \"Ver todas\", que lleva a otra parte — el panel mismo se queda con lo reciente y accionable.",
    ],
    pairs: [
      {
        do: "Pasar `unread` como la única señal de si una notificación es nueva.",
        dont: "Aplicar un fondo distinto y un peso de texto distinto por separado, con el riesgo de que queden desincronizados.",
        why: "La fuente cambia las dos señales siempre juntas — nunca aparece un fondo de leída con texto en negrita, o viceversa. Una sola prop hace esa combinación imposible de romper por accidente.",
      },
      {
        do: "Envolver las notificaciones en `NotificationMenuList`.",
        dont: "Ponerlas directamente como hijas de `NotificationMenu`.",
        why: "Es la única pieza que hace scroll — el header y el footer quedan siempre fijos. Sin ese envoltorio, una lista larga se llevaría puestos a los dos.",
      },
    ],
  },

  anatomy: {
    // El panel no se ilustra con el componente real abierto: DropdownMenu no
    // monta su contenido hasta una apertura genuina por interacción, así que
    // NotificationMenu cerrado no mostraría ninguna de sus partes. La réplica
    // usa las mismas clases de superficie que el componente real, el mismo
    // trade-off que ya hacen las figuras de anatomía de Modal y Drawer.
    renderParts: () => (
      <div className="flex w-[380px] flex-col overflow-hidden rounded-control border border-neutral-default bg-neutral-default shadow-md">
        <div className="flex items-center border-b border-neutral-default px-[18px] py-3.5">
          <span className="text-body-sm font-semibold text-neutral-default">Notificaciones</span>
          <span className="ml-auto text-body-sm text-brand-default">Marcar todas leídas</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-[8px_1fr] gap-3 border-b border-neutral-default bg-neutral-default px-[18px] py-3.5">
            <span aria-hidden="true" className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-pill bg-danger-bold" />
            <div className="min-w-0">
              <div className="text-body-sm font-semibold text-neutral-default">3 células superaron su umbral</div>
              <div className="mt-0.5 text-body-sm text-neutral-subtle">Bogotá · Centro concentra 2 de las 3.</div>
              <div className="mt-1 text-body-sm text-neutral-subtlest">hace 12 min</div>
            </div>
          </div>
          <div className="grid grid-cols-[8px_1fr] gap-3 border-b border-neutral-default bg-neutral-subtlest px-[18px] py-3.5">
            <span aria-hidden="true" className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-pill bg-current text-neutral-subtle" />
            <div className="min-w-0">
              <div className="text-body-sm text-neutral-default">Ampliación completada</div>
              <div className="mt-0.5 text-body-sm text-neutral-subtle">CEL-00755 quedó en 61% de utilización.</div>
              <div className="mt-1 text-body-sm text-neutral-subtlest">ayer</div>
            </div>
          </div>
        </div>
        <div className="bg-neutral-subtlest px-[18px] py-3 text-center text-body-sm text-brand-default">Ver todas</div>
      </div>
    ),
    partsCaption: "header (título + acción) + lista con scroll propio + footer",
    partsDescription:
      "NotificationMenuHeader y NotificationMenuFooter quedan fijos; solo NotificationMenuList — la que envuelve los NotificationMenuItem — hace scroll cuando hay más de las que entran en el alto del panel.",
    parts: [
      {
        name: "Ancho",
        measure: "w-[380px]",
        note: "Valor fijo: a diferencia de Modal o Drawer, la fuente no sugiere más de un ancho para este panel.",
      },
      {
        name: "Punto",
        measure: "bg-{role}-bold, el mismo mapeo de ActivityTimeline",
        note: "success/info/warning/danger/discovery/neutral — el punto neutral reusa exacto la resolución que ya fijó ActivityTimeline, no el gris ligeramente distinto que esta sección del mockup usa por su cuenta.",
      },
      {
        name: "No leída",
        measure: "bg-neutral-default + font-semibold",
        note: "Las dos señales cambian juntas: nunca una fila con fondo de no-leída y texto regular, o viceversa.",
      },
      {
        name: "Capa",
        measure: "z-menu + shadow-md",
        note: "La misma familia que Menu, Select y Combobox — no la de Modal/Drawer, que sí bloquean la página.",
      },
    ],
    renderState: (state) => (
      <div className="grid w-[380px] grid-cols-[8px_1fr] gap-3 overflow-hidden rounded-control border border-neutral-default bg-neutral-default px-[18px] py-3.5 shadow-md">
        <span aria-hidden="true" className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-pill bg-warning-bold" />
        <div className="min-w-0">
          <div className={state.disabled ? "text-body-sm text-neutral-default" : "text-body-sm font-semibold text-neutral-default"}>
            SOL-2041 espera tu aprobación
          </div>
          <div className="mt-0.5 text-body-sm text-neutral-subtle">M. Restrepo solicitó +4,0 Gbps para CEL-00842.</div>
          <div className="mt-1 text-body-sm text-neutral-subtlest">hace 1 h</div>
        </div>
      </div>
    ),
    states: [
      { name: "No leída", note: "Fondo blanco, texto en negrita." },
      { name: "Leída", disabled: true, note: "Fondo bg-neutral-subtlest, peso regular — las dos señales bajan juntas." },
    ],
    statesCaption: "unread controla las dos señales a la vez, nunca una sin la otra",
  },

  accessibility: [
    {
      aspect: "Navegación por teclado",
      value: "flechas entre notificaciones y acciones",
      explanation: "Resuelto por @radix-ui/react-dropdown-menu: el header (si tiene acción) y el footer participan de la misma navegación por flechas que las notificaciones — están tan accionables como ellas.",
    },
    {
      aspect: "Cierre",
      value: "Escape, el foco vuelve al disparador",
      explanation: "Igual que Menu: la campana que abrió el panel recupera el foco al cerrarse, sin lógica adicional del consumidor.",
    },
    {
      aspect: "Estado leído/no leído",
      value: "fondo + peso, no solo color",
      explanation: "Las dos señales cambian juntas, así que alguien que no distingue bien el contraste del fondo blanco contra el gris igual lo distingue por el peso del texto.",
    },
  ],
};
