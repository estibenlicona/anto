import { DistributionCard } from "@tuya-ui/components";

export const meta = {
  title: "Distribución por seniority",
  description:
    "La misma card con tonos de acento: una escala ordinal sin gravedad, los mismos matices que usa LevelMeter para ese nivel en cualquier otra pantalla.",
  caption: "DistributionCard con tone",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <DistributionCard
        title="DISTRIBUCIÓN POR SENIORITY"
        total={18}
        totalNoun="personas"
        items={[
          { label: "Principiante", value: 2, tone: "sky" },
          { label: "Competente", value: 5, tone: "blue" },
          { label: "Avanzado", value: 7, tone: "violet" },
          { label: "Experto", value: 4, tone: "magenta" },
        ]}
      />
    </div>
  );
}
