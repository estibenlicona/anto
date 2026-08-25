import { Meter } from "@tuya-ui/components";

export const meta = {
  title: "Dedicación en una fila",
  description:
    "La barra y la cifra describen el mismo número. Con `warningFrom={100}` el 100 % se lee como \"al tope\" en warning; por encima, la barra satura a danger y la cifra sigue diciendo la verdad.",
  caption: "Meter con 50, 80, 100 y 120 con warningFrom 100",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Meter value={50} warningFrom={100} label="Dedicación" />
      <Meter value={80} warningFrom={100} label="Dedicación" />
      <Meter value={100} warningFrom={100} label="Dedicación" />
      <Meter value={120} warningFrom={100} label="Dedicación" />
    </div>
  );
}
