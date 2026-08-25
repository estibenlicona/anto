import { Avatar } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Tres tamaños, mismo fondo neutro.",
  caption: "size: small · medium · large",
};

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="small" label="María González">
        MG
      </Avatar>
      <Avatar size="medium" label="Julián Pérez">
        JP
      </Avatar>
      <Avatar size="large" label="Laura Ruiz">
        LR
      </Avatar>
    </div>
  );
}
