import { useState } from "react";
import { Button, Icon, Sidebar } from "@tuya-ui/components";

export const meta = {
  title: "Colapso controlado",
  description: "Con collapsed/onCollapsedChange, la app es la única fuente de verdad — Sidebar no lee ni escribe su propia persistencia en localStorage.",
  caption: "sin estas dos props, Sidebar recuerda la elección por su cuenta entre sesiones",
};

export default function Example() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" iconBefore={<Icon name="menu" size={16} />} onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? "Expandir desde la app" : "Colapsar desde la app"}
      </Button>
      <div className="h-[260px] overflow-hidden rounded-control border border-neutral-default">
        <Sidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          groups={[
            {
              label: "Operación",
              items: [
                { id: "torre", label: "Torre de control", icon: <Icon name="dashboard" size={20} />, href: "#torre" },
                { id: "solicitudes", label: "Solicitudes", icon: <Icon name="document" size={20} />, href: "#solicitudes", badge: 5 },
              ],
            },
          ]}
          activeId="torre"
          onNavigate={() => {}}
          className="h-full"
        />
      </div>
    </div>
  );
}
