import { Checkbox } from "@tuya-ui/components";

export const meta = {
  title: "Campo básico",
  description: "Marcado y desmarcado, con la etiqueta asociada a la casilla.",
  caption: "label asociado a la casilla por un id generado",
};

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Acepto los términos y condiciones" defaultChecked />
      <Checkbox label="Quiero recibir novedades por correo" />
    </div>
  );
}
