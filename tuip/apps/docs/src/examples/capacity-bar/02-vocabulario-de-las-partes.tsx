import { CapacityBar } from "@tuya-ui/components";

export const meta = {
  title: "Vocabulario de las partes",
  description:
    "Cada parte declara **uno** de los dos vocabularios de color. `tone` cuando son pasos de una misma escala, ordenados entre sí. `color` cuando son categorías que no se ordenan — y ahí el acento sería un préstamo: haría que las partes tomaran los tonos de las escalas ordinales del sistema y se leyeran como si fueran una.",
  caption: "Arriba dos pasos de una escala; abajo dos categorías que no se ordenan",
};

export default function Example() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: "340px" }}>
      <CapacityBar
        allocated={1.8}
        available={2}
        unit="FTE"
        parts={[
          { label: "Junior", value: 1.1, tone: "sky" },
          { label: "Senior", value: 0.7, tone: "violet" },
        ]}
      />

      <CapacityBar
        allocated={1.8}
        available={2}
        unit="FTE"
        parts={[
          { label: "BAU", value: 1.1, color: "green" },
          { label: "Transf.", value: 0.7, color: "purple" },
        ]}
      />
    </div>
  );
}
