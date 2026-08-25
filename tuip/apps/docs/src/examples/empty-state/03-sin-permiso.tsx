import { EmptyState, Icon } from "@tuya-ui/components";

export const meta = {
  title: "Sin permiso",
  description: "El usuario no tiene acceso a este contenido — el texto dice a quién pedirlo, en vez de una acción que no puede resolver por su cuenta.",
  caption: "el título y la descripción reemplazan a la acción cuando no hay nada que el usuario pueda hacer",
};

export default function Example() {
  return (
    <EmptyState
      icon={<Icon name="status-locked" size={32} />}
      title="No tenés acceso a esta célula"
      description="Pedile a tu lead de capacidad que te agregue como colaborador."
    />
  );
}
