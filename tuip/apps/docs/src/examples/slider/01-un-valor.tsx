import { useState } from "react";
import { Slider } from "@tuya-ui/components";

export const meta = {
  title: "Un solo valor",
  description:
    "Sin `segments`, Slider es un control de valor corriente: una pista fina, el tramo recorrido y un pulgar.",
  caption: "value con un elemento · sin segmentos",
};

export default function Example() {
  const [value, setValue] = useState([35]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-baseline justify-between text-body-sm text-neutral-subtle">
        <span>Tolerancia</span>
        <span className="font-mono text-neutral-default">{value[0]}%</span>
      </div>
      <Slider value={value} onValueChange={setValue} aria-label="Tolerancia" />
    </div>
  );
}
