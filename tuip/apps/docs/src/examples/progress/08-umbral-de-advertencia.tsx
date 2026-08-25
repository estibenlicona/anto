import { Progress } from "@tuya-ui/components";

export const meta = {
  title: "Umbral de advertencia",
  description:
    "Con `warningFrom` la barra avisa antes del límite: desde ese valor hasta 100 inclusive el relleno es warning; por encima de 100 sigue saturando a danger. `warningFrom={100}` marca \"exactamente al tope\" sin llamarlo error.",
  caption: "Progress con warningFrom 85 (84, 85, 100) y con warningFrom 100 (100, 110)",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Progress value={84} warningFrom={85} label="Con espacio" />
      <Progress value={85} warningFrom={85} label="Desde el umbral" />
      <Progress value={100} warningFrom={85} label="Al tope" />
      <Progress value={100} warningFrom={100} label="Exactamente al tope" />
      <Progress value={110} warningFrom={100} label="Sobreasignado" />
    </div>
  );
}
