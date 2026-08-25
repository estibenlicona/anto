import { DateRangeField } from "@tuya-ui/components";

export const meta = {
  title: "Uso simple",
  description: "Inicio y fin se escriben en formato ISO, o se eligen los dos extremos desde el mismo calendario.",
  caption: "elegí el día de inicio y luego el de fin, sin que el calendario se cierre entre uno y otro",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <DateRangeField label="Rango de sprint" />
    </div>
  );
}
