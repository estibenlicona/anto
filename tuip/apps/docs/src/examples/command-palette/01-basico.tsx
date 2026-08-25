import { useState } from "react";
import {
  Button,
  CommandPalette,
  CommandPaletteEmpty,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
} from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Se abre con el botón o con ⌘K / Ctrl+K desde cualquier parte de la pantalla.",
  caption: "CommandPalette open={open} onOpenChange={setOpen}",
};

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Buscar (⌘K)
      </Button>
      <CommandPalette label="Comandos" open={open} onOpenChange={setOpen}>
        <CommandPaletteInput placeholder="Escribe un comando o buscá…" />
        <CommandPaletteList>
          <CommandPaletteEmpty>Sin resultados.</CommandPaletteEmpty>
          <CommandPaletteGroup heading="Navegación">
            <CommandPaletteItem onSelect={() => setOpen(false)}>Ir a Capacidad</CommandPaletteItem>
            <CommandPaletteItem onSelect={() => setOpen(false)}>Ir a Facturación</CommandPaletteItem>
          </CommandPaletteGroup>
          <CommandPaletteGroup heading="Acciones">
            <CommandPaletteItem onSelect={() => setOpen(false)}>Crear célula</CommandPaletteItem>
            <CommandPaletteItem onSelect={() => setOpen(false)}>Exportar reporte</CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </>
  );
}
