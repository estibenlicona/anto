import { Button, Checkbox, Icon, Popover, PopoverContent, PopoverTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Filtro de columna",
  description: "El caso de uso principal de Popover: filtros de columna, selectores múltiples.",
  caption: "Popover anclado a un botón de filtro",
};

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="secondary">
          <Icon name="filter" size={16} />
          Estado
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <p className="text-body-sm font-medium text-neutral-default">Filtrar por estado</p>
          <label className="flex items-center gap-2 text-body-sm text-neutral-default">
            <Checkbox defaultChecked /> Activo
          </label>
          <label className="flex items-center gap-2 text-body-sm text-neutral-default">
            <Checkbox /> Pausado
          </label>
          <label className="flex items-center gap-2 text-body-sm text-neutral-default">
            <Checkbox /> Archivado
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
