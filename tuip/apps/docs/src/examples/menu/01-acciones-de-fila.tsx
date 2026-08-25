import { Button, Icon, Menu, MenuItem, MenuSeparator } from "@tuya-ui/components";

export const meta = {
  title: "Acciones de fila",
  description: "Editar y Duplicar arriba; Eliminar al final, separado y en el rol de peligro.",
  caption: "Menu trigger=... — MenuItem con icon y destructive, MenuSeparator entre grupos",
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
      <MenuItem icon={<Icon name="duplicate" size={16} />} onSelect={() => {}}>
        Duplicar
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Icon name="delete" size={16} />} destructive onSelect={() => {}}>
        Eliminar
      </MenuItem>
    </Menu>
  );
}
