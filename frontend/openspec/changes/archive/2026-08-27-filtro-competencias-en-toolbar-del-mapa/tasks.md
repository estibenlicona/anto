## 1. Filtro dentro del mapa

- [x] 1.1 En `SpanMatrixTable.tsx`, añadir `toolbar?: React.ReactNode` a `SpanMatrixTableProps` (JSDoc: barra superior de la card del mapa, fuera del scroll) y pasarlo a `<Table toolbar={toolbar} …>`
- [x] 1.2 En `SpanMatrixContainer.tsx`, quitar `<SpanControls …/>` de la columna del mapa y pasarlo como `toolbar` de `SpanMatrixTable`; quitar el `gap-2` del `div` de la columna y actualizar sus comentarios (el filtro va en la barra de la card)

## 2. Tests

- [x] 2.1 En `SpanMatrixContainer.test.tsx`, reescribir el assert "el filtro está en la columna del mapa" como "el filtro está dentro del marco de Table" (`table.parentElement.parentElement` contiene el radio "Técnicas" y ese marco no contiene el contador ni el aviso de pendientes)
- [x] 2.2 Ajustar el test de la leyenda: el marco del mapa no contiene "Dónde enfocarse"; comentario actualizado
- [x] 2.3 Añadir un caso: acotar a "Técnicas" desde la barra deja la barra montada y el scroller sigue con `data-scrolled` (columna fija viva con slot)

- [x] 2.4 Ajuste tras la revisión: `gap-3` en raíz, fila de notas, zona mapa ↔ columna, rejilla de la columna y grid de cards de resumen; `py-3` en la franja del breadcrumb y el `<main>` de `ChapterLeadLayout`; specs `span-matrix-view` (espaciado) y `lead-shell-page-actions` (padding) actualizadas por delta

## 3. Verificación

- [x] 3.1 `pnpm test` (career-plan y página) en verde, `tsc --noEmit` sin errores nuevos y eslint limpio en los archivos tocados
- [x] 3.2 Revisar en el navegador `/app/lead/competencias`: el marco del mapa y la primera card de la columna arrancan a la misma altura; el filtro dentro de la card; acotar a "Técnicas" y desplazar horizontalmente para ver la columna fija y su sombra; comparar con Células (misma barra `px-4 py-3`)
