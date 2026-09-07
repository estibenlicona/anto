import { Navbar } from "@tuya-ui/components";

export const meta = {
  title: "Sin notificaciones",
  description:
    "Un producto —o un host de módulos— que todavía no ofrece notificaciones pasa showNotifications={false}: ni el botón ni su panel se renderizan, y la marca, los enlaces de utilidad y la cuenta siguen en su lugar. Sin la prop, la campana se muestra como siempre.",
  caption: "Navbar clara con la campana omitida",
};

export default function Example() {
  return (
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
  );
}
