import { DateField } from "@tuya-ui/components";

export const meta = {
  title: "Con error",
  description: "El mensaje de error explica el formato esperado, con el mismo tratamiento visual que Input.",
  caption: "el texto escrito no es una fecha ISO válida",
};

export default function Example() {
  return (
    <div className="w-full max-w-xs">
      <DateField label="Fecha de nacimiento" defaultValue="31/08/2026" error="Formato esperado: YYYY-MM-DD" />
    </div>
  );
}
