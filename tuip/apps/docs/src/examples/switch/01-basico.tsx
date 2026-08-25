import { Switch } from "@tuya-ui/components";

export const meta = {
  title: "Campo básico",
  description: "Un ajuste que toma efecto de inmediato al tocarlo.",
  caption: "label asociado al track por un id generado",
};

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <Switch label="Notificaciones por correo" defaultChecked />
      <Switch label="Notificaciones push" />
    </div>
  );
}
