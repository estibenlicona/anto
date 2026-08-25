## 1. Componente Table

- [x] 1.1 Construir `Table` sobre `<table>`, estilado con tokens
- [x] 1.2 Construir `TableHeader` sobre `<thead>` y `TableBody` sobre `<tbody>`
- [x] 1.3 Construir `TableFooter` sobre `<tfoot>`
- [x] 1.4 Construir `TableRow` sobre `<tr>`, con estado hover vía tokens
- [x] 1.5 Construir `TableHead` sobre `<th>` y `TableCell` sobre `<td>`
- [x] 1.6 Declarar props públicas con tipos explícitos y descripciones en las siete partes

## 2. Registro

- [x] 2.1 Añadir la entrada `table` a `definitions.ts`, categoría `layout`, `status: "stable"`
- [x] 2.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos

## 3. Documentación del componente

- [x] 3.1 Escribir `content/table.tsx`: guía de uso con la convención de alineación (texto izquierda, números derecha con cifras tabulares) y datos ausentes ("—"); anatomía de las siete partes; notas de accesibilidad
- [x] 3.2 Escribir los ejemplos en vivo de `examples/table/*.tsx`: básico con cabecera y filas; columna numérica alineada a la derecha con un dato ausente como "—"
- [x] 3.3 Registrar el módulo de contenido en `content/index.ts`

## 4. Cierre

- [x] 4.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 4.2 Confirmar con un lector de pantalla que la estructura de filas y columnas se anuncia correctamente, sin roles ARIA agregados a mano
- [x] 4.3 Confirmar que ningún estilo de Table usa un valor fuera de los tokens del sistema
- [x] 4.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
