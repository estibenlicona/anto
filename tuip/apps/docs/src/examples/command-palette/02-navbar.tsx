import { useState } from "react";
import {
  CommandPalette,
  CommandPaletteEmpty,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
  Navbar,
} from "@tuya-ui/components";

export const meta = {
  title: "Integración con Navbar",
  description: 'El caso que asume la propia definición: onSearch de Navbar abre este mismo CommandPalette.',
  caption: 'Navbar onSearch={() => setOpen(true)}',
};

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-surface border border-neutral-default">
      <Navbar
        product="Capacidad"
        onSearch={() => setOpen(true)}
        user={{ name: "Sofía Ramos", role: "Admin", initials: "SR" }}
        userMenu={[{ label: "Cerrar sesión", onSelect: () => {} }]}
      />
      <CommandPalette label="Comandos" open={open} onOpenChange={setOpen}>
        <CommandPaletteInput placeholder="Escribe un comando o buscá…" />
        <CommandPaletteList>
          <CommandPaletteEmpty>Sin resultados.</CommandPaletteEmpty>
          <CommandPaletteGroup heading="Navegación">
            <CommandPaletteItem onSelect={() => setOpen(false)}>Ir a Capacidad</CommandPaletteItem>
            <CommandPaletteItem onSelect={() => setOpen(false)}>Ir a Facturación</CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
}
