import { Navbar } from "@tuya-ui/components";

export const meta = {
  title: "Variante compacta",
  description:
    "Achicá la ventana del navegador por debajo de 960px: la altura baja, la búsqueda se reduce a un ícono y aparece un botón de menú para la navegación lateral de la app. Los quiebres son del ancho real de la ventana — Navbar es la barra de arriba de toda la página, no un bloque que responda al ancho de un contenedor.",
  caption: "el botón de menú solo aparece si se pasa onMenuToggle — no hay un menú sin acción",
};

export default function Example() {
  return (
    <Navbar
      product="Capacidad"
      apps={[{ id: "capacidad", name: "Capacidad", description: "Células, umbrales y proyección", color: "#ED1C29", current: true }]}
      onSearch={() => {}}
      notifications={[{ id: "n1", unread: true, label: "3 células superaron su umbral", timestamp: "hace 12 min" }]}
      user={{ name: "Mariana Restrepo", role: "Analista de capacidad · TI", initials: "MR" }}
      userMenu={[{ label: "Mi perfil" }, { label: "Cerrar sesión", destructive: true }]}
      onMenuToggle={() => {}}
    />
  );
}
