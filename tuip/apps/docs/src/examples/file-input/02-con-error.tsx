import { useState } from "react";
import { FileInput } from "@tuya-ui/components";

export const meta = {
  title: "Con error",
  description: "El borde y el mensaje reusan el mismo rol danger que ya usa Input.",
  caption: "error coexiste con un value ya elegido — no lo reemplaza",
};

export default function Example() {
  const [file, setFile] = useState<File | null>(
    new File(["contenido de ejemplo"], "comprobante-borroso.jpg", { type: "image/jpeg" }),
  );

  return (
    <FileInput
      label="Comprobante de pago"
      value={file}
      onValueChange={setFile}
      error="La imagen no se lee con claridad. Subí una nueva."
    />
  );
}
