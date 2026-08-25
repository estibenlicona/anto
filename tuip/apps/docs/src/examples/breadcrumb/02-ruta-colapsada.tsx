import { Breadcrumb } from "@tuya-ui/components";

export const meta = {
  title: "Ruta colapsada",
  description: "Más de tres niveles: el centro se colapsa en un único «…», conservando primero y último.",
  caption: "items con 5 niveles",
};

export default function Example() {
  return (
    <Breadcrumb
      items={[
        { label: "Plataforma", href: "#" },
        { label: "Células", href: "#" },
        { label: "Backend Platform", href: "#" },
        { label: "Capacidades", href: "#" },
        { label: "Julián Pérez" },
      ]}
    />
  );
}
