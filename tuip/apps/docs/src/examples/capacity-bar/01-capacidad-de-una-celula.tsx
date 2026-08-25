import { CapacityBar } from "@tuya-ui/components";

export const meta = {
  title: "Capacidad de una célula",
  description:
    "Asignado sobre disponible, con el porcentaje por severidad (success con espacio, warning desde 85, danger al tope), la barra apilada sobre la capacidad disponible y la lectura de lo libre. La variante vacía es la célula sin equipo.",
  caption: "CapacityBar con margen · al tope · vacía",
};

const parts = [
  { label: "BAU", value: 1.7, tone: "sky" as const },
  { label: "Transf.", value: 1.0, tone: "blue" as const },
];

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <CapacityBar allocated={2.7} available={3.8} parts={parts} unit="FTE" />
      <CapacityBar
        allocated={2.0}
        available={2.0}
        parts={[
          { label: "BAU", value: 1.0, tone: "sky" },
          { label: "Transf.", value: 1.0, tone: "blue" },
        ]}
        unit="FTE"
      />
      <CapacityBar allocated={0} available={0} parts={[]} unit="FTE" />
    </div>
  );
}
