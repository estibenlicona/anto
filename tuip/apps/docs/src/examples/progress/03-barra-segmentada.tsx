import { SegmentedBar } from "@tuya-ui/components";

export const meta = {
  title: "Barra segmentada",
  description: "Una distribución entre categorías, cada una con su propio rol de color.",
  caption: "SegmentedBar con tres segmentos",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <SegmentedBar
        segments={[
          { value: 37, role: "info", label: "Backend Platform" },
          { value: 38, role: "warning", label: "Canales Digitales" },
          { value: 25, role: "success", label: "Core Bancario" },
        ]}
      />
    </div>
  );
}
