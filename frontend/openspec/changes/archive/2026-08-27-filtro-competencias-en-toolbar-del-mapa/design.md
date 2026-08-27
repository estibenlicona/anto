## Context

Hoy la zona del mapa es `<div class="flex min-w-0 max-w-full flex-col gap-2">` con `SpanControls` (el filtro) y `SpanMatrixTable` apilados; al lado, el `aside` elástico con las cards. `SpanMatrixTable` monta `Table` de tuip con `density="matrix"` y `stickyFirstColumn`, sin `flush`: la propia `Table` dibuja el marco. Desde `table-slots-toolbar-footer` (tuip 0.1.10, ya instalado), `Table` acepta `toolbar` y, con contenido, envuelve barra + tabla en un único marco, con la barra fuera del scroller y `stickyFirstColumn` intacto (probado en tuip). Ver proposal.md — Why y el lienzo "Alineación del mapa de competencias", opción B.

## Goals / Non-Goals

**Goals:**
- Mapa y cards arrancan en la misma línea; el filtro queda dentro de la card del mapa.
- Reutilizar el slot de tuip tal cual; ningún cambio en la librería.

**Non-Goals:**
- Tocar la fila de notas, el `aside`, `SpanControls` o el detalle de celda.
- Un `footer` para el mapa (no hay paginación).

## Decisions

**1. `SpanMatrixTable` expone `toolbar?: ReactNode` y lo reenvía a `Table`.**
Es la pieza que ya monta `Table`; añadir la prop es una línea y deja al contenedor decidir qué va en la barra. Alternativa: que `SpanMatrixTable` importe y renderice `SpanControls` con sus props — acopla la tabla a un control que no es suyo y obliga a pasar `groups`/`onGroupsChange` a través. El slot genérico es exactamente para esto.

**2. El contenedor pasa `toolbar={<SpanControls …/>}` y la columna del mapa se queda sólo con la tabla.**
El `div` de la columna sigue existiendo (`min-w-0 max-w-full` son lo que impide que una matriz ancha rompa el layout); pierde su `gap-2` porque ya no apila nada. `SpanControls` conserva su wrapper `flex flex-wrap items-center gap-3`: dentro de la barra (que ya es flex con `gap-3`) no molesta y mantiene el componente utilizable fuera.

**3. Tests: el filtro se localiza dentro del marco de `Table`.**
Con slot, el árbol es `marco > [barra, scroller > table]`. Los asserts que hoy usan `table.parentElement.parentElement` como "columna del mapa" pasan a leerlo como "marco del mapa": contiene el radio "Técnicas" y no contiene la leyenda. Se añade un caso que acota desde la barra y comprueba que el scroller sigue con `data-scrolled` (columna fija viva).

**4. La spec principal recupera su estructura a mano; el delta sólo lleva el filtro.**
`openspec validate` exige que un MODIFIED conserve todos los escenarios del requisito, así que no sirve para mover "Una sola brecha" y "Sin matriz" al requisito de la fila de notas. Es una corrección de forma sin cambio de comportamiento, y ese tipo de edición va directamente sobre `openspec/specs/…` (misma regla que para el Purpose). Hecha al proponer este change. El delta queda con un único MODIFIED, el del filtro, que conserva el nombre del escenario "Filtro sobre el mapa" con su contenido nuevo y añade "Mapa y columna de apoyo alineados" y "Acotar desde la barra".

**5. Un solo paso de 12px: `gap-3` en toda la pantalla y `py-3` en el shell.**
Pedido tras la revisión. Convivían cuatro medidas (raíz `gap-2`, fila de notas `gap-x-6`, mapa ↔ columna `gap-6`, rejilla `gap-4`, cards de resumen `gap-4`) y el shell separaba franja y contenido con 8+8. Todo pasa a 12px, incluido el `py` de la franja y del `<main>` en `ChapterLeadLayout`; esto último es compartido, así que Células, Personas, Ausencias y las demás ganan 4px por lado entre breadcrumb y contenido (sus `gap-2` internos no se tocan: quedan como los definieron sus changes). Los gaps internos de cada card (`gap-3` en focus/pendientes/leyenda) ya coincidían.

## Risks / Trade-offs

- [El mapa gana ~46px de alto (la barra)] → Es el coste asumido en la opción B; lo compensa el alineado y la coherencia con los listados.
- [La barra de `Table` usa `px-4 py-3` fijos; el control segmentado mide 36px] → Barra de 60px, igual que en Células; nada que ajustar.
- [Un test localiza la leyenda "fuera del mapa" por `parentElement.parentElement`] → Se reescribe con el marco como referencia; sigue verdadero.
