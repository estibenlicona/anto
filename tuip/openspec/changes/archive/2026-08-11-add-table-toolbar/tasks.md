## 1. Componente Pagination

- [x] 1.1 Construir `Pagination` controlado (`page`, `pageCount`, `onPageChange`): botones anterior/siguiente, números de página
- [x] 1.2 Puntos suspensivos cuando el rango de páginas no cabe completo, conservando primera, última y actual visibles
- [x] 1.3 Deshabilitar anterior/siguiente en los límites
- [x] 1.4 Verificar con teclado: foco visible, Enter/Espacio activan cada control
- [x] 1.5 Declarar props públicas con tipos explícitos y descripciones

## 2. Componente Chip

- [x] 2.1 Construir `Chip` con label y botón de cierre (`onRemove`)
- [x] 2.2 Verificar con teclado: foco visible en el botón de cierre, Enter/Espacio lo activan, con `aria-label` sobre qué se remueve
- [x] 2.3 Declarar props públicas con tipos explícitos y descripciones

## 3. Componente SegmentedControl

- [x] 3.1 Construir `SegmentedControl` controlado (`options`, `value`, `onChange`)
- [x] 3.2 Verificar con teclado: flechas mueven foco y selección juntos dentro del grupo
- [x] 3.3 Declarar props públicas con tipos explícitos y descripciones

## 4. Componente TableToolbar

- [x] 4.1 Construir `TableToolbar` como contenedor de layout (fila, espaciado, borde), sin controles propios
- [x] 4.2 Declarar props públicas con tipos explícitos y descripciones

## 5. Extensiones de Table

- [x] 5.1 Agregar contexto de densidad a `Table` (`density?: "comfortable" | "compact"`, por defecto `"comfortable"`) consumido por `TableHead` y `TableCell`
- [x] 5.2 Verificar que Table sin `density` explícita se ve idéntica a como se veía antes de este change
- [x] 5.3 Agregar `sortDirection`/`onSort` a `TableHead`: ícono de orden, `aria-sort`, manejo de click y teclado cuando `onSort` está presente
- [x] 5.4 Verificar con teclado que una TableHead ordenable es accesible como botón (foco visible, Enter/Espacio)
- [x] 5.5 Declarar las props nuevas de `Table` y `TableHead` con tipos explícitos y descripciones

## 6. Registro

- [x] 6.1 Añadir las entradas `pagination` (`actions`), `chip` (`feedback`), `segmented-control` (`forms`) y `table-toolbar` (`layout`) a `definitions.ts`, todas `status: "stable"`
- [x] 6.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos para los cuatro, y que las props nuevas de `Table`/`TableHead` aparecen en su tabla de props existente

## 7. Documentación

- [x] 7.1 Escribir `content/pagination.tsx`, `content/chip.tsx`, `content/segmented-control.tsx`, `content/table-toolbar.tsx`: guía de uso, anatomía y accesibilidad de cada uno
- [x] 7.2 Actualizar `content/table.tsx` con las secciones de densidad, cabeceras ordenables y el patrón de composición de selección de filas con `Checkbox`
- [x] 7.3 Escribir los ejemplos en vivo de `examples/pagination/*.tsx`, `examples/chip/*.tsx`, `examples/segmented-control/*.tsx`, `examples/table-toolbar/*.tsx`
- [x] 7.4 Escribir un ejemplo nuevo en `examples/table/*.tsx` que combina `TableToolbar` + densidad + orden + selección de filas + `Pagination`, mostrando la integración completa
- [x] 7.5 Registrar los cuatro módulos de contenido nuevos en `content/index.ts`

## 8. Cierre

- [x] 8.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 8.2 Confirmar con lector de pantalla: Chip anuncia qué remueve, SegmentedControl anuncia la opción seleccionada, TableHead ordenable anuncia su dirección de orden
- [x] 8.3 Confirmar que ningún estilo de los componentes nuevos ni de las extensiones de Table usa un valor fuera de los tokens del sistema
- [x] 8.4 Confirmar que una Table existente sin `density` ni `sortDirection`/`onSort` sigue viéndose y comportándose igual que antes de este change
- [x] 8.5 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
