import { Navbar } from "@tuya-ui/components";

export const meta = {
  title: "Variante dark, completa",
  description: "Las tres zonas con datos reales: selector de apps, búsqueda, utilidades, notificaciones sin leer y cuenta.",
  caption: "abrir un panel cierra cualquier otro que estuviera abierto",
};

export default function Example() {
  return (
    <Navbar
      product="Capacidad"
      apps={[
        { id: "capacidad", name: "Capacidad", description: "Células, umbrales y proyección", color: "#ED1C29", current: true },
        { id: "cartera", name: "Cartera", description: "Saldos y recuperación", color: "#1F4E8C" },
        { id: "originacion", name: "Originación", description: "Solicitudes de crédito", color: "#1E6B3A" },
        { id: "directorio", name: "Directorio TI", description: "Activos y responsables", color: "#8A5A00" },
      ]}
      onSearch={() => {}}
      notifications={[
        {
          id: "n1",
          unread: true,
          variant: "danger",
          label: "3 células superaron su umbral",
          detail: "Bogotá · Centro concentra 2 de las 3.",
          timestamp: "hace 12 min",
        },
        {
          id: "n2",
          unread: true,
          variant: "warning",
          label: "SOL-2041 espera tu aprobación",
          detail: "M. Restrepo solicitó +4,0 Gbps para CEL-00842.",
          timestamp: "hace 1 h",
        },
        {
          id: "n3",
          label: "Proyección mensual disponible",
          detail: "Agosto 2026 · 14 zonas con riesgo a 90 días.",
          timestamp: "hoy 07:00",
        },
      ]}
      onMarkAllNotificationsRead={() => {}}
      onViewAllNotifications={() => {}}
      user={{ name: "Mariana Restrepo", role: "Analista de capacidad · TI", initials: "MR" }}
      userMenu={[
        { label: "Mi perfil" },
        { label: "Preferencias de notificación" },
        { label: "Densidad de tablas" },
        { label: "Cerrar sesión", destructive: true },
      ]}
    />
  );
}
