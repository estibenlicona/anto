import { useState } from "react";
import { FileInput } from "@tuya-ui/components";

export const meta = {
  title: "Adjuntar documento",
  description: "Arrastrá un archivo o hacé clic para elegirlo — Tab y Enter/Espacio abren el mismo selector nativo.",
  caption: "value/onValueChange controlado, sin defaultValue posible para un File",
};

export default function Example() {
  const [file, setFile] = useState<File | null>(null);

  return <FileInput label="Comprobante de pago" value={file} onValueChange={setFile} />;
}
