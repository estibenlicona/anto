## 1. Dependencias y tokens

- [x] 1.1 Agregar `@radix-ui/react-dialog` a `packages/components/package.json` y ejecutar `pnpm install` desde la raíz del monorepo.
- [x] 1.2 Conectar `overlayWidth` (de `@tuya-ui/tokens`) al tema de `packages/tokens/src/tailwind-preset.ts` (nuevas clases de ancho: `w-modal-sm`, `w-modal-md`, `w-modal-lg`, `w-drawer-sm`, `w-drawer-lg`, `w-popover-min`, `w-popover-max`, `w-tooltip`), sin modificar el valor de ninguna clase existente.

## 2. Componente Modal

- [x] 2.1 Crear `packages/components/src/modal.tsx`: `Modal` (root, `open`/`onOpenChange`/`defaultOpen`, envuelve `Dialog.Root`/`Portal`/`Overlay`/`Content`), `ModalHeader`, `ModalBody`, `ModalFooter`.
- [x] 2.2 `Modal` props: `open?`, `onOpenChange?`, `defaultOpen?`, `size?` ("sm" | "md" | "lg", default "sm", mapea a `w-modal-*`), `children`, `className?` — cada prop con JSDoc.
- [x] 2.3 `ModalHeader` props: `title` (renderizado como `Dialog.Title`), `children?` (contenido extra junto al título) — incluye el botón de cerrar (`Dialog.Close asChild` + `Icon name="close" size={20}`).
- [x] 2.4 `ModalBody`/`ModalFooter`: contenedores presentacionales siguiendo el vocabulario de `CardBody`/`CardFooter`; `ModalBody` pasa `aria-describedby={undefined}` a `Dialog.Content` para declarar deliberadamente que no hay descripción.
- [x] 2.5 Estilo: overlay `fixed inset-0 z-overlay bg-neutral-bold/40`; contenido centrado `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-overlay max-h-[85vh] flex flex-col rounded-surface bg-neutral-default shadow-lg`.
- [x] 2.6 `Modal.displayName`, `ModalHeader.displayName`, `ModalBody.displayName`, `ModalFooter.displayName` asignados.

## 3. Componente Drawer

- [x] 3.1 Crear `packages/components/src/drawer.tsx`: `Drawer` (root, mismo shape de props que `Modal`), `DrawerHeader`, `DrawerBody`, `DrawerFooter`.
- [x] 3.2 `Drawer` props: `open?`, `onOpenChange?`, `defaultOpen?`, `size?` ("sm" | "lg", default "sm", mapea a `w-drawer-*`), `children`, `className?`.
- [x] 3.3 `DrawerHeader` props: `title`, `eyebrow?` (etiqueta corta sobre el título, como "Capacidad" en el mockup), `children?` — mismo botón de cerrar que `ModalHeader`.
- [x] 3.4 `DrawerBody`/`DrawerFooter`: `DrawerBody` con `flex-1 overflow-y-auto` (el panel ocupa toda la altura, a diferencia del Modal que se ajusta a su contenido); mismo `aria-describedby={undefined}` que `ModalBody`.
- [x] 3.5 Estilo: overlay igual al de Modal; contenido `fixed inset-y-0 right-0 z-overlay flex h-full flex-col bg-neutral-default shadow-lg`, con animación de entrada/salida deslizándose desde `translate-x-full` a `translate-x-0` vía los data-state de Radix (transición pura con `transition-transform` + `data-[state=]`, sin el plugin `tailwindcss-animate`, que el proyecto no usa en ningún otro lado).
- [x] 3.6 `Drawer.displayName`, `DrawerHeader.displayName`, `DrawerBody.displayName`, `DrawerFooter.displayName` asignados.

## 4. Registro

- [x] 4.1 Agregar entrada `modal` al registro: categoría `overlays`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-dialog"]`, `dependencies: ["utils", "icon"]`.
- [x] 4.2 Agregar entrada `drawer` al registro: categoría `overlays`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-dialog"]`, `dependencies: ["utils", "icon"]`.
- [x] 4.3 Agregar `export * from "./modal"` y `export * from "./drawer"` a `packages/components/src/index.ts`.
- [x] 4.4 Ejecutar `pnpm --filter @tuya-ui/components build` para regenerar `registry.json` y confirmar que ambos componentes extraen props, peso y código fuente correctamente.

## 5. Documentación

- [x] 5.1 Crear `apps/docs/src/content/modal.tsx` (uso, anatomía, accesibilidad), incluyendo la guía "Modal para decidir, Drawer para consultar" del mockup. La figura de anatomía usa una réplica de las clases de superficie en vez del componente real abierto — Modal es `position: fixed` y taparía la página de documentación, el mismo trade-off que ya hace el contenido de Toast.
- [x] 5.2 Crear `apps/docs/src/content/drawer.tsx`, con la misma guía desde el ángulo de Drawer y la misma réplica no-fixed para su figura de anatomía.
- [x] 5.3 Crear ejemplos en vivo en `apps/docs/src/examples/modal/*.tsx`: la confirmación destructiva del mockup («¿Eliminar la iniciativa?») y una variante de tamaño.
- [x] 5.4 Crear ejemplos en vivo en `apps/docs/src/examples/drawer/*.tsx`: el detalle de fila del mockup (capacidad de una persona, con acción de rebalancear).
- [x] 5.5 Registrar `modalContent`/`drawerContent` en `apps/docs/src/content/index.ts` con las claves `"modal"` y `"drawer"`.

## 6. Cierre

- [x] 6.1 Levantar el sitio de docs y verificar manualmente: foco atrapado dentro de Modal/Drawer al tabular, Escape cierra ambos, el foco vuelve al botón que los abrió. Se encontró y corrigió un bug real acá: sin `Dialog.Trigger`, Radix no tenía a quién devolver el foco y caía a `document.body` — resuelto capturando el elemento activo en `onOpenAutoFocus` y restaurándolo a mano en `onCloseAutoFocus`, en ambos componentes. Verificado con un clic real (no `.click()` sintético) vía CDP: el foco vuelve exactamente al botón disparador.
- [x] 6.2 Verificar que un Select o Combobox abierto desde dentro de un Modal o Drawer flota por encima de su contenido (confirma que `z-overlay` < `z-menu` funciona sin ajuste especial). Verificado a nivel de CSS generado: `.z-overlay{z-index:400}` y `.z-menu{z-index:600}`, la misma capa que ya usan Select/Combobox/Menu/Tooltip.
- [x] 6.3 Verificar que ninguna clase de `overlayWidth` agregada al preset cambió el valor de una clase de Tailwind existente (diff de la config generada, no solo lectura del archivo). Confirmado en el CSS generado: `w-full` y el resto de la escala numérica de Tailwind siguen presentes sin cambios, junto a las clases nuevas (`w-modal-sm`, `w-drawer-lg`, etc.).
- [x] 6.4 Grep rápido de valores hex/px sueltos en `modal.tsx`/`drawer.tsx`.
- [x] 6.5 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en la raíz del monorepo y dejar los tres en verde.
