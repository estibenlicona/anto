import { SegmentedBar } from "@tuya-ui/components";

export const meta = {
  title: "Segmentos sobre un total",
  description:
    "Con `total`, cada segmento se dimensiona sobre esa capacidad y no sobre la suma de los segmentos: el track vacío que queda es lo libre. Acá 1.7 de BAU y 1.0 de Transformación sobre 3.8 FTE disponibles.",
  caption: "SegmentedBar con total, tonos de acento y size sm",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedBar
        size="sm"
        total={3.8}
        segments={[
          { value: 1.7, tone: "sky", label: "BAU" },
          { value: 1.0, tone: "blue", label: "Transformación" },
        ]}
      />
    </div>
  );
}
