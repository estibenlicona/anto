import { Input } from "@tuya-ui/components";

export const meta = {
  title: "Deshabilitado",
  description: "Un campo deshabilitado sale del orden de tabulación y no admite edición.",
  caption: "disabled: fuera del orden de tabulación y sin edición",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Input label="Identificador" value="TUY-00421" disabled readOnly />
    </div>
  );
}
