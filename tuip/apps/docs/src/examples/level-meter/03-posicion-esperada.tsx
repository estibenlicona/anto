import { LevelMeter } from "@tuya-ui/components";

export const meta = {
  title: "Posición esperada",
  description:
    "`expected` marca hasta dónde debería llegar el nivel. La marca va en el **límite** de ese paso y no encima de él, para que se lea \"hasta acá\" y no \"en este escalón\". No ocupa lugar en el reparto: los segmentos miden lo mismo con marca y sin ella.",
  caption: "Las tres situaciones que la marca distingue, y abajo el mismo medidor sin ella",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <LevelMeter value={1} expected={3} tone="blue" label="Por debajo de lo esperado" />
      <LevelMeter value={3} expected={3} tone="blue" label="En lo esperado" />
      <LevelMeter value={4} expected={2} tone="blue" label="Por encima de lo esperado" />
      <LevelMeter value={3} tone="blue" label="Sin nivel esperado" />
    </div>
  );
}
