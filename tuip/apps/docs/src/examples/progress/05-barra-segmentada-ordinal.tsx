import { SegmentedBar } from "@tuya-ui/components";

export const meta = {
  title: "Barra segmentada con tonos de acento",
  description:
    "Una distribución cuyos segmentos son los pasos de una escala ordinal. El tono de acento es el mismo vocabulario que usa LevelMeter, así que el mismo paso viste el mismo color en la barra y en el medidor.",
  caption: "SegmentedBar con tone en vez de color o rol",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedBar
        segments={[
          { value: 2, tone: "sky", label: "Principiante" },
          { value: 5, tone: "blue", label: "Competente" },
          { value: 7, tone: "violet", label: "Avanzado" },
          { value: 4, tone: "magenta", label: "Experto" },
        ]}
      />
    </div>
  );
}
