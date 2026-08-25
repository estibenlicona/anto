import { Input } from "@tuya-ui/components";

export const meta = {
  title: "Campo con etiqueta",
  description: "La etiqueta queda asociada al campo, así que hacer clic en ella enfoca el input.",
  caption: "label asociado al campo por un id generado",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Input label="Nombre completo" placeholder="Escribe tu nombre" />
    </div>
  );
}
