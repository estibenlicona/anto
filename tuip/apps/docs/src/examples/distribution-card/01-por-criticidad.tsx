import { DistributionCard } from "@tuya-ui/components";

export const meta = {
  title: "Distribución por criticidad",
  description:
    "Rótulo, total, barra con grado de intensidad, leyenda en dos columnas con el mismo relleno que cada segmento, y un pie con la única lectura que la leyenda no da de un vistazo.",
  caption: "DistributionCard con heat y pie",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <DistributionCard
        title="DISTRIBUCIÓN POR CRITICIDAD"
        total={5}
        totalNoun="células"
        items={[
          { label: "Crítica", value: 2, heat: "max" },
          { label: "Alta", value: 1, heat: "high" },
          { label: "Media", value: 1, heat: "mid" },
          { label: "Baja", value: 1, heat: "low" },
        ]}
        footer={
          <>
            <span className="font-bold tabular-nums text-neutral-default">3 de 5</span> células en
            criticidad alta o crítica
          </>
        }
      />
    </div>
  );
}
