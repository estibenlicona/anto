import { Button, EmptyState, Icon } from "@tuya-ui/components";

export const meta = {
  title: "Sin datos aún",
  description: "La lista todavía no tiene ningún elemento — la acción invita a crear el primero.",
  caption: "icon + title + description + action",
};

export default function Example() {
  return (
    <EmptyState
      icon={<Icon name="status-empty" size={32} />}
      title="Aún no hay iniciativas en este chapter"
      description="Cuando crees la primera, aparecerá aquí con su estimación y las células asignadas."
      action={<Button variant="primary">Crear iniciativa</Button>}
    />
  );
}
