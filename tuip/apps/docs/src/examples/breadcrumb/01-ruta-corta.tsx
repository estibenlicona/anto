import { Breadcrumb } from "@tuya-ui/components";

export const meta = {
  title: "Ruta corta",
  description: "Tres niveles o menos: se muestran todos.",
  caption: "items con 3 niveles",
};

export default function Example() {
  return (
    <Breadcrumb
      items={[
        { label: "Plataforma", href: "#" },
        { label: "Células", href: "#" },
        { label: "Backend Platform" },
      ]}
    />
  );
}
