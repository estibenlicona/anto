import { Checkbox } from "@tuya-ui/components";

export const meta = {
  title: "Deshabilitado",
  description: "Fuera del flujo de tabulación, con el mismo tratamiento visual marcado y desmarcado.",
  caption: "disabled: true",
};

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Desmarcado, deshabilitado" disabled />
      <Checkbox label="Marcado, deshabilitado" disabled defaultChecked />
    </div>
  );
}
