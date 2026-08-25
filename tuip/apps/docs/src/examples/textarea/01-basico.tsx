import { useState } from "react";
import { Textarea } from "@tuya-ui/components";

export const meta = {
  title: "Detalle de un motivo",
  description:
    "Misma anatomía que Input: etiqueta, ayuda y error con las mismas piezas. El campo crece sólo hacia abajo, y el error reemplaza a la ayuda cuando falta lo obligatorio.",
  caption: "Textarea con hint, required y error al quedar vacío",
};

export default function Example() {
  const [value, setValue] = useState("Lo reasignaron por error al cerrar el sprint.");
  const [touched, setTouched] = useState(false);
  const error = touched && value.trim() === "" ? "Contá qué pasó" : undefined;
  return (
    <div className="w-full max-w-md">
      <Textarea
        label="Detalle"
        hint="Qué pasó y desde cuándo"
        required
        rows={3}
        value={value}
        error={error}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
      />
    </div>
  );
}
