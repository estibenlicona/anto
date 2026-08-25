import { SegmentedBar } from "@tuya-ui/components";

export const meta = {
  title: "Barra segmentada con segmentos separados",
  description:
    "Categorías independientes que solo comparten un total: separarlas evita sugerir un continuo que el dato no tiene.",
  caption: "SegmentedBar con separated",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <SegmentedBar
        separated
        segments={[
          { value: 2, tone: "sky", label: "Principiante" },
          { value: 3, tone: "blue", label: "Competente" },
          { value: 3, tone: "violet", label: "Avanzado" },
          { value: 2, tone: "magenta", label: "Experto" },
        ]}
      />
      <SegmentedBar
        segments={[
          { value: 2, tone: "sky", label: "Principiante" },
          { value: 3, tone: "blue", label: "Competente" },
          { value: 3, tone: "violet", label: "Avanzado" },
          { value: 2, tone: "magenta", label: "Experto" },
        ]}
      />
    </div>
  );
}
