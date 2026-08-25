import { DateRangeField } from "@tuya-ui/components";

export const meta = {
  title: "Con límites",
  description: "Los días fuera de minDate/maxDate quedan visibles pero deshabilitados en el calendario.",
  caption: "minDate y maxDate acotan el trimestre actual",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <DateRangeField
        label="Ventana de mantenimiento"
        minDate={new Date(2026, 6, 1)}
        maxDate={new Date(2026, 8, 30)}
      />
    </div>
  );
}
