## 1. Componente

- [x] 1.1 Crear `packages/components/src/command-palette.tsx` con `CommandPalette` (envoltorio de `Dialog.Root` + `Command` de `cmdk`, soporta `open`/`onOpenChange`)
- [x] 1.2 Registrar el listener de `⌘K`/`Ctrl+K` a nivel de documento dentro de un `useEffect`, agregado al montar y quitado al desmontar
- [x] 1.3 Implementar `CommandPaletteGroup` y `CommandPaletteItem` (envoltorios de `Command.Group`/`Command.Item` de `cmdk`) — más `CommandPaletteInput`, `CommandPaletteList` y `CommandPaletteEmpty`, necesarios para que el componente sea usable sin recurrir a las primitivas crudas de `cmdk`
- [x] 1.4 Implementar el estado "sin resultados" cuando el texto escrito no coincide con ningún ítem
- [x] 1.5 Verificar cierre con Escape y que el foco vuelve al elemento que lo tenía antes de abrirse

## 2. Registro en el catálogo

- [x] 2.1 Agregar la entrada `command-palette` en `packages/components/registry/definitions.ts` (categoría `overlays`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-dialog", "cmdk"]`, `files` apuntando a `src/command-palette.tsx`)
- [x] 2.2 Exportar `CommandPalette`, `CommandPaletteGroup`, `CommandPaletteItem` desde `packages/components/src/index.ts`

## 3. Documentación

- [x] 3.1 Crear `apps/docs/src/content/command-palette.tsx` con uso, anatomía y accesibilidad, incluida la aclaración de que se monta una sola vez por aplicación
- [x] 3.2 Crear `apps/docs/src/examples/command-palette/01-basico.tsx` (atajo `⌘K` + lista de comandos filtrable)
- [x] 3.3 Crear `apps/docs/src/examples/command-palette/02-navbar.tsx` (integración con `Navbar` vía `onSearch`)
- [x] 3.4 Registrar `commandPaletteContent` en `apps/docs/src/content/index.ts`

## 4. Spec

- [x] 4.1 Confirmar que `openspec/specs/component-library/spec.md` refleja, tras archivar el cambio, el catálogo actualizado y los requisitos de `CommandPalette`
