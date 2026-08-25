import { Button } from "@tuya-ui/components";

export const meta = {
  title: "Tamaños",
  description: "El tamaño cambia altura, espaciado y texto, sin alterar la variante ni sus colores.",
  caption: "size: small · medium · large — solo cambia el padding, no la variante",
};

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="small">Pequeño</Button>
      <Button size="medium">Mediano</Button>
      <Button size="large">Grande</Button>
    </div>
  );
}
