## 1. Competencias: retirar el encabezado y reubicar el contador

- [x] 1.1 En `SpanMatrixContainer.tsx`, eliminar el bloque de encabezado (h1 "Competencias", descripción y el `<p>` "N brechas a la vista") y cambiar la raíz `space-y-6` por `flex flex-col gap-2`; dejar un comentario con la intención (el nombre lo pone el breadcrumb; el contador vive en los controles)
- [x] 1.2 En `SpanControls.tsx`, renderizar en el lado derecho un único `<p className="text-body-sm text-neutral-subtle">` con `{n} brecha(s) a la vista` (singular/plural) y, si `span.narrowed`, la continuación "Los totales cuentan sólo las {k} habilidades visibles, de {total}."; conservar y ajustar el comentario sobre decirlo junto al control
- [x] 1.3 En `SpanMatrixContainer.tsx`, quitar el `Button` "Abrir evaluaciones" del aviso de pendientes (y su `div` envolvente si queda sólo el `<p>`); reescribir el comentario para apuntar al "Evaluar a …" del detalle de celda como el camino
- [x] 1.4 En `LeadCareerPlanPage.tsx`, envolver `SpanMatrixContainer` en un `div` con `h1` `sr-only` "Competencias" (patrón de `LeadPeoplePage`) y un comentario que diga por qué

- [x] 1.5 Ajuste tras la revisión: mover `<SpanLegend />` del pie de la zona del mapa al final del `aside` de la columna de apoyo, con comentario; actualizar el comentario de "Dos zonas"

- [x] 1.6 Ajuste tras la revisión: quitar el control de orden de `SpanControls` (y sus props `sort`/`onSortChange`); el contenedor pasa `sort: "gaps"` fijo al hook
- [x] 1.7 Ajuste tras la revisión: fila de notas (aviso de pendientes a la izquierda, `SpanVisibleGaps` a la derecha) encima del filtro; `SpanControls` pasa a la columna del mapa, pegado a la tabla (`gap-2`)

- [x] 1.8 Ajuste tras la revisión: `aside` elástico (`flex-1 min-w-[20rem]`) con rejilla `auto-fit` de 18rem mínimo e `items-start`, para que las tres cards ocupen el ancho sobrante al lado del mapa

## 2. Tests

- [x] 2.1 En `SpanMatrixContainer.test.tsx`: en el test del pie de brechas, afirmar que "6 brechas a la vista" está dentro de la fila de controles (mismo contenedor que el radiogroup "Habilidades visibles"); añadir asserts de que no hay `heading` nivel 1 ni el texto "Brecha entre el nivel que pide cada cargo"
- [x] 2.2 En `SpanMatrixContainer.test.tsx`, cambiar el assert del recorte a la frase fundida (`/6 brechas a la vista\. Los totales cuentan sólo las 5 habilidades visibles, de 9/` o equivalente) y confirmar que "a la vista" aparece una sola vez en esa fila
- [x] 2.3 En `SpanMatrixContainer.test.tsx`, invertir "ofrece abrir las evaluaciones que faltan": el aviso "Sin evaluación cerrada no hay brecha que medir" sigue y no existe el botón "Abrir evaluaciones"; renombrar el test para que describa lo nuevo
- [x] 2.4 Crear `src/pages/LeadCareerPlanPage/LeadCareerPlanPage.test.tsx` que afirme un único `heading` nivel 1 con el texto "Competencias" y clase `sr-only` (siguiendo `LeadPeoplePage.test.tsx`)

- [x] 2.5 Test: la leyenda ("Dónde enfocarse") está dentro del `aside` (rol `complementary`) y no en la zona del mapa

- [x] 2.6 Tests: el contador comparte fila con el aviso de pendientes; el filtro está en la columna del mapa; no existe el radio "Por nombre" y el orden sigue siendo por brechas

## 3. Verificación

- [x] 3.1 `pnpm test` (suites de career-plan y de páginas) en verde y `pnpm lint` sin errores nuevos (quedan los fallos previos y ajenos: `App.test.tsx`, `httpClient`, `set-state-in-effect` en hooks no tocados)
- [x] 3.2 Revisar en el navegador `/app/lead/competencias`: sin título ni descripción, franja del breadcrumb sin acciones, cards primero, contador a la derecha de los controles; acotar a "Técnicas" y ver que el contador y el aviso son una sola frase; aviso de pendientes sin botón; abrir una celda y confirmar que el detalle ofrece "Evaluar a …"
- [x] 3.3 Comparar con `/app/lead/personas` en la misma sesión: misma altura de franja y misma separación entre bloques; entrar al detalle de una persona (`competencias/:personId`) y confirmar que no cambió
