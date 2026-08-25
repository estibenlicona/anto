import { useState } from "react";
import { Icon, SegmentedControl } from "@tuya-ui/components";

export const meta = {
  title: "Densidad",
  description: "Dos opciones excluyentes que aplican su cambio de inmediato, representadas solo por icono.",
  caption: "options con icon en vez de label visible — el label pasa a ser el nombre accesible",
};

const OPTIONS = [
  { value: "comfortable", label: "Cómoda", icon: <Icon name="density-comfortable" size={16} /> },
  { value: "compact", label: "Compacta", icon: <Icon name="density-compact" size={16} /> },
];

export default function Example() {
  const [density, setDensity] = useState("comfortable");

  return (
    <SegmentedControl
      label="Densidad"
      options={OPTIONS}
      value={density}
      onValueChange={setDensity}
    />
  );
}
