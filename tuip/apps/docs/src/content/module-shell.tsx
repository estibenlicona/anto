import { Icon, ModuleShell, Navbar } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const demoGroups = [
  {
    label: "Capacidad",
    items: [
      { id: "personas", label: "Personas", href: "#", icon: <Icon name="user" size={20} /> },
      { id: "celulas", label: "Células", href: "#", icon: <Icon name="cell" size={20} /> },
    ],
  },
];

/** La barra es del host y la columna del módulo: el marco muestra la unión —
 * la navegación empezando justo bajo la barra, sin cabecera propia — y, al
 * pie de la columna, la franja de colapso de Sidebar, que es el control del
 * módulo. La columna mide lo que mide la ventana menos la barra; para que la
 * franja quede a la vista dentro del marco, el marco le fija a la columna su
 * propia altura (420 − 56). Es presentación de la página, no una prop. */
function HostFrame({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-surface border border-neutral-default [&_aside]:h-[364px]">
      <Navbar
        product="Dimensionamiento TI"
        variant="light"
        apps={[{ id: "capacidad", name: "Gestión de Capacidad", color: "#C9151F", current: true }]}
        user={{ name: "Chapter Lead", initials: "CL" }}
        userMenu={[{ label: "Cerrar sesión", destructive: true }]}
        showNotifications={false}
      />
      <ModuleShell
        groups={demoGroups}
        activeId="personas"
        onNavigate={() => {}}
        ariaLabel="Navegación de Capacidad"
        defaultCollapsed={collapsed}
        topOffset={56}
      >
        <div className="p-6 text-body-sm text-neutral-subtle">Contenido del módulo</div>
      </ModuleShell>
    </div>
  );
}

export const moduleShellContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Como esqueleto de un módulo que vive debajo de la barra de un host y sólo es dueño de su navegación lateral: la columna a toda la altura disponible con Sidebar controlado, colapso persistente y auto-colapso, y el contenido al lado. Sin barra propia ni cabecera de marca: el título del producto y del módulo los pone la barra del host, y repetirlos en la columna era un segundo título más chico.",
      "Como no hay barra, tampoco hay hamburguesa: el control de colapso es la franja al pie que Sidebar ya trae suelto, de borde a borde, con su chevron y su rótulo.",
      "Con topOffset igual a la altura de la barra del host (56px para Navbar en escritorio): la columna queda fija justo debajo de esa barra al desplazar la página y su altura descuenta ese espacio.",
      "En una plataforma de host y módulos: el host usa Navbar y cada módulo ModuleShell. Como persiste bajo la misma clave que AppShell y Sidebar, un módulo que migra desde AppShell conserva la preferencia de colapso de cada persona.",
    ],
    whenNotToUse: [
      "Una aplicación completa con navegación lateral y barra propias: eso es AppShell, que trae la barra, la marca en la cabecera de la columna y la hamburguesa en la barra.",
      "Una aplicación —o un host— sin navegación lateral: eso es Navbar suelto.",
      "Sólo la navegación dentro de un layout que la aplicación arma por su cuenta: eso es Sidebar suelto.",
      "Recomponer esta columna a mano sobre Sidebar: la columna fija bajo la barra, la persistencia y el auto-colapso habría que recablearlos en cada módulo — es exactamente lo que ModuleShell elimina.",
    ],
    pairs: [
      {
        do: "Pasar como topOffset la altura real de la barra del host bajo la que se monta el módulo.",
        dont: "Dejar topOffset en 0 con una barra encima, o compensarlo con un margen propio en el contenido.",
        why: "La columna es sticky: sin el desplazamiento se pega al borde de la ventana y queda debajo de la barra del host; un margen en el contenido no mueve la columna.",
      },
      {
        do: "Nombrar al módulo en ariaLabel y dejar que la barra del host muestre el título.",
        dont: "Agregar una cabecera con el nombre del módulo encima de la navegación.",
        why: "La barra del host ya dice dónde está la persona (producto y módulo actual en el selector de apps); una segunda marca en la columna duplica ese título a menor tamaño. El nombre accesible de la navegación es lo único que la columna necesita.",
      },
      {
        do: "Dejar que la franja al pie sea el único control de colapso del módulo.",
        dont: "Sumar una hamburguesa en la barra del host o un control dentro del contenido.",
        why: "El módulo es dueño de su colapso. Dos controles para el mismo estado se desincronizan y duplican la parada de teclado; la franja ya persiste la preferencia y dice el estado en su rótulo.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <HostFrame />,
    partsCaption: "barra del host + navegación + franja de colapso al pie + contenido",
    partsDescription:
      "La columna empieza justo debajo de la barra del host, directamente por la navegación — sin cabecera propia — y el control de colapso la cierra al pie: una franja de borde a borde, el mismo control que Sidebar muestra suelto. El contenido del módulo ocupa el resto.",
    parts: [
      {
        name: "Navegación",
        measure: "Sidebar 248px ↔ 64px",
        note: "El Sidebar de siempre, en modo controlado: el estado lo gobierna el shell. Es el primer elemento de la columna.",
      },
      {
        name: "Franja de colapso",
        measure: "h-14 · chevron 20px · px-6",
        note: "La de Sidebar suelto, de borde a borde y último elemento de la columna; el rótulo dice el estado (Colapsar / Expandir) y colapsada conserva el chevron.",
      },
      {
        name: "Desplazamiento superior",
        measure: "topOffset · px",
        note: "Fija top y height de la columna: sticky justo debajo de la barra del host, altura de la ventana menos la barra.",
      },
    ],
    renderState: (state) => <HostFrame collapsed={state.name === "Colapsado"} />,
    states: [
      { name: "Expandido" },
      { name: "Colapsado", note: "Sólo íconos; la franja al pie sigue ahí y la preferencia persiste." },
    ],
    statesCaption: "Probá la franja al pie en cualquiera de los dos: el colapso funciona en vivo",
  },

  accessibility: [
    {
      aspect: "Navegación",
      value: "ariaLabel con el nombre del módulo",
      explanation:
        "Sin cabecera visible, el landmark de navegación es el único lugar donde la columna nombra al módulo; se pasa el nombre en ariaLabel (\"Navegación de Capacidad\") para que quien navega por landmarks sepa de qué módulo es.",
    },
    {
      aspect: "Franja de colapso",
      value: "rótulo según estado",
      explanation:
        'El botón dice lo que hace ("Colapsar" expandido, "Expandir" colapsado); colapsado el texto queda sólo para tecnologías de asistencia, así el estado de la columna llega sin mirar el ancho. Es el mismo control de Sidebar suelto, con su zona activa de borde a borde.',
    },
    {
      aspect: "Ítems colapsados",
      value: "nombre accesible por ítem",
      explanation:
        "Con la navegación a sólo-íconos, cada ítem conserva su nombre para tecnologías de asistencia y su tooltip — herencia directa de Sidebar, que ModuleShell no reimplementa.",
    },
    {
      aspect: "Persistencia",
      value: "tuya-ui:sidebar-collapsed",
      explanation:
        "La preferencia de colapso se guarda bajo la misma clave que Sidebar y AppShell: pasar un módulo de AppShell a ModuleShell no le resetea la elección a nadie.",
    },
  ],
};
