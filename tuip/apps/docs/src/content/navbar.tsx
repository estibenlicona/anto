import { Avatar, Icon } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const navbarContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para una aplicación con navegación lateral, la composición por defecto es AppShell — trae la fusión con la otra pieza ya resuelta (sidebar a toda altura, hamburguesa en la barra, colapso persistente); esta pieza suelta es para cuando el shell completo no aplica.",
      "Una vez por app, como el elemento fijo que identifica dónde está la persona, hacia dónde puede ir y quién es — igual en todas las pantallas.",
      "Cuando varias apps internas comparten usuarios: la barra idéntica es lo que permite saltar de una a otra sin reaprender dónde está la marca, la búsqueda o la cuenta.",
    ],
    whenNotToUse: [
      "Para navegación de secciones dentro de la app — eso vive en el menú lateral que abre la hamburguesa de la variante compacta, no en Navbar.",
      "Para acciones primarias de una pantalla — pertenecen al page header, no a la barra superior.",
      "Para filtros, selectores de fecha o cualquier estado propio de una pantalla puntual.",
    ],
    pairs: [
      {
        do: "Mantener la misma `variant` en todas las pantallas de un producto.",
        dont: "Cambiar entre `dark` y `light` por sección o por entorno de despliegue.",
        why: "La variante es lo que ancla la identidad visual del producto — alternarla dentro de un mismo producto rompe justamente la continuidad que Navbar existe para dar.",
      },
      {
        do: "Pasar `onMenuToggle` solo cuando la app realmente tiene un menú lateral que abrir.",
        dont: "Dejar `onMenuToggle` sin definir esperando que el botón de hamburguesa aparezca igual en pantallas angostas.",
        why: "Sin `onMenuToggle`, Navbar no renderiza el botón — un botón que no hace nada es peor que ningún botón.",
      },
    ],
  },

  anatomy: {
    // Navbar es `sticky` y de ancho completo por diseño — la figura usa una
    // réplica estática con las mismas clases, sin la posición fija, en vez
    // del componente real. Mismo criterio que Modal/Drawer/NotificationMenu.
    renderParts: () => (
      <div className="flex h-14 w-full items-center gap-4 rounded-control bg-neutral-inverse px-5">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-6 w-6 shrink-0 rounded-control bg-brand-bold" />
            <span className="text-body-sm font-semibold text-neutral-inverse">Capacidad</span>
            <Icon name="chevron-down" size={16} className="text-neutral-inverse" />
          </div>
          <span className="h-5 w-px shrink-0 bg-neutral-bold" />
          <div className="flex h-8 w-[240px] items-center gap-2 rounded-control bg-neutral-bold px-3 text-body-sm text-neutral-inverse">
            <Icon name="search" size={16} />
            <span>Buscar</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden h-8 items-center px-3 text-body-sm text-neutral-inverse min-[1120px]:flex">Ayuda</span>
          <span className="relative flex h-8 w-8 items-center justify-center text-neutral-inverse">
            <Icon name="notification" size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-pill bg-brand-bold" />
          </span>
          <div className="flex h-9 items-center gap-2 pl-0.5 pr-2">
            <Avatar size="small" label="Mariana Restrepo">
              MR
            </Avatar>
            <span className="hidden text-body-sm text-neutral-inverse min-[1120px]:inline">Mariana Restrepo</span>
          </div>
        </div>
      </div>
    ),
    partsCaption: "marca + selector de apps · búsqueda global · utilidades + notificaciones + cuenta",
    partsDescription:
      "Tres zonas en un orden fijo que no cambia entre productos: la marca identifica dónde está la persona, la búsqueda hacia dónde puede ir, la cuenta quién es.",
    parts: [
      {
        name: "Altura",
        measure: "h-14 (56px) · h-12 (48px) bajo 960px",
        note: "La única medida que cambia con el ancho — el resto de la barra permanece igual hasta la variante compacta.",
      },
      {
        name: "Marca",
        measure: "h-6 w-6 (bg-brand-bold) + texto 15/600",
        note: "El nombre del producto es siempre texto, nunca una imagen. Abre el selector de apps solo si se pasó al menos una.",
      },
      {
        name: "Búsqueda",
        measure: "min-[1120px]:w-[240px] min-[1440px]:w-[380px]",
        note: "Colapsa a un ícono de 32×32 por debajo de 1120px. No se renderiza sin `onSearch`.",
      },
      {
        name: "Capa",
        measure: "z-navigation (100)",
        note: "Por debajo de z-overlay (400) y z-menu (600): un Modal o un Menu abierto sobre la página siempre se apila por encima de la barra sticky.",
      },
    ],
    renderState: (state) => (
      <div className={`flex h-14 items-center gap-3 rounded-control bg-neutral-inverse px-5 ${state.className ?? ""}`}>
        <span className="h-6 w-6 shrink-0 rounded-control bg-brand-bold" />
        <span className="text-body-sm font-semibold text-neutral-inverse">Capacidad</span>
        {state.disabled ? (
          <span className="ml-auto text-body-sm text-neutral-inverse">sin notificaciones</span>
        ) : (
          <span className="relative ml-auto flex h-8 w-8 items-center justify-center text-neutral-inverse">
            <Icon name="notification" size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-pill bg-brand-bold" />
          </span>
        )}
      </div>
    ),
    states: [
      { name: "Sin no leídas", disabled: true, note: "El botón de notificaciones no muestra indicador." },
      { name: "Con no leídas", note: "El punto de indicador aparece — nunca un conteo numérico junto al ícono." },
    ],
    statesCaption: "El único estado visual del botón de notificaciones es tener o no un indicador de no leídas",
  },

  accessibility: [
    {
      aspect: "Landmark",
      value: 'role="banner" con un <nav> propio adentro',
      explanation: "Navbar es el banner del documento — un lector de pantalla puede saltar directo a él o directo a pasarlo por alto.",
    },
    {
      aspect: "Saltar al contenido",
      value: "Primer elemento tabbable, invisible hasta recibir foco",
      explanation: 'Antes que la marca: quien navega por teclado no tiene que atravesar toda la barra en cada página para llegar al contenido.',
    },
    {
      aspect: "Paneles",
      value: "aria-expanded en cada disparador, vía Radix",
      explanation: "El selector de apps, las notificaciones y la cuenta anuncian si su panel está abierto sin código propio — lo resuelve @radix-ui/react-dropdown-menu.",
    },
    {
      aspect: "Un panel a la vez",
      value: "Abrir uno cierra cualquier otro abierto",
      explanation: "Los tres paneles comparten un único estado de apertura en Navbar, coordinado a través del modo controlado de Menu y NotificationMenu.",
    },
    {
      aspect: "Foco atrapado",
      value: "No — Tab sale del panel y lo cierra",
      explanation: "Comportamiento nativo de Radix: ningún panel de Navbar retiene el foco dentro de sí.",
    },
    {
      aspect: "Indicador de no leídas",
      value: "Nunca la única señal",
      explanation: "El punto de color en el botón de notificaciones se acompaña, dentro del panel, del peso de texto que ya distingue lo no leído — no depende solo del color.",
    },
  ],
};
