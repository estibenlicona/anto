import { DateRangeField } from "@tuya-ui/components";

export const meta = {
  title: "Modo lectura",
  description: "Con un rango ya elegido y el campo fuera de edición, se muestra el formato abreviado en vez del ISO de captura.",
  caption: "el campo llega con «28 jul – 8 ago»; hacé clic para volver a editarlo en ISO",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <DateRangeField label="Rango de sprint" defaultStartValue="2026-07-28" defaultEndValue="2026-08-08" />
    </div>
  );
}
