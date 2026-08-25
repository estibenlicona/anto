import { useState } from "react";
import { SearchField } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Buscador acotado, típicamente sobre una Table.",
  caption: "sin label, con placeholder",
};

export default function Example() {
  const [value, setValue] = useState("");

  return (
    <div className="max-w-xs">
      <SearchField
        placeholder="Buscar por nombre o cargo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
