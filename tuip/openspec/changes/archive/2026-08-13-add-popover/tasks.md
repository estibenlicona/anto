## 1. Componente

- [x] 1.1 Crear `packages/components/src/popover.tsx` con `Popover` (envoltorio de `Root`, soporta `open`/`defaultOpen`/`onOpenChange`)
- [x] 1.2 Implementar `PopoverTrigger` (envoltorio de `Trigger` con `asChild`), siguiendo el patrón de disparador explícito de `Menu`
- [x] 1.3 Implementar `PopoverContent` con ancho por defecto `w-popover-min` (280px), padding `p-4` (16px), capa `z-menu`, `rounded-control border border-neutral-default bg-neutral-default shadow-md`, y props `side`/`align`/`sideOffset` (default `bottom`/`start`/4, igual que `Menu`)
- [x] 1.4 Verificar cierre con Escape y con clic afuera, y que el foco vuelve al disparador al cerrar

## 2. Registro en el catálogo

- [x] 2.1 Agregar la entrada `popover` en `packages/components/registry/definitions.ts` (categoría `overlays`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-popover"]`, `files` apuntando a `src/popover.tsx`)
- [x] 2.2 Exportar `Popover`, `PopoverTrigger`, `PopoverContent` desde `packages/components/src/index.ts`

## 3. Documentación

- [x] 3.1 Crear `apps/docs/src/content/popover.tsx` con uso, anatomía y accesibilidad, incluida la aclaración de que Popover es para consultar u operar sin bloquear el flujo (filtros, selección) y no para una decisión que debe resolverse antes de continuar (eso sigue siendo Modal)
- [x] 3.2 Crear `apps/docs/src/examples/popover/01-filtros.tsx` (caso de uso principal de la definición: filtro de columna)
- [x] 3.3 Crear `apps/docs/src/examples/popover/02-ancho-personalizado.tsx` (`className="w-popover-max"`)
- [x] 3.4 Registrar `popoverContent` en `apps/docs/src/content/index.ts`

## 4. Spec

- [x] 4.1 Confirmar que `openspec/specs/component-library/spec.md` refleja, tras archivar el cambio, el catálogo actualizado y los requisitos de `Popover`
