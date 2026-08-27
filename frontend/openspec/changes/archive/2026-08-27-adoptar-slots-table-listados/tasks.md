## 1. Librería

- [x] 1.1 Con el tarball generado por `table-slots-toolbar-footer` (tuip, `pnpm publish:local`), actualizar en `package.json` la ruta de `@tuya-ui/components` (y `@tuya-ui/tokens` si también cambió de versión) y correr `pnpm install`; confirmar con `tsc --noEmit` que `Table` expone `toolbar` y `footer`

## 2. Pieza compartida

- [x] 2.1 Crear `src/shared/components/TableStatusRow.tsx`: `TableRow` + `TableCell colSpan` con contenido centrado y padding vertical amplio; props `colSpan: number` y `children`; comentario de por qué el `colSpan` es explícito
- [x] 2.2 Test unitario mínimo (`__test__/TableStatusRow.test.tsx`): renderiza una sola celda con el `colSpan` recibido y el contenido

## 3. Migración de los listados

- [x] 3.1 `SquadsList.tsx`: mover la fila de búsqueda + filtro a `toolbar`, `PaginationBar` a `footer` (sin sus clases de borde/fondo, sólo cuando hay filas), quitar el `div` con `overflow-hidden rounded-surface border`, y mover carga / error / "Sin resultados" a un `TableStatusRow colSpan={7}` dentro de `TableBody`; conservar el `return` temprano del vacío inicial y el comentario sobre la barra montada
- [x] 3.2 `PeopleList.tsx`: idem (`colSpan={8}`); eliminar los `return` tempranos de carga y error para que la barra quede montada, en el mismo orden que Células
- [x] 3.3 `InitiativesList.tsx`: idem (`colSpan={6}`); eliminar los `return` tempranos de carga y error
- [x] 3.4 `AllocationsList.tsx`: idem (`colSpan={6}`); eliminar los `return` tempranos de carga y error
- [x] 3.5 `BillingList.tsx`: idem (`colSpan={9}`), con `toolbar` sólo cuando hay más de un proveedor; el error de carga previo a la tabla se mantiene donde está si no hay barra que preservar
- [x] 3.6 Buscar restos: `grep -rn "overflow-hidden rounded-surface border" src/features/{squads,people,initiatives,allocations,billing}` no debe encontrar nada en los cinco listados

## 4. Pruebas

- [x] 4.1 Actualizar los tests de los cinco listados: la barra está presente durante carga, error y sin resultados (invertir los que afirmaban lo contrario); los textos de carga/error/"Sin resultados" se buscan igual; la paginación no aparece en esos estados; ningún test depende del `div` de la card manual
- [x] 4.2 Correr `pnpm test` (suites de squads, people, initiatives, allocations, billing y shared) y `pnpm lint` sobre los archivos tocados

## 5. Revisión visual

- [x] 5.1 `pnpm dev:auth` como Chapter Lead: Células, Personas, Iniciativas, detalle de célula (Asignaciones) y Facturación — una sola card con barra, cabeceras, filas y paginación; abrir un filtro y confirmar que el popover no se recorta
- [x] 5.2 En Células: escribir en la búsqueda y ver que el campo conserva foco y texto mientras carga; forzar "Sin resultados" con un texto sin coincidencias y ver el estado bajo las cabeceras sin paginación
- [x] 5.3 Con el simulador "Chapter Lead · sin personas": el vacío inicial de Células y Personas sigue a pantalla completa, sin barra ni tabla
