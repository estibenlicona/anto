import { Progress } from "@tuya-ui/components";

export const meta = {
  title: "Sobre el límite",
  description: "Un valor mayor a 100 satura la barra a danger en vez de desbordarla.",
  caption: "value: 110",
};

export default function Example() {
  return (
    <div className="w-full max-w-sm">
      <Progress value={110} label="Backend Platform" />
    </div>
  );
}
