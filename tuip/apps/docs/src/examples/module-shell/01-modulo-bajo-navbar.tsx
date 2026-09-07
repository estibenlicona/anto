import { Icon, ModuleShell, Navbar } from "@tuya-ui/components";

export const meta = {
  title: "Módulo bajo la barra del host",
  description:
    "La barra es del host (Navbar, sin campana): ahí viven el producto y el módulo actual en el selector de apps. El módulo pone su columna con ModuleShell y topOffset igual a la altura de esa barra — sin cabecera propia, la navegación empieza justo debajo. Sin barra propia no hay hamburguesa: el control de colapso es la franja al pie. Clickeala: el colapso funciona y persiste. La columna mide lo que mide la ventana menos la barra; acá el marco le fija una altura menor para que la franja quede a la vista.",
  caption: "Navbar del host arriba, ModuleShell del módulo debajo, con la franja de colapso al pie",
};

export default function Example() {
  return (
    <div className="h-[380px] w-full overflow-hidden rounded-surface border border-neutral-default [&_aside]:h-[324px]">
      <Navbar
        product="Dimensionamiento TI"
        variant="light"
        apps={[
          { id: "capacidad", name: "Gestión de Capacidad", color: "#C9151F", current: true },
          { id: "facturacion", name: "Facturación", color: "#2563EB" },
        ]}
        user={{ name: "Chapter Lead", role: "Tu chapter", initials: "CL" }}
        userMenu={[{ label: "Cerrar sesión", destructive: true }]}
        showNotifications={false}
      />
      <ModuleShell
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
        ariaLabel="Navegación de Capacidad"
        topOffset={56}
      >
        <div className="p-6 text-body-sm text-neutral-subtle">
          Contenido del módulo — breadcrumb y main van acá, como hijos.
        </div>
      </ModuleShell>
    </div>
  );
}
