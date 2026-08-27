## Context

`Table` renderiza hoy un solo `div` (`overflow-x-auto`, con `rounded-surface border-default border-neutral-default` salvo `flush`) que contiene el `<table>`; ese mismo `div` es el `scroller` que `stickyFirstColumn` observa para pintar `data-scrolled`. No hay ninguna zona fuera del `<table>` donde poner contenido.

Dos decisiones previas pesan sobre este change:

- `add-table-toolbar` (2026-08-11) rechazó fundir el borde de un `TableToolbar` con el de Table porque exigía que Table "supiera" si tenía un vecino arriba o abajo: acoplamiento entre componentes independientes.
- `modernize-table-suite` (2026-08-24) eliminó `TableToolbar` y fijó que búsqueda y filtros van sueltos sobre el fondo de la página, "sin un contenedor de reemplazo, porque el punto es justamente no tener uno".

La primera objeción no aplica a un slot: Table no adivina a un vecino, recibe la barra como prop y la renderiza ella. La segunda es la que este change revierte, a pedido del consumidor: los cinco listados de Gestión de Capacidad construyeron la caja a mano (ver proposal.md — Why). El requisito de Angular que cita el pedido —proyectar un componente dentro de otro— en React es exactamente una prop de tipo `ReactNode`.

## Goals / Non-Goals

**Goals:**
- Dos slots genéricos (`toolbar`, `footer`) que Table envuelve en un marco único cuando existen.
- Cero cambio de markup y estilo para toda Table que no use slots.
- `stickyFirstColumn` y `flush` siguen funcionando con slots.

**Non-Goals:**
- Un componente `TableToolbar`/`TableCard` nuevo, o un slot para estados vacíos/carga: eso es contenido de la tabla y lo compone el consumidor (una fila de ancho completo).
- Lógica de búsqueda, filtro o paginación dentro de Table.
- Cambiar `PaginationBar`, `SearchField` o `FilterButton`.
- Tocar la geometría de `Card`.

## Decisions

**1. Slots como props `toolbar?: ReactNode` y `footer?: ReactNode`, no como hijos especiales.**
Los hijos de Table son partes de `<table>` (`TableHeader`, `TableBody`…); mezclar ahí un `<TableToolbar>` obligaría a Table a inspeccionar `children` y extraer piezas, que es lo que `modernize-table-suite` y `add-table` evitaron con `columns`/`rows`. Una prop de nodo es el equivalente React de una plantilla proyectada, y es lo que ya hacen `Alert` (`action`) y `EmptyState` (`action`). Alternativa considerada: contexto + `<TableToolbar>` como hijo que "sube" al marco vía portal — más maquinaria para el mismo resultado.

**2. El marco aparece sólo si hay algún slot; sin slots, el `scroller` sigue siendo la raíz.**
```
sin slots:   <div scroller rounded border> <table/> </div>            (idéntico a hoy)
con slots:   <div frame rounded border>
               [<div toolbar border-b px-4 py-3>…</div>]
               <div scroller overflow-x-auto> <table/> </div>
               [<div footer border-t bg-neutral-subtlest px-4 py-3>…</div>]
             </div>
```
Envolver siempre en el marco cambiaría el árbol de todas las tablas existentes (tests de consumidores que hacen `closest`/`parentElement`, snapshots) sin darles nada. El costo es una rama condicional en un solo componente. `border-default border-neutral-default rounded-surface` y `bg-neutral-default` viajan a la raíz que corresponda en cada rama.

**3. Los slots viven fuera del `scroller`.**
Dentro de él, la barra se desplazaría junto con las columnas y sus popovers (`FilterButton`, `Menu`) quedarían recortados por `overflow-x-auto`. Fuera, el `scroller` sigue siendo el mismo `div` con `ref` y `data-scrolled`, así que `stickyFirstColumn` no cambia ni una línea. El marco no lleva `overflow-hidden` —la advertencia de la documentación sigue vigente— y las esquinas se resuelven por zona: la barra redondea arriba, el pie abajo, y el `scroller` sólo el lado donde no hay slot (sus corners los recorta su propio `overflow`, como hoy). Fondos: barra `bg-neutral-default` (es contenido, como el cuerpo); pie `bg-neutral-subtlest` (es un pie, como `tfoot` y como el que los consumidores ya pintaban a mano).

**4. Padding de los slots fijo (`px-4 py-3`), independiente de `density`.**
`density` habla del alto de fila y celda; la barra lleva controles de 32–40px cuya altura no cambia con la densidad de la tabla. Ligarlos daría barras apretadas con controles que no encogen. Si una tabla `compact` quiere una barra más baja, el consumidor lo pone en el contenido del slot.

**5. Documentación: el ejemplo "Integración completa" migra a los slots y la nota de "sueltos sobre la página" se reescribe.**
Es el ejemplo que hoy dice "ya no dentro de TableToolbar"; dejarlo así junto a la prop nueva contaría dos historias. Anatomía gana "Barra" y "Pie (slot)"; el `whenNotToUse` sobre búsqueda/filtros pasa a decir que Table no trae la lógica pero sí el lugar. `PropsTable` se alimenta del registro generado desde JSDoc en el build, así que las props nuevas se documentan escribiendo su comentario.

**6. `minor`, no `patch`.**
Prop pública nueva sin romper nada: es la regla de `CONTRIBUTING.md`. Con `0.1.9` como base, changesets produce `0.2.0`; el frontend actualiza la ruta del tarball.

## Risks / Trade-offs

- [Revertir una decisión de hace dos días] → Documentado arriba y en el proposal; la decisión anterior no tenía consumidores reales que la validaran y los que llegaron construyeron lo contrario.
- [Un consumidor pasa `toolbar={null}` o `undefined` esperando el marco] → Se decide por "hay contenido" (`!= null`), no por "se pasó la prop"; sin contenido, sin marco, sin zona vacía. Documentado en el JSDoc.
- [Esquinas: fondo `bg-neutral-subtlest` de la cabecera visible en los corners superiores cuando no hay barra] → Ya ocurre hoy y lo recorta el `overflow` del `scroller`; se conserva el `rounded-t` en el `scroller` en ese caso. Test de clases lo cubre.
- [Alguien monta `overflow-hidden` en el marco para "limpiar" esquinas] → Comentario en el código junto a la advertencia existente sobre sticky.
