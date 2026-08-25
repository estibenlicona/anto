import { Button, Icon, Tooltip } from "@tuya-ui/components";

export const meta = {
  title: "Botón de solo ícono",
  description: "Aclara qué hace un botón que no tiene texto propio.",
  caption: "Tooltip content=\"...\" — aparece a los 500ms de hover o foco",
};

export default function Example() {
  return (
    <Tooltip content="Duplicar iniciativa">
      <Button variant="secondary">
        <Icon name="duplicate" size={16} />
      </Button>
    </Tooltip>
  );
}
