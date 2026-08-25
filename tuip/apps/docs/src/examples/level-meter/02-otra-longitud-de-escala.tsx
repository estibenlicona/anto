import { LevelMeter } from "@tuya-ui/components";

export const meta = {
  title: "Otra longitud de escala",
  description:
    "`steps` es lo que permite reutilizar el medidor en una escala que no tenga cuatro pasos, sin bifurcar el componente. El ancho se reparte igual entre los que haya.",
  caption: "Tres, cuatro y cinco pasos, todos en la misma posición relativa",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <LevelMeter value={2} steps={3} tone="violet" label="Escala de tres" />
      <LevelMeter value={2} steps={4} tone="violet" label="Escala de cuatro" />
      <LevelMeter value={2} steps={5} tone="violet" label="Escala de cinco" />
    </div>
  );
}
