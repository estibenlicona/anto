import { Switch } from "@tuya-ui/components";

export const meta = {
  title: "Deshabilitado",
  description: "Fuera del flujo de tabulación, con el mismo tratamiento visual encendido y apagado.",
  caption: "disabled: true",
};

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <Switch label="Apagado, deshabilitado" disabled />
      <Switch label="Encendido, deshabilitado" disabled defaultChecked />
    </div>
  );
}
