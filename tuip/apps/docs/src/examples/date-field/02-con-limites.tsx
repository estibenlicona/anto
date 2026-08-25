import { DateField } from "@tuya-ui/components";

export const meta = {
  title: "Con límites",
  description: "Los días fuera de minDate/maxDate se muestran deshabilitados en el calendario, no ocultos.",
  caption: "minDate y maxDate acotan el sprint actual",
};

export default function Example() {
  return (
    <div className="w-full max-w-xs">
      <DateField
        label="Fecha de entrega"
        defaultValue="2026-08-05"
        minDate={new Date(2026, 6, 28)}
        maxDate={new Date(2026, 7, 8)}
      />
    </div>
  );
}
