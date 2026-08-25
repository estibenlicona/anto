import { EmptyState, Icon } from "@tuya-ui/components";

export const meta = {
  title: "Sin resultados",
  description: "Un filtro o una búsqueda no arrojó resultados — sin acción de creación, porque no es lo que corresponde acá.",
  caption: "sin action: invita a ajustar la búsqueda, no a crear algo nuevo",
};

export default function Example() {
  return (
    <EmptyState
      icon={<Icon name="search" size={32} />}
      title="Sin resultados para “backend platform”"
      description="Probá con otro término o limpiá los filtros activos."
    />
  );
}
