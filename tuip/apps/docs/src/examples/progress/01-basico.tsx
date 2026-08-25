import { Progress } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Un valor entre 0 y 100.",
  caption: "value: 75",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Progress value={75} label="Capacidad usada" />
    </div>
  );
}
