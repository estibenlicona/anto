import { SegmentedBar } from "@tuya-ui/components";

export const meta = {
  title: "Escala de intensidad",
  description:
    "Una distribución ordenada por gravedad. `heat` va del relleno de peligro intenso al de marca, al de marca atenuada y al neutro: el color resume cuánto de lo que hay es grave, sin afirmar el estado de ninguna célula en particular — eso lo dice el badge de cada una, con `role`.",
  caption: "SegmentedBar separada con heat: max, high, mid, low",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedBar
        separated
        segments={[
          { value: 2, heat: "max", label: "Crítica" },
          { value: 1, heat: "high", label: "Alta" },
          { value: 1, heat: "mid", label: "Media" },
          { value: 1, heat: "low", label: "Baja" },
        ]}
      />
    </div>
  );
}
