import { Icon, Sidebar } from "@tuya-ui/components";

export const meta = {
  title: "Dos grupos, con contador",
  description: "Las mismas seis secciones del mockup: cuatro en Operación, dos en Administración. Solicitudes lleva un contador de trabajo pendiente.",
  caption: "el contador se omite por completo en los ítems sin trabajo pendiente — nunca aparece en cero",
};

export default function Example() {
  return (
    <div className="h-[460px] overflow-hidden rounded-control border border-neutral-default">
      <Sidebar
        groups={[
          {
            label: "Operación",
            items: [
              { id: "torre", label: "Torre de control", icon: <Icon name="dashboard" size={20} />, href: "#torre" },
              { id: "inventario", label: "Inventario de células", icon: <Icon name="grid" size={20} />, href: "#inventario" },
              { id: "solicitudes", label: "Solicitudes", icon: <Icon name="document" size={20} />, href: "#solicitudes", badge: 12 },
              { id: "proyeccion", label: "Proyección", icon: <Icon name="trend-up" size={20} />, href: "#proyeccion" },
            ],
          },
          {
            label: "Administración",
            items: [
              { id: "umbrales", label: "Umbrales", icon: <Icon name="target" size={20} />, href: "#umbrales" },
              { id: "usuarios", label: "Usuarios y roles", icon: <Icon name="user" size={20} />, href: "#usuarios" },
            ],
          },
        ]}
        activeId="solicitudes"
        onNavigate={() => {}}
        footer={<span className="text-body-sm text-neutral-subtle">v2.4.1</span>}
        className="h-full"
      />
    </div>
  );
}
