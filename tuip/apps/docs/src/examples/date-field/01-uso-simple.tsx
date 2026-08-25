import { DateField } from "@tuya-ui/components";

export const meta = {
  title: "Uso simple",
  description: "El texto acepta la fecha en formato ISO tal como se escribe; el calendario es una ayuda para elegirla.",
  caption: "escribí una fecha o elegila desde el calendario",
};

export default function Example() {
  return (
    <div className="w-full max-w-xs">
      <DateField label="Fecha objetivo" defaultValue="2026-08-31" />
    </div>
  );
}
