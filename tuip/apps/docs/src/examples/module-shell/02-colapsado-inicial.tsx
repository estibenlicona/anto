import { Icon, ModuleShell } from "@tuya-ui/components";

export const meta = {
  title: "Colapsado inicial",
  description:
    "Con defaultCollapsed la columna arranca a sólo-íconos sin esperar a la preferencia guardada: 64px, cada ítem conserva su nombre por tooltip y la franja al pie sigue ahí —con el chevron y el rótulo 'Expandir' para tecnologías de asistencia— para volver a expandir. Sin topOffset, la columna ocupa la ventana completa, como la de AppShell.",
  caption: "ModuleShell con defaultCollapsed y sin barra encima",
};

export default function Example() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-surface border border-neutral-default [&_aside]:h-[320px]">
      <ModuleShell
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
        ariaLabel="Navegación de Capacidad"
        defaultCollapsed
      >
        <div className="p-6 text-body-sm text-neutral-subtle">Contenido del módulo</div>
      </ModuleShell>
    </div>
  );
}
