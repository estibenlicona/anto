import { Select } from "@tuya-ui/components";

export const meta = {
  title: "Tamaños",
  description: "El tamaño cambia altura, espaciado y texto, sin alterar el comportamiento.",
  caption: "size: small · medium · large",
};

const OPTIONS = [
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Mediano" },
  { value: "lg", label: "Grande" },
];

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Select size="small" placeholder="Pequeño" options={OPTIONS} />
      <Select size="medium" placeholder="Mediano" options={OPTIONS} />
      <Select size="large" placeholder="Grande" options={OPTIONS} />
    </div>
  );
}
