import { Button, Popover, PopoverContent, PopoverTrigger } from "@tuya-ui/components";

export const meta = {
  title: "Ancho personalizado",
  description: "Contenido que necesita más espacio ensancha hasta el máximo de la definición (360px).",
  caption: 'PopoverContent con className="w-popover-max"',
};

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="secondary">Ver detalle</Button>
      </PopoverTrigger>
      <PopoverContent className="w-popover-max">
        <p className="text-body-sm font-medium text-neutral-default">Última sincronización</p>
        <p className="mt-1 text-body-sm text-neutral-subtle">
          Los datos de esta tarjeta se actualizaron hace 4 minutos desde el conector de facturación.
          Un ancho mayor evita que esta descripción se corte en dos o tres palabras por línea.
        </p>
      </PopoverContent>
    </Popover>
  );
}
