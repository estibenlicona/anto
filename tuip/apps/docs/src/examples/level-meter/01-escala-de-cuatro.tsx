import { LevelMeter } from "@tuya-ui/components";

export const meta = {
  title: "Escala de cuatro pasos",
  description:
    "Los segmentos son de igual ancho y lo que varía es cuántos están llenos. Los vacíos llevan aro porque su relleno solo no se distingue de un fondo teñido.",
  caption: "El mismo medidor en las cuatro posiciones de la escala",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <LevelMeter value={1} tone="sky" label="Primer paso" />
      <LevelMeter value={2} tone="blue" label="Segundo paso" />
      <LevelMeter value={3} tone="violet" label="Tercer paso" />
      <LevelMeter value={4} tone="magenta" label="Cuarto paso" />
    </div>
  );
}
