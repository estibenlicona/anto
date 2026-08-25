import { Icon, Sidebar } from "@tuya-ui/components";

export const meta = {
  title: "Densidad compacta",
  description: "Mismo Sidebar con density=\"compact\": cada ítem baja de 36px a 32px de alto.",
  caption: "el mismo par comfortable/compact que ya usa Table, no un vocabulario propio",
};

export default function Example() {
  return (
    <div className="h-[300px] overflow-hidden rounded-control border border-neutral-default">
      <Sidebar
        density="compact"
        groups={[
          {
            label: "Operación",
            items: [
              { id: "torre", label: "Torre de control", icon: <Icon name="dashboard" size={20} />, href: "#torre" },
              { id: "solicitudes", label: "Solicitudes", icon: <Icon name="document" size={20} />, href: "#solicitudes", badge: 3 },
              { id: "proyeccion", label: "Proyección", icon: <Icon name="trend-up" size={20} />, href: "#proyeccion" },
            ],
          },
        ]}
        activeId="torre"
        onNavigate={() => {}}
        className="h-full"
      />
    </div>
  );
}
