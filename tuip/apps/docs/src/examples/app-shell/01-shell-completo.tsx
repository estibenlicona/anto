import { AppShell, Icon } from "@tuya-ui/components";

export const meta = {
  title: "El shell completo",
  description:
    "Sidebar a toda altura con la marca en su cabecera, barra al lado con la hamburguesa como primer elemento, contenido como hijos. Clickeá la hamburguesa: el colapso funciona y persiste. El shell es dueño del viewport, así que acá se muestra recortado a su franja superior.",
  caption: "AppShell con la navegación de ejemplo",
};

export default function Example() {
  return (
    <div className="h-[380px] w-full overflow-hidden rounded-surface border border-neutral-default">
      <AppShell
        product="Dimensionamiento TI"
        groups={[
          {
            label: "Capacidad",
            items: [
              { id: "celulas", label: "Células", href: "#", icon: <Icon name="cell" size={20} /> },
              { id: "personas", label: "Personas", href: "#", icon: <Icon name="user" size={20} /> },
              { id: "capacidades", label: "Capacidades", href: "#", icon: <Icon name="capacity" size={20} /> },
            ],
          },
        ]}
        activeId="personas"
        onNavigate={() => {}}
        user={{ name: "Chapter Lead", role: "Tu chapter", initials: "CL" }}
        userMenu={[{ label: "Cerrar sesión", destructive: true }]}
      >
        <div className="p-6 text-body-sm text-neutral-subtle">
          Contenido de la aplicación — breadcrumb y main van acá, como hijos.
        </div>
      </AppShell>
    </div>
  );
}
