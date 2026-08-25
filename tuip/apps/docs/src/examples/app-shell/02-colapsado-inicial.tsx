import { AppShell, Icon } from "@tuya-ui/components";

export const meta = {
  title: "Colapsado inicial",
  description:
    "Con defaultCollapsed el shell arranca a sólo-íconos sin esperar a la preferencia guardada: 64px, la cabecera muestra sólo el cuadro de marca, y cada ítem conserva su nombre por tooltip.",
  caption: "AppShell con defaultCollapsed",
};

export default function Example() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-surface border border-neutral-default">
      <AppShell
        product="Dimensionamiento TI"
        groups={[
          {
            label: "Capacidad",
            items: [
              { id: "celulas", label: "Células", href: "#", icon: <Icon name="cell" size={20} /> },
              { id: "personas", label: "Personas", href: "#", icon: <Icon name="user" size={20} /> },
            ],
          },
        ]}
        activeId="personas"
        onNavigate={() => {}}
        user={{ name: "Chapter Lead", initials: "CL" }}
        userMenu={[{ label: "Cerrar sesión", destructive: true }]}
        defaultCollapsed
      >
        <div className="p-6 text-body-sm text-neutral-subtle">Contenido de la aplicación</div>
      </AppShell>
    </div>
  );
}
