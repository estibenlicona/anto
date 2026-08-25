import { AppShell } from '@tuya-ui/components';
import { Icon } from '@tuya-ui/components';
import type { ComponentContent } from './types';

const demoGroups = [
  {
    label: 'Capacidad',
    items: [
      { id: 'personas', label: 'Personas', href: '#', icon: <Icon name='user' size={20} /> },
      { id: 'celulas', label: 'Células', href: '#', icon: <Icon name='cell' size={20} /> },
    ],
  },
];

/** El shell es dueño del viewport (min-h-screen), así que en la página se
 * muestra dentro de un marco recortado: se ve su franja superior — cabecera,
 * barra y el arranque de la navegación — que es donde vive la unión. */
function ShellFrame({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className='h-[360px] w-full overflow-hidden rounded-surface border border-neutral-default'>
      <AppShell
        product='Dimensionamiento TI'
        groups={demoGroups}
        activeId='personas'
        onNavigate={() => {}}
        user={{ name: 'Chapter Lead', initials: 'CL' }}
        userMenu={[{ label: 'Cerrar sesión', destructive: true }]}
        defaultCollapsed={collapsed}
      >
        <div className='p-6 text-body-sm text-neutral-subtle'>Contenido de la aplicación</div>
      </AppShell>
    </div>
  );
}

export const appShellContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Como esqueleto por defecto de una aplicación interna con navegación lateral: trae la fusión resuelta — sidebar a toda altura con la marca en su cabecera, barra al lado con la hamburguesa que lo contrae, colapso persistente y auto-colapso en ventanas angostas.",
      "Cuando la app ya usa Navbar + Sidebar sueltos y quiere la composición corregida (el sidebar llegando arriba, el control de colapso a la vista): AppShell conserva la preferencia de colapso guardada, porque persiste bajo la misma clave.",
    ],
    whenNotToUse: [
      "Una aplicación sin navegación lateral: eso es Navbar suelto.",
      "Una superficie que necesita navegación lateral sin la barra del sistema: eso es Sidebar suelto.",
      "Recomponer la fusión a mano con Navbar + Sidebar: el estado que la fusión necesita (colapso, persistencia, auto-colapso, un panel abierto a la vez) habría que recablearlo en cada app — es exactamente lo que AppShell elimina.",
    ],
    pairs: [
      {
        do: "Pasar el contenido de la app (breadcrumb, main) como children del shell.",
        dont: "Renderizar el breadcrumb o el contenido fuera del shell, al lado de él.",
        why: "El shell es dueño de la geometría — columna lateral, barra, área de contenido. Lo que se renderiza afuera no participa de esa geometría y se desalinea al colapsar.",
      },
      {
        do: "Dejar que la hamburguesa sea el único control de colapso.",
        dont: "Sumar otro control de colapso propio dentro del contenido.",
        why: "Dos controles para el mismo estado se desincronizan a la vista y duplican la parada de teclado. La hamburguesa ya persiste la preferencia y comunica el estado.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <ShellFrame />,
    partsCaption: 'cabecera de marca + barra con hamburguesa + navegación + contenido',
    partsDescription:
      'La cabecera de la columna lateral y la barra comparten los 56px de alto y el mismo filete inferior, así la línea corre continua de borde a borde. La hamburguesa es el primer elemento de la barra, pegada al borde del sidebar que controla.',
    parts: [
      { name: 'Cabecera de marca', measure: 'h-14 · cuadro 24px bg-brand-bold', note: 'Misma anatomía que NavbarBrand; colapsada muestra sólo el cuadro.' },
      { name: 'Hamburguesa', measure: '36px · ícono menu 20px', note: 'Único control de colapso; aria-label según estado y aria-expanded.' },
      { name: 'Navegación', measure: 'Sidebar 248px ↔ 64px', note: 'El Sidebar de siempre, controlado y sin su franja de colapso inferior.' },
    ],
    renderState: (state) => <ShellFrame collapsed={state.name === 'Colapsado'} />,
    states: [
      { name: 'Expandido' },
      { name: 'Colapsado', note: 'Sólo íconos; la preferencia persiste entre sesiones.' },
    ],
    statesCaption: 'Probá la hamburguesa en cualquiera de los dos: el colapso funciona en vivo',
  },

  accessibility: [
    {
      aspect: "Hamburguesa",
      value: 'aria-label + aria-expanded',
      explanation:
        "El botón dice lo que hace según el estado (\"Contraer la navegación\" / \"Expandir la navegación\") y expone aria-expanded, así el estado del sidebar llega a las tecnologías de asistencia sin mirar el ancho.",
    },
    {
      aspect: "Colapsado",
      value: "nombre accesible por ítem",
      explanation:
        "Con la navegación a sólo-íconos, cada ítem conserva su nombre para tecnologías de asistencia y su tooltip — herencia directa de Sidebar, que AppShell no reimplementa.",
    },
    {
      aspect: "Paneles de la barra",
      value: "uno abierto a la vez",
      explanation:
        "Notificaciones y cuenta comparten el slot único de paneles de Navbar. Se hereda también su limitación documentada: pasar de un panel al otro toma dos activaciones, no una.",
    },
    {
      aspect: "Persistencia",
      value: "tuya-ui:sidebar-collapsed",
      explanation:
        "La preferencia de colapso se guarda bajo la misma clave que Sidebar usa suelto: migrar una app al shell no le resetea la elección a nadie.",
    },
  ],
};
