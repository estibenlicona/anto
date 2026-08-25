import { Button, Icon, Menu, MenuItem, MenuSeparator } from "@tuya-ui/components";

export const meta = {
  title: "Ítem deshabilitado",
  description: "Un ítem individual puede deshabilitarse sin afectar al resto del menú.",
  caption: "MenuItem disabled — fuera de la navegación por teclado",
};

export default function Example() {
  return (
    <Menu
      trigger={
        <Button variant="secondary">
          <Icon name="more" size={16} label="Más acciones" />
        </Button>
      }
    >
      <MenuItem icon={<Icon name="edit" size={16} />} onSelect={() => {}}>
        Editar
      </MenuItem>
      <MenuItem icon={<Icon name="duplicate" size={16} />} disabled>
        Duplicar
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Icon name="delete" size={16} />} destructive onSelect={() => {}}>
        Eliminar
      </MenuItem>
    </Menu>
  );
}
