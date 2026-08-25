import { SeniorityCard } from "@tuya-ui/components";

export const meta = {
  title: "Estado vacío y variante sin etiqueta",
  description:
    "Un valor fuera de la escala cae en el estado vacío documentado, con la misma dimensión que los demás. La variante sin etiqueta usa su propio ancho reducido y mueve el nombre del nivel al tooltip y al nombre accesible.",
  caption: "Sin dato · fuera de escala · sin etiqueta (pasá el cursor por encima)",
};

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SeniorityCard level={null} />
      <SeniorityCard level="Senior" />
      <SeniorityCard level="Principiante" hideLabel />
      <SeniorityCard level="Experto" hideLabel />
    </div>
  );
}
