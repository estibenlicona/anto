import { Breadcrumb } from "@tuya-ui/components";

export const meta = {
  title: "Fondo oscuro",
  description: "`variant=\"dark\"` adapta los enlaces, el nivel actual y los separadores a una superficie oscura, como la de Navbar.",
  caption: "variant=\"dark\" sobre bg-neutral-inverse",
};

export default function Example() {
  return (
    <div className="w-full rounded-control bg-neutral-inverse px-5 py-4">
      <Breadcrumb
        variant="dark"
        items={[
          { label: "Plataforma", href: "#" },
          { label: "Células", href: "#" },
          { label: "Backend Platform" },
        ]}
      />
    </div>
  );
}
