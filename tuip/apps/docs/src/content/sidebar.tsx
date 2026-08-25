import { Icon, Sidebar } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const sidebarContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para una aplicación con navegación lateral, la composición por defecto es AppShell — trae la fusión con la otra pieza ya resuelta (sidebar a toda altura, hamburguesa en la barra, colapso persistente); esta pieza suelta es para cuando el shell completo no aplica.",
      "Como la navegación de un solo nivel de una app, junto a Navbar en el app shell — Navbar dice en qué producto está la persona, Sidebar dice qué puede hacer dentro.",
      "Con un contador en un ítem solo cuando representa trabajo pendiente de esa persona específica — una solicitud que espera su aprobación, no un total del módulo.",
    ],
    whenNotToUse: [
      "Para subsecciones dentro de una sección ya activa — esas van en las pestañas del encabezado de página, no en un segundo nivel de Sidebar.",
      "Para acciones — Sidebar navega, no ejecuta. Un botón de acción primaria pertenece al encabezado de página, no a un ítem de Sidebar.",
    ],
    pairs: [
      {
        do: "Omitir por completo un ítem al que la persona no tiene acceso.",
        dont: "Mostrarlo deshabilitado con un candado o un tooltip explicando por qué no puede entrar.",
        why: "Un ítem que no lleva a ningún lado es ruido — si no puede entrar, no debería enterarse de que la sección existe.",
      },
      {
        do: "Dejar que Sidebar persista su propio estado de colapso sin pasarle `collapsed`.",
        dont: "Guardar el colapso a mano en el estado de la app y sincronizarlo con Sidebar.",
        why: "Sin `collapsed`, el propio componente ya lo recuerda entre sesiones — controlarlo desde afuera solo tiene sentido cuando otra parte de la app necesita saber o forzar ese estado.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="h-[420px] overflow-hidden rounded-control border border-neutral-default">
        <Sidebar
          groups={[
            {
              label: "Operación",
              items: [
                { id: "torre", label: "Torre de control", icon: <Icon name="dashboard" size={20} />, href: "#" },
                { id: "solicitudes", label: "Solicitudes", icon: <Icon name="document" size={20} />, href: "#", badge: 12 },
                { id: "proyeccion", label: "Proyección", icon: <Icon name="trend-up" size={20} />, href: "#" },
              ],
            },
            {
              label: "Administración",
              items: [{ id: "usuarios", label: "Usuarios y roles", icon: <Icon name="user" size={20} />, href: "#" }],
            },
          ]}
          activeId="solicitudes"
          onNavigate={() => {}}
          collapsible={false}
          className="h-full"
        />
      </div>
    ),
    partsCaption: "encabezado de grupo + ítems con ícono, etiqueta y contador opcional + control de colapso",
    partsDescription:
      "Cada grupo es un encabezado en mayúsculas seguido de su lista de ítems. El ítem activo se distingue por tres señales a la vez — riel, fondo y peso — nunca solo por color. El control de colapso vive al pie, separado del contenido por un borde.",
    parts: [
      {
        name: "Ancho",
        measure: "w-[248px] expandido · w-[64px] colapsado",
        note: "Medidas fijas del propio mockup — no hay alias de espaciado que las cubra, así que van como valores arbitrarios documentados en el componente.",
      },
      {
        name: "Superficie de la barra",
        measure: "bg-neutral-default",
        note: "El mismo token que la barra superior en su variante clara, para que el shell se lea como una sola pieza. El lienzo de la página queda en `subtlest`, un paso por debajo, y de esa diferencia sale la separación entre navegación y contenido.",
      },
      {
        name: "Riel del ítem activo",
        measure: "border-l-2 border-l-brand-default",
        note: "Reservado en todos los ítems (transparente cuando inactivo) para que activarse no desplace el contenido — el mismo hex que pide el mockup, Red 500.",
      },
      {
        name: "Fondo del ítem activo",
        measure: "bg-neutral-selected",
        note: "El paso que el sistema reserva para selección y fila activa. No puede ser el color de la barra: un fondo que iguala a su superficie deja de ser señal, y el ítem activo necesita tres. Se separa del hover de un inactivo por tono, no por claridad.",
      },
      {
        name: "Contador",
        measure: "bg-brand-bold + texto blanco",
        note: "Rojo 600, no 500 — el mockup lo pide así explícitamente porque el contador lleva una cifra dentro (regla §10, la misma que ya aplica en Navbar).",
      },
      {
        name: "Ícono",
        measure: "caja de 20×20px",
        note: "Sidebar no impone qué ícono usar — cada consumidor pasa el suyo propio como ReactNode.",
      },
      {
        name: "Inset del contenido",
        measure: "24px, igual que la marca de Navbar",
        note: "Una sola vertical para los ítems, los rótulos de grupo y el control de colapso. Los ítems llegan ahí por composición (relleno del `ul` + riel de 2px + relleno propio) porque van embutidos; los otros dos ocupan el ancho completo, así que su inset es un único valor.",
      },
      {
        name: "Franja de colapso",
        measure: "ancho completo, sin redondeo",
        note: "El botón es la franja que delimita su separador, así que el clic y el hover responden de borde a borde. No se redondea, a diferencia de los ítems: ellos flotan embutidos en la columna y esta llega a los dos bordes.",
      },
    ],
    renderState: (state) => (
      <div className="h-[100px] overflow-hidden rounded-control border border-neutral-default">
        <Sidebar
          groups={[
            {
              label: "Operación",
              items: [
                {
                  id: "solicitudes",
                  label: "Solicitudes",
                  icon: <Icon name="document" size={20} />,
                  href: "#",
                  badge: state.name === "Con trabajo pendiente" ? 12 : undefined,
                },
              ],
            },
          ]}
          activeId="solicitudes"
          onNavigate={() => {}}
          collapsible={false}
          className={`h-full ${state.className ?? ""}`}
        />
      </div>
    ),
    states: [
      { name: "Sin trabajo pendiente", note: "Sin la prop `badge`, el ítem no muestra contador — nunca un cero." },
      { name: "Con trabajo pendiente", note: "El contador aparece y se suma al nombre accesible del ítem." },
    ],
    statesCaption: "El contador es la única parte del ítem que depende de datos externos a la navegación misma",
  },

  accessibility: [
    {
      aspect: "Landmark",
      value: "<nav aria-label>",
      explanation: "El elemento nativo ya provee el landmark de navegación — sin un atributo role redundante, mismo patrón que Breadcrumb y Pagination.",
    },
    {
      aspect: "Ítem activo",
      value: 'aria-current="page"',
      explanation: "El estilo por sí solo no alcanza: un lector de pantalla necesita anunciar dónde está la persona, no solo mostrarlo visualmente.",
    },
    {
      aspect: "Colapsado",
      value: "texto en sr-only + Tooltip",
      explanation: "El nombre de cada ítem sigue disponible para tecnología de asistencia aunque el texto esté oculto, y Tooltip (ya publicado) lo muestra a quien ve la pantalla al pasar el mouse.",
    },
    {
      aspect: "Contador",
      value: "parte del aria-label, no solo visual",
      explanation: '"Solicitudes, 12 pendientes" — el número viaja en el nombre accesible del ítem, no únicamente en su apariencia.',
    },
    {
      aspect: "Grupos",
      value: "ul con aria-labelledby",
      explanation: "Cada lista de ítems queda etiquetada por el encabezado de su propio grupo, incluso cuando ese encabezado está visualmente oculto en la variante colapsada.",
    },
  ],
};
