import { useState } from "react";
import { Slider, Tag } from "@tuya-ui/components";

export const meta = {
  title: "Partición en bandas",
  description:
    "Cuatro límites parten 0–100% en cinco bandas. Mover uno cambia a la vez las dos bandas que separa — no hay lógica que las sincronice, comparten el número.",
  caption: "value con 4 límites · segments con 5 tramos",
};

const bandas = [
  { label: "XS", color: "gray" },
  { label: "S", color: "green" },
  { label: "M", color: "blue" },
  { label: "L", color: "amber" },
  { label: "XL", color: "red" },
] as const;

export default function Example() {
  const [limites, setLimites] = useState([20, 40, 60, 80]);
  const bordes = [0, ...limites, 100];

  return (
    <div className="flex w-full flex-col gap-4">
      <Slider
        value={limites}
        onValueChange={setLimites}
        segments={bandas.map((b) => ({ label: b.label, color: b.color }))}
        minDistance={5}
      />
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {bandas.map((banda, index) => (
          <span key={banda.label} className="flex items-center gap-2 text-body-sm">
            <Tag color={banda.color}>{banda.label}</Tag>
            <span className="font-mono text-neutral-subtle">
              {index === 0 ? bordes[0] : bordes[index] + 1}–{bordes[index + 1]}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
