## 1. Componente

- [x] 1.1 Crear `packages/components/src/tag.tsx` con `TagColor = "gray" | "green" | "blue" | "amber" | "red" | "purple"` y `TagProps extends HTMLAttributes<HTMLSpanElement>` con `color?: TagColor`, por defecto `"gray"`.
- [x] 1.2 Definir la tabla de mapeo hue → escala de rol (`gray→neutral`, `green→success`, `blue→info`, `amber→warning`, `red→danger`, `purple→discovery`), siguiendo la forma que ya usa `Badge` para sus variantes.
- [x] 1.3 Renderizar un `<span>` de relleno sólido con `bg-{rol}-bold` y `text-{rol}-on-bold`, sin punto indicador y sin `role="status"`. Verificar que los seis roles tengan ambos tokens. Forma: `rounded-pill`, NO `rounded-control` — la doc de `Badge` ya promete que Tag y Badge "se distinguen también por forma, píldora en vez de cuadrada". Ver la decisión agregada en design.md.
- [x] 1.4 Documentar en el JSDoc de `color` que el color no significa nada, que conviene fijar uno por miembro y mantenerlo estable, y que `brand` queda excluido por estar reservado a la acción principal de una vista.
- [x] 1.5 Exportar desde `packages/components/src/index.ts` con `export * from "./tag";`.

## 2. Registro

- [x] 2.1 Agregar la entrada de `tag` en `packages/components/registry/definitions.ts` (junto a `badge`, categoría `feedback`, `status: "stable"`, `dependencies: ["utils"]`, `extendsElement: "span"`, archivo `src/tag.tsx` → `components/ui/tag.tsx`), con una `description` que lo distinga de Badge.
- [x] 2.2 Reconstruir el paquete y confirmar que `tag` aparece en el registry generado y en la skill.

## 3. Documentación

- [x] 3.1 Crear `apps/docs/src/content/tag.tsx` con `usage`, `anatomy` y `accessibility`, incluyendo un par `do`/`dont` que establezca explícitamente cuándo va `Tag` y cuándo `Badge` — el spec lo exige como requisito, no como nota opcional.
- [x] 3.2 Registrar `tagContent` en `apps/docs/src/content/index.ts` (import + entrada en el mapa).
- [x] 3.3 Crear `apps/docs/src/examples/tag/01-conjunto-de-colores.tsx` mostrando un conjunto completo (p. ej. las tallas XS–XL) con un color por miembro.
- [x] 3.4 Agregar al ejemplo o a la anatomía el caso de `Tag` dentro de una celda de `Table`, que es el uso que motivó el componente.
- [x] 3.5 Confirmar que la página de Tag aparece en la navegación del sitio y que la tabla de props se genera con `color` y su valor por defecto. Verificado: "Tag" aparece en el sidebar bajo Feedback tras Badge, y la tabla de props lista `color` con su tipo completo y default `gray`.

## 4. Verificación

- [x] 4.1 Renderizar los seis colores y confirmar que el texto es legible sobre cada relleno. Los seis renderizan legibles, incluido `amber`, que era el caso marginal por ser el tono más claro.
- [x] 4.2 Confirmar que un `Tag` sin `color` sale neutro.
- [x] 4.3 Confirmar en el árbol de accesibilidad que `Tag` se expone como su texto y no como región de estado, a diferencia de `Badge`. Verificado en fuente y build: el único `role=` en tag.tsx está en un comentario; `role="status"` no aparece en el JSX de Tag.
- [x] 4.4 Comprobar que `Badge` y `Chip` no cambiaron su render. `badge.tsx` y `chip.tsx` no figuran entre los archivos modificados.
- [x] 4.5 Correr `tsc --noEmit` en `packages/components` y `apps/docs`, y reconstruir el paquete.
