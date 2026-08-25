import { Progress } from "@tuya-ui/components";

export const meta = {
  title: "Relleno de marca",
  description:
    "Degradado de marca en vez del color de severidad. Es decorativo: no dice nada del valor y no satura a danger al pasarse de 100.",
  caption: "Progress con brandFill, comparado con el relleno por severidad",
};

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress brandFill value={74} label="Capacidad asignada" />
      <Progress value={74} label="Capacidad asignada" />
    </div>
  );
}
