## 1. Dependencias

- [x] 1.1 Agregar `@radix-ui/react-tooltip` y `@radix-ui/react-dropdown-menu` a `packages/components/package.json` y ejecutar `pnpm install` desde la raíz del monorepo.

## 2. Componente Tooltip

- [x] 2.1 Crear `packages/components/src/tooltip.tsx`: monta `Tooltip.Provider` (`delayDuration={500}`) internamente, `Tooltip.Root`/`Trigger asChild`/`Portal`/`Content` de `@radix-ui/react-tooltip`.
- [x] 2.2 Props: `content` (nodo/string), `children` (el disparador), `side?`, `align?`, `className?` — cada prop propia con JSDoc inmediato encima, siguiendo el patrón de `SelectProps`/`ComboboxProps`.
- [x] 2.3 Estilo: `bg-neutral-bold text-neutral-inverse rounded-control px-2.5 py-1.5 text-sm max-w-[240px] shadow-md`, sin ícono ni acción.
- [x] 2.4 `Tooltip.displayName = "Tooltip"`.
- [x] 2.5 Verificar contraste del par `bg-neutral-bold`/`text-neutral-inverse` en modo claro y oscuro reusando el cálculo ya validado para `Toast` (sin recalcular si los tokens no cambiaron).

## 3. Componente Menu

- [x] 3.1 Crear `packages/components/src/menu.tsx`: `Menu` (root, recibe `trigger` y envuelve `DropdownMenu.Root`/`Trigger asChild`/`Portal`/`Content`), `MenuItem`, `MenuSeparator`, sobre `@radix-ui/react-dropdown-menu`.
- [x] 3.2 `Menu` props: `trigger` (nodo), `children` (los `MenuItem`/`MenuSeparator`), `align?`, `side?`, `className?`.
- [x] 3.3 `MenuItem` props: `icon?` (nodo `Icon`), `children` (texto), `destructive?` (boolean), `disabled?`, `onSelect?` — estilo base `text-neutral-default hover:bg-neutral-subtle`, con `destructive` sobreescribiendo a `text-danger-default`.
- [x] 3.4 `MenuSeparator`: `<DropdownMenu.Separator className="border-neutral-default" />` (mismo tono que ya separa filas de `Table` y segmentos de `SegmentedControl`).
- [x] 3.5 Confirmar que navegación con flechas, `Escape`, `Home`/`End` funcionan sin código propio (comportamiento nativo de `@radix-ui/react-dropdown-menu`).
- [x] 3.6 `Menu.displayName`, `MenuItem.displayName`, `MenuSeparator.displayName` asignados.

## 4. Registro

- [x] 4.1 Agregar `"overlays"` a la unión de `category` en `packages/components/registry/definitions.ts`.
- [x] 4.2 Agregar entrada `tooltip` al registro: categoría `overlays`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-tooltip"]`, `dependencies: ["utils", "icon"]`.
- [x] 4.3 Agregar entrada `menu` al registro: categoría `overlays`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-dropdown-menu"]`, `dependencies: ["utils", "icon"]`.
- [x] 4.4 Agregar `export * from "./tooltip"` y `export * from "./menu"` a `packages/components/src/index.ts`.
- [x] 4.5 Ejecutar `pnpm --filter @tuya-ui/components build` para regenerar `registry.json` y confirmar que ambos componentes extraen props, peso y código fuente correctamente.

## 5. Documentación

- [x] 5.1 Crear `apps/docs/src/content/tooltip.tsx` (uso, anatomía, accesibilidad) siguiendo la forma de `apps/docs/src/content/types.ts`.
- [x] 5.2 Crear `apps/docs/src/content/menu.tsx`, incluyendo guía de uso sobre el orden y divisor del ítem destructivo (no forzado por el componente).
- [x] 5.3 Crear ejemplos en vivo en `apps/docs/src/examples/tooltip/*.tsx` (uso básico sobre un ícono/botón).
- [x] 5.4 Crear ejemplos en vivo en `apps/docs/src/examples/menu/*.tsx`, incluido un menú de fila con `edit`/`duplicate`/`delete` y el ítem destructivo separado por `MenuSeparator`.
- [x] 5.5 Registrar `tooltipContent`/`menuContent` en `apps/docs/src/content/index.ts` con las claves `"tooltip"` y `"menu"`.

## 6. Cierre

- [x] 6.1 Levantar el sitio de docs y verificar manualmente: Tooltip aparece con retraso y desaparece sin retraso (hover y foco por teclado); Menu se abre, navega con flechas, cierra con Escape devolviendo el foco al disparador, y Home/End saltan a los extremos.
- [x] 6.2 Verificar visualmente el ítem destructivo de Menu: color distinguible, separado por `MenuSeparator`, último de la lista en el ejemplo.
- [x] 6.3 Grep rápido de valores hex/px sueltos en `tooltip.tsx`/`menu.tsx` fuera del `max-w-[240px]` ya decidido en design.md.
- [x] 6.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en la raíz del monorepo y dejar los tres en verde.
